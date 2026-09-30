# Almanac

> **A graphical directory of essential Linux software — categorized, searchable, and fully navigable with Neovim-style keyboard shortcuts.**

Almanac is an offline-first, keyboard-driven application catalog designed specifically for Linux desktop environments and sysadmins. It organizes software across **14 distinct categories**, supports **11 packaging formats**, and allows complete navigation from your home row without a mouse.

---

## Features

- **Tauri v2 + Rust Architecture**: Native desktop experience with a tiny memory footprint (< 40MB RAM) and sub-10ms startup.
- **Neovim-Style Keyboard Navigation**: Fast modal keybindings (`/`, `Space`, `j`/`k`, `h`/`l`, `c`, `Esc`, `?`) for efficient, mouse-free browsing.
- **Collapsible Category Grid**: Software catalog grouped into collapsible categories with responsive 4-column layout and instant global filtering.
- **Selection Queue & Batch Helper**: Toggle applications with `Space` and inspect or copy installation commands in batch.
- **Live System Detection**: Automatically detects host package managers (`apt`, `dnf`, `pacman`, `zypper`, `flatpak`, `snap`, `brew`).
- **Offline-First Catalog**: Rich curated database of 50+ Linux utilities, development tools, and desktop applications.

---

## Project Structure

```
almanac/
├── src/                  # Desktop frontend (React 19 + Tailwind CSS + Radix UI)
│   ├── components/       # UI components (sidebar, software grid, details drawer, overlays)
│   ├── lib/              # Catalog data, keybindings, state management & types
│   └── hooks/            # Custom React hooks
├── src-tauri/            # Tauri v2 Rust native core (system commands & package detection)
│   ├── src/              # Rust source files (main, commands, system detection)
│   └── tauri.conf.json   # Tauri application configuration
├── index.html            # Desktop web entrypoint
├── package.json          # Project scripts & dependencies
└── vite.config.ts        # Vite build configuration
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
| **Utilities** | Everyday utility apps and helpers | Bitwarden, 1Password, AnyDesk, BleachBit, PeaZip |
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
| `/` | Focus Search | Focus global search input |
| `Space` | Toggle Queue | Toggle highlighted application in selection queue |
| `j` / `k` | Move Down / Up | Move highlight cursor up or down in the grid |
| `h` / `l` | Move Left / Right | Move highlight cursor left or right |
| `c` | Clear Queue | Clear all selected items from queue |
| `Esc` | Close / Dismiss | Close details modal, clear search, or reset highlight |
| `?` | Keybindings Help | Open keybindings cheatsheet modal |
| `Enter` | Open Details | Open selected application details and install commands |
| `g g` / `G` | Jump to Top / Bottom | Quick jump to beginning or end of catalog |
| `s` | Toggle Sidebar | Collapse or expand category sidebar |
| `1` - `5` | Switch View | `1`: Grid, `3`: Installed, `4`: System Managers, `5`: Settings |

---

## Quick Start & Development

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Run Desktop App in Development
To run the full Tauri desktop application:
```bash
npm run dev:tauri
# or with bun:
bun run dev:tauri
```

To run the Vite web frontend independently in your browser:
```bash
npm run dev
```

### 3. Run Tests & Typecheck
```bash
npm run typecheck
npm run test
```

---

## Building the Desktop App (Tauri & Cargo)

Prerequisites:
- [Rust toolchain](https://www.rust-lang.org/tools/install)
- Platform-specific native libraries (e.g., `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev` on Debian/Ubuntu)

```bash
# Build desktop executable and installer bundles
npm run build:tauri
# or:
cargo tauri build --manifest-path src-tauri/Cargo.toml
```

Bundled executables (`.deb`, `.rpm`, `.AppImage`) will be generated under `src-tauri/target/release/bundle/`.

---

## Contributing Software

To propose a new software entry, append a `SoftwareEntry` object to `src/lib/software.ts`:

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

Verify your additions with:
```bash
npm run typecheck
npm run test
```

---

## License

GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](LICENSE) for details.
