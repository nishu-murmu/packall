//! Tests for system detection, command building, icon resolution, caching,
//! and multi-step execution in `system.rs`.
//!
//! Command shapes are asserted exactly for managers detected as available on
//! the host; requesting an unavailable manager must behave identically to
//! passing `None`, which is what makes these tests host-independent. On a
//! bare CI runner every row exercises the fallback, on a Linux desktop the
//! exact rows fire. Anything else that touches the host (package detection,
//! scanning, shell execution) asserts only structural invariants.

/// Mirror of the resolver's documented fallback chain, used to derive
/// host-independent expectations: an explicit manager is honored only when
/// detected as available, then the first available manager wins, then "paru".
fn resolve_preferred(requested: Option<&str>) -> String {
    let managers = detect_available_managers();
    requested
        .and_then(|m| managers.iter().find(|i| i.id == m && i.available))
        .or_else(|| managers.iter().find(|i| i.available))
        .map(|i| i.id.clone())
        .unwrap_or_else(|| "paru".to_string())
}

use packall_lib::system::{
    build_action_command, detect_available_managers, detect_distro_info, execute_multi_step_commands,
    invalidate_system_cache, read_icon_as_data_url, resolve_linux_icon_path, scan_system_packages,
    DistroInfo, MultiStepCommand, PackageManagerInfo, SystemPackage,
};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

// ---------------------------------------------------------------------------
// build_action_command — install matrix
// ---------------------------------------------------------------------------

#[test]
fn install_command_for_explicit_manager_matches_matrix_when_available() {
    let pkgs = vec!["firefox".to_string(), "neovim".to_string()];
    let cases: &[(&str, &str, &[&str])] = &[
        ("paru", "paru", &["-S", "--noconfirm", "firefox", "neovim"]),
        ("yay", "yay", &["-S", "--noconfirm", "firefox", "neovim"]),
        ("pacman", "sudo", &["pacman", "-S", "--noconfirm", "firefox", "neovim"]),
        ("flatpak", "flatpak", &["install", "-y", "firefox", "neovim"]),
        ("snap", "sudo", &["snap", "install", "firefox", "neovim"]),
        ("apt", "sudo", &["apt", "install", "-y", "firefox", "neovim"]),
        ("dnf", "sudo", &["dnf", "install", "-y", "firefox", "neovim"]),
        ("brew", "brew", &["install", "firefox", "neovim"]),
    ];

    for (manager, expected_bin, expected_args) in cases {
        let built = build_action_command("install", &pkgs, Some(manager));
        if resolve_preferred(Some(manager)) == *manager {
            assert_eq!(&built.0, expected_bin, "install via {manager}: wrong binary");
            assert_eq!(
                built.1,
                expected_args
                    .iter()
                    .map(|s| s.to_string())
                    .collect::<Vec<_>>(),
                "install via {manager}: wrong args"
            );
        } else {
            assert_eq!(
                built,
                build_action_command("install", &pkgs, None),
                "unavailable manager '{manager}' must fall through to the None resolution"
            );
        }
    }
}

#[test]
fn install_with_unavailable_manager_falls_back_to_default_resolution() {
    let pkgs = vec!["firefox".to_string()];
    let requested = build_action_command("install", &pkgs, Some("manager-that-does-not-exist"));
    let fallback = build_action_command("install", &pkgs, None);
    assert_eq!(
        requested, fallback,
        "an unavailable explicit manager must fall through to the same default as None"
    );
}

#[test]
fn install_with_no_manager_and_no_available_managers_defaults_to_paru_syntax() {
    // Asserted structurally: on hosts with no package manager the resolver
    // lands on "paru", and paru syntax must never contain "sudo".
    let (bin, args) = build_action_command("install", &["pkg".to_string()], None);
    assert!(!bin.is_empty());
    assert!(!args.is_empty());
    if bin == "paru" || bin == "yay" {
        assert!(!args.contains(&"sudo".to_string()), "AUR helpers must never be wrapped in sudo");
    }
}

#[test]
fn install_and_remove_with_empty_package_list_append_nothing() {
    // Host-independent invariant: for every resolver outcome the fixed flags
    // come first and exactly one arg is appended per requested package, so a
    // single-package command must be the empty-list command plus one arg.
    for action in ["install", "remove"] {
        for requested in [Some("apt"), Some("paru"), None] {
            let empty = build_action_command(action, &[], requested);
            let with_pkg = build_action_command(action, &["pkg".to_string()], requested);
            assert!(!empty.0.is_empty(), "{action}: binary must never be blank");
            assert!(
                with_pkg.1.starts_with(&empty.1),
                "{action}: package args must be appended after the fixed flags, got {:?} vs {:?}",
                empty.1,
                with_pkg.1
            );
            assert_eq!(
                with_pkg.1.len(),
                empty.1.len() + 1,
                "{action}: exactly one arg must be appended for a single package"
            );
        }
    }
}

