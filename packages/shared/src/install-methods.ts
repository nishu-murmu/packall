import type { InstallMethod } from "./types"

export const METHOD_LABELS: Record<InstallMethod, string> = {
  apt: "apt",
  snap: "snap",
  flatpak: "Flatpak",
  appimage: "AppImage",
  deb: ".deb",
  aur: "AUR",
  manual: "Manual",
  dnf: "dnf",
  pacman: "pacman",
  zypper: "zypper",
  brew: "Homebrew",
}

export const METHOD_DESCRIPTIONS: Record<InstallMethod, string> = {
  apt: "Debian/Ubuntu package manager",
  snap: "Canonical's containerized packages",
  flatpak: "Universal Linux package format",
  appimage: "Portable single-file application",
  deb: "Debian package file",
  aur: "Arch User Repository",
  manual: "Manual installation required",
  dnf: "Fedora/RHEL package manager",
  pacman: "Arch Linux package manager",
  zypper: "openSUSE package manager",
  brew: "Homebrew package manager",
}

export const METHOD_COLORS: Record<InstallMethod, string> = {
  apt: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  snap: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  flatpak: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  appimage: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  deb: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  aur: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  manual: "bg-muted text-muted-foreground border-border",
  dnf: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  pacman: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  zypper: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30",
  brew: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
}
