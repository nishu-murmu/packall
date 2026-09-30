use crate::data::{get_categories, get_software_catalogue};
use crate::system::{build_action_command, detect_available_managers, scan_system_packages};
use std::collections::HashSet;
use std::process::Command;

pub fn handle_cli(args: &[String]) {
    if args.is_empty() || args[0] == "help" || args[0] == "--help" || args[0] == "-h" {
        print_help();
        return;
    }

    let subcmd = args[0].as_str();
    let rest = &args[1..];

    match subcmd {
        "ls" | "list" => handle_list(rest),
        "search" | "find" => handle_search(rest),
        "info" | "show" => handle_info(rest),
        "install" | "add" => handle_install(rest),
        "remove" | "uninstall" | "rm" => handle_remove(rest),
        "update" | "upgrade" | "up" => handle_update(rest),
        "scan" | "detect" => handle_scan(),
        "categories" | "cat" => handle_categories(),
        "version" | "-v" | "--version" => {
            println!("Packall v0.1.0 - Linux Software Directory & Package Manager");
        }
        _ => {
            eprintln!("Unknown command: '{}'. Run 'packall help' for usage.", subcmd);
            std::process::exit(1);
        }
    }
}

fn print_help() {
    println!(
        r#"
Packall - Essential Linux Software Directory & System Package Manager

USAGE:
    packall [COMMAND] [OPTIONS]
    packall                      Launch graphical user interface (GUI)

COMMANDS:
    ls, list                     List software packages
        --installed, -i          List all installed packages (catalogue & system) with categories
        --all, -a                List all catalogue packages with installation status
        --system, -s             List all system packages detected across pacman/paru/flatpak/etc.
        --category, -c <name>    Filter packages by category
        --available              List packages available to install
        --json                   Output results in machine-readable JSON format

    search, find <query>         Search across catalogue software and installed system packages
    info, show <package>         Show detailed information and install methods for a package
    install, add <packages...>   Install one or more packages using preferred/detected manager
        --manager, -m <mgr>      Specify package manager (paru, yay, pacman, flatpak, apt, etc.)
    remove, rm <packages...>     Remove one or more packages from the system
    update, upgrade [packages..] Update specified packages or run full system upgrade
    scan, detect                 Scan host for package managers and count installed packages
    categories, cat              List all categories with package counts
    gui                          Explicitly launch the desktop GUI
    help, --help, -h             Print this help message

EXAMPLES:
    packall ls --installed
    packall ls -c development
    packall search neovim
    packall install neovim discord zen-browser
    packall update
"#
    );
}

fn handle_list(args: &[String]) {
    let mut show_installed = false;
    let mut show_all = false;
    let mut show_system = false;
    let mut show_available = false;
    let mut as_json = false;
    let mut category_filter: Option<String> = None;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--installed" | "-i" => show_installed = true,
            "--all" | "-a" => show_all = true,
            "--system" | "-s" => show_system = true,
            "--available" => show_available = true,
            "--json" => as_json = true,
            "--category" | "-c" => {
                if i + 1 < args.len() {
                    category_filter = Some(args[i + 1].to_lowercase());
                    i += 1;
                }
            }
            arg if !arg.starts_with('-') => {
                category_filter = Some(arg.to_lowercase());
            }
            _ => {}
        }
        i += 1;
    }

    let catalogue = get_software_catalogue();
    let system_pkgs = scan_system_packages();
    let installed_names: HashSet<String> = system_pkgs
        .iter()
        .map(|p| p.name.to_lowercase())
        .collect();

    // If --system is requested
    if show_system {
        if as_json {
            println!("{}", serde_json::to_string_pretty(&system_pkgs).unwrap_or_default());
            return;
        }

        println!("\n📦 SYSTEM PACKAGES ({} found):", system_pkgs.len());
        println!("{:<32} {:<16} {:<10}", "PACKAGE", "VERSION", "SOURCE");
        println!("{}", "-".repeat(62));
        for p in system_pkgs {
            println!("{:<32} {:<16} [{}]", p.name, p.version, p.manager);
        }
        return;
    }

    // Default or catalogue listing
    let mut items: Vec<_> = catalogue
        .into_iter()
        .filter(|entry| {
            if let Some(ref cat) = category_filter {
                if entry.category.to_lowercase() != *cat {
                    return false;
                }
            }
            let is_installed = installed_names.contains(&entry.id.to_lowercase())
                || installed_names.contains(&entry.name.to_lowercase());

            if show_installed && !is_installed {
                return false;
            }
            if show_available && is_installed {
                return false;
            }
            true
        })
        .collect();

    if as_json {
        println!("{}", serde_json::to_string_pretty(&items).unwrap_or_default());
        return;
    }

    let title = if show_installed {
        "INSTALLED PACKAGES"
    } else if show_available {
        "AVAILABLE SOFTWARE"
    } else if show_all {
        "ALL CATALOGUE SOFTWARE"
    } else if let Some(ref cat) = category_filter {
        &format!("SOFTWARE IN CATEGORY: {}", cat.to_uppercase())
    } else {
        "CATALOGUE SOFTWARE (use --installed or -c <category>)"
    };

    println!("\n📦 {} ({} items):", title, items.len());
    println!("{:<24} {:<16} {:<12} {}", "NAME", "CATEGORY", "STATUS", "TAGLINE");
    println!("{}", "-".repeat(80));

    items.sort_by(|a, b| a.category.cmp(&b.category).then(a.name.cmp(&b.name)));

    for item in items {
        let is_installed = installed_names.contains(&item.id.to_lowercase())
            || installed_names.contains(&item.name.to_lowercase());
        let status = if is_installed {
            "✔ Installed"
        } else {
            "○ Available"
        };
        println!("{:<24} {:<16} {:<12} {}", item.name, item.category, status, item.tagline);
    }
}

