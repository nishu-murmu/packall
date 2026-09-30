# Package Icons

Place application icons here. Packall will automatically use them on the software grid.

## Naming Convention

Name the file after the software's `id` field (lowercase, with hyphens):

```
firefox.png
brave.png
vscode.png
neovim.svg
obs-studio.png
```

## Supported Formats

- **SVG** (preferred, scales perfectly at any size)
- **PNG** (use 128×128 or 256×256 px for best quality)
- **WebP**, **AVIF**, **JPEG** (supported, but SVG/PNG preferred)

## Where to Download Icons

Great sources for high-quality app icons:

| Source | URL | Notes |
|--------|-----|-------|
| **Simple Icons** | https://simpleicons.org | Brand SVGs for most popular apps |
| **Papirus Icon Theme** | https://github.com/PapirusDevelopmentTeam/papirus-icon-theme | Full Linux icon set, SVGs |
| **Numix Icons** | https://github.com/numixproject/numix-icon-theme | Flat circular icons |
| **Breeze Icons** | https://github.com/KDE/breeze-icons | KDE's icon set, SVGs |
| **Flathub** | https://flathub.org | App screenshots and icons |
| **App vendor sites** | — | Official brand assets |

## How Packall Loads Icons

1. Looks for `/icons/<id>.svg` first
2. Falls back to `/icons/<id>.png`, `.webp`, `.avif`, `.jpg`
3. If no icon found, shows the first letter of the app name as a stylized avatar
