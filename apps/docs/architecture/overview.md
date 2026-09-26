# Monorepo Architecture Overview

Almanac is engineered as an integrated monorepo uniting a cross-platform desktop application, a public documentation portal, a marketing website, and a shared catalog package.

## Repository Layout

```
almanac/
├── src/                  # React + Tailwind + Radix desktop frontend
├── src-tauri/            # Tauri v2 Rust core application
├── apps/
│   ├── marketing/        # Landing page & download portal (Vite)
│   └── docs/             # Technical documentation & guide (VitePress)
├── packages/
│   └── shared/           # Catalog entries, categories & TypeScript types
└── README.md             # Unified monorepo documentation
```

## Component Roles

1. **`src/` (Desktop Frontend)**:
   - React 19 single-page app utilizing Radix UI primitives and Lucide icons.
   - Global keyboard event listener capturing Neovim modal commands.
   - Client-side fuzzy searching and state persistence.

2. **`src-tauri/` (Native Rust Core)**:
   - Tauri v2 application wrapper.
   - Native process execution and package manager discovery (`apt`, `pacman`, `dnf`, `flatpak`, etc.).
   - Fast system calls without heavyweight Electron runtimes.

3. **`apps/docs/` (Documentation)**:
   - Built on VitePress for lightning-fast documentation with client-side instant search.
   - Comprehensive references for keybindings, package schemas, and install guides.

4. **`apps/marketing/` (Marketing & Showcase)**:
   - Vite-powered modern showcase site.
   - Interactive keybinding playground allowing prospective users to test the Neovim shortcuts in-browser.
   - Multi-distro download hub.

5. **`packages/shared/`**:
   - Single source of truth for software definitions, categories, and schemas.
