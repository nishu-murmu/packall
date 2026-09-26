# LinuxDir

> **A graphical directory of essential Linux software — categorized, searchable, and fully navigable with Neovim-style keyboard shortcuts.**

LinuxDir is an offline-first, keyboard-driven application catalog designed specifically for Linux desktop environments and sysadmins. It organizes software across **14 distinct categories**, supports **11 packaging formats**, and allows complete navigation from your home row without a mouse.

---

## Monorepo Architecture

LinuxDir is organized as a unified monorepo encompassing the native desktop application, technical documentation, marketing portal, and shared package definitions:

```
almanac/
├── src/                  # Main Tauri desktop frontend (React 19 + Tailwind + Radix UI)
├── src-tauri/            # Tauri v2 Rust native core (commands & package detection)
├── apps/
│   ├── marketing/        # Interactive marketing & download website (Vite + React)
│   └── docs/             # Technical documentation & guide (VitePress)
├── packages/
│   └── shared/           # @linuxdir/shared: catalog types, categories & software data
├── index.html            # Desktop web entrypoint
└── package.json          # Monorepo scripts & dependencies
```

---

## Applications & Packages

### 1. Main Desktop App (`src/`, `src-tauri/`)
- Powered by **Tauri v2 + Rust** for tiny memory footprint (< 40MB RAM) and sub-10ms startup.
- Full **Neovim modal keybindings** for keyboard-only navigation.
- Live system package manager detection (`apt`, `dnf`, `pacman`, `zypper`, `flatpak`, `snap`, `brew`).
- Local state tracking for **Favorites** and **Installed** software.

### 2. Marketing Website (`apps/marketing/`)
- Built with **Vite + React**.
- Features an **interactive in-browser Neovim keybinding simulator** where prospective users can test modal navigation.
- Curated 14-category showcase with application counts, feature highlights, and distribution download links.

### 3. Documentation Portal (`apps/docs/`)
- Powered by **VitePress** with client-side instant search.
- Includes getting started guides, installation walkthroughs, full keyboard shortcuts reference, and schema specifications for adding new apps.

### 4. Shared Package (`packages/shared/`)
- Named package `@linuxdir/shared`.
- Contains single source of truth for:
  - `types.ts` — TypeScript interfaces (`SoftwareEntry`, `Category`, `InstallOption`, `View`).
  - `categories.ts` — Definitions and icon mappings for all 14 categories.
  - `software.ts` — Catalog of 50+ software entries with multi-distro installation commands.
  - `install-methods.ts` — Metadata, styling badges, and descriptions for package managers.

```ts
import { SOFTWARE, CATEGORIES } from "@linuxdir/shared"
import type { SoftwareEntry, Category } from "@linuxdir/shared"
```

---

## 14 Curated Categories

| Category | Description | Key Software |
|---|---|---|
| **Browsers** | Web browsers and privacy tools | Firefox, Brave, Chrome, Chromium, LibreWolf, Zen |
| **Communications** | Chat, email clients, IRC & VoIP | Discord, Slack, Thunderbird, Element/Matrix, Telegram |
| **Development** | Code editors, IDEs, and developer tooling | VS Code, Neovim, Zed, Postman, GitKraken |
| **Documents** | Office suites, note-taking, and PDF tools | LibreOffice, Obsidian, Logseq, OnlyOffice, Zotero |
| **Games** | Gaming clients, emulators, and launchers | Steam, Lutris, Heroic Games Launcher, RetroArch |
| **Multimedia** | Audio, video, and media playback tools | VLC, Spotify, OBS Studio, Audacity, Kdenlive |
| **Self-Hosted** | Self-hosted services and server applications | Nextcloud, Docker, Portainer, Plex, Jellyfin |
| **Utilities** | Everyday utility apps and helpers | Bitwarden, 1Password, AnyDesk, PeaZip, BleachBit |
| **Terminal** | Terminal emulators and shell tools | Alacritty, Kitty, WezTerm, tmux, Zellij |
| **System** | System management and configuration tools | btop, htop, Stacer, Timeshift, GParted |
| **Security** | Privacy, encryption, and security tools | Wireshark, VeraCrypt, KeePassXC, UFW |
| **Virtualization** | VMs, containers, and sandboxing | VirtualBox, QEMU/KVM, Podman, Distrobox |
| **Education** | Learning and reference applications | Stellarium, GeoGebra, Anki, KiCad |
| **Graphics** | Image editing, 3D, and design tools | GIMP, Inkscape, Blender, Krita, Darktable |

---

## Neovim Keyboard Navigation Reference

| Key | Action | Description |
|---|---|---|
| `j` / `k` | Move Cursor Down / Up | Navigate software list |
| `h` / `l` | Previous / Next Category | Cycle through categories in the sidebar |
| `gg` / `G` | Jump to Top / Bottom | Quick jump to beginning or end of catalog |
| `Enter` | Open App Details | Inspect install commands and detailed notes |
| `Esc` / `Backspace` | Back / Clear | Return to catalog grid or clear search |
| `/` | Focus Search | Instant search by name, tagline, or tags |
| `f` | Toggle Favorite | Star or unstar current software |
| `i` | Toggle Installed | Mark or unmark software as installed locally |
| `s` | Toggle Sidebar | Collapse or expand category sidebar |
| `1` - `4` | Switch View | `1`: Grid, `2`: Favorites, `3`: Installed, `4`: Settings |
| `Tab` | Cycle Views | Consecutively cycle through available views |
| `?` | Help Overlay | Display cheatsheet modal |
| `5j` / `10k` | Number Multiplier | Move cursor down 5 or up 10 items |

---

## Quick Start & Monorepo Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Main Desktop Web App
```bash
npm run dev
# Opens at http://localhost:5173
```

### 3. Run the Marketing Website
```bash
npm run dev:marketing
# Opens at http://localhost:5174
```

### 4. Run the VitePress Documentation Site
```bash
npm run dev:docs
# Opens at http://localhost:5175
```

### 5. Build Everything
```bash
npm run build:all
```

---

## Building the Desktop App (Tauri & Cargo)

```bash
# Ensure Rust and webkit2gtk dependencies are installed
npm run build
cd src-tauri
cargo tauri build
```

Bundled executables (`.deb`, `.rpm`, `AppImage`) will be generated under `src-tauri/target/release/bundle/`.

---

## Contributing Software

To propose a new software entry, append a `SoftwareEntry` object to `packages/shared/src/software.ts`:

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
    { method: "flatpak", command: "flatpak install flathub com.example.MyApp" }
  ]
}
```

Verify your additions with `npm run typecheck` or `npm run build:all`.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
