# LinuxDir

A graphical directory of essential Linux software — categorized, searchable, and fully navigable with Neovim-style keyboard shortcuts.

## Monorepo Structure

```
linuxdir/
├── src/              # Main Tauri desktop app (React + TypeScript + Rust)
├── src-tauri/        # Rust backend (Tauri commands, data layer)
├── apps/
│   ├── marketing/    # Marketing website
│   └── docs/         # Documentation website
└── packages/
    └── shared/       # Shared types and data between apps
```

## Features

- **14 categories** covering browsers, communications, development, games, multimedia, self-hosted tools, utilities, terminal, system, security, virtualization, education, and graphics
- **50+ software entries** with multiple installation methods (apt, flatpak, snap, AppImage, AUR, .deb, and more)
- **Neovim-style keybindings** — navigate the entire app without a mouse
- **Search** across all software by name, tagline, or tags
- **Favorites & Installed tracking** with local state
- **Tauri-powered** native desktop app with Rust backend

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Move selection down / up |
| `h` / `l` | Previous / next category |
| `gg` / `G` | Jump to top / bottom |
| `Enter` | Open app details |
| `Esc` | Go back / clear search |
| `/` | Focus search |
| `f` | Toggle favorite |
| `i` | Toggle installed |
| `1`-`4` | Switch views (grid, favorites, installed, settings) |
| `?` | Show keyboard shortcut help |
| `5j` | Number prefix — move down 5 items |

## Getting Started

```bash
npm install
npm run dev
```

## Building the Desktop App

```bash
npm run build
cd src-tauri && cargo tauri build
```

## License

MIT