fn handle_search(args: &[String]) {
    if args.is_empty() {
        eprintln!("Usage: packall search <query>");
        return;
    }

    let query = args.join(" ").to_lowercase();
    let catalogue = get_software_catalogue();
    let system_pkgs = scan_system_packages();

    let installed_names: HashSet<String> = system_pkgs
        .iter()
        .map(|p| p.name.to_lowercase())
        .collect();

    let cat_matches: Vec<_> = catalogue
        .into_iter()
        .filter(|s| {
            s.name.to_lowercase().contains(&query)
                || s.tagline.to_lowercase().contains(&query)
                || s.description.to_lowercase().contains(&query)
                || s.tags.iter().any(|t| t.to_lowercase().contains(&query))
                || s.category.to_lowercase().contains(&query)
        })
        .collect();

    let sys_matches: Vec<_> = system_pkgs
        .into_iter()
        .filter(|p| p.name.to_lowercase().contains(&query))
        .collect();

    println!("\n🔍 SEARCH RESULTS FOR '{}'", query);
    println!("\nCatalogue Matches ({}):", cat_matches.len());
    println!("{:<24} {:<16} {:<12} {}", "NAME", "CATEGORY", "STATUS", "TAGLINE");
    println!("{}", "-".repeat(80));
    for item in cat_matches {
        let is_installed = installed_names.contains(&item.id.to_lowercase())
            || installed_names.contains(&item.name.to_lowercase());
        let status = if is_installed { "✔ Installed" } else { "○ Available" };
        println!("{:<24} {:<16} {:<12} {}", item.name, item.category, status, item.tagline);
    }

    if !sys_matches.is_empty() {
        println!("\nDetected System Packages ({}):", sys_matches.len());
        println!("{:<32} {:<16} Source", "PACKAGE", "VERSION");
        println!("{}", "-".repeat(60));
        for p in sys_matches.into_iter().take(20) {
            println!("{:<32} {:<16} [{}]", p.name, p.version, p.manager);
        }
    }
}