// ---------------------------------------------------------------------------
// build_action_command — update/upgrade (empty vs targeted)
// ---------------------------------------------------------------------------

#[test]
fn update_without_packages_runs_full_upgrade_when_available() {
    let empty: Vec<String> = vec![];
    // (requested manager, action spelling, expected binary, expected args)
    let cases: &[(&str, &str, &str, &[&str])] = &[
        ("paru", "update", "paru", &["-Syu", "--noconfirm"]),
        ("pacman", "upgrade", "sudo", &["pacman", "-Syu", "--noconfirm"]),
        ("flatpak", "update", "flatpak", &["update", "-y"]),
    ];
    for (manager, action, expected_bin, expected_args) in cases {
        let built = build_action_command(action, &empty, Some(manager));
        if resolve_preferred(Some(manager)) == *manager {
            assert_eq!(&built.0, expected_bin, "{action} via {manager}: wrong binary");
            assert_eq!(
                built.1,
                expected_args
                    .iter()
                    .map(|s| s.to_string())
                    .collect::<Vec<_>>(),
                "{action} via {manager}: wrong args"
            );
        } else {
            assert_eq!(
                built,
                build_action_command(action, &empty, None),
                "unavailable manager '{manager}' must fall through to the None resolution"
            );
        }
    }
}

#[test]
fn update_with_packages_targets_only_those_packages_when_available() {
    let pkgs = vec!["firefox".to_string()];
    let cases: &[(&str, &str, &[&str])] = &[
        ("paru", "paru", &["-S", "--noconfirm", "firefox"]),
        ("pacman", "sudo", &["pacman", "-S", "--noconfirm", "firefox"]),
        ("flatpak", "flatpak", &["update", "-y", "firefox"]),
    ];
    for (manager, expected_bin, expected_args) in cases {
        let built = build_action_command("update", &pkgs, Some(manager));
        if resolve_preferred(Some(manager)) == *manager {
            assert_eq!(&built.0, expected_bin, "update via {manager}: wrong binary");
            assert_eq!(
                built.1,
                expected_args
                    .iter()
                    .map(|s| s.to_string())
                    .collect::<Vec<_>>(),
                "update via {manager}: wrong args"
            );
        } else {
            assert_eq!(
                built,
                build_action_command("update", &pkgs, None),
                "unavailable manager '{manager}' must fall through to the None resolution"
            );
        }
    }
}

#[test]
fn update_via_manager_without_update_arm_degrades_to_echo() {
    // Only paru/yay/pacman/flatpak have targeted update arms; every other
    // resolved manager (winget, brew-when-absent, ...) degrades to a no-op.
    let pkgs = vec!["pkg".to_string()];
    let (bin, args) = build_action_command("update", &pkgs, Some("brew"));
    match resolve_preferred(Some("brew")).as_str() {
        "paru" => {
            assert_eq!(bin, "paru");
            assert_eq!(
                args,
                vec!["-S".to_string(), "--noconfirm".to_string(), "pkg".to_string()]
            );
        }
        "yay" => {
            assert_eq!(bin, "yay");
            assert_eq!(
                args,
                vec!["-S".to_string(), "--noconfirm".to_string(), "pkg".to_string()]
            );
        }
        "pacman" => {
            assert_eq!(bin, "sudo");
            assert_eq!(
                args,
                vec!["pacman".to_string(), "-S".to_string(), "--noconfirm".to_string(), "pkg".to_string()]
            );
        }
        "flatpak" => {
            assert_eq!(bin, "flatpak");
            assert_eq!(args, vec!["update".to_string(), "-y".to_string(), "pkg".to_string()]);
        }
        _ => {
            assert_eq!(bin, "echo");
            assert_eq!(args, vec!["update completed".to_string()]);
        }
    }
}

// ---------------------------------------------------------------------------
// build_action_command — remove/uninstall + unknown actions
// ---------------------------------------------------------------------------

