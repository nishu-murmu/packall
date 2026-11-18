use crate::data::{get_categories, get_software_catalogue, Category, SoftwareEntry};
use crate::system::{
    build_action_command, detect_available_managers, detect_distro_info,
    execute_multi_step_commands, invalidate_system_cache, read_icon_as_data_url,
    resolve_linux_icon_path, scan_system_packages, ActionExecutionResult, DistroInfo,
    MultiStepActionResult, MultiStepCommand, PackageManagerInfo, SystemPackage,
};
use crate::jobs::{cancel_batch, forget_sudo, run_batch, sudo_status, unlock_sudo, JobSpec};
use crate::repos::{self, RepoPackage};
use crate::updates::{check_updates, PackageUpdate};
use serde::Serialize;
use std::collections::BTreeMap;
use std::process::Command;
use tauri::{AppHandle, Emitter};

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
pub fn get_distro_info() -> DistroInfo {
    detect_distro_info()
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

            if success {
                invalidate_system_cache();
            }

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

#[tauri::command]
pub fn execute_multi_step_action(
    steps: Vec<MultiStepCommand>,
) -> Result<MultiStepActionResult, String> {
    Ok(execute_multi_step_commands(steps))
}

/// Start a batch of install / update / remove jobs on a background thread and
/// return immediately. Progress is delivered through `packall-job` events.
#[tauri::command]
pub fn start_batch(app: AppHandle, batch_id: String, jobs: Vec<JobSpec>) -> Result<(), String> {
    std::thread::Builder::new()
        .name(format!("packall-batch-{}", batch_id))
        .spawn(move || {
            let id = batch_id.clone();
            run_batch(&id, jobs, |event| {
                let _ = app.emit("packall-job", event);
            });
            invalidate_system_cache();
            // A full upgrade may have synced new repository databases.
            repos::invalidate_index();
        })
        .map(|_| ())
        .map_err(|e| format!("Failed to start background worker: {}", e))
}

#[tauri::command]
pub fn cancel_batch_job(batch_id: String) -> bool {
    cancel_batch(&batch_id)
}

/// "ready" | "needs_password" | "unavailable"
#[tauri::command]
pub fn sudo_state() -> String {
    sudo_status().to_string()
}

#[tauri::command]
pub fn unlock_privileges(password: String) -> Result<(), String> {
    unlock_sudo(&password)
}

#[tauri::command]
pub fn forget_privileges() {
    forget_sudo()
}

/// Whether a newer Packall release exists, and how this install would update.
#[tauri::command]
pub async fn check_app_update() -> Result<crate::self_update::UpdateInfo, String> {
    tauri::async_runtime::spawn_blocking(crate::self_update::check)
        .await
        .map_err(|e| e.to_string())?
}

/// Replace the running AppImage with the latest release. Returns the new version.
#[tauri::command]
pub async fn apply_app_update() -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(crate::self_update::apply_appimage)
        .await
        .map_err(|e| e.to_string())?
}

/// Every installed package with a newer version waiting. Slow — most managers
/// ask the network — so it runs off the main thread.
#[tauri::command]
pub async fn check_package_updates() -> Vec<PackageUpdate> {
    tauri::async_runtime::spawn_blocking(check_updates).await.unwrap_or_default()
}

#[derive(Serialize)]
pub struct RepoIndexInfo {
    pub total: usize,
    /// Package count per manager, e.g. {"pacman": 14000}.
    pub counts: BTreeMap<String, usize>,
    pub error: Option<String>,
}

/// How many packages the host's repositories offer. Reading the index the
/// first time takes a second or two.
#[tauri::command]
pub async fn repo_index_info() -> RepoIndexInfo {
    tauri::async_runtime::spawn_blocking(|| {
        let ix = repos::index();
        RepoIndexInfo { total: ix.len(), counts: ix.counts(), error: ix.error.clone() }
    })
    .await
    .unwrap_or(RepoIndexInfo { total: 0, counts: BTreeMap::new(), error: Some("index worker failed".into()) })
}

#[derive(Serialize)]
pub struct RepoSearch {
    pub hits: Vec<RepoPackage>,
    /// Matches before the limit was applied.
    pub total: usize,
}

#[tauri::command]
pub async fn search_repositories(query: String, limit: Option<usize>) -> RepoSearch {
    let limit = limit.unwrap_or(500).min(2000);
    tauri::async_runtime::spawn_blocking(move || {
        let (hits, total) = repos::index().search(&query, limit);
        RepoSearch { hits, total }
    })
    .await
    .unwrap_or(RepoSearch { hits: Vec::new(), total: 0 })
}

#[tauri::command]
pub async fn search_aur_packages(query: String) -> Result<Vec<RepoPackage>, String> {
    tauri::async_runtime::spawn_blocking(move || repos::search_aur(&query))
        .await
        .map_err(|e| e.to_string())?
}
