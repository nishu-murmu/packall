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

/// Rewrite `sudo` into `pkexec` so a graphical polkit prompt is used instead of
/// a terminal password prompt, which a desktop app cannot answer.
pub fn adapt_privilege(command: &str, is_root: bool, has_pkexec: bool) -> String {
    if is_root {
        return command
            .split_whitespace()
            .filter(|t| *t != "sudo")
            .collect::<Vec<_>>()
            .join(" ");
    }
    if !has_pkexec {
        return command.to_string();
    }
    command
        .split(' ')
        .map(|t| if t == "sudo" { "pkexec" } else { t })
        .collect::<Vec<_>>()
        .join(" ")
}

fn is_root() -> bool {
    #[cfg(unix)]
    {
        Command::new("id")
            .arg("-u")
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim() == "0")
            .unwrap_or(false)
    }
    #[cfg(not(unix))]
    {
        false
    }
}

fn has_pkexec() -> bool {
    #[cfg(unix)]
    {
        Command::new("sh")
            .args(["-c", "command -v pkexec"])
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
    #[cfg(not(unix))]
    {
        false
    }
}

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
    let cancel = register(batch_id);
    let root = is_root();
    let pkexec = has_pkexec();

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
            let command = adapt_privilege(raw, root, pkexec);
            let mut ev = JobEvent::new(batch_id, &job.id, "output");
            ev.line = Some(format!("$ {}", command));
            emit(ev);
            if !run_command(batch_id, &job.id, &command, &cancel, &emit) {
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

    #[test]
    fn privilege_rewrite() {
        assert_eq!(
            adapt_privilege("sudo apt install -y git", false, true),
            "pkexec apt install -y git"
        );
        assert_eq!(
            adapt_privilege("sudo apt install -y git", true, true),
            "apt install -y git"
        );
        assert_eq!(
            adapt_privilege("sudo apt install -y git", false, false),
            "sudo apt install -y git"
        );
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