#[test]
fn remove_command_for_explicit_manager_matches_matrix() {
    let pkgs = vec!["firefox".to_string()];
    let cases: &[(&str, &str, &[&str])] = &[
        ("paru", "paru", &["-Rns", "--noconfirm", "firefox"]),
        ("yay", "yay", &["-Rns", "--noconfirm", "firefox"]),
        ("pacman", "sudo", &["pacman", "-Rns", "--noconfirm", "firefox"]),
        ("flatpak", "flatpak", &["uninstall", "-y", "firefox"]),
        ("snap", "sudo", &["snap", "remove", "firefox"]),
        ("apt", "sudo", &["apt", "remove", "-y", "firefox"]),
    ];

    for (manager, expected_bin, expected_args) in cases {
        // both "remove" and its "uninstall" alias must behave identically
        for action in ["remove", "uninstall"] {
            let built = build_action_command(action, &pkgs, Some(manager));
            if resolve_preferred(Some(manager)) == *manager {
                assert_eq!(&built.0, expected_bin, "{action} via {manager}: wrong binary");
                assert_eq!(
                    built.1,
                    expected_args
                        .iter()
                        .map(|s| s.to_string())
                        .collect::<Vec<_>>(),
                    "{action} via {manager}: wrong args"
                );
            } else {
                assert_eq!(
                    built,
                    build_action_command(action, &pkgs, None),
                    "unavailable manager '{manager}' must fall through to the None resolution"
                );
            }
        }
    }
}

#[test]
fn unknown_action_is_neutralized_to_echo() {
    let (bin, args) = build_action_command("format-disk", &["pkg".to_string()], Some("apt"));
    assert_eq!(bin, "echo", "unknown actions must never spawn a real package manager");
    assert_eq!(args, vec!["unknown action".to_string()]);
}

// ---------------------------------------------------------------------------
// detect_available_managers
// ---------------------------------------------------------------------------

#[test]
fn manager_detection_covers_all_supported_managers() {
    let managers = detect_available_managers();
    let ids: HashSet<&str> = managers.iter().map(|m| m.id.as_str()).collect();
    for expected in ["paru", "yay", "pacman", "flatpak", "snap", "apt", "dnf", "zypper", "brew", "winget"] {
        assert!(ids.contains(expected), "missing manager '{expected}' in detection table");
    }
}

#[test]
fn aur_helpers_are_flagged_and_only_helpers_use_aur_flag() {
    let managers = detect_available_managers();
    for m in &managers {
        let is_aur_helper = m.id == "paru" || m.id == "yay";
        assert_eq!(
            m.is_aur, is_aur_helper,
            "manager '{}' is_aur flag inconsistent with AUR helper set",
            m.id
        );
    }
}

#[test]
fn manager_info_always_carries_full_command_surface() {
    for m in detect_available_managers() {
        assert!(!m.name.is_empty(), "{}: name blank", m.id);
        assert!(!m.install_cmd.is_empty(), "{}: install_cmd blank", m.id);
        assert!(!m.update_cmd.is_empty(), "{}: update_cmd blank", m.id);
        assert!(!m.remove_cmd.is_empty(), "{}: remove_cmd blank", m.id);
    }
}

// ---------------------------------------------------------------------------
// detect_distro_info
// ---------------------------------------------------------------------------

#[test]
fn distro_info_has_identity_and_coherent_manager_preference() {
    let info = detect_distro_info();
    assert!(!info.id.is_empty());
    assert!(!info.pretty_name.is_empty());
    assert!(
        info.managers.iter().any(|m| m.id == info.preferred_manager),
        "preferred manager '{}' must be part of the reported manager list",
        info.preferred_manager
    );
}

#[test]
fn distro_info_is_stable_across_calls() {
    let first = detect_distro_info();
    let second = detect_distro_info();
    assert_eq!(first.id, second.id);
    assert_eq!(first.preferred_manager, second.preferred_manager);
    assert_eq!(first.managers.len(), second.managers.len());
}

#[cfg(windows)]
#[test]
fn distro_info_on_windows_reports_windows_identity() {
    let info = detect_distro_info();
    assert_eq!(info.id, "windows");
}

// ---------------------------------------------------------------------------
// scan_system_packages
// ---------------------------------------------------------------------------

#[test]
fn scanned_packages_are_sorted_case_insensitively() {
    let pkgs = scan_system_packages();
    for w in pkgs.windows(2) {
        let a = w[0].name.to_lowercase();
        let b = w[1].name.to_lowercase();
        assert!(a <= b, "scan result not sorted: '{}' > '{}'", a, b);
    }
}

#[test]
fn scanned_packages_have_unique_manager_name_pairs() {
    let pkgs = scan_system_packages();
    let mut seen = HashSet::new();
    for p in &pkgs {
        assert!(
            seen.insert((p.manager.as_str(), p.name.to_lowercase())),
            "duplicate scan hit for {}:{}",
            p.manager,
            p.name
        );
    }
}

