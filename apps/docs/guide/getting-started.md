# Getting Started

Welcome to the Almanac documentation! This guide will walk you through launching the Almanac application and setting up your local development environment.

## What is Almanac?

**Almanac** is a keyboard-driven, graphical software directory built specifically for Linux desktop users and sysadmins. Rather than searching scattered websites, package repositories, or forum threads, Almanac brings together the finest Linux applications in one place with:

- **14 curated categories**: Browsers, Development, Gaming, Utilities, Multimedia, Self-Hosted, and more.
- **Multiple install methods**: apt, dnf, pacman, zypper, flatpak, snap, AppImage, and AUR.
- **Pure Neovim keybindings**: Navigate, search, switch categories, and mark favorites using familiar modal editing keys (`j`, `k`, `h`, `l`, `gg`, `G`, `/`).
- **Offline first & light**: Backed by a high-efficiency Rust backend running on Tauri v2.

---

## Prerequisites

Before building Almanac locally, ensure you have the following installed:

- **Node.js**: v18+ (Node.js 20 or 22 LTS recommended)
- **Rust Toolchain**: `rustc` and `cargo` (1.75+)
- **System dependencies (Linux)**:
  ```bash
  # Debian / Ubuntu / Pop!_OS
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

  # Fedora / RHEL
  sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget libappindicator-gtk3-devel librsvg2-devel

  # Arch Linux
  sudo pacman -S webkit2gtk-4.1 base-devel curl wget openssl appmenu-gtk-module libappindicator-gtk3 librsvg
  ```

---

## Running in Development

Clone the repository and install root dependencies:

```bash
git clone https://github.com/nishu-murmu/almanac.git almanac
cd almanac
npm install
```

### Launch the Desktop App Frontend (Vite)

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Launch with Tauri Native Window

```bash
npm run build
cd src-tauri
cargo tauri dev
```

---

## Monorepo Commands

Almanac is structured as a monorepo containing the desktop client, docs, marketing site, and shared catalog:

| Command | Description |
|---|---|
| `npm run dev` | Runs the main desktop web interface on `localhost:5173` |
| `npm run build` | Compiles TypeScript and builds production frontend bundle |
| `npm run typecheck` | Checks TypeScript across the client codebase |
| `cd apps/marketing && npm run dev` | Runs the marketing landing page on `localhost:5174` |
| `cd apps/docs && npm run dev` | Runs this VitePress documentation site on `localhost:5175` |
