use crate::data::{get_categories, Category};
use std::process::Command;

#[tauri::command]
pub fn get_all_categories() -> Vec<Category> {
    get_categories()
}

#[tauri::command]
pub fn run_install_command(command: String) -> Result<String, String> {
    // In a real app, this would execute the install command in a terminal
    // For now, we return the command that would be run
    Ok(format!("Command queued: {}", command))
}

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
        if Command::new("which")
            .arg(cmd)
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            managers.push(cmd.to_string());
        }
    }

    managers
}
