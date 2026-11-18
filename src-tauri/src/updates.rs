//! Which installed packages have a newer version waiting. A port of
//! internal/distro/outdated.go: one root-free query per manager, run in
//! parallel, each parsed into the same shape.

use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

/// How long one manager's check may take. Most of them talk to the network.
const CHECK_TIMEOUT: Duration = Duration::from_secs(90);

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Default)]
pub struct PackageUpdate {
    /// The id the installed scan reports, so the two line up.
    pub manager: String,
    /// Matches `SystemPackage::name` for the same package.
    pub name: String,
    /// The Flatpak application id; empty for every other manager.
    pub id: String,
    /// The installed version, when the manager says. Flatpak, DNF and Snap
    /// only report the new one.
    pub current: String,
    pub latest: String,
}

fn up(manager: &str, name: &str, current: &str, latest: &str) -> PackageUpdate {
    PackageUpdate { manager: manager.into(), name: name.into(), current: current.into(), latest: latest.into(), ..Default::default() }
}

/// "name old -> new", shared by pacman -Qu, checkupdates and the AUR helpers.
fn parse_arrow(manager: &str, out: &str) -> Vec<PackageUpdate> {
    out.lines()
        .filter_map(|line| {
            let f: Vec<&str> = line.split_whitespace().collect();
            (f.len() >= 4 && f[2] == "->").then(|| up(manager, f[0], f[1], f[3]))
        })
        .collect()
}

/// `apt list --upgradable`:
/// `firefox/jammy-updates 120.0+b2 amd64 [upgradable from: 119.0+b1]`
fn parse_apt(out: &str) -> Vec<PackageUpdate> {
    out.lines()
        .filter_map(|line| {
            let (head, from) = line.split_once("[upgradable from:")?;
            let from = from.trim().trim_end_matches(']').trim();
            let mut f = head.split_whitespace();
            let name = f.next()?.split('/').next()?;
            let latest = f.next()?;
            Some(up("apt", name, from, latest))
        })
        .collect()
}

/// `dnf check-update`: "name.arch  version  repo" rows, then an
/// "Obsoleting Packages" section that is not an upgrade list.
fn parse_dnf(out: &str) -> Vec<PackageUpdate> {
    let mut seen = std::collections::HashSet::new();
    let mut ups = Vec::new();
    for line in out.lines() {
        if line.starts_with("Obsoleting") {
            break;
        }
        if line.is_empty() || line.starts_with(' ') || line.starts_with('\t') {
            continue;
        }
        let f: Vec<&str> = line.split_whitespace().collect();
        if f.len() != 3 || !f[1].chars().any(|c| c.is_ascii_digit()) {
            continue;
        }
        let Some(dot) = f[0].rfind('.').filter(|&d| d > 0) else { continue };
        let name = &f[0][..dot];
        // A multilib host lists the same package once per architecture.
        if seen.insert(name.to_string()) {
            ups.push(up("dnf", name, "", f[1]));
        }
    }
    ups
}

/// `zypper list-updates`: `v | repo-oss | bash | 5.1-1.1 | 5.2-1.1 | x86_64`
fn parse_zypper(out: &str) -> Vec<PackageUpdate> {
    out.lines()
        .filter_map(|line| {
            let c: Vec<&str> = line.split('|').map(str::trim).collect();
            (c.len() >= 6 && c[0] == "v" && !c[2].is_empty()).then(|| up("zypper", c[2], c[3], c[4]))
        })
        .collect()
}

/// `flatpak remote-ls --updates --app --columns=application,name,version`
fn parse_flatpak(out: &str) -> Vec<PackageUpdate> {
    out.lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.split('\t').map(str::trim).collect();
            let id = parts.first().copied().filter(|id| id.contains('.'))?;
            let name = parts.get(1).copied().filter(|n| !n.is_empty()).unwrap_or(id);
            let latest = parts.get(2).copied().unwrap_or("");
            Some(PackageUpdate { id: id.into(), ..up("flatpak", name, "", latest) })
        })
        .collect()
}

