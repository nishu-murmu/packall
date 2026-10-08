//! Background batch runner.
//!
//! The frontend hands over a list of jobs (one per software entry), each with
//! the shell commands needed to install / update / remove it. Jobs run
//! sequentially on a worker thread and report progress through a callback, which
//! the Tauri layer turns into `packall-job` events. Nothing here blocks the UI.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::Read;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, RecvTimeoutError};
use std::sync::{Arc, Mutex};
use std::time::Duration;

#[derive(Debug, Deserialize, Clone)]
pub struct JobSpec {
    pub id: String,
    pub name: String,
    /// Shell commands executed in order; the job fails on the first non-zero exit.
    pub commands: Vec<String>,
}

#[derive(Debug, Serialize, Clone, PartialEq)]
pub struct JobEvent {
    pub batch_id: String,
    pub job_id: String,
    /// "started" | "output" | "finished" | "batch_done"
    pub kind: String,
    pub line: Option<String>,
    pub percent: Option<f32>,
    pub success: Option<bool>,
    pub cancelled: bool,
}

impl JobEvent {
    fn new(batch_id: &str, job_id: &str, kind: &str) -> Self {
        JobEvent {
            batch_id: batch_id.to_string(),
            job_id: job_id.to_string(),
            kind: kind.to_string(),
            line: None,
            percent: None,
            success: None,
            cancelled: false,
        }
    }
}

static BATCHES: Mutex<Option<HashMap<String, Arc<AtomicBool>>>> = Mutex::new(None);

fn register(batch_id: &str) -> Arc<AtomicBool> {
    let flag = Arc::new(AtomicBool::new(false));
    if let Ok(mut lock) = BATCHES.lock() {
        lock.get_or_insert_with(HashMap::new)
            .insert(batch_id.to_string(), flag.clone());
    }
    flag
}

fn unregister(batch_id: &str) {
    if let Ok(mut lock) = BATCHES.lock() {
        if let Some(map) = lock.as_mut() {
            map.remove(batch_id);
        }
    }
}

/// Ask a running batch to stop. The current command is terminated.
pub fn cancel_batch(batch_id: &str) -> bool {
    if let Ok(lock) = BATCHES.lock() {
        if let Some(flag) = lock.as_ref().and_then(|m| m.get(batch_id)) {
            flag.store(true, Ordering::SeqCst);
            return true;
        }
    }
    false
}

/// Extract a progress percentage from a line of package-manager output.
/// Understands `45%`, `[ 45%]` (apt) and `(3/10)` (pacman).
pub fn parse_percent(line: &str) -> Option<f32> {
    // "...  45%" style; take the last percentage on the line.
    let bytes = line.as_bytes();
    let mut i = bytes.len();
    while i > 0 {
        i -= 1;
        if bytes[i] == b'%' {
            let mut j = i;
            while j > 0 && (bytes[j - 1].is_ascii_digit() || bytes[j - 1] == b'.') {
                j -= 1;
            }
            if j < i {
                if let Ok(v) = line[j..i].parse::<f32>() {
                    if (0.0..=100.0).contains(&v) {
                        return Some(v);
                    }
                }
            }
        }
    }
    // "(3/10)" style.
    if let Some(open) = line.find('(') {
        if let Some(close) = line[open..].find(')') {
            let inner = line[open + 1..open + close].trim();
            if let Some((a, b)) = inner.split_once('/') {
                if let (Ok(a), Ok(b)) = (a.trim().parse::<f32>(), b.trim().parse::<f32>()) {
                    if b > 0.0 && a <= b {
                        return Some(a / b * 100.0);
                    }
                }
            }
        }
    }
    None
}

// ---------------------------------------------------------------------------
// Privilege handling
//
// A desktop app has no terminal to type a sudo password into, and pkexec falls
// back to a text prompt on the launching terminal (and may pick a different
// admin account than the current user). Instead Packall asks for the password
// in its own dialog, keeps it in memory and exposes it to `sudo -A` through a
// private askpass helper. A tiny `sudo` wrapper placed first in PATH makes every
// `sudo` call (including the ones AUR helpers make) use it.
// ---------------------------------------------------------------------------

static SUDO_PASSWORD: Mutex<Option<String>> = Mutex::new(None);

#[cfg(unix)]
pub fn is_root() -> bool {
    Command::new("id")
        .arg("-u")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim() == "0")
        .unwrap_or(false)
}

#[cfg(not(unix))]
pub fn is_root() -> bool {
    false
}

