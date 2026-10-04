import type {
  BatchAction,
  DistroFamily,
  DistroFilter,
  DistroInfo,
  InstallMethod,
  InstallOption,
  PackageManagerInfo,
  SoftwareEntry,
  SystemPackage,
} from "./types"

/**
 * Turns catalogue install options into the non-interactive commands the
 * background worker runs. Everything here is pure so it can be unit tested.
 */

const NATIVE_METHODS: Record<Exclude<DistroFamily, "other">, InstallMethod[]> = {
  debian: ["apt", "deb"],
  fedora: ["dnf"],
  arch: ["pacman", "aur", "paru", "yay"],
  suse: ["zypper"],
}

/** Methods that run on any distro as long as the tool is installed. */
const UNIVERSAL_METHODS: InstallMethod[] = ["flatpak", "snap", "appimage"]

/** Order in which methods are tried for each distro family. */
const METHOD_PRIORITY: Record<DistroFamily, InstallMethod[]> = {
  arch: ["pacman", "aur", "paru", "yay", "flatpak", "snap"],
  debian: ["apt", "flatpak", "snap"],
  fedora: ["dnf", "flatpak", "snap"],
  suse: ["zypper", "flatpak", "snap"],
  other: ["flatpak", "snap", "pacman", "apt", "dnf", "zypper", "aur", "paru", "yay", "brew"],
}

export const DISTRO_FILTERS: { id: DistroFilter; label: string; hint: string }[] = [
  { id: "all", label: "All distros", hint: "Everything in the catalogue" },
  { id: "debian", label: "Debian / Ubuntu", hint: "apt packages" },
  { id: "fedora", label: "Fedora / RHEL", hint: "dnf packages" },
  { id: "arch", label: "Arch / Manjaro", hint: "pacman and AUR" },
  { id: "suse", label: "openSUSE", hint: "zypper packages" },
  { id: "flatpak", label: "Flatpak", hint: "Runs on any distro" },
  { id: "snap", label: "Snap", hint: "Runs on any distro" },
]

export function familyFromDistro(info: DistroInfo | null): DistroFamily {
  if (!info) return "other"
  if (info.family) return info.family
  const id = info.id.toLowerCase()
  if (["arch", "manjaro", "endeavouros", "garuda", "artix", "cachyos"].includes(id)) return "arch"
  if (["debian", "ubuntu", "linuxmint", "pop", "elementary", "zorin", "kali"].includes(id)) return "debian"
  if (["fedora", "rhel", "centos", "almalinux", "rocky", "nobara"].includes(id)) return "fedora"
  if (id.includes("suse")) return "suse"
  return "other"
}

/** Does the entry have an option for the given distro filter? */
export function matchesDistroFilter(software: SoftwareEntry, filter: DistroFilter): boolean {
  if (filter === "all") return true
  if (filter === "flatpak" || filter === "snap") {
    return software.install.some((o) => o.method === filter)
  }
  const native = NATIVE_METHODS[filter]
  return software.install.some((o) => native.includes(o.method))
}

/** Map a catalogue method onto the tool that has to exist on the host. */
function toolFor(method: InstallMethod): string[] {
  switch (method) {
    case "aur":
      return ["paru", "yay"]
    case "paru":
    case "yay":
      return [method]
    case "deb":
    case "appimage":
    case "manual":
      return []
    default:
      return [method]
  }
}

export function isMethodAvailable(method: InstallMethod, managers: PackageManagerInfo[]): boolean {
  const tools = toolFor(method)
  if (tools.length === 0) return false
  // No detection data (web preview / backend unavailable): assume everything works.
  if (managers.length === 0) return true
  return tools.some((t) => managers.some((m) => m.id === t && m.available))
}

export interface ParsedOption {
  method: InstallMethod
  /** Space separated package names / flatpak app ids. */
  pkgs: string[]
  /** Extra install flags worth keeping, e.g. snap's --classic. */
  flags: string[]
  /** True when the catalogue command can be reproduced for update / remove. */
  automatable: boolean
}

