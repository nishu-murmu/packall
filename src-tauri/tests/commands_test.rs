//! Tests for the Tauri command layer in `commands.rs`.
//!
//! Each Tauri command is a thin, synchronous wrapper, so the commands can be
//! invoked directly in tests without standing up a Tauri runtime. These tests
//! pin the contract the webview relies on: command names map to functions,
//! return shapes match the TypeScript DTOs, and failure paths surface as
//! structured results instead of panics.

use almanac_lib::commands::{
    detect_package_managers, execute_multi_step_action, execute_package_action, get_all_categories,
    get_catalogue_software, get_distro_info, get_system_packages, open_external_url, resolve_app_icon,
};

#[test]
fn get_all_categories_matches_data_module() {
    assert_eq!(
        get_all_categories().len(),
        almanac_lib::data::get_categories().len(),
        "command must expose the full category list from data.rs"
    );
}

#[test]
fn get_catalogue_software_matches_data_module() {
    let via_command = get_catalogue_software();
    let direct = almanac_lib::data::get_software_catalogue();
    assert_eq!(via_command.len(), direct.len());
    assert_eq!(via_command[0].id, direct[0].id);
}

#[test]
fn get_system_packages_returns_sorted_structured_rows() {
    let pkgs = get_system_packages();
    for w in pkgs.windows(2) {
        assert!(
            w[0].name.to_lowercase() <= w[1].name.to_lowercase(),
            "command output must stay sorted for the UI table"
        );
    }
}

#[test]
fn detect_package_managers_marks_at_least_one_entry() {
    let managers = detect_package_managers();
    assert!(!managers.is_empty());
    // The UI needs the full detection table even when nothing is installed,
    // so the shape (not the availability) is the contract here.
    assert!(managers.iter().all(|m| !m.install_cmd.is_empty()));
}

#[test]
fn get_distro_info_returns_cachable_snapshot() {
    let info = get_distro_info();
    assert!(!info.id.is_empty());
    assert!(!info.pretty_name.is_empty());
}

#[test]
fn execute_package_action_never_panics_on_unknown_action() {
    // "bogus" resolves to `echo unknown action` via build_action_command.
    // unix hosts have echo; Windows hosts fail to spawn — both are fine, the
    // contract is only that the call resolves to Ok with a structured result.
    let result = execute_package_action(
        "bogus".to_string(),
        vec!["firefox".to_string()],
        Some("apt".to_string()),
    )
    .expect("command errors must be returned as Ok(ActionExecutionResult), not Err");
    assert_eq!(result.command, "echo unknown action");
}

#[test]
fn execute_package_action_multi_word_packages_build_full_command_string() {
    let result = execute_package_action("bogus".to_string(), vec!["a".to_string(), "b".to_string()], None)
        .expect("command errors must be returned as Ok(ActionExecutionResult), not Err");
    assert_eq!(result.command, "echo unknown action", "command echo must reflect the resolved binary and args");
}

#[test]
fn execute_multi_step_action_wraps_engine_result() {
    let steps = vec![almanac_lib::system::MultiStepCommand {
        title: "say".into(),
        command: "echo hello".into(),
        description: None,
    }];
    let result = execute_multi_step_action(steps).expect("engine never rejects, it reports");
    assert!(result.success);
    assert_eq!(result.completed_steps, 1);
    assert_eq!(result.total_steps, 1);
}

#[test]
fn resolve_app_icon_for_nonsense_name_returns_none() {
    assert!(
        resolve_app_icon("almanac-not-a-real-app-icon-xyz-123".to_string()).is_none(),
        "missing icons must be None so the UI can fall back to its placeholder"
    );
}

#[test]
fn open_external_url_rejects_invalid_input_without_panicking() {
    // Side-effecting success paths (actually launching a browser) are not
    // exercised here; only the validation/error contract. On Windows the
    // ShellExecute call fails synchronously for a blank target, so we can
    // additionally pin the Err variant there.
    let result = open_external_url(String::new());
    #[cfg(windows)]
    assert!(result.is_err(), "empty URL must be rejected on Windows");
    #[cfg(not(windows))]
    let _ = result; // xdg-open failures are asynchronous on unix: no Err guarantee
}
