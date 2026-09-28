use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemPackage {
    pub name: String,
    pub version: String,
    pub manager: String, // "pacman", "aur", "flatpak", "snap", "apt", "dnf", "brew", "winget", "system"
    pub description: Option<String>,
    pub installed: bool,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageManagerInfo {
    pub id: String,
    pub name: String,
    pub available: bool,
    pub is_aur: bool,
    pub install_cmd: String,
    pub update_cmd: String,
    pub remove_cmd: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionExecutionResult {
    pub success: bool,
    pub command: String,
    pub output: String,
    pub error: Option<String>,
}

/// Detect available package managers on the host machine
pub fn detect_available_managers() -> Vec<PackageManagerInfo> {
    let mut managers = Vec::new();

    let candidates = [
        ("paru", "Paru (AUR)", true, "paru -S", "paru -Syu", "paru -Rns"),
        ("yay", "Yay (AUR)", true, "yay -S", "yay -Syu", "yay -Rns"),
        ("pacman", "Pacman", false, "sudo pacman -S", "sudo pacman -Syu", "sudo pacman -Rns"),
        ("flatpak", "Flatpak", false, "flatpak install", "flatpak update", "flatpak uninstall"),
        ("snap", "Snap", false, "sudo snap install", "sudo snap refresh", "sudo snap remove"),
        ("apt", "APT", false, "sudo apt install", "sudo apt update && sudo apt upgrade", "sudo apt remove"),
        ("dnf", "DNF", false, "sudo dnf install", "sudo dnf upgrade", "sudo dnf remove"),
        ("zypper", "Zypper", false, "sudo zypper install", "sudo zypper update", "sudo zypper remove"),
        ("brew", "Homebrew", false, "brew install", "brew upgrade", "brew uninstall"),
        ("winget", "Windows Package Manager", false, "winget install", "winget upgrade", "winget uninstall"),
    ];

    for (id, name, is_aur, inst, upd, rem) in candidates {
        let is_available = is_executable_in_path(id);
        managers.push(PackageManagerInfo {
            id: id.to_string(),
            name: name.to_string(),
            available: is_available,
            is_aur,
            install_cmd: inst.to_string(),
            update_cmd: upd.to_string(),
            remove_cmd: rem.to_string(),
        });
    }

    managers
}

fn is_executable_in_path(cmd: &str) -> bool {
    #[cfg(unix)]
    {
        Command::new("which")
            .arg(cmd)
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
    #[cfg(windows)]
    {
        Command::new("where")
            .arg(cmd)
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
}

/// Query installed packages across all available managers on the host system
pub fn scan_system_packages() -> Vec<SystemPackage> {
    let mut packages = Vec::new();
    let mut seen = HashSet::new();

    // 1. Check Pacman (Arch Linux explicit packages)
    if is_executable_in_path("pacman") {
        if let Ok(output) = Command::new("pacman").args(["-Qe"]).output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let mut parts = line.split_whitespace();
                    if let (Some(name), Some(version)) = (parts.next(), parts.next()) {
                        let key = format!("pacman:{}", name);
                        if seen.insert(key) {
                            packages.push(SystemPackage {
                                name: name.to_string(),
                                version: version.to_string(),
                                manager: "pacman".to_string(),
                                description: None,
                                installed: true,
                                icon: resolve_linux_icon_path(name),
                            });
                        }
                    }
                }
            }
        }
    }

    // 2. Check Paru or Yay (AUR foreign packages)
    for aur_tool in ["paru", "yay"] {
        if is_executable_in_path(aur_tool) {
            if let Ok(output) = Command::new(aur_tool).args(["-Qm"]).output() {
                if output.status.success() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    for line in stdout.lines() {
                        let mut parts = line.split_whitespace();
                        if let (Some(name), Some(version)) = (parts.next(), parts.next()) {
                            let key = format!("aur:{}", name);
                            if seen.insert(key) {
                                packages.push(SystemPackage {
                                    name: name.to_string(),
                                    version: version.to_string(),
                                    manager: "aur".to_string(),
                                    description: None,
                                    installed: true,
                                    icon: resolve_linux_icon_path(name),
                                });
                            }
                        }
                    }
                }
            }
            break;
        }
    }

    // 3. Check Flatpak
    if is_executable_in_path("flatpak") {
        if let Ok(output) = Command::new("flatpak")
            .args(["list", "--app", "--columns=application,name,version"])
            .output()
        {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let parts: Vec<&str> = line.split('\t').collect();
                    if !parts.is_empty() {
                        let app_id = parts[0].trim();
                        let app_name = parts.get(1).unwrap_or(&app_id).trim();
                        let version = parts.get(2).unwrap_or(&"latest").trim();
                        let key = format!("flatpak:{}", app_id);
                        if seen.insert(key) {
                            packages.push(SystemPackage {
                                name: if !app_name.is_empty() { app_name.to_string() } else { app_id.to_string() },
                                version: version.to_string(),
                                manager: "flatpak".to_string(),
                                description: Some(app_id.to_string()),
                                installed: true,
                                icon: resolve_linux_icon_path(app_id),
                            });
                        }
                    }
                }
            }
        }
    }

    // 4. Check Snap
    if is_executable_in_path("snap") {
        if let Ok(output) = Command::new("snap").args(["list"]).output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for (idx, line) in stdout.lines().enumerate() {
                    if idx == 0 { continue; } // skip header
                    let mut parts = line.split_whitespace();
                    if let (Some(name), Some(version)) = (parts.next(), parts.next()) {
                        let key = format!("snap:{}", name);
                        if seen.insert(key) {
                            packages.push(SystemPackage {
                                name: name.to_string(),
                                version: version.to_string(),
                                manager: "snap".to_string(),
                                description: None,
                                installed: true,
                                icon: resolve_linux_icon_path(name),
                            });
                        }
                    }
                }
            }
        }
    }

    // 5. Check APT (Debian/Ubuntu)
    if is_executable_in_path("dpkg-query") {
        if let Ok(output) = Command::new("dpkg-query")
            .args(["-W", "-f=${Package}\t${Version}\t${Status}\n"])
            .output()
        {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let parts: Vec<&str> = line.split('\t').collect();
                    if parts.len() >= 3 && parts[2].contains("installed") {
                        let name = parts[0].trim();
                        let version = parts[1].trim();
                        let key = format!("apt:{}", name);
                        if seen.insert(key) {
                            packages.push(SystemPackage {
                                name: name.to_string(),
                                version: version.to_string(),
                                manager: "apt".to_string(),
                                description: None,
                                installed: true,
                                icon: resolve_linux_icon_path(name),
                            });
                        }
                    }
                }
            }
        }
    }

    // 6. Check Homebrew
    if is_executable_in_path("brew") {
        if let Ok(output) = Command::new("brew").args(["list", "--versions"]).output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let mut parts = line.split_whitespace();
                    if let (Some(name), Some(version)) = (parts.next(), parts.next()) {
                        let key = format!("brew:{}", name);
                        if seen.insert(key) {
                            packages.push(SystemPackage {
                                name: name.to_string(),
                                version: version.to_string(),
                                manager: "brew".to_string(),
                                description: None,
                                installed: true,
                                icon: None,
                            });
                        }
                    }
                }
            }
        }
    }

    // Sort alphabetically by package name
    packages.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    packages
}