const PATTERNS: { methods: InstallMethod[]; re: RegExp }[] = [
  { methods: ["apt"], re: /^sudo\s+apt(?:-get)?\s+install\s+(?:-y\s+)?(.+)$/ },
  { methods: ["dnf"], re: /^sudo\s+dnf\s+install\s+(?:-y\s+)?(.+)$/ },
  { methods: ["zypper"], re: /^sudo\s+zypper\s+(?:--non-interactive\s+)?install\s+(?:-y\s+)?(.+)$/ },
  { methods: ["pacman"], re: /^sudo\s+pacman\s+-S\s+(?:--needed\s+)?(?:--noconfirm\s+)?(.+)$/ },
  { methods: ["aur", "paru", "yay"], re: /^(?:paru|yay)\s+-S\s+(?:--needed\s+)?(?:--noconfirm\s+)?(.+)$/ },
  { methods: ["flatpak"], re: /^flatpak\s+install\s+(?:-y\s+)?(?:flathub\s+)?(.+)$/ },
  { methods: ["snap"], re: /^sudo\s+snap\s+install\s+(.+)$/ },
  { methods: ["brew"], re: /^brew\s+install\s+(?:--cask\s+)?(.+)$/ },
]

/** First segment of a compound command (`a && b`). */
function firstSegment(command: string): string {
  return command.split("&&")[0].trim()
}

export function parseOption(opt: InstallOption): ParsedOption {
  const base: ParsedOption = { method: opt.method, pkgs: [], flags: [], automatable: false }
  const command = firstSegment(opt.command)
  for (const { methods, re } of PATTERNS) {
    if (!methods.includes(opt.method)) continue
    const m = command.match(re)
    if (!m) continue
    const tokens = m[1].split(/\s+/).filter(Boolean)
    base.pkgs = tokens.filter((t) => !t.startsWith("-"))
    base.flags = tokens.filter((t) => t.startsWith("-"))
    base.automatable = base.pkgs.length > 0
    return base
  }
  return base
}

function aurHelper(managers: PackageManagerInfo[]): "paru" | "yay" {
  const has = (id: string) => managers.some((m) => m.id === id && m.available)
  if (has("paru")) return "paru"
  if (has("yay")) return "yay"
  return "paru"
}

/** Commands that run `action` for one parsed option. Empty array = not automatable. */
export function buildCommands(
  action: BatchAction,
  opt: InstallOption,
  managers: PackageManagerInfo[] = []
): string[] {
  const parsed = parseOption(opt)

  // Multi-step installs and compound commands are replayed verbatim.
  if (action === "install" && (opt.steps?.length || /&&/.test(opt.command))) {
    const steps = opt.steps?.length ? opt.steps.map((s) => s.command) : [opt.command]
    if (steps.every((c) => looksExecutable(c))) return steps
  }
  if (!parsed.automatable) return []
  return commandsForParsed(action, parsed, managers)
}

/** Update / remove for a package that is only known from the system scan. */
export function buildSystemPackageCommands(
  action: Exclude<BatchAction, "install">,
  pkg: SystemPackage,
  managers: PackageManagerInfo[] = []
): string[] {
  const method = pkg.manager as InstallMethod
  const id = method === "flatpak" ? (pkg.description ?? pkg.name) : pkg.name
  return commandsForParsed(action, { method, pkgs: [id], flags: [], automatable: true }, managers)
}