fn sudo_binary() -> Option<String> {
    let out = Command::new("sh")
        .args(["-c", "command -v sudo"])
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let path = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if path.is_empty() {
        None
    } else {
        Some(path)
    }
}

fn verify_password(sudo: &str, password: &str) -> bool {
    use std::io::Write;
    let child = Command::new(sudo)
        .args(["-S", "-k", "-p", "", "-v"])
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();
    let Ok(mut child) = child else { return false };
    if let Some(mut stdin) = child.stdin.take() {
        let _ = stdin.write_all(password.as_bytes());
        let _ = stdin.write_all(b"\n");
    }
    child.wait().map(|s| s.success()).unwrap_or(false)
}

/// "ready" (root, passwordless or already unlocked), "needs_password" or "unavailable".
pub fn sudo_status() -> &'static str {
    if is_root() {
        return "ready";
    }
    let Some(sudo) = sudo_binary() else {
        return "unavailable";
    };
    let passwordless = Command::new(&sudo)
        .args(["-n", "-v"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false);
    if passwordless {
        return "ready";
    }
    let stored = SUDO_PASSWORD.lock().ok().and_then(|g| g.clone());
    match stored {
        Some(pw) if verify_password(&sudo, &pw) => "ready",
        _ => "needs_password",
    }
}

/// Check the password against sudo and remember it for this session.
pub fn unlock_sudo(password: &str) -> Result<(), String> {
    let sudo = sudo_binary().ok_or_else(|| "sudo is not installed".to_string())?;
    if !verify_password(&sudo, password) {
        return Err("Incorrect password".to_string());
    }
    if let Ok(mut lock) = SUDO_PASSWORD.lock() {
        *lock = Some(password.to_string());
    }
    Ok(())
}

pub fn forget_sudo() {
    if let Ok(mut lock) = SUDO_PASSWORD.lock() {
        *lock = None;
    }
}

/// Private directory holding the askpass helper and the `sudo` wrapper.
pub struct SudoShim {
    dir: std::path::PathBuf,
}

/// Prefer `$XDG_RUNTIME_DIR` (per-user, 0700, cleared on logout) over
/// `$TMPDIR` so the password file lives on a tmpfs and cannot survive a
/// reboot. Falls back to the system temp dir when the variable is unset.
#[cfg(unix)]
fn shim_base_dir() -> std::path::PathBuf {
    if let Ok(xdg) = std::env::var("XDG_RUNTIME_DIR") {
        let p = std::path::PathBuf::from(xdg);
        if p.is_dir() {
            return p;
        }
    }
    std::env::temp_dir()
}

impl SudoShim {
    #[cfg(unix)]
    pub fn create(batch_id: &str) -> Option<SudoShim> {
        use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
        let root = is_root();
        let sudo = if root { String::new() } else { sudo_binary()? };
        let password = SUDO_PASSWORD.lock().ok().and_then(|g| g.clone());

        let dir = shim_base_dir().join(format!("packall-{}-{}", std::process::id(), batch_id));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::DirBuilder::new().mode(0o700).create(&dir).ok()?;

        let write = |name: &str, body: &str, mode: u32| -> Option<()> {
            let mut f = std::fs::OpenOptions::new()
                .write(true)
                .create_new(true)
                .mode(mode)
                .open(dir.join(name))
                .ok()?;
            std::io::Write::write_all(&mut f, body.as_bytes()).ok()
        };

        let wrapper = if root {
            "#!/bin/sh\nexec \"$@\"\n".to_string()
        } else if password.is_some() {
            format!("#!/bin/sh\nexec '{}' -A \"$@\"\n", sudo)
        } else {
            // Never block on a prompt nobody can answer.
            format!("#!/bin/sh\nexec '{}' -n \"$@\"\n", sudo)
        };
        write("sudo", &wrapper, 0o700)?;
        if let Some(pw) = password {
            write("pw", &pw, 0o600)?;
            write(
                "askpass",
                "#!/bin/sh\ncat \"$(dirname \"$0\")/pw\"\n",
                0o700,
            )?;
        }
        register_shim_dir(&dir);
        Some(SudoShim { dir })
    }

    #[cfg(not(unix))]
    pub fn create(_batch_id: &str) -> Option<SudoShim> {
        None
    }

    fn env(&self) -> Vec<(String, String)> {
        let path = std::env::var("PATH").unwrap_or_default();
        vec![
            ("PATH".to_string(), format!("{}:{}", self.dir.display(), path)),
            (
                "SUDO_ASKPASS".to_string(),
                self.dir.join("askpass").display().to_string(),
            ),
        ]
    }
}

