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
  | "manual"
  | "dnf"
  | "pacman"
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

export type View =
  | { kind: "grid" }
  | { kind: "detail"; id: string }
  | { kind: "favorites" }
  | { kind: "installed" }
  | { kind: "settings" }
  | { kind: "help" }