function commandsForParsed(
  action: BatchAction,
  parsed: ParsedOption,
  managers: PackageManagerInfo[]
): string[] {
  const pkgs = parsed.pkgs.join(" ")
  const flags = parsed.flags.join(" ")
  const method = parsed.method

  switch (method) {
    case "apt":
      if (action === "install")
        return [`sudo sh -c "apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y ${pkgs}"`]
      if (action === "update")
        return [`sudo sh -c "apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y --only-upgrade ${pkgs}"`]
      return [`sudo apt-get remove -y ${pkgs}`]
    case "dnf":
      if (action === "install") return [`sudo dnf install -y ${pkgs}`]
      if (action === "update") return [`sudo dnf upgrade -y ${pkgs}`]
      return [`sudo dnf remove -y ${pkgs}`]
    case "zypper":
      if (action === "install") return [`sudo zypper --non-interactive install ${pkgs}`]
      if (action === "update") return [`sudo zypper --non-interactive update ${pkgs}`]
      return [`sudo zypper --non-interactive remove ${pkgs}`]
    case "pacman":
      if (action === "install") return [`sudo pacman -S --needed --noconfirm ${pkgs}`]
      if (action === "update") return [`sudo pacman -S --noconfirm ${pkgs}`]
      return [`sudo pacman -Rns --noconfirm ${pkgs}`]
    case "aur":
    case "paru":
    case "yay": {
      const helper = aurHelper(managers)
      // The helper calls `sudo` itself; the worker supplies the password.
      if (action === "install") return [`${helper} -S --needed --noconfirm ${pkgs}`]
      if (action === "update") return [`${helper} -S --noconfirm ${pkgs}`]
      return [`sudo pacman -Rns --noconfirm ${pkgs}`]
    }
    // Flatpak runs per-user so polkit is never involved; update/remove fall back
    // to the system installation through sudo.
    case "flatpak":
      if (action === "install")
        return [
          "flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
          `flatpak install --user -y --noninteractive flathub ${pkgs}`,
        ]
      if (action === "update")
        return [
          `flatpak update --user -y --noninteractive ${pkgs} || sudo flatpak update --system -y --noninteractive ${pkgs}`,
        ]
      return [
        `flatpak uninstall --user -y --noninteractive ${pkgs} || sudo flatpak uninstall --system -y --noninteractive ${pkgs}`,
      ]
    case "snap":
      if (action === "install") return [`sudo snap install ${pkgs} ${flags}`.trim()]
      if (action === "update") return [`sudo snap refresh ${pkgs}`]
      return [`sudo snap remove ${pkgs}`]
    case "brew":
      if (action === "install") return [`brew install ${pkgs}`]
      if (action === "update") return [`brew upgrade ${pkgs}`]
      return [`brew uninstall ${pkgs}`]
    default:
      return []
  }
}

/** Free-text "Download from ..." instructions are not shell commands. */
function looksExecutable(command: string): boolean {
  return /^(sudo|flatpak|snap|apt|dnf|zypper|pacman|paru|yay|brew|curl|wget|echo|sh|bash|mkdir|tar|chmod|install|cp|mv|ln|rpm|dpkg|add-apt-repository|gpg)\b/.test(
    command.trim()
  )
}

export interface PickContext {
  distro: DistroInfo | null
  managers: PackageManagerInfo[]
  systemPackages: SystemPackage[]
  /** Force a specific method (user override). */
  forceMethod?: InstallMethod | null
}

/** Is this option's package currently installed according to the system scan? */
export function optionInstalled(opt: InstallOption, systemPackages: SystemPackage[]): boolean {
  const parsed = parseOption(opt)
  if (!parsed.automatable) return false
  return parsed.pkgs.some((pkg) =>
    systemPackages.some((p) => {
      const mgr = p.manager
      const matchesManager =
        mgr === parsed.method ||
        (parsed.method === "aur" && (mgr === "aur" || mgr === "pacman")) ||
        (parsed.method === "paru" && (mgr === "aur" || mgr === "pacman")) ||
        (parsed.method === "yay" && (mgr === "aur" || mgr === "pacman")) ||
        (parsed.method === "dnf" && (mgr === "dnf" || mgr === "zypper")) ||
        (parsed.method === "zypper" && (mgr === "dnf" || mgr === "zypper"))
      if (!matchesManager) return false
      if (parsed.method === "flatpak") return p.description === pkg
      return p.name === pkg
    })
  )
}