impl Drop for SudoShim {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.dir);
        #[cfg(unix)]
        unregister_shim_dir(&self.dir);
    }
}

// ---------------------------------------------------------------------------
// Signal-safe cleanup: remove shim directories on SIGINT / SIGTERM so the
// password file never survives an abnormal exit (short of SIGKILL / OOM).
// ---------------------------------------------------------------------------

#[cfg(unix)]
static SHIM_DIRS: Mutex<Option<Vec<std::path::PathBuf>>> = Mutex::new(None);

#[cfg(unix)]
fn register_shim_dir(dir: &std::path::Path) {
    if let Ok(mut lock) = SHIM_DIRS.lock() {
        lock.get_or_insert_with(Vec::new).push(dir.to_path_buf());
    }
}

#[cfg(unix)]
fn unregister_shim_dir(dir: &std::path::Path) {
    if let Ok(mut lock) = SHIM_DIRS.lock() {
        if let Some(dirs) = lock.as_mut() {
            dirs.retain(|d| d != dir);
        }
    }
}

#[cfg(unix)]
fn cleanup_all_shims() {
    if let Ok(mut lock) = SHIM_DIRS.lock() {
        if let Some(dirs) = lock.take() {
            for dir in dirs {
                let _ = std::fs::remove_dir_all(dir);
            }
        }
    }
}

/// Install signal handlers that clean up shim directories on SIGINT/SIGTERM.
/// Safe to call more than once; subsequent calls are no-ops.
#[cfg(unix)]
pub fn install_signal_handlers() {
    use std::sync::Once;
    static ONCE: Once = Once::new();
    ONCE.call_once(|| {
        // Re-raise the signal after cleanup so the default handler runs.
        unsafe {
            for sig in [libc::SIGINT, libc::SIGTERM] {
                libc::signal(sig, signal_handler as libc::sighandler_t);
            }
        }
    });
}

#[cfg(unix)]
extern "C" fn signal_handler(sig: libc::c_int) {
    cleanup_all_shims();
    // Restore the default handler and re-raise so the process exits normally.
    unsafe {
        libc::signal(sig, libc::SIG_DFL);
        libc::raise(sig);
    }
}

#[cfg(not(unix))]
pub fn install_signal_handlers() {}

/// Split a byte stream into lines, treating both `\n` and `\r` as terminators so
/// in-place progress meters (curl, flatpak) produce updates.
fn pump<R: Read + Send + 'static>(mut reader: R, tx: mpsc::Sender<String>) {
    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        let mut line: Vec<u8> = Vec::new();
        loop {
            match reader.read(&mut buf) {
                Ok(0) | Err(_) => break,
                Ok(n) => {
                    for &b in &buf[..n] {
                        if b == b'\n' || b == b'\r' {
                            if !line.is_empty() {
                                let _ = tx.send(String::from_utf8_lossy(&line).to_string());
                                line.clear();
                            }
                        } else {
                            line.push(b);
                        }
                    }
                }
            }
        }
        if !line.is_empty() {
            let _ = tx.send(String::from_utf8_lossy(&line).to_string());
        }
    });
}

#[cfg(unix)]
fn terminate(child: &mut std::process::Child) {
    let pid = child.id();
    // Kill the whole process group so grandchildren (apt, dnf, ...) stop too.
    let _ = Command::new("kill")
        .args(["-TERM", "--", &format!("-{}", pid)])
        .status();
    let _ = child.kill();
}

#[cfg(not(unix))]
fn terminate(child: &mut std::process::Child) {
    let _ = child.kill();
}

/// Run one shell command, streaming output. Returns Ok(true) on success.
fn run_command<F: Fn(JobEvent)>(
    batch_id: &str,
    job_id: &str,
    command: &str,
    cancel: &AtomicBool,
    env: &[(String, String)],
    emit: &F,
) -> bool {
    let mut cmd = if cfg!(windows) {
        let mut c = Command::new("powershell");
        c.args(["-Command", command]);
        c
    } else {
        let mut c = Command::new("sh");
        c.args(["-c", command]);
        c
    };
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::null());
    for (k, v) in env {
        cmd.env(k, v);
    }
    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        cmd.process_group(0);
    }

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            let mut ev = JobEvent::new(batch_id, job_id, "output");
            ev.line = Some(format!("Failed to start command: {}", e));
            emit(ev);
            return false;
        }
    };

    let (tx, rx) = mpsc::channel::<String>();
    if let Some(out) = child.stdout.take() {
        pump(out, tx.clone());
    }
    if let Some(err) = child.stderr.take() {
        pump(err, tx.clone());
    }
    drop(tx);

    let forward = |line: String| {
        let mut ev = JobEvent::new(batch_id, job_id, "output");
        ev.percent = parse_percent(&line);
        ev.line = Some(line);
        emit(ev);
    };

    loop {
        if cancel.load(Ordering::SeqCst) {
            terminate(&mut child);
            let _ = child.wait();
            return false;
        }
        match rx.recv_timeout(Duration::from_millis(100)) {
            Ok(line) => forward(line),
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => break,
        }
    }
    for line in rx.try_iter() {
        forward(line);
    }
    child.wait().map(|s| s.success()).unwrap_or(false)
}

