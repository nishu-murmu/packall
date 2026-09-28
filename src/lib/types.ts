export type CategoryId =
  | "browsers"
  | "communications"
  | "development"
  | "documents"
  | "games"
  | "multimedia"
  | "self-hosted"
  | "utilities"
  | "terminal"
  | "system"
  | "security"
  | "virtualization"
  | "education"
  | "graphics"

export type InstallMethod =
  | "apt"
  | "snap"
  | "flatpak"
  | "appimage"
  | "deb"
  | "aur"
  | "paru"
  | "yay"
  | "pacman"
  | "manual"
  | "dnf"
  | "zypper"
  | "brew"

export interface InstallOption {
  method: InstallMethod
  command: string
  notes?: string
}

export interface SoftwareEntry {
  id: string
  name: string
  tagline: string
  description: string
  category: CategoryId
  homepage: string
  license: string
  tags: string[]
  install: InstallOption[]
  icon?: string
  featured?: boolean
}

export interface Category {
  id: CategoryId
  name: string
  description: string
  icon: string
}

export interface SystemPackage {
  name: string
  version: string
  manager: string // "pacman" | "aur" | "flatpak" | "snap" | "apt" | "dnf" | "brew" | "winget"
  description?: string
  installed: boolean
  icon?: string
  matchedSoftwareId?: string
  category?: CategoryId
}

export interface PackageManagerInfo {
  id: string
  name: string
  available: boolean
  is_aur: boolean
  install_cmd: string
  update_cmd: string
  remove_cmd: string
}

export interface ActionExecutionResult {
  success: boolean
  command: string
  output: string
  error?: string
}

export type BatchAction = "install" | "update" | "remove"

export type View =
  | { kind: "grid" }
  | { kind: "detail"; id: string }
  | { kind: "favorites" }
  | { kind: "installed" }
  | { kind: "system" }
  | { kind: "settings" }
  | { kind: "help" }