/**
 * Choose the option to use for an action. Update and remove prefer the option
 * the software is actually installed with; install follows the distro's
 * priority list. Returns null when nothing can be automated.
 */
export function pickOption(
  software: SoftwareEntry,
  action: BatchAction,
  ctx: PickContext
): InstallOption | null {
  const family = familyFromDistro(ctx.distro)
  const usable = software.install.filter(
    (o) => parseOption(o).automatable || o.steps?.length || /&&/.test(o.command)
  )
  const available = usable.filter((o) => isMethodAvailable(o.method, ctx.managers))

  if (ctx.forceMethod) {
    const forced = available.find((o) => o.method === ctx.forceMethod)
    if (forced) return forced
  }

  if (action !== "install") {
    const installed = available.find((o) => optionInstalled(o, ctx.systemPackages))
    if (installed) return installed
  }

  const priority = METHOD_PRIORITY[family]
  const ranked = [...available].sort((a, b) => {
    const ia = priority.indexOf(a.method)
    const ib = priority.indexOf(b.method)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  return ranked[0] ?? null
}

/** Can the host install this entry through at least one automatable method? */
export function isSupportedOnHost(software: SoftwareEntry, ctx: PickContext): boolean {
  return pickOption(software, "install", ctx) !== null
}

/**
 * When nothing is directly installable but a universal option (Flatpak, then
 * Snap) exists whose tool is missing, say which tool would unlock it. The UI
 * can then offer to install that tool first.
 */
export function missingUniversalFor(
  software: SoftwareEntry,
  ctx: PickContext
): "flatpak" | "snap" | null {
  if (pickOption(software, "install", ctx) !== null) return null
  const has = (m: InstallMethod) => software.install.some((o) => o.method === m && parseOption(o).automatable)
  if (has("flatpak") && !isMethodAvailable("flatpak", ctx.managers)) return "flatpak"
  if (has("snap") && !isMethodAvailable("snap", ctx.managers)) return "snap"
  return null
}

/** Commands that install Flatpak or Snap itself, using the host's native manager. */
export function bootstrapCommands(
  tool: "flatpak" | "snap",
  distro: DistroInfo | null,
  managers: PackageManagerInfo[] = []
): string[] {
  const family = familyFromDistro(distro)
  const pkg = tool === "flatpak" ? "flatpak" : "snapd"
  const native: Partial<Record<DistroFamily, string>> = {
    debian: `sudo apt-get install -y ${pkg}`,
    fedora: `sudo dnf install -y ${pkg}`,
    suse: `sudo zypper --non-interactive install ${pkg}`,
    arch: tool === "flatpak" ? `sudo pacman -S --needed --noconfirm flatpak` : `${aurHelper(managers)} -S --needed --noconfirm snapd`,
  }
  const install = native[family]
  if (!install) return []
  if (tool === "flatpak") {
    return [
      install,
      "flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
    ]
  }
  // Snap needs its socket running, and Arch/Fedora want the /snap symlink.
  const post = ["sudo systemctl enable --now snapd.socket"]
  if (family === "arch" || family === "fedora") post.push("sudo ln -sf /var/lib/snapd/snap /snap")
  return [install, ...post]
}

/** A synthetic "available" manager entry, so a just-bootstrapped tool counts as present. */
export function syntheticManager(id: InstallMethod): PackageManagerInfo {
  return { id, name: id, available: true, is_aur: false, install_cmd: "", update_cmd: "", remove_cmd: "" }
}

/** Methods the host has that can install this entry (used for the manager picker). */
export function availableMethods(software: SoftwareEntry, managers: PackageManagerInfo[]): InstallMethod[] {
  const out: InstallMethod[] = []
  for (const o of software.install) {
    if (!(parseOption(o).automatable || o.steps?.length || /&&/.test(o.command))) continue
    if (isMethodAvailable(o.method, managers) && !out.includes(o.method)) out.push(o.method)
  }
  return out
}

export { NATIVE_METHODS, UNIVERSAL_METHODS }