/// `snap refresh --list`, whose Version column is the new one.
fn parse_snap(out: &str) -> Vec<PackageUpdate> {
    out.lines()
        .filter_map(|line| {
            let f: Vec<&str> = line.split_whitespace().collect();
            (f.len() >= 2 && f[0] != "Name" && !line.starts_with("All snaps")).then(|| up("snap", f[0], "", f[1]))
        })
        .collect()
}

/// `brew outdated --verbose`: `wget (1.21.3) < 1.21.4`; casks use `!=`, and
/// several installed versions are comma-separated.
fn parse_brew(out: &str) -> Vec<PackageUpdate> {
    out.lines()
        .filter_map(|line| {
            let (name, rest) = line.split_once(" (")?;
            let (current, rest) = rest.split_once(')')?;
            let rest = rest.trim();
            let latest = rest.strip_prefix('<').or_else(|| rest.strip_prefix("!="))?.split_whitespace().next()?;
            let current = current.rsplit(',').next()?.trim();
            Some(up("brew", name.trim(), current, latest))
        })
        .collect()
}

struct Checker {
    tool: &'static str,
    args: &'static [&'static str],
    parse: fn(&str) -> Vec<PackageUpdate>,
}

fn on_path(tool: &str) -> bool {
    std::env::var_os("PATH")
        .map(|p| std::env::split_paths(&p).any(|d| d.join(tool).is_file()))
        .unwrap_or(false)
}

fn checkers() -> Vec<Checker> {
    let mut out = Vec::new();
    // checkupdates (pacman-contrib) syncs into a temporary database, so it sees
    // new versions without touching the system's; pacman -Qu only knows what
    // the last -Sy fetched.
    if on_path("checkupdates") {
        out.push(Checker { tool: "checkupdates", args: &["--nocolor"], parse: |o| parse_arrow("pacman", o) });
    } else if on_path("pacman") {
        out.push(Checker { tool: "pacman", args: &["-Qu"], parse: |o| parse_arrow("pacman", o) });
    }
    if on_path("paru") {
        out.push(Checker { tool: "paru", args: &["-Qua"], parse: |o| parse_arrow("aur", o) });
    } else if on_path("yay") {
        out.push(Checker { tool: "yay", args: &["-Qua"], parse: |o| parse_arrow("aur", o) });
    }
    if on_path("apt") && on_path("dpkg-query") {
        out.push(Checker { tool: "apt", args: &["list", "--upgradable"], parse: parse_apt });
    }
    if on_path("zypper") {
        out.push(Checker { tool: "zypper", args: &["--non-interactive", "--quiet", "list-updates"], parse: parse_zypper });
    } else if on_path("dnf") {
        out.push(Checker { tool: "dnf", args: &["check-update", "--quiet"], parse: parse_dnf });
    }
    if on_path("flatpak") {
        out.push(Checker {
            tool: "flatpak",
            args: &["remote-ls", "--updates", "--app", "--columns=application,name,version"],
            parse: parse_flatpak,
        });
    }
    if on_path("snap") {
        out.push(Checker { tool: "snap", args: &["refresh", "--list"], parse: parse_snap });
    }
    if on_path("brew") {
        out.push(Checker { tool: "brew", args: &["outdated", "--verbose"], parse: parse_brew });
    }
    out
}

