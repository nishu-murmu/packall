<p align="center">
  <img src="assets/logo.svg" width="128" alt="Packall">
</p>

<h1 align="center">Packall</h1>

<p align="center">
  A keyboard-driven catalogue of essential Linux software.<br>
  Browse 215 curated apps, queue a few, and let Packall install them with the right package manager for your distro.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/apps-215-6E56CF" alt="apps">
  <img src="https://img.shields.io/badge/categories-14-8B5CF6" alt="categories">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-green" alt="license">
</p>

---

## Two ways to find software

- **Catalogue** — 215 hand-picked apps in 14 categories, each with verified
  package names for every supported distro, so Packall picks the right
  install method (native, Flatpak, Snap, AUR, or the vendor's script).
- **Repositories** *(TUI)* — every package your system's repositories offer,
  not just the curated ones. Packall reads the package lists your manager
  already keeps on disk (pacman's sync databases, apt's package lists) and
  searches the AUR online when `yay` or `paru` is installed. Queue and install
  them exactly like catalogue apps.

In the TUI the views are tabs along the top. Search the catalogue with `/`;
if what you want is not there, press `tab` to run the same search across your
repositories — the footer tells you how many matches are waiting.

> The Repositories view reads indexes from disk, so it is only as fresh as
> your last `sudo pacman -Sy` or `sudo apt update`. AUR packages are
> user-submitted — read the PKGBUILD before installing.

## Keeping things up to date *(TUI)*

On start Packall asks each manager what it could upgrade (`checkupdates` or
`pacman -Qu`, `paru`/`yay -Qua`, `apt list --upgradable`, `dnf check-update`,
`zypper list-updates`, `flatpak remote-ls --updates`, `snap refresh --list`,
`brew outdated`). None of these need root.

- The **Updates** tab (`5`) shows the count and lists every package as
  `installed → newer`. Select with `Space` / `a`, then `u` to update the
  selection, or press `U` twice to upgrade everything.
- The **Installed** view marks outdated packages with `↑` and the new version.
- `r` re-checks; the list also refreshes after every batch.

> Arch does not support partial upgrades, so pacman packages are only updated
> through `U` (`pacman -Syu`); AUR and every other manager can be updated one
> by one. Install `pacman-contrib` for fresh results — without it Packall
> falls back to `pacman -Qu`, which only knows about your last `pacman -Sy`.

---

### Desktop app (GUI)

```bash
curl -fsSL https://packall-website.pages.dev/install.sh | sh
```

### Terminal app (TUI)

```bash
curl -fsSL https://packall-website.pages.dev/install.sh | sh -s -- --tui
```

Or build from source (Go 1.24+):

```bash
git clone https://github.com/nishu-murmu/packall.git && cd packall
go build -o packall ./cmd/packall && ./packall
```

Manual downloads are on the [Releases](https://github.com/nishu-murmu/packall/releases) page (AppImage, TUI tarball).

### Updating Packall

Both apps update themselves from the latest GitHub release:

```bash
packall self-update        # desktop app (also offered on launch and in About)
packall-tui self-update    # terminal app (or press P when the header says a new version is out)
```

Add `--check` to only check. The AppImage and TUI binary are replaced in place;
`.deb`/`.rpm` installs update through apt, dnf or zypper.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Search |
| `j` `k` `h` `l` | Navigate |
| `Space` | Toggle app in queue |
| `a` / `c` | Queue all shown / clear queue |
| `i` / `u` / `x` | Install / update / remove |
| `1` `2` `3` `4` `5` | Catalogue / Repositories / Installed / Managers / Updates *(TUI)* |
| `U` `U` | Update every outdated package *(TUI)* |
| `r` | Re-check for updates *(TUI)* |
| `Tab` | Move the current search between Catalogue and Repositories *(TUI)* |
| `?` | Full keybindings help |

---

## Development

```bash
npm install && npm run dev:tauri    # desktop app (needs Rust + Tauri deps)
npm run web:dev                     # frontend only
go run ./cmd/packall                # TUI
```

```bash
npm run typecheck && npm test       # TypeScript + Vitest
npm run test:rust                   # cargo test
go test ./...                       # Go tests
```

See the [releases page](https://github.com/nishu-murmu/packall/releases) for prebuilt binaries.

---

## Contributing

Bug fixes, distro support, and catalogue entries are welcome. Run the test suites before opening a PR.

To add an app, append an entry to [`src/lib/software.ts`](src/lib/software.ts) using the package names each distro actually ships.

---

## License

[AGPL-3.0](LICENSE)
