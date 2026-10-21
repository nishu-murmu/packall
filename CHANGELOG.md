# Changelog

## 0.3.0

### Added

- **Script install method** — a new `script` install method for apps that
  provide official vendor installers (e.g. shell-based install scripts),
  expanding how catalogue entries can be installed.
- **New catalogue entries** — added install paths for Helium, Zellij and
  Mullvad with per-distro package names and guard coverage.
- **Per-distro package names** — rebuilt catalogue install options with real,
  verified package names for each distribution, so the CLI and TUI resolve
  the correct package on every supported distro.

### Fixed

- **TUI install screen top border missing** — the jobs view was overflowing
  its pane because the log viewport claimed nearly the entire pane height;
  fixed the layout to properly split space between the header, job list and
  log sections.
- **Flatpak IDs** — corrected Flatpak application IDs after thorough
  verification against the Flathub app list; removed entries with invalid
  IDs.
- **Snap IDs** — verified and fixed Snap package identifiers.
- **Arch / AUR package names** — corrected package names verified against
  the official Arch repos and the AUR.
- **Package manager switching** — fixed the software drawer not switching
  the install method when the user picks a different package manager.
- **Default method picker** — the drawer's method picker now defaults to
  the installer's own recommended choice instead of the first option.

### Changed

- **Consolidated CI workflow** — merged the separate test, build, TUI and
  checksums workflows into a single build job; removed the old `ci.yml`.
- **Simplified release body** — replaced the vague download table with
  direct install-script commands so users can copy-paste from the release
  page.
- **Removed packaging folder** — dropped the now-unused packaging directory
  and simplified the release workflow.

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
- **TUI release binary** — the release workflow now builds a standalone Go
  binary (`packall-linux-amd64.tar.gz`) and attaches it to every GitHub
  release alongside the GUI packages.
- **Symbol lookup error handling** — detects dynamic linker errors and shows
  a friendly suggestion to install the missing library.
- **Logo** — added the Packall logo to the README.

### Changed

- `NewBatch` now prepends bootstrap jobs and uses an augmented manager list
  when planning installs that need a missing tool.
- The TUI detail view shows a more descriptive hint for AUR entries
  ("install an AUR helper (yay or paru)").
- TypeScript `missingUniversalFor` now returns `"aur"` alongside `"flatpak"`
  and `"snap"`.
- Simplified the README to focus on the `install.sh` one-liner and essential
  information.
- Split install docs into separate GUI and TUI sections.

## 0.1.0

First public release.

- Keyboard-driven software directory with 215 curated apps in 14 categories
- One-click install, update and remove in the background, with progress, per-app status and cancel
- Distro detection (Debian/Ubuntu, Fedora/RHEL, Arch, openSUSE) and a distro filter
- In-app password prompt for administrator rights; Flatpak installs per user
- Command-line interface: `packall list | search | info | install | update | remove`
- Packages: `.deb`, `.rpm`, AppImage, AUR (`packall-bin`)