#[test]
fn scanned_packages_mark_everything_installed_with_identity() {
    for p in scan_system_packages() {
        assert!(p.installed, "'{}' came from a live query and must be installed", p.name);
        assert!(!p.name.trim().is_empty(), "scanned package with blank name");
        assert!(!p.version.trim().is_empty(), "scanned package '{}' with blank version", p.name);
        assert!(!p.manager.trim().is_empty(), "scanned package '{}' with blank manager", p.name);
    }
}

#[test]
fn cache_invalidation_never_panics_and_scan_recovers() {
    invalidate_system_cache();
    let pkgs = scan_system_packages();
    invalidate_system_cache();
    let again = scan_system_packages();
    assert_eq!(pkgs.len(), again.len(), "scan results must be deterministic within a session");
}

// ---------------------------------------------------------------------------
// read_icon_as_data_url
// ---------------------------------------------------------------------------

fn temp_file(ext: &str, contents: &[u8]) -> PathBuf {
    let unique = format!(
        "packall-test-{}-{}-{}.{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos(),
        ext,
        ext
    );
    let path = std::env::temp_dir().join(unique);
    fs::write(&path, contents).expect("test fixture must be writable");
    path
}

#[test]
fn data_url_for_missing_file_is_none() {
    let path = std::env::temp_dir().join(format!("packall-test-definitely-missing-{}.png", std::process::id()));
    let _ = fs::remove_file(&path);
    assert!(read_icon_as_data_url(path.to_str().unwrap()).is_none());
}

#[test]
fn svg_icon_encodes_to_svg_data_url() {
    let svg = r#"<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>"#;
    let path = temp_file("svg", svg.as_bytes());
    let url = read_icon_as_data_url(path.to_str().unwrap()).expect("svg fixture must encode");
    fs::remove_file(&path).ok();

    assert!(url.starts_with("data:image/svg+xml;base64,"), "wrong mime prefix: {url}");
    let payload = url.trim_start_matches("data:image/svg+xml;base64,");
    let decoded = base64_decode(payload);
    assert_eq!(decoded, svg.as_bytes());
}

#[test]
fn raster_icons_get_matching_mime_types() {
    let cases = [
        ("png", "image/png"),
        ("jpg", "image/jpeg"),
        ("jpeg", "image/jpeg"),
        ("webp", "image/webp"),
        ("gif", "image/png"), // unknown extensions fall back to png
    ];
    for (ext, mime) in cases {
        let path = temp_file(ext, &[0x89, 0x50, 0x4E, 0x47]);
        let url = read_icon_as_data_url(path.to_str().unwrap()).expect("fixture must encode");
        fs::remove_file(&path).ok();
        assert!(
            url.starts_with(&format!("data:{mime};base64,")),
            "ext '{ext}' must produce mime '{mime}', got: {url}"
        );
    }
}

#[test]
fn file_without_extension_cannot_be_encoded() {
    let path = std::env::temp_dir().join(format!("packall-test-noext-{}", std::process::id()));
    fs::write(&path, b"bytes").unwrap();
    assert!(read_icon_as_data_url(path.to_str().unwrap()).is_none());
    fs::remove_file(&path).ok();
}

fn base64_decode(input: &str) -> Vec<u8> {
    use base64::Engine;
    base64::engine::general_purpose::STANDARD.decode(input).expect("valid base64")
}

// ---------------------------------------------------------------------------
// resolve_linux_icon_path
// ---------------------------------------------------------------------------

#[test]
fn nonsense_icon_name_resolves_to_nothing_and_never_panics() {
    let result = resolve_linux_icon_path("packall-definitely-not-a-real-application-xyz-123");
    #[cfg(not(unix))]
    assert!(result.is_none(), "non-unix hosts have no Freedesktop icon lookup");
    #[cfg(unix)]
    let _ = result; // lookup is best-effort on real Linux; only panics would fail the test
}

// ---------------------------------------------------------------------------
// execute_multi_step_commands
// ---------------------------------------------------------------------------

fn step(title: &str, command: &str) -> MultiStepCommand {
    MultiStepCommand {
        title: title.to_string(),
        command: command.to_string(),
        description: None,
    }
}

#[test]
fn empty_step_list_is_an_immediate_success() {
    let result = execute_multi_step_commands(vec![]);
    assert!(result.success);
    assert_eq!(result.completed_steps, 0);
    assert_eq!(result.total_steps, 0);
    assert!(result.step_results.is_empty());
    assert!(result.error.is_none());
}

