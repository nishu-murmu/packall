//! Turns a catalogue entry into the shell commands that install it on this
//! host. Mirrors `pickOption` / `buildCommands` in src/lib/actions.ts.

use crate::data::{InstallOption, SoftwareEntry};

const FLATHUB: &str = "https://dl.flathub.org/repo/flathub.flatpakrepo";

#[derive(Debug, Clone, PartialEq)]
pub struct InstallPlan {
    pub method: String,
    pub commands: Vec<String>,
}

fn priority(family: &str) -> &'static [&'static str] {
    match family {
        "arch" => &["pacman", "aur", "paru", "yay", "flatpak", "script", "snap"],
        "debian" => &["apt", "flatpak", "script", "snap"],
        "fedora" => &["dnf", "flatpak", "script", "snap"],
        "suse" => &["zypper", "flatpak", "script", "snap"],
        _ => &[
            "flatpak", "script", "snap", "pacman", "apt", "dnf", "zypper", "aur", "paru", "yay",
            "brew",
        ],
    }
}

fn aur_helper(available: &[String]) -> Option<&'static str> {
    if available.iter().any(|m| m == "paru") {
        Some("paru")
    } else if available.iter().any(|m| m == "yay") {
        Some("yay")
    } else {
        None
    }
}

fn method_available(method: &str, available: &[String]) -> bool {
    match method {
        "script" => true,
        "aur" | "paru" | "yay" => aur_helper(available).is_some(),
        "deb" | "manual" | "appimage" => false,
        m => available.iter().any(|a| a == m),
    }
}

/// Package names and flags from a catalogue command such as
/// `sudo pacman -S foo bar` or `flatpak install flathub org.x.Y`.
fn parse_packages(command: &str) -> (Vec<String>, Vec<String>) {
    let first = command.split("&&").next().unwrap_or("").trim();
    let tokens: Vec<&str> = first.split_whitespace().collect();
    let Some(start) = tokens.iter().position(|t| *t == "install" || *t == "-S") else {
        return (vec![], vec![]);
    };
    let rest = tokens[start + 1..]
        .iter()
        .filter(|t| **t != "flathub" && **t != "-y");
    let (flags, pkgs): (Vec<&str>, Vec<&str>) = rest.partition(|t| t.starts_with('-'));
    (
        pkgs.into_iter().map(String::from).collect(),
        flags.into_iter().map(String::from).collect(),
    )
}

fn commands_for(opt: &InstallOption, available: &[String]) -> Vec<String> {
    if let Some(steps) = opt.steps.as_ref().filter(|s| !s.is_empty()) {
        return steps.iter().map(|s| s.command.clone()).collect();
    }
    if opt.command.contains("&&") {
        return vec![opt.command.clone()];
    }
    let (pkgs, flags) = parse_packages(&opt.command);
    if pkgs.is_empty() {
        return vec![];
    }
    let pkgs = pkgs.join(" ");
    match opt.method.as_str() {
        "pacman" => vec![format!("sudo pacman -S --needed --noconfirm {pkgs}")],
        "aur" | "paru" | "yay" => match aur_helper(available) {
            Some(helper) => vec![format!("{helper} -S --needed --noconfirm {pkgs}")],
            None => vec![],
        },
        "apt" => vec![format!("sudo apt-get install -y {pkgs}")],
        "dnf" => vec![format!("sudo dnf install -y {pkgs}")],
        "zypper" => vec![format!("sudo zypper --non-interactive install {pkgs}")],
        "flatpak" => vec![
            format!("flatpak remote-add --user --if-not-exists flathub {FLATHUB}"),
            format!("flatpak install --user -y flathub {pkgs}"),
        ],
        "snap" => vec![format!("sudo snap install {pkgs} {}", flags.join(" "))
            .trim_end()
            .to_string()],
        "brew" => vec![format!("brew install {pkgs}")],
        _ => vec![],
    }
}

/// The best install for `entry` on a host of `family` with the `available`
/// package managers, or None when nothing can be automated. `force` picks a
/// method explicitly when the entry has it and the host can use it.
pub fn install_plan(
    entry: &SoftwareEntry,
    family: &str,
    available: &[String],
    force: Option<&str>,
) -> Option<InstallPlan> {
    let usable: Vec<(&InstallOption, Vec<String>)> = entry
        .install
        .iter()
        .filter(|o| method_available(&o.method, available))
        .map(|o| (o, commands_for(o, available)))
        .filter(|(_, cmds)| !cmds.is_empty())
        .collect();

    let rank = |m: &str| {
        priority(family)
            .iter()
            .position(|p| *p == m)
            .unwrap_or(usize::MAX)
    };
    let chosen = force
        .and_then(|f| usable.iter().find(|(o, _)| o.method == f))
        .or_else(|| usable.iter().min_by_key(|(o, _)| rank(&o.method)))?;

    Some(InstallPlan {
        method: chosen.0.method.clone(),
        commands: chosen.1.clone(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data::find_software;

    fn mgrs(ids: &[&str]) -> Vec<String> {
        ids.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn uses_the_distro_package_name() {
        let py = find_software("python-3").unwrap();
        let arch = install_plan(&py, "arch", &mgrs(&["pacman"]), None).unwrap();
        assert_eq!(
            arch.commands,
            vec!["sudo pacman -S --needed --noconfirm python"]
        );
        let deb = install_plan(&py, "debian", &mgrs(&["apt"]), None).unwrap();
        assert_eq!(deb.commands, vec!["sudo apt-get install -y python3"]);
    }

    #[test]
    fn falls_back_to_flatpak_then_honours_a_forced_method() {
        let floorp = find_software("floorp").unwrap();
        let plan = install_plan(&floorp, "arch", &mgrs(&["pacman", "flatpak"]), None).unwrap();
        assert_eq!(plan.method, "flatpak");
        assert_eq!(
            plan.commands[1],
            "flatpak install --user -y flathub one.ablaze.floorp"
        );
        let aur =
            install_plan(&floorp, "arch", &mgrs(&["pacman", "paru", "flatpak"]), None).unwrap();
        assert_eq!(
            aur.commands,
            vec!["paru -S --needed --noconfirm floorp-bin"]
        );
        let forced = install_plan(
            &floorp,
            "arch",
            &mgrs(&["pacman", "paru", "flatpak"]),
            Some("flatpak"),
        )
        .unwrap();
        assert_eq!(forced.method, "flatpak");
    }

    #[test]
    fn runs_vendor_scripts_verbatim() {
        let bun = find_software("bun").unwrap();
        let plan = install_plan(&bun, "fedora", &mgrs(&["dnf"]), None).unwrap();
        assert_eq!(plan.method, "script");
        assert_eq!(
            plan.commands,
            vec!["curl -fsSL https://bun.sh/install | bash"]
        );
    }

    #[test]
    fn keeps_snap_flags() {
        let kubectl = find_software("kubectl").unwrap();
        let plan = install_plan(&kubectl, "debian", &mgrs(&["apt", "snap"]), None).unwrap();
        assert_eq!(plan.commands, vec!["sudo snap install kubectl --classic"]);
    }

    #[test]
    fn returns_none_without_a_usable_method() {
        let floorp = find_software("floorp").unwrap();
        assert!(install_plan(&floorp, "debian", &mgrs(&["apt"]), None).is_none());
    }
}
