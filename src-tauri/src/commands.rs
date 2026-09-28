use crate::data::{get_categories, get_software_catalogue, Category, SoftwareEntry};
use crate::system::{
    build_action_command, detect_available_managers, read_icon_as_data_url,
    resolve_linux_icon_path, scan_system_packages, ActionExecutionResult, PackageManagerInfo,
    SystemPackage,
};
use std::process::Command;

#[tauri::command]
pub fn get_all_categories() -> Vec<Category> {
    get_categories()
}

#[tauri::command]
pub fn get_catalogue_software() -> Vec<SoftwareEntry> {
    get_software_catalogue()
}

#[tauri::command]
pub fn get_system_packages() -> Vec<SystemPackage> {
    scan_system_packages()
}

#[tauri::command]
pub fn detect_package_managers() -> Vec<PackageManagerInfo> {
    detect_available_managers()
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| format!("Failed to open URL '{}': {}", url, e))
}

#[tauri::command]
pub fn resolve_app_icon(icon_name: String) -> Option<String> {
    if let Some(path) = resolve_linux_icon_path(&icon_name) {
        return read_icon_as_data_url(&path);
    }
    None
}

#[tauri::command]
pub fn execute_package_action(
    action: String,
    packages: Vec<String>,
    manager: Option<String>,
) -> Result<ActionExecutionResult, String> {
    let (bin, args) = build_action_command(&action, &packages, manager.as_deref());
    let full_command = format!("{} {}", bin, args.join(" "));

    match Command::new(&bin).args(&args).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let success = output.status.success();

            Ok(ActionExecutionResult {
                success,
                command: full_command,
                output: if stdout.is_empty() { stderr.clone() } else { stdout },
                error: if success { None } else { Some(stderr) },
            })
        }
        Err(e) => Ok(ActionExecutionResult {
            success: false,
            command: full_command,
            output: String::new(),
            error: Some(format!("Failed to execute command: {}", e)),
        }),
    }
}