/// Runs one check. Several of these answer with the exit code — dnf says 100
/// when there are updates, checkupdates 2 and the AUR helpers 1 when there
/// are none — so the status is ignored and whatever was printed is parsed.
/// A check that outlives the timeout is killed and contributes nothing.
fn run(c: &Checker) -> Vec<PackageUpdate> {
    let Ok(mut child) = Command::new(c.tool)
        .args(c.args)
        .env("LC_ALL", "C")
        .env("NO_COLOR", "1")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
    else {
        return Vec::new();
    };

    // Read stdout on its own thread so a chatty manager cannot fill the pipe
    // and stall while we wait on it.
    let mut stdout = child.stdout.take();
    let reader = std::thread::spawn(move || {
        let mut s = String::new();
        if let Some(out) = stdout.as_mut() {
            let _ = std::io::Read::read_to_string(out, &mut s);
        }
        s
    });

    let start = Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(_)) => break,
            Ok(None) if start.elapsed() < CHECK_TIMEOUT => std::thread::sleep(Duration::from_millis(100)),
            _ => {
                let _ = child.kill();
                let _ = child.wait();
                return Vec::new();
            }
        }
    }
    (c.parse)(&reader.join().unwrap_or_default())
}

/// Asks every manager on the host what it could upgrade, in parallel.
pub fn check_updates() -> Vec<PackageUpdate> {
    let checks = checkers();
    let mut out: Vec<PackageUpdate> = std::thread::scope(|s| {
        let handles: Vec<_> = checks.iter().map(|c| s.spawn(move || run(c))).collect();
        handles.into_iter().flat_map(|h| h.join().unwrap_or_default()).collect()
    });
    out.sort_by(|a, b| a.manager.cmp(&b.manager).then(a.name.to_lowercase().cmp(&b.name.to_lowercase())));
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_pacman_and_aur() {
        let ups = parse_arrow("pacman", "linux 6.18.1-1 -> 6.18.2-1\nmesa 1:25.0-1 -> 1:25.1-1 [ignored]\n:: noise\n");
        assert_eq!(ups, vec![up("pacman", "linux", "6.18.1-1", "6.18.2-1"), up("pacman", "mesa", "1:25.0-1", "1:25.1-1")]);
    }

    #[test]
    fn parses_apt() {
        let ups = parse_apt("Listing... Done\nfirefox/jammy-updates 120.0+b2 amd64 [upgradable from: 119.0+b1]\n");
        assert_eq!(ups, vec![up("apt", "firefox", "119.0+b1", "120.0+b2")]);
    }

    #[test]
    fn parses_dnf() {
        let out = "Last metadata expiration check: 0:01:00 ago.\n\nfirefox.x86_64   120.0-1.fc39   updates\nglibc.i686   2.38-14.fc39   updates\nglibc.x86_64   2.38-14.fc39   updates\nObsoleting Packages\ngrub2-tools.x86_64   1:2.06   updates\n";
        assert_eq!(parse_dnf(out), vec![up("dnf", "firefox", "", "120.0-1.fc39"), up("dnf", "glibc", "", "2.38-14.fc39")]);
    }

    #[test]
    fn parses_zypper() {
        let out = "S | Repository | Name | Current Version | Available Version | Arch\n--+---\nv | repo-oss | bash | 5.1-1.1 | 5.2-1.1 | x86_64\n";
        assert_eq!(parse_zypper(out), vec![up("zypper", "bash", "5.1-1.1", "5.2-1.1")]);
    }

    #[test]
    fn parses_flatpak() {
        let ups = parse_flatpak("org.mozilla.firefox\tFirefox\t120.0\ncom.example.App\t\t\n");
        assert_eq!(ups[0].name, "Firefox");
        assert_eq!(ups[0].id, "org.mozilla.firefox");
        assert_eq!(ups[0].latest, "120.0");
        assert_eq!(ups[1].name, "com.example.App");
    }

    #[test]
    fn parses_snap_and_brew() {
        assert_eq!(parse_snap("Name Version Rev\ncore22 2024.1 1234\n"), vec![up("snap", "core22", "", "2024.1")]);
        assert_eq!(
            parse_brew("wget (1.21.3) < 1.21.4\npython@3.12 (3.12.0, 3.12.1) < 3.12.2\nfirefox (119.0) != 120.0\n"),
            vec![up("brew", "wget", "1.21.3", "1.21.4"), up("brew", "python@3.12", "3.12.1", "3.12.2"), up("brew", "firefox", "119.0", "120.0")]
        );
    }
}
