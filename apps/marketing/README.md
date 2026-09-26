# LinuxDir Marketing Website

A modern landing page for the LinuxDir desktop application.

## Structure (planned)

```
apps/marketing/
├── src/
│   ├── pages/
│   │   ├── index.tsx       # Hero, features, categories, download
│   │   └── download.tsx    # Download links for .deb, AppImage, .rpm
│   └── components/
│       ├── hero.tsx
│       ├── feature-grid.tsx
│       └── category-showcase.tsx
└── package.json
```

This will be a Vite + React app sharing the design system and types from `packages/shared`.