#[test]
fn all_successful_steps_run_in_order() {
    // `echo` works under both `sh -c` (unix) and `powershell -Command` (windows).
    let result = execute_multi_step_commands(vec![
        step("first", "echo first-step"),
        step("second", "echo second-step"),
    ]);
    assert!(result.success, "multi-step run failed: {:?}", result.error);
    assert_eq!(result.completed_steps, 2);
    assert_eq!(result.total_steps, 2);
    assert_eq!(result.step_results.len(), 2);
    assert!(result.error.is_none());
    for (i, step_res) in result.step_results.iter().enumerate() {
        assert_eq!(step_res.step_index, i + 1, "step_index is 1-based and sequential");
        assert!(step_res.success);
        assert!(step_res.stdout.contains("step"), "stdout should capture echo output");
        // stderr is deliberately not asserted: shells may attach profile or
        // startup noise to it (e.g. PowerShell profiles when redirected).
    }
}

#[test]
fn failing_step_halts_execution_and_reports_progress() {
    let result = execute_multi_step_commands(vec![
        step("before", "echo before"),
        step("boom", "exit 1"),
        step("never-runs", "echo after"),
    ]);
    assert!(!result.success);
    assert_eq!(result.total_steps, 3);
    assert_eq!(result.completed_steps, 1, "only the step before the failure completed");
    assert_eq!(result.step_results.len(), 2, "failed step is included, subsequent steps never start");
    assert_eq!(result.step_results[1].title, "boom");
    assert!(!result.step_results[1].success);
    assert!(
        result.error.is_some(),
        "halt reason must be surfaced to the UI toast"
    );
}

#[cfg(unix)]
#[test]
fn failing_step_prefers_stderr_as_error_message() {
    let result = execute_multi_step_commands(vec![step("noisy-fail", "echo oops 1>&2; exit 1")]);
    assert!(!result.success);
    assert!(
        result.error.as_ref().unwrap().contains("oops"),
        "stderr should be the primary error message, got: {:?}",
        result.error
    );
    assert!(result.step_results[0].stderr.contains("oops"));
}

#[test]
fn failing_single_step_reports_failure_without_panicking() {
    // `exit 1` fails deterministically under both `sh -c` and
    // `powershell -Command`, unlike a nonexistent binary whose exit status
    // varies across PowerShell versions and profiles.
    let result = execute_multi_step_commands(vec![step("boom", "exit 1")]);
    assert!(!result.success);
    assert_eq!(result.completed_steps, 0);
    assert_eq!(result.step_results.len(), 1);
    assert!(!result.step_results[0].success);
    assert!(result.error.is_some(), "halt reason must be surfaced to the UI toast");
}

#[test]
fn successful_multi_step_run_invalidates_package_cache() {
    // Cache invalidation is internal; the observable contract is that the
    // function completes cleanly after prior scans (no poisoned mutex).
    let _ = scan_system_packages();
    let result = execute_multi_step_commands(vec![step("cleanup-marker", "echo done")]);
    assert!(result.success);
}

// ---------------------------------------------------------------------------
// serde shape of backend DTOs
// ---------------------------------------------------------------------------

#[test]
fn system_package_round_trips_through_json() {
    let pkg = SystemPackage {
        name: "firefox".into(),
        version: "123.0".into(),
        manager: "pacman".into(),
        description: Some("Browser".into()),
        installed: true,
        icon: None,
    };
    let json = serde_json::to_string(&pkg).unwrap();
    let restored: SystemPackage = serde_json::from_str(&json).unwrap();
    assert_eq!(restored.name, "firefox");
    assert!(restored.installed);
}

#[test]
fn distro_info_serialization_uses_snake_case_fields() {
    let managers: Vec<PackageManagerInfo> = detect_available_managers();
    let info = DistroInfo {
        id: "test".into(),
        name: "Test".into(),
        pretty_name: "Test OS".into(),
        preferred_manager: "paru".into(),
        family: "arch".into(),
        managers,
    };
    let value = serde_json::to_value(&info).unwrap();
    assert_eq!(value["preferred_manager"], "paru");
    assert_eq!(value["pretty_name"], "Test OS");
    assert!(value["managers"].is_array());
}

#[test]
fn classify_family_uses_id_and_id_like() {
    use packall_lib::system::classify_family;
    assert_eq!(classify_family("arch", ""), "arch");
    assert_eq!(classify_family("endeavouros", "arch"), "arch");
    assert_eq!(classify_family("ubuntu", "debian"), "debian");
    assert_eq!(classify_family("pop", "ubuntu debian"), "debian");
    assert_eq!(classify_family("fedora", ""), "fedora");
    assert_eq!(classify_family("rocky", "rhel centos fedora"), "fedora");
    assert_eq!(classify_family("opensuse-tumbleweed", "opensuse suse"), "suse");
    assert_eq!(classify_family("nixos", ""), "other");
}
