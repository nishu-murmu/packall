//! Keeps Packall itself current: asks GitHub for the latest release, compares it
//! with this build, and updates in whatever way Packall was installed.
//!
//! * AppImage (the installer's default): the file at `$APPIMAGE` is replaced in
//!   place — written next to it, then renamed over it — so no sudo is needed and
//!   a failed download leaves the old file untouched.
//! * .deb / .rpm: the matching package from the release is installed with the
//!   system package manager, which needs sudo.
//!
//! Downloads go through `curl`, which the installer already requires, so no
//! HTTP stack is linked into the app.

use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;

pub const REPO: &str = "nishu-murmu/packall";
pub const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub current: String,
    pub latest: String,
    pub available: bool,
    pub release_url: String,
    /// "appimage" | "deb" | "rpm" | "manual"
    pub method: String,
    /// Shell commands for "deb"/"rpm" updates; empty otherwise.
    pub commands: Vec<String>,
}

#[derive(Debug, Clone, Default)]
struct Release {
    tag: String,
    url: String,
    assets: Vec<(String, String)>, // (name, download url)
}

impl Release {
    fn version(&self) -> &str {
        self.tag.trim_start_matches('v')
    }
    fn asset(&self, suffix: &str) -> Option<&str> {
        self.assets
            .iter()
            .find(|(n, _)| n.ends_with(suffix))
            .map(|(_, u)| u.as_str())
    }
}

fn parse_version(v: &str) -> Option<[u64; 3]> {
    let v = v.trim().trim_start_matches('v');
    let core = v.split(|c| c == '-' || c == '+').next()?;
    let mut out = [0u64; 3];
    let parts: Vec<&str> = core.split('.').collect();
    if parts.is_empty() || parts.len() > 3 {
        return None;
    }
    for (i, p) in parts.iter().enumerate() {
        out[i] = p.parse().ok()?;
    }
    Some(out)
}

/// True when `a` is strictly newer than `b`.
pub fn is_newer(a: &str, b: &str) -> bool {
    match (parse_version(a), parse_version(b)) {
        (Some(a), Some(b)) => a > b,
        (Some(_), None) => true,
        _ => false,
    }
}

fn fetch_latest() -> Result<Release, String> {
    let url = format!("https://api.github.com/repos/{}/releases/latest", REPO);
    let out = Command::new("curl")
        .args([
            "-fsSL",
            "--max-time",
            "15",
            "-H",
            "Accept: application/vnd.github+json",
            "-A",
            "packall-selfupdate",
            &url,
        ])
        .output()
        .map_err(|e| format!("curl is required to check for updates: {}", e))?;
    if !out.status.success() {
        return Err("could not reach GitHub (offline or rate limited)".into());
    }
    parse_release(&out.stdout)
}

fn parse_release(body: &[u8]) -> Result<Release, String> {
    let json: serde_json::Value =
        serde_json::from_slice(body).map_err(|e| format!("unreadable release data: {}", e))?;
    let tag = json["tag_name"].as_str().unwrap_or_default().to_string();
    if tag.is_empty() {
        return Err("the latest release has no tag".into());
    }
    let assets = json["assets"]
        .as_array()
        .map(|a| {
            a.iter()
                .filter_map(|x| {
                    Some((
                        x["name"].as_str()?.to_string(),
                        x["browser_download_url"].as_str()?.to_string(),
                    ))
                })
                .collect()
        })
        .unwrap_or_default();
    Ok(Release {
        tag,
        url: json["html_url"].as_str().unwrap_or_default().to_string(),
        assets,
    })
}

fn appimage_path() -> Option<PathBuf> {
    std::env::var_os("APPIMAGE")
        .map(PathBuf::from)
        .filter(|p| p.is_file())
}