fn handle_info(args: &[String]) {
    if args.is_empty() {
        eprintln!("Usage: packall info <package>");
        return;
    }

    let target = args[0].to_lowercase();
    let catalogue = get_software_catalogue();
    let system_pkgs = scan_system_packages();

    let found = catalogue.iter().find(|s| {
        s.id.to_lowercase() == target || s.name.to_lowercase() == target
    });

    if let Some(s) = found {
        let is_installed = system_pkgs.iter().any(|p| {
            p.name.to_lowercase() == s.id.to_lowercase() || p.name.to_lowercase() == s.name.to_lowercase()
        });

        println!("\n{}", "=".repeat(60));
        println!("{} ({})", s.name, s.category);
        println!("Status:      {}", if is_installed { "✔ Installed on system" } else { "○ Available to install" });
        println!("License:     {}", s.license);
        println!("Homepage:    {}", s.homepage);
        println!("Tags:        {}", s.tags.join(", "));
        println!("\nDescription:\n  {}", s.description);
        println!("\nInstallation Commands:");
        for opt in &s.install {
            println!("  • {:<10} -> {}", opt.method, opt.command);
            if let Some(ref notes) = opt.notes {
                println!("               ({})", notes);
            }
        }
        println!("{}\n", "=".repeat(60));
        return;
    }

    // Check if it's an external system package
    if let Some(p) = system_pkgs.iter().find(|p| p.name.to_lowercase() == target) {
        println!("\n{}", "=".repeat(60));
        println!("{} (System Package)", p.name);
        println!("Status:      ✔ Installed");
        println!("Version:     {}", p.version);
        println!("Manager:     {}", p.manager);
        if let Some(ref desc) = p.description {
            println!("Description: {}", desc);
        }
        println!("{}\n", "=".repeat(60));
        return;
    }

    eprintln!("Package '{}' not found in Packall catalogue or system packages.", target);
}

fn handle_install(args: &[String]) {
    if args.is_empty() {
        eprintln!("Usage: packall install <package1> [package2...] [--manager <mgr>]");
        return;
    }

    let mut pkgs = Vec::new();
    let mut manager: Option<&str> = None;

    let mut i = 0;
    while i < args.len() {
        if (args[i] == "--manager" || args[i] == "-m") && i + 1 < args.len() {
            manager = Some(args[i + 1].as_str());
            i += 2;
        } else if !args[i].starts_with('-') {
            pkgs.push(args[i].clone());
            i += 1;
        } else {
            i += 1;
        }
    }

    if pkgs.is_empty() {
        eprintln!("No packages specified for installation.");
        return;
    }

    let (bin, cmd_args) = build_action_command("install", &pkgs, manager);
    println!("Executing: {} {}", bin, cmd_args.join(" "));

    let status = Command::new(&bin).args(&cmd_args).status();
    match status {
        Ok(s) => {
            if s.success() {
                println!("Installation completed successfully.");
            } else {
                eprintln!("Command failed with exit code: {:?}", s.code());
            }
        }
        Err(e) => {
            eprintln!("Failed to launch {}: {}", bin, e);
        }
    }
}

fn handle_remove(args: &[String]) {
    if args.is_empty() {
        eprintln!("Usage: packall remove <package1> [package2...]");
        return;
    }

    let (bin, cmd_args) = build_action_command("remove", args, None);
    println!("Executing: {} {}", bin, cmd_args.join(" "));

    let status = Command::new(&bin).args(&cmd_args).status();
    match status {
        Ok(s) => {
            if s.success() {
                println!("Removal completed successfully.");
            } else {
                eprintln!("Command failed with exit code: {:?}", s.code());
            }
        }
        Err(e) => eprintln!("Failed to launch {}: {}", bin, e),
    }
}

fn handle_update(args: &[String]) {
    let (bin, cmd_args) = build_action_command("update", args, None);
    println!("Executing: {} {}", bin, cmd_args.join(" "));

    let status = Command::new(&bin).args(&cmd_args).status();
    match status {
        Ok(s) => {
            if s.success() {
                println!("Update completed successfully.");
            } else {
                eprintln!("Command failed with exit code: {:?}", s.code());
            }
        }
        Err(e) => eprintln!("Failed to launch {}: {}", bin, e),
    }
}

fn handle_scan() {
    println!("\n🔍 Scanning Host System Package Managers...");
    let managers = detect_available_managers();
    for m in &managers {
        let status = if m.available { "AVAILABLE" } else { "NOT FOUND" };
        println!("  • {:<14} [{:<9}] (e.g. {})", m.name, status, m.install_cmd);
    }

    let pkgs = scan_system_packages();
    println!("\nTotal Installed Packages Detected: {}", pkgs.len());
}

fn handle_categories() {
    let categories = get_categories();
    let catalogue = get_software_catalogue();

    println!("\n📂 PACKALL CATEGORIES:");
    println!("{:<20} {:<8} {}", "CATEGORY ID", "COUNT", "DESCRIPTION");
    println!("{}", "-".repeat(70));

    for cat in categories {
        let count = catalogue.iter().filter(|s| s.category == cat.id).count();
        println!("{:<20} {:<8} {}", cat.id, count, cat.description);
    }
}
