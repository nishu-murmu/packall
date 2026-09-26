# Tauri & Rust Native Layer

Almanac uses Tauri v2 to achieve native desktop speed, minimal RAM usage (< 40MB idle), and small package footprints compared to traditional Chromium/Electron wrappers.

## Tauri Commands

The Rust backend exposes Tauri commands invoked through `@tauri-apps/api/core`:

### 1. `detect_package_managers`
Detects which package managers are installed on the user's host machine by querying the system path.

```rust
#[tauri::command]
pub fn detect_package_managers() -> Vec<String> {
    let mut managers = Vec::new();
    for (cmd, _) in &[
        ("apt", "apt"),
        ("dnf", "dnf"),
        ("pacman", "pacman"),
        ("zypper", "zypper"),
        ("flatpak", "flatpak"),
        ("snap", "snap"),
        ("brew", "brew"),
    ] {
        if Command::new("which").arg(cmd).output().map(|o| o.status.success()).unwrap_or(false) {
            managers.push(cmd.to_string());
        }
    }
    managers
}
```

### 2. `run_install_command`
Prepares or delegates package execution to the user's chosen terminal emulator (e.g. `kitty`, `alacritty`, `gnome-terminal`, or `konsole`).

```rust
#[tauri::command]
pub fn run_install_command(command: String) -> Result<String, String> {
    Ok(format!("Command queued: {}", command))
}
```
