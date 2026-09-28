pub mod cli;
pub mod commands;
pub mod data;
pub mod system;

use commands::{
    detect_package_managers, execute_package_action, get_all_categories,
    get_catalogue_software, get_system_packages, open_external_url, resolve_app_icon,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_all_categories,
            get_catalogue_software,
            get_system_packages,
            detect_package_managers,
            execute_package_action,
            open_external_url,
            resolve_app_icon,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
