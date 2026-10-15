# Changelog

## 0.2.0

### Added

- **Auto-bootstrap missing package managers** — when selected apps require a
  tool that is not installed (Flatpak, Snap, or an AUR helper like yay/paru),
  the system detects the gap and offers to install it before proceeding.
- **AUR helper bootstrapping** — full support for installing yay or paru from
  source via `git clone` + `makepkg`, since AUR helpers cannot be installed
  through pacman directly.
- **Augmented context resolution** — entries that depend on a bootstrapped tool
  are resolved against a context that assumes the tool will be available after
  its bootstrap job, preventing them from being incorrectly marked as skipped.
- **Post-bootstrap host refresh** — after a bootstrap batch completes, distro
  detection is re-run so the newly installed tool is picked up immediately.
- **AUR prompt in Tauri desktop app** — the install dialog now shows an
  AUR-specific message when an AUR helper needs to be set up.

### Changed

- `NewBatch` now prepends bootstrap jobs and uses an augmented manager list
  when planning installs that need a missing tool.
- The TUI detail view shows a more descriptive hint for AUR entries
  ("install an AUR helper (yay or paru)").
- TypeScript `missingUniversalFor` now returns `"aur"` alongside `"flatpak"`
  and `"snap"`.

## 0.1.0

First public release.

- Keyboard-driven software directory with 215 curated apps in 14 categories
- One-click install, update and remove in the background, with progress, per-app status and cancel
- Distro detection (Debian/Ubuntu, Fedora/RHEL, Arch, openSUSE) and a distro filter
- In-app password prompt for administrator rights; Flatpak installs per user
- Command-line interface: `packall list | search | info | install | update | remove`
- Packages: `.deb`, `.rpm`, AppImage, AUR (`packall-bin`)
