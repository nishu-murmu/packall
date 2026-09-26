---
layout: home

hero:
  name: "LinuxDir"
  text: "Documentation & Developer Guide"
  tagline: "The definitive catalog of Linux software — categorized, searchable, and driven by Neovim keybindings."
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Keyboard Shortcuts
      link: /guide/keyboard-shortcuts
    - theme: alt
      text: View Catalog
      link: /catalog/categories

features:
  - icon: ⚡
    title: Neovim Navigation
    details: Navigate the entire software catalog without ever touching your mouse. j/k movement, gg/G jumps, search, and fuzzy filters.
  - icon: 📦
    title: Multi-Distribution Support
    details: Instant copy-paste install commands for apt, dnf, pacman, zypper, flatpak, snap, AppImage, and AUR.
  - icon: 🦀
    title: Tauri & Rust Powered
    details: Blazing-fast desktop performance, tiny memory footprint, and native Linux integration using Tauri v2.
  - icon: 🗂️
    title: 14 Curated Categories
    details: From development environments and terminal emulators to gaming clients, self-hosted stacks, and privacy utilities.
---

## Quick Architecture Overview

LinuxDir is architected as a modular monorepo:

```
linuxdir/
├── src/              # Main Tauri desktop frontend (React + Tailwind + Lucide)
├── src-tauri/        # Rust backend (Tauri v2 commands, package manager detection)
├── apps/
│   ├── marketing/    # High-performance marketing landing site (Vite)
│   └── docs/         # Documentation website (VitePress)
└── packages/
    └── shared/       # Shared TypeScript catalog data, types, and installation schemas
```
