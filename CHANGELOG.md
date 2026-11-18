# Changelog

## 0.4.0

### Added

- **Repositories and Updates in the desktop app** — the GUI gets both views.
  Repositories (`2`) searches pacman's sync databases and apt's package lists
  (read from disk in Rust) plus the AUR, and installs results with one click.
  Updates (`5`) lists every outdated package as `installed → newer`, with a
  per-row Update button, *Update selected*, and *Update all* (`U`, confirmed
  first). The sidebar shows the update count, System Packages marks outdated
  rows and gains an *Outdated* filter, and installed catalogue apps with an
  update show an amber arrow.
- **Self-update** — `packall self-update` (desktop) and `packall-tui self-update`
  (terminal) install the latest release in place; `--check` only checks. The
  desktop app checks on launch and offers an Update button (also in About); the
  TUI shows a header note when a new version is out and updates with `P`.
- **Updates view (TUI)** — press `5` to see every installed package with a
  newer version waiting, as `installed → newer`, across pacman, the AUR, apt,
  dnf, zypper, Flatpak, Snap and Homebrew. Select packages and press `u`, or
  press `U` twice to upgrade everything (one full upgrade per manager). The
  tab shows the count, the Installed view marks outdated rows with `↑`, and
  `r` re-checks. Pacman packages only update through the full upgrade, since
  Arch does not support partial upgrades.
- **Repositories view (TUI)** — press `2` to search every package the host's
  repositories offer, not just the curated catalogue: pacman's sync
  databases, apt's package lists, and the AUR (searched online when `yay` or
  `paru` is installed). Results queue and install through the same batch
  runner as catalogue apps. Indexes are read straight from disk in pure Go,
  so no libalpm or libapt-pkg is linked.
- **View tabs (TUI)** — the header now lists Catalogue, Repositories,
  Installed and Managers with the key that opens each, and how many packages
  the repositories hold.
- **`tab` widens a search (TUI)** — moves the current query between the
  catalogue and the repositories, even while typing. A catalogue search shows
  how many repository matches it has in the footer, and an empty catalogue
  result points at them.
- **Repositories intro screen (TUI)** — the empty view explains what is
  searched, lists package counts per manager, and says whether the AUR is
  included or what to install to include it.

### Changed

- Release builds stamp the tag's version into the desktop app
  (`scripts/set-version.mjs`); before this, 0.2.x and 0.3.0 binaries reported 0.1.0.
- Package names from the repositories and the AUR are rejected if a shell
  would interpret them, since they end up in command lines.

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
