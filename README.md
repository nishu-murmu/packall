# Packall

**A keyboard-driven catalogue of essential Linux software.** Browse 215 curated apps, queue a few, and let Packall install them with the right package manager for your distro.

![apps](https://img.shields.io/badge/apps-215-6E56CF)
![categories](https://img.shields.io/badge/categories-14-8B5CF6)
![formats](https://img.shields.io/badge/package%20formats-10-0EA5E9)
![Tauri](https://img.shields.io/badge/Tauri-v2-24C8DB)
![license](https://img.shields.io/badge/license-AGPL--3.0-green)

Free and open source, licensed under the [AGPL-3.0](LICENSE). Contributions welcome — see [Contributing](#contributing).

---

## Distro coverage

Every app Packall can install on each distribution, counting native packages first and Flatpak/Snap as the fallback:

![Debian](https://img.shields.io/badge/Debian%20%2F%20Ubuntu-211%20apps-A81D33)
![Fedora](https://img.shields.io/badge/Fedora%20%2F%20RHEL-209%20apps-51A2DA)
![Arch](https://img.shields.io/badge/Arch%20%2F%20Manjaro-215%20apps-1793D1)
![openSUSE](https://img.shields.io/badge/openSUSE-210%20apps-73BA25)
![Flatpak](https://img.shields.io/badge/Flatpak-198%20apps-4A86CF)
![Snap](https://img.shields.io/badge/Snap-51%20apps-E95420)

| Distro | Native packages | Installable in total |
|---|---:|---:|
| Debian / Ubuntu / Mint | 196 (`apt`, `.deb`) | **211** |
| Arch / Manjaro / EndeavourOS | 193 (`pacman`, AUR) | **215** |
| openSUSE | 115 (`zypper`) | **210** |
| Fedora / RHEL | 101 (`dnf`) | **209** |
| Any distro | — | 198 Flatpak · 51 Snap |

Native package names are verified against the distributions' own repository metadata. Where a distro ships no native package, Packall falls back to Flatpak or Snap rather than hiding the app.

---

## Features

- **Native desktop app** — Tauri v2 + Rust core with a React 19 frontend; the catalogue works offline.
- **Distro-aware installs** — detects Debian, Fedora, Arch and openSUSE families (including derivatives via `ID_LIKE`), then picks the best available method per app.
- **Neovim-style navigation** — `/`, `j`/`k`, `h`/`l`, `Space`, `i`/`u`/`x`, `?`; the whole app runs from the home row.
- **Background queue** — select apps, press Install, Update or Remove; work runs on a background thread with per-package status, live logs, progress and Cancel. Privileged steps use a private `SUDO_ASKPASS` helper; the password is collected in an in-app dialog, never stored on disk beyond the lifetime of the batch.
- **Live system detection** — finds `apt`, `dnf`, `pacman`, `zypper`, `flatpak`, `snap` and `brew` on the host, and greys out methods whose tool is missing.
- **Installed view** — scan what is already on the system and update or remove it from the same UI.

---

## Install

Packall comes in two versions that share the same catalogue. Pick the one you want:

| | Desktop app (GUI) | Terminal app (TUI) |
|---|---|---|
| Interface | Window with mouse and keyboard | Keyboard only, runs in your terminal |
| How you get it | Prebuilt packages from Releases | Build from source with Go |

### Desktop app (GUI)

Download from the [Releases](https://github.com/nishu-murmu/packall/releases) page, or use the commands below.

| Distro | Command |
|---|---|
| Debian / Ubuntu / Mint | `sudo apt install ./Packall_*_amd64.deb` |
| Fedora / RHEL / openSUSE | `sudo dnf install ./Packall-*.rpm` |
| Any x86_64 Linux (AppImage) | See below |

AppImage with `curl`:

```bash
curl -fL -o Packall.AppImage "$(curl -s https://api.github.com/repos/nishu-murmu/packall/releases/latest | grep -o 'https://[^"]*\.AppImage' | head -1)"
chmod +x Packall.AppImage
./Packall.AppImage
```

On Arch, AppImages need FUSE 2 first: `sudo pacman -S fuse2`.

### Terminal app (TUI)

The TUI is not published as a release file yet, so build it from source. You need Go 1.24 or newer (on Arch: `sudo pacman -S go`).

```bash
git clone https://github.com/nishu-murmu/packall.git
cd packall
go build -o packall ./cmd/packall
./packall                 # interactive interface
./packall list            # command-line subcommands also work
```

To put it on your `PATH`, run `go install ./cmd/packall` from the repo, which installs to `$(go env GOPATH)/bin`.

Maintainers: see [`packaging/`](packaging/README.md) for APT, RPM and release automation.

---

## Keyboard reference

| Key | Action |
|---|---|
| `/` | Focus search |
| `j` `k` `h` `l` | Move highlight down / up / left / right |
| `Space` | Toggle highlighted app in the queue |
| `a` · `c` | Select everything visible · clear the queue |
| `i` · `u` · `x` | Install · update · remove the queue |
| `Enter` | Open app details and install commands |
| `g g` · `G` | Jump to first · last item |
| `1` · `3` · `4` | Catalogue · Installed · System managers |
| `s` · `?` · `Esc` | Toggle sidebar · keybindings help · close or go back |

---

## Catalogue

215 apps across 14 categories:

| Category | Apps | Category | Apps |
|---|---:|---|---:|
| Development | 55 | Games | 12 |
| Terminal | 29 | Graphics | 12 |
| System | 26 | Documents | 10 |
| Browsers | 20 | Communications | 7 |
| Multimedia | 15 | Security | 6 |
| Utilities | 14 | Self-Hosted | 4 |
| | | Education | 3 |
| | | Virtualization | 2 |

---

## Development

```bash
npm install          # or: bun install
npm run dev:tauri    # full desktop app
npm run web:dev      # Vite frontend only (package actions need the desktop shell)
```

```bash
npm run typecheck && npm test   # TypeScript + Vitest
npm run test:rust               # cargo test
npm run build:tauri             # bundles into src-tauri/target/release/bundle/
```

Building the desktop app needs the [Rust toolchain](https://www.rust-lang.org/tools/install) plus the usual Tauri native libraries:

```bash
# Debian / Ubuntu / Mint
sudo apt install libwebkit2gtk-4.1-dev build-essential libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Arch / Manjaro / EndeavourOS
sudo pacman -S webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg

# Fedora / RHEL
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
```

Source layout: [`src/`](src) is the React frontend (`lib/` holds the catalogue, state and keybindings), [`src-tauri/src/`](src-tauri/src) is the Rust core (system detection, job worker).

---

## Contributing

Bug fixes, new distro support, packaging and catalogue entries are all welcome. Run `npm run typecheck && npm test` and `npm run test:rust` before opening a PR.

### Adding software

Append a `SoftwareEntry` to [`src/lib/software.ts`](src/lib/software.ts):

```ts
{
  id: "my-app",
  name: "My App",
  tagline: "A concise summary",
  description: "Detailed description of features and usage.",
  category: "development",
  homepage: "https://example.com",
  license: "GPL-3.0",
  tags: ["dev", "tools"],
  install: [
    { method: "apt", command: "sudo apt install my-app" },
    { method: "dnf", command: "sudo dnf install my-app" },
    { method: "zypper", command: "sudo zypper install my-app" },
    { method: "flatpak", command: "flatpak install flathub com.example.MyApp" }
  ]
}
```

Please use the package name that distro actually ships — the test suite checks that each command drives its own package manager, and a wrong name only fails once a user presses Install. Native-only apps are fine; Flatpak or Snap covers the rest.

---

## License

GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE).