/// Run every job in order. Failed jobs do not stop the rest of the batch.
pub fn run_batch<F: Fn(JobEvent)>(batch_id: &str, jobs: Vec<JobSpec>, emit: F) {
    install_signal_handlers();
    let cancel = register(batch_id);
    let shim = SudoShim::create(batch_id);
    let env = shim.as_ref().map(|s| s.env()).unwrap_or_default();

    for job in jobs {
        if cancel.load(Ordering::SeqCst) {
            let mut ev = JobEvent::new(batch_id, &job.id, "finished");
            ev.success = Some(false);
            ev.cancelled = true;
            emit(ev);
            continue;
        }
        emit(JobEvent::new(batch_id, &job.id, "started"));

        let mut ok = true;
        for raw in &job.commands {
            let command = raw.clone();
            let mut ev = JobEvent::new(batch_id, &job.id, "output");
            ev.line = Some(format!("$ {}", command));
            emit(ev);
            if !run_command(batch_id, &job.id, &command, &cancel, &env, &emit) {
                ok = false;
                break;
            }
        }

        let mut ev = JobEvent::new(batch_id, &job.id, "finished");
        ev.success = Some(ok);
        ev.cancelled = cancel.load(Ordering::SeqCst) && !ok;
        emit(ev);
    }

    emit(JobEvent::new(batch_id, "", "batch_done"));
    unregister(batch_id);
    drop(shim);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn percent_from_plain_and_apt() {
        assert_eq!(parse_percent("Downloading 45%"), Some(45.0));
        assert_eq!(parse_percent("Progress: [ 62%]"), Some(62.0));
        assert_eq!(parse_percent("nothing here"), None);
    }

    #[test]
    fn percent_from_pacman_counter() {
        assert_eq!(parse_percent("(1/4) installing foo"), Some(25.0));
    }

    #[cfg(unix)]
    #[test]
    fn shim_wraps_sudo_and_cleans_up() {
        let dir;
        {
            let shim = SudoShim::create("shimtest").expect("shim");
            dir = shim.dir.clone();
            assert!(dir.join("sudo").exists());
            let env = shim.env();
            assert!(env.iter().any(|(k, v)| k == "PATH" && v.starts_with(dir.to_str().unwrap())));
        }
        assert!(!dir.exists());
    }

    #[cfg(unix)]
    #[test]
    fn password_never_prompts_a_terminal() {
        // With no stored password the wrapper must fail fast instead of hanging.
        forget_sudo();
        let events = Mutex::new(Vec::new());
        run_batch(
            "t2",
            vec![JobSpec { id: "a".into(), name: "A".into(), commands: vec!["sudo true".into()] }],
            |e| events.lock().unwrap().push(e),
        );
        let ev = events.lock().unwrap();
        assert!(ev.iter().any(|e| e.kind == "finished"));
    }

    #[cfg(unix)]
    #[test]
    fn batch_reports_success_and_failure() {
        let events = Mutex::new(Vec::new());
        run_batch(
            "t1",
            vec![
                JobSpec { id: "a".into(), name: "A".into(), commands: vec!["echo hi".into()] },
                JobSpec { id: "b".into(), name: "B".into(), commands: vec!["exit 3".into()] },
            ],
            |e| events.lock().unwrap().push(e),
        );
        let ev = events.lock().unwrap();
        let finished: Vec<_> = ev.iter().filter(|e| e.kind == "finished").collect();
        assert_eq!(finished.len(), 2);
        assert_eq!(finished[0].success, Some(true));
        assert_eq!(finished[1].success, Some(false));
        assert!(ev.iter().any(|e| e.line.as_deref() == Some("hi")));
        assert_eq!(ev.last().unwrap().kind, "batch_done");
    }
}