fn owned_by(cmd: &str, args: &[&str]) -> bool {
    Command::new(cmd)
        .args(args)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn has(cmd: &str) -> bool {
    owned_by("sh", &["-c", &format!("command -v {} >/dev/null", cmd)])
}

fn shell_quote(s: &str) -> String {
    format!("'{}'", s.replace('\'', r"'\''"))
}

/// How this copy of Packall was installed, with the commands that update it.
fn plan(rel: &Release) -> (String, Vec<String>) {
    if appimage_path().is_some() && rel.asset(".AppImage").is_some() {
        return ("appimage".into(), vec![]);
    }
    let exe = std::env::current_exe()
        .ok()
        .and_then(|p| p.canonicalize().ok())
        .map(|p| p.to_string_lossy().into_owned())
        .unwrap_or_default();

    if !exe.is_empty() && has("dpkg") && owned_by("dpkg", &["-S", &exe]) {
        if let Some(url) = rel.asset("_amd64.deb") {
            let f = "/tmp/packall-update.deb";
            return (
                "deb".into(),
                vec![format!(
                    "curl -fL -o {f} {u} && sudo apt-get install -y {f}; s=$?; rm -f {f}; exit $s",
                    f = f,
                    u = shell_quote(url)
                )],
            );
        }
    }
    if !exe.is_empty() && has("rpm") && owned_by("rpm", &["-qf", &exe]) {
        if let Some(url) = rel.asset(".x86_64.rpm") {
            let f = "/tmp/packall-update.rpm";
            let install = if has("dnf") {
                format!("sudo dnf install -y {}", f)
            } else {
                format!("sudo zypper --non-interactive --no-gpg-checks install {}", f)
            };
            return (
                "rpm".into(),
                vec![format!(
                    "curl -fL -o {f} {u} && {i}; s=$?; rm -f {f}; exit $s",
                    f = f,
                    u = shell_quote(url),
                    i = install
                )],
            );
        }
    }
    ("manual".into(), vec![])
}

pub fn check() -> Result<UpdateInfo, String> {
    let rel = fetch_latest()?;
    let available = is_newer(rel.version(), CURRENT_VERSION);
    let (method, commands) = if available {
        plan(&rel)
    } else {
        ("none".into(), vec![])
    };
    Ok(UpdateInfo {
        current: CURRENT_VERSION.into(),
        latest: rel.version().into(),
        available,
        release_url: rel.url.clone(),
        method,
        commands,
    })
}

/// Replace the running AppImage with the latest one. Returns the new version.
pub fn apply_appimage() -> Result<String, String> {
    let target = appimage_path().ok_or("Packall is not running from an AppImage")?;
    let rel = fetch_latest()?;
    if !is_newer(rel.version(), CURRENT_VERSION) {
        return Err(format!("Packall {} is already the latest", CURRENT_VERSION));
    }
    let url = rel
        .asset(".AppImage")
        .ok_or_else(|| format!("release {} has no AppImage", rel.tag))?;
    replace_file(&target, url)?;
    Ok(rel.version().to_string())
}

fn replace_file(target: &Path, url: &str) -> Result<(), String> {
    let dir = target.parent().ok_or("bad AppImage path")?;
    let tmp = dir.join(format!(".packall-update-{}", std::process::id()));
    let status = Command::new("curl")
        .args(["-fL", "--max-time", "600", "-o"])
        .arg(&tmp)
        .arg(url)
        .status()
        .map_err(|e| format!("curl failed to start: {}", e))?;
    if !status.success() {
        let _ = std::fs::remove_file(&tmp);
        return Err(format!(
            "download failed — is {} writable? Re-run the installer otherwise",
            dir.display()
        ));
    }
    use std::os::unix::fs::PermissionsExt;
    let done = std::fs::set_permissions(&tmp, std::fs::Permissions::from_mode(0o755))
        .and_then(|_| std::fs::rename(&tmp, target));
    if let Err(e) = done {
        let _ = std::fs::remove_file(&tmp);
        return Err(format!("could not replace {}: {}", target.display(), e));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compares_versions() {
        assert!(is_newer("0.3.0", "0.2.1"));
        assert!(is_newer("v0.10.0", "0.9.9"));
        assert!(is_newer("1.0", "0.9.9"));
        assert!(!is_newer("0.3.0", "0.3.0"));
        assert!(!is_newer("0.2.1", "0.3.0"));
        assert!(!is_newer("dev", "0.3.0"));
        assert!(is_newer("0.4.0-rc1", "0.3.0"));
    }

    #[test]
    fn parses_release_and_finds_assets() {
        let body = br#"{"tag_name":"v0.4.0","html_url":"https://x/rel","assets":[
            {"name":"Packall_0.4.0_amd64.AppImage","browser_download_url":"https://x/a"},
            {"name":"Packall_0.4.0_amd64.deb","browser_download_url":"https://x/d"},
            {"name":"Packall-0.4.0-1.x86_64.rpm","browser_download_url":"https://x/r"}]}"#;
        let rel = parse_release(body).unwrap();
        assert_eq!(rel.version(), "0.4.0");
        assert_eq!(rel.asset(".AppImage"), Some("https://x/a"));
        assert_eq!(rel.asset("_amd64.deb"), Some("https://x/d"));
        assert_eq!(rel.asset(".x86_64.rpm"), Some("https://x/r"));
        assert!(parse_release(b"{}").is_err());
    }

    #[test]
    fn quotes_for_shell() {
        assert_eq!(shell_quote("a'b"), r"'a'\''b'");
    }
}
