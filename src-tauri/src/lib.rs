pub mod cli;
pub mod commands;
pub mod data;
pub mod jobs;
pub mod system;

use commands::{
    detect_package_managers, execute_multi_step_action, execute_package_action,
    cancel_batch_job, forget_privileges, get_all_categories, get_catalogue_software, get_distro_info, get_system_packages,
    open_external_url, resolve_app_icon, start_batch, sudo_state, unlock_privileges,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            // Pre-warm system package and distro caches in background thread for instant UI response
            std::thread::spawn(|| {
                let _ = system::detect_distro_info();
                let _ = system::scan_system_packages();
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_categories,
            get_catalogue_software,
            get_system_packages,
            detect_package_managers,
            get_distro_info,
            execute_package_action,
            execute_multi_step_action,
            open_external_url,
            resolve_app_icon,
            start_batch,
            cancel_batch_job,
            sudo_state,
            unlock_privileges,
            forget_privileges,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
