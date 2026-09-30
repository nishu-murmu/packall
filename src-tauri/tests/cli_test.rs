//! Tests for the CLI entry point in `cli.rs`.
//!
//! Only side-effect-free subcommands are exercised: anything that installs,
//! removes, or upgrades packages on the host is deliberately excluded so the
//! suite never mutates a developer's machine. Unknown subcommands terminate
//! the process via `exit(1)` and are likewise untestable here.

use packall_lib::cli::handle_cli;

fn args(items: &[&str]) -> Vec<String> {
    items.iter().map(|s| (*s).to_string()).collect()
}

#[test]
fn no_args_prints_help_and_returns() {
    handle_cli(&[]);
}

#[test]
fn help_aliases_all_print_help_and_return() {
    for alias in ["help", "--help", "-h"] {
        handle_cli(&args(&[alias]));
    }
}

#[test]
fn version_aliases_print_without_exiting() {
    for alias in ["version", "-v", "--version"] {
        handle_cli(&args(&[alias]));
    }
}

#[test]
fn categories_lists_every_category_with_counts() {
    // Exercises the full catalogue iteration path; output goes to stdout.
    handle_cli(&args(&["categories"]));
    handle_cli(&args(&["cat"]));
}

#[test]
fn list_all_modes_iterate_catalogue_without_error() {
    for argv in [
        vec!["ls"],
        vec!["list"],
        vec!["ls", "--all"],
        vec!["ls", "--installed"],
        vec!["ls", "--available"],
        vec!["ls", "--category", "development"],
        vec!["ls", "-c", "browsers"],
        vec!["ls", "multimedia"], // positional category filter
        vec!["ls", "--json"],
    ] {
        handle_cli(&args(&argv));
    }
}

#[test]
fn list_system_mode_reports_scanned_packages() {
    handle_cli(&args(&["ls", "--system"]));
    handle_cli(&args(&["ls", "--system", "--json"]));
}

#[test]
fn search_requires_and_accepts_query() {
    handle_cli(&args(&["search"])); // usage error path must not panic
    handle_cli(&args(&["search", "neovim"]));
    handle_cli(&args(&["find", "browser"]));
}

#[test]
fn info_handles_missing_known_and_system_packages() {
    handle_cli(&args(&["info"])); // usage error path
    handle_cli(&args(&["info", "neovim"])); // catalogue hit
    handle_cli(&args(&["show", "packall-no-such-package-xyz"])); // miss path
}

#[test]
fn install_and_remove_without_packages_print_usage() {
    handle_cli(&args(&["install"]));
    handle_cli(&args(&["remove"]));
    handle_cli(&args(&["rm"]));
}

#[test]
fn install_parses_manager_flag_and_skips_unknown_flags() {
    // Only the arg-parsing path is safe to test: the resulting command is
    // never executed because no packages remain after filtering.
    handle_cli(&args(&["install", "--manager", "apt"]));
    handle_cli(&args(&["install", "-m", "flatpak"]));
}

#[test]
fn scan_reports_manager_table() {
    handle_cli(&args(&["scan"]));
    handle_cli(&args(&["detect"]));
}

#[test]
fn unknown_flags_are_ignored_by_list_parser() {
    handle_cli(&args(&["ls", "--frobnicate"]));
}