/// Look up icons on standard Linux Freedesktop paths
pub fn resolve_linux_icon_path(app_name: &str) -> Option<String> {
    #[cfg(unix)]
    {
        let icon_dirs = [
            "/usr/share/icons/hicolor/scalable/apps",
            "/usr/share/icons/hicolor/48x48/apps",
            "/usr/share/icons/hicolor/64x64/apps",
            "/usr/share/icons/hicolor/128x128/apps",
            "/usr/share/icons/hicolor/256x256/apps",
            "/usr/share/pixmaps",
        ];

        let extensions = ["svg", "png"];

        // 1. Direct match with name
        for dir in icon_dirs {
            for ext in extensions {
                let p = PathBuf::from(dir).join(format!("{}.{}", app_name, ext));
                if p.exists() {
                    return Some(p.to_string_lossy().to_string());
                }
            }
        }

        // 2. Inspect /usr/share/applications/*.desktop for Icon= property
        let desktop_paths = [
            format!("/usr/share/applications/{}.desktop", app_name),
            format!("/usr/share/applications/{}.desktop", app_name.to_lowercase()),
        ];

        for dp in desktop_paths {
            let path = Path::new(&dp);
            if path.exists() {
                if let Ok(content) = std::fs::read_to_string(path) {
                    for line in content.lines() {
                        if line.starts_with("Icon=") {
                            let icon_val = line.trim_start_matches("Icon=").trim();
                            if icon_val.starts_with('/') && Path::new(icon_val).exists() {
                                return Some(icon_val.to_string());
                            }
                            // Search icon name in icon dirs
                            for dir in icon_dirs {
                                for ext in extensions {
                                    let p = PathBuf::from(dir).join(format!("{}.{}", icon_val, ext));
                                    if p.exists() {
                                        return Some(p.to_string_lossy().to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let _ = app_name;
    None
}

/// Convert an icon on disk to a data URL (base64) so webview can safely render it
pub fn read_icon_as_data_url(file_path: &str) -> Option<String> {
    use base64::Engine;
    let path = Path::new(file_path);
    if !path.exists() {
        return None;
    }

    let ext = path.extension()?.to_str()?.to_lowercase();
    let bytes = std::fs::read(path).ok()?;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);

    let mime = match ext.as_str() {
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        _ => "image/png",
    };

    Some(format!("data:{};base64,{}", mime, encoded))
}

/// Build an execution command for batch actions
pub fn build_action_command(action: &str, packages: &[String], manager: Option<&str>) -> (String, Vec<String>) {
    let managers = detect_available_managers();
    let preferred = manager
        .and_then(|m| managers.iter().find(|info| info.id == m && info.available))
        .or_else(|| managers.iter().find(|info| info.available))
        .map(|info| info.id.as_str())
        .unwrap_or("paru");

    match action {
        "install" => match preferred {
            "paru" => ("paru".to_string(), [vec!["-S".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat()),
            "yay" => ("yay".to_string(), [vec!["-S".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat()),
            "pacman" => ("sudo".to_string(), [vec!["pacman".to_string(), "-S".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat()),
            "flatpak" => ("flatpak".to_string(), [vec!["install".to_string(), "-y".to_string()], packages.to_vec()].concat()),
            "snap" => ("sudo".to_string(), [vec!["snap".to_string(), "install".to_string()], packages.to_vec()].concat()),
            "apt" => ("sudo".to_string(), [vec!["apt".to_string(), "install".to_string(), "-y".to_string()], packages.to_vec()].concat()),
            "dnf" => ("sudo".to_string(), [vec!["dnf".to_string(), "install".to_string(), "-y".to_string()], packages.to_vec()].concat()),
            "brew" => ("brew".to_string(), [vec!["install".to_string()], packages.to_vec()].concat()),
            _ => ("echo".to_string(), packages.to_vec()),
        },
        "update" | "upgrade" => match preferred {
            "paru" => {
                if packages.is_empty() {
                    ("paru".to_string(), vec!["-Syu".to_string(), "--noconfirm".to_string()])
                } else {
                    ("paru".to_string(), [vec!["-S".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat())
                }
            },
            "yay" => {
                if packages.is_empty() {
                    ("yay".to_string(), vec!["-Syu".to_string(), "--noconfirm".to_string()])
                } else {
                    ("yay".to_string(), [vec!["-S".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat())
                }
            },
            "pacman" => {
                if packages.is_empty() {
                    ("sudo".to_string(), vec!["pacman".to_string(), "-Syu".to_string(), "--noconfirm".to_string()])
                } else {
                    ("sudo".to_string(), [vec!["pacman".to_string(), "-S".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat())
                }
            },
            "flatpak" => {
                if packages.is_empty() {
                    ("flatpak".to_string(), vec!["update".to_string(), "-y".to_string()])
                } else {
                    ("flatpak".to_string(), [vec!["update".to_string(), "-y".to_string()], packages.to_vec()].concat())
                }
            },
            _ => ("echo".to_string(), vec!["update completed".to_string()]),
        },
        "remove" | "uninstall" => match preferred {
            "paru" => ("paru".to_string(), [vec!["-Rns".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat()),
            "yay" => ("yay".to_string(), [vec!["-Rns".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat()),
            "pacman" => ("sudo".to_string(), [vec!["pacman".to_string(), "-Rns".to_string(), "--noconfirm".to_string()], packages.to_vec()].concat()),
            "flatpak" => ("flatpak".to_string(), [vec!["uninstall".to_string(), "-y".to_string()], packages.to_vec()].concat()),
            "snap" => ("sudo".to_string(), [vec!["snap".to_string(), "remove".to_string()], packages.to_vec()].concat()),
            "apt" => ("sudo".to_string(), [vec!["apt".to_string(), "remove".to_string(), "-y".to_string()], packages.to_vec()].concat()),
            _ => ("echo".to_string(), packages.to_vec()),
        },
        _ => ("echo".to_string(), vec!["unknown action".to_string()]),
    }
}
