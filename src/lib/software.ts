import type { SoftwareEntry } from "./types"

export const SOFTWARE: SoftwareEntry[] = [
  // ==================== BROWSERS ====================
  {
    id: "firefox",
    name: "Firefox",
    tagline: "Fast, private, and secure web browser",
    description:
      "Mozilla Firefox is a free and open-source web browser. Known for its strong privacy stance, customization options, and support for open web standards. Uses the Gecko rendering engine and is developed by the Mozilla Foundation.",
    category: "browsers",
    homepage: "https://www.mozilla.org/firefox/",
    license: "MPL-2.0",
    tags: ["browser", "web", "privacy", "gecko"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install firefox" },
      { method: "flatpak", command: "flatpak install flathub org.mozilla.firefox" },
      { method: "snap", command: "sudo snap install firefox" },
    ],
  },
  {
    id: "chromium",
    name: "Chromium",
    tagline: "Open-source browser project behind Chrome",
    description:
      "Chromium is the open-source browser project that serves as the foundation for Google Chrome and many other browsers. It provides a fast, secure, and stable browsing experience using the Blink rendering engine.",
    category: "browsers",
    homepage: "https://www.chromium.org/",
    license: "BSD-3-Clause",
    tags: ["browser", "web", "blink"],
    install: [
      { method: "apt", command: "sudo apt install chromium-browser" },
      { method: "flatpak", command: "flatpak install flathub org.chromium.Chromium" },
      { method: "snap", command: "sudo snap install chromium" },
    ],
  },
  {
    id: "brave",
    name: "Brave",
    tagline: "Privacy-focused browser with built-in ad blocking",
    description:
      "Brave is a free and open-source browser based on Chromium that blocks ads and website trackers out of the box. Includes built-in Tor for private browsing and optional crypto rewards system.",
    category: "browsers",
    homepage: "https://brave.com/",
    license: "MPL-2.0",
    tags: ["browser", "privacy", "adblock", "chromium"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.brave.Browser" },
      { method: "apt", command: "sudo snap install brave", notes: "Via snap on most distros" },
    ],
  },
  {
    id: "vivaldi",
    name: "Vivaldi",
    tagline: "Highly customizable browser for power users",
    description:
      "Vivaldi is a feature-rich, highly customizable web browser built for power users. Includes tab stacking, built-in note-taking, mouse gestures, and extensive theming options. Based on Chromium.",
    category: "browsers",
    homepage: "https://vivaldi.com/",
    license: "Proprietary",
    tags: ["browser", "customizable", "power-user"],
    install: [
      { method: "deb", command: "Download .deb from vivaldi.com" },
      { method: "aur", command: "yay -S vivaldi" },
    ],
  },
  {
    id: "zen-browser",
    name: "Zen Browser",
    tagline: "Firefox-based browser focused on privacy and beauty",
    description:
      "Zen Browser is a modern Firefox-based browser that emphasizes privacy, speed, and a beautiful user experience. Features a split-view, workspaces, and compact mode for efficient browsing.",
    category: "browsers",
    homepage: "https://zen-browser.app/",
    license: "MPL-2.0",
    tags: ["browser", "privacy", "firefox"],
    install: [
      { method: "flatpak", command: "flatpak install flathub app.zen_browser.zen" },
      { method: "aur", command: "yay -S zen-browser-bin" },
    ],
  },
  {
    id: "tor-browser",
    name: "Tor Browser",
    tagline: "Anonymous browsing via the Tor network",
    description:
      "Tor Browser isolates and routes web traffic through the encrypted Tor network to protect privacy and anonymity. Blocks trackers, defends against surveillance, and uses Firefox as its base.",
    category: "browsers",
    homepage: "https://www.torproject.org/",
    license: "MPL-2.0",
    tags: ["browser", "privacy", "anonymity", "tor"],
    install: [
      { method: "flatpak", command: "flatpak install flathub org.torproject.torbrowser-launcher" },
      { method: "apt", command: "sudo apt install torbrowser-launcher" },
    ],
  },

  // ==================== COMMUNICATIONS ====================
  {
    id: "signal",
    name: "Signal",
    tagline: "End-to-end encrypted messaging",
    description:
      "Signal is a free, open-source messaging app with end-to-end encryption for messages, voice, and video calls. Considered the gold standard for private communication. Developed by the Signal Foundation.",
    category: "communications",
    homepage: "https://signal.org/",
    license: "AGPL-3.0",
    tags: ["messaging", "encryption", "privacy", "voip"],
    featured: true,
    install: [
      { method: "flatpak", command: "flatpak install flathub org.signal.Signal" },
      { method: "apt", command: "Follow instructions at signal.org/download" },
      { method: "aur", command: "yay -S signal-desktop" },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    tagline: "Fast, cloud-based messaging with huge features",
    description:
      "Telegram is a cloud-based messaging app with a focus on speed and security. Supports large group chats, channels, bots, file sharing up to 2GB, and optional end-to-end encrypted secret chats.",
    category: "communications",
    homepage: "https://telegram.org/",
    license: "GPL-3.0",
    tags: ["messaging", "cloud", "voip"],
    install: [
      { method: "flatpak", command: "flatpak install flathub org.telegram.desktop" },
      { method: "apt", command: "sudo snap install telegram-desktop" },
      { method: "aur", command: "yay -S telegram-desktop" },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    tagline: "Voice, video, and text chat for communities",
    description:
      "Discord is a popular communication platform for communities, gamers, and teams. Offers voice channels, video calls, text messaging, screen sharing, and bot integrations. Available as a desktop app or web app.",
    category: "communications",
    homepage: "https://discord.com/",
    license: "Proprietary",
    tags: ["messaging", "voip", "gaming", "communities"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.discordapp.Discord" },
      { method: "deb", command: "Download .deb from discord.com" },
      { method: "aur", command: "yay -S discord" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "Team collaboration and messaging",
    description:
      "Slack is a business messaging platform for team collaboration. Features channels, direct messages, file sharing, integrations with hundreds of services, and powerful search. Popular in professional environments.",
    category: "communications",
    homepage: "https://slack.com/",
    license: "Proprietary",
    tags: ["messaging", "team", "business", "collaboration"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.slack.Slack" },
      { method: "deb", command: "Download .deb from slack.com/downloads" },
      { method: "snap", command: "sudo snap install slack" },
    ],
  },
  {
    id: "thunderbird",
    name: "Thunderbird",
    tagline: "Free, open-source email client",
    description:
      "Mozilla Thunderbird is a free, open-source email, news, and chat client. Supports multiple accounts, RSS feeds, newsgroups, and includes a built-in calendar and contact manager. Highly extensible via add-ons.",
    category: "communications",
    homepage: "https://www.thunderbird.net/",
    license: "MPL-2.0",
    tags: ["email", "client", "calendar", "rss"],
    install: [
      { method: "flatpak", command: "flatpak install flathub org.mozilla.Thunderbird" },
      { method: "apt", command: "sudo apt install thunderbird" },
    ],
  },
  {
    id: "element",
    name: "Element",
    tagline: "Matrix-based decentralized messaging",
    description:
      "Element is a Matrix-based messaging client offering end-to-end encrypted, decentralized communication. Supports group chats, voice/video calls, file sharing, and bridges to other networks like IRC, Slack, and Discord.",
    category: "communications",
    homepage: "https://element.io/",
    license: "AGPL-3.0",
    tags: ["messaging", "matrix", "decentralized", "encryption"],
    install: [
      { method: "flatpak", command: "flatpak install flathub im.riot.Riot" },
      { method: "apt", command: "sudo apt install element-desktop" },
      { method: "aur", command: "yay -S element-desktop" },
    ],
  },

  // ==================== DEVELOPMENT ====================
  {
    id: "vscode",
    name: "VS Code",
    tagline: "Popular extensible code editor by Microsoft",
    description:
      "Visual Studio Code is a free, source-available code editor with excellent TypeScript, JavaScript, and Python support. Features an integrated terminal, Git integration, debugging, and a massive extension marketplace.",
    category: "development",
    homepage: "https://code.visualstudio.com/",
    license: "MIT",
    tags: ["editor", "ide", "microsoft", "extensions"],
    featured: true,
    install: [
      { method: "flatpak", command: "flatpak install flathub com.visualstudio.code" },
      { method: "deb", command: "Download .deb from code.visualstudio.com" },
      { method: "apt", command: "Follow Microsoft's apt repo setup guide" },
      { method: "snap", command: "sudo snap install code --classic" },
    ],
  },
  {
    id: "neovim",
    name: "Neovim",
    tagline: "Modern, extensible Vim-fork editor",
    description:
      "Neovim is a Vim-fork focused on extensibility and usability. Features a built-in LSP client, Lua scripting, async plugin architecture, and a modern terminal UI. The most popular Vim distribution among new power users.",
    category: "development",
    homepage: "https://neovim.io/",
    license: "Apache-2.0",
    tags: ["editor", "vim", "terminal", "lsp", "lua"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install neovim" },
      { method: "flatpak", command: "flatpak install flathub io.neovim.nvim" },
      { method: "aur", command: "yay -S neovim" },
      { method: "pacman", command: "sudo pacman -S neovim" },
    ],
  },
  {
    id: "zed",
    name: "Zed",
    tagline: "Blazing-fast collaborative code editor",
    description:
      "Zed is a high-performance, GPU-accelerated code editor built in Rust by the creators of Atom. Features real-time collaboration, built-in terminal, and excellent language support. Open source as of 2024.",
    category: "development",
    homepage: "https://zed.dev/",
    license: "GPL-3.0",
    tags: ["editor", "rust", "collaboration", "gpu"],
    install: [
      { method: "aur", command: "yay -S zed" },
      { method: "manual", command: "Download from zed.dev" },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    tagline: "Container platform for building and shipping apps",
    description:
      "Docker is a platform for developing, shipping, and running applications in containers. Provides a consistent runtime environment, simplifies deployment, and integrates with CI/CD pipelines. Industry standard for containerization.",
    category: "development",
    homepage: "https://www.docker.com/",
    license: "Apache-2.0",
    tags: ["containers", "devops", "deployment"],
    install: [
      { method: "apt", command: "Follow docs.docker.com engine install guide for your distro" },
      { method: "deb", command: "Download .deb from docker.com" },
      { method: "aur", command: "yay -S docker" },
    ],
  },
  {
    id: "podman",
    name: "Podman",
    tagline: "Daemonless, rootless container engine",
    description:
      "Podman is a daemonless, rootless container engine that provides a Docker-compatible command line interface. Developed by Red Hat, it is a drop-in replacement for Docker with better security defaults.",
    category: "development",
    homepage: "https://podman.io/",
    license: "Apache-2.0",
    tags: ["containers", "rootless", "red-hat", "oci"],
    install: [
      { method: "apt", command: "sudo apt install podman" },
      { method: "dnf", command: "sudo dnf install podman" },
      { method: "pacman", command: "sudo pacman -S podman" },
    ],
  },
  {
    id: "git",
    name: "Git",
    tagline: "Distributed version control system",
    description:
      "Git is a free and open-source distributed version control system. Handles projects of any size with speed, efficiency, and a branching model that enables powerful workflows. The backbone of modern software development.",
    category: "development",
    homepage: "https://git-scm.com/",
    license: "GPL-2.0",
    tags: ["vcs", "version-control", "scm"],
    install: [
      { method: "apt", command: "sudo apt install git" },
      { method: "dnf", command: "sudo dnf install git" },
      { method: "pacman", command: "sudo pacman -S git" },
    ],
  },
  {
    id: "postman",
    name: "Postman",
    tagline: "API development and testing platform",
    description:
      "Postman is a collaboration platform for API development. Allows you to design, test, document, and share APIs. Features a graphical interface for building HTTP requests, automated testing, and environment management.",
    category: "development",
    homepage: "https://www.postman.com/",
    license: "Proprietary",
    tags: ["api", "http", "testing", "rest"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.getpostman.Postman" },
      { method: "snap", command: "sudo snap install postman" },
    ],
  },

  // ==================== DOCUMENTS ====================
  {
    id: "libreoffice",
    name: "LibreOffice",
    tagline: "Free, open-source office suite",
    description:
      "LibreOffice is a free and open-source office suite with a word processor (Writer), spreadsheet (Calc), presentation (Impress), drawing (Draw), database (Base), and math (Math) tools. Compatible with Microsoft Office formats.",
    category: "documents",
    homepage: "https://www.libreoffice.org/",
    license: "MPL-2.0",
    tags: ["office", "suite", "word", "spreadsheet", "presentation"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install libreoffice" },
      { method: "flatpak", command: "flatpak install flathub org.libreoffice.LibreOffice" },
    ],
  },
  {
    id: "onlyoffice",
    name: "OnlyOffice",
    tagline: "Office suite with excellent MS Office compatibility",
    description:
      "OnlyOffice is an office suite with excellent Microsoft Office format compatibility. Includes document, spreadsheet, and presentation editors. Also offers a self-hosted document server for collaboration.",
    category: "documents",
    homepage: "https://www.onlyoffice.com/",
    license: "AGPL-3.0",
    tags: ["office", "suite", "collaboration"],
    install: [
      { method: "flatpak", command: "flatpak install flathub org.onlyoffice.desktopeditors" },
      { method: "deb", command: "Download .deb from onlyoffice.com" },
    ],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    tagline: "Knowledge base on top of a local Markdown folder",
    description:
      "Obsidian is a powerful note-taking and knowledge management app that stores notes as plain Markdown files. Features backlinks, graph view, canvas, and a rich plugin ecosystem. Your data stays local and under your control.",
    category: "documents",
    homepage: "https://obsidian.md/",
    license: "Proprietary",
    tags: ["notes", "markdown", "knowledge-base", "pkms"],
    install: [
      { method: "flatpak", command: "flatpak install flathub md.obsidian.Obsidian" },
      { method: "deb", command: "Download .deb from obsidian.md" },
      { method: "aur", command: "yay -S obsidian" },
    ],
  },
  {
    id: "okular",
    name: "Okular",
    tagline: "Universal document viewer by KDE",
    description:
      "Okular is a universal document viewer developed by KDE. Supports PDF, EPUB, DjVu, CHM, Comics, and many more formats. Features annotation tools, bookmarks, and excellent rendering quality.",
    category: "documents",
    homepage: "https://okular.kde.org/",
    license: "GPL-2.0",
    tags: ["pdf", "viewer", "kde", "document"],
    install: [
      { method: "apt", command: "sudo apt install okular" },
      { method: "flatpak", command: "flatpak install flathub org.kde.okular" },
    ],
  },

  // ==================== GAMES ====================
  {
    id: "steam",
    name: "Steam",
    tagline: "Gaming platform and store by Valve",
    description:
      "Steam is the largest PC gaming platform by Valve. Provides game purchasing, automatic updates, community features, and Proton for running Windows games on Linux. Includes Steam Workshop for mods.",
    category: "games",
    homepage: "https://store.steampowered.com/",
    license: "Proprietary",
    tags: ["gaming", "store", "proton", "valve"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install steam" },
      { method: "flatpak", command: "flatpak install flathub com.valvesoftware.Steam" },
      { method: "aur", command: "yay -S steam" },
    ],
  },
  {
    id: "lutris",
    name: "Lutris",
    tagline: "Open gaming platform for all your games",
    description:
      "Lutris is a gaming platform that helps you install and manage games from various sources. Supports Steam, GOG, Epic, emulators, and more. Includes install scripts for thousands of games and manages Wine prefixes.",
    category: "games",
    homepage: "https://lutris.net/",
    license: "GPL-3.0",
    tags: ["gaming", "emulation", "wine", "manager"],
    install: [
      { method: "flatpak", command: "flatpak install flathub net.lutris.Lutris" },
      { method: "apt", command: "Follow lutris.net download instructions" },
      { method: "aur", command: "yay -S lutris" },
    ],
  },
  {
    id: "heroic",
    name: "Heroic Games Launcher",
    tagline: "GOG and Epic Games launcher for Linux",
    description:
      "Heroic Games Launcher is a native Linux GUI for GOG and Epic Games Store. Lets you install, update, and play games from both stores with Wine/Proton support. Features cloud saves and game library management.",
    category: "games",
    homepage: "https://heroicgameslauncher.com/",
    license: "GPL-3.0",
    tags: ["gaming", "epic", "gog", "wine"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.heroicgameslauncher.hgl" },
      { method: "aur", command: "yay -S heroic-games-launcher-bin" },
    ],
  },
  {
    id: "wine",
    name: "WINE",
    tagline: "Run Windows applications on Linux",
    description:
      "WINE is a compatibility layer capable of running Windows applications on Linux, macOS, and BSD. Translates Windows API calls to POSIX calls. The foundation for Proton and many game compatibility setups.",
    category: "games",
    homepage: "https://www.winehq.org/",
    license: "LGPL-2.1",
    tags: ["compatibility", "windows", "gaming"],
    install: [
      { method: "apt", command: "sudo apt install wine" },
      { method: "dnf", command: "sudo dnf install wine" },
      { method: "pacman", command: "sudo pacman -S wine" },
    ],
  },

  // ==================== MULTIMEDIA ====================
  {
    id: "vlc",
    name: "VLC",
    tagline: "Plays everything, everywhere",
    description:
      "VLC is a free and open-source media player that plays virtually any audio and video format. Supports streaming, subtitles, screen recording, and a wide range of codecs without needing external packs.",
    category: "multimedia",
    homepage: "https://www.videolan.org/",
    license: "GPL-2.0",
    tags: ["player", "video", "audio", "media"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install vlc" },
      { method: "flatpak", command: "flatpak install flathub org.videolan.VLC" },
      { method: "snap", command: "sudo snap install vlc" },
    ],
  },
  {
    id: "obs-studio",
    name: "OBS Studio",
    tagline: "Free, open-source streaming and recording",
    description:
      "OBS Studio is free and open-source software for video recording and live streaming. Supports multiple sources, scenes, filters, transitions, and plugins. The industry standard for content creators on Linux.",
    category: "multimedia",
    homepage: "https://obsproject.com/",
    license: "GPL-2.0",
    tags: ["streaming", "recording", "video", "broadcasting"],
    featured: true,
    install: [
      { method: "flatpak", command: "flatpak install flathub com.obsproject.Studio" },
      { method: "apt", command: "sudo apt install obs-studio" },
      { method: "aur", command: "yay -S obs-studio" },
    ],
  },
  {
    id: "audacity",
    name: "Audacity",
    tagline: "Free, open-source audio editor",
    description:
      "Audacity is a free, open-source, cross-platform audio editor. Supports recording, editing, mixing, and exporting audio. Includes effects, noise reduction, multi-track editing, and support for various audio formats.",
    category: "multimedia",
    homepage: "https://www.audacityteam.org/",
    license: "GPL-2.0",
    tags: ["audio", "editor", "recording", "music"],
    install: [
      { method: "apt", command: "sudo apt install audacity" },
      { method: "flatpak", command: "flatpak install flathub org.audacityteam.Audacity" },
    ],
  },
  {
    id: "kdenlive",
    name: "Kdenlive",
    tagline: "Free, open-source video editor",
    description:
      "Kdenlive is a free, open-source multi-track video editor built on the MLT framework. Supports a wide range of formats, effects, transitions, and timeline editing. A professional-grade NLE for Linux.",
    category: "multimedia",
    homepage: "https://kdenlive.org/",
    license: "GPL-3.0",
    tags: ["video", "editor", "nle", "kde"],
    install: [
      { method: "flatpak", command: "flatpak install flathub org.kde.kdenlive" },
      { method: "apt", command: "sudo apt install kdenlive" },
    ],
  },
  {
    id: "gimp",
    name: "GIMP",
    tagline: "Free image editor and graphics tool",
    description:
      "GIMP is a free and open-source image editor. Supports raster editing, photo retouching, image composition, and graphic design. Extensible via plugins and scripts. The most popular open-source alternative to Photoshop.",
    category: "multimedia",
    homepage: "https://www.gimp.org/",
    license: "GPL-3.0",
    tags: ["image", "editor", "graphics", "photo"],
    install: [
      { method: "apt", command: "sudo apt install gimp" },
      { method: "flatpak", command: "flatpak install flathub org.gimp.GIMP" },
      { method: "snap", command: "sudo snap install gimp" },
    ],
  },

  // ==================== SELF-HOSTED ====================
  {
    id: "nextcloud",
    name: "Nextcloud",
    tagline: "Self-hosted cloud storage and collaboration",
    description:
      "Nextcloud is a self-hosted cloud storage platform with file sync, sharing, calendar, contacts, and collaboration features. Includes a rich app ecosystem and end-to-end encryption. A privacy-focused alternative to Google Drive.",
    category: "self-hosted",
    homepage: "https://nextcloud.com/",
    license: "AGPL-3.0",
    tags: ["cloud", "storage", "self-hosted", "collaboration"],
    featured: true,
    install: [
      { method: "flatpak", command: "flatpak install flathub com.nextcloud.desktopclient" },
      { method: "manual", command: "Docker: docker run nextcloud" },
      { method: "apt", command: "Follow nextcloud.com/install guide" },
    ],
  },
  {
    id: "jellyfin",
    name: "Jellyfin",
    tagline: "Free, open-source media server",
    description:
      "Jellyfin is a free, open-source media system that lets you stream your movies, TV shows, and music to any device. No tracking, no premium tiers, no data collection. A volunteer-built alternative to Plex.",
    category: "self-hosted",
    homepage: "https://jellyfin.org/",
    license: "GPL-2.0",
    tags: ["media", "server", "streaming", "self-hosted"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.jellyfin.JellyfinServer" },
      { method: "manual", command: "Docker: docker run jellyfin/jellyfin" },
      { method: "aur", command: "yay -S jellyfin" },
    ],
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    tagline: "Lightweight Bitwarden-compatible server",
    description:
      "Vaultwarden is a lightweight, self-hosted password manager server compatible with Bitwarden clients. Written in Rust, it uses minimal resources while providing the full Bitwarden API including organizations and attachments.",
    category: "self-hosted",
    homepage: "https://github.com/dani-garcia/vaultwarden",
    license: "AGPL-3.0",
    tags: ["password", "security", "self-hosted", "bitwarden"],
    install: [
      { method: "manual", command: "Docker: docker run vaultwarden/server" },
      { method: "aur", command: "yay -S vaultwarden-bin" },
    ],
  },
  {
    id: "home-assistant",
    name: "Home Assistant",
    tagline: "Open-source home automation platform",
    description:
      "Home Assistant is a free, open-source home automation platform focused on local control and privacy. Integrates with thousands of smart devices and services. Supports automation, dashboards, and voice assistants.",
    category: "self-hosted",
    homepage: "https://www.home-assistant.io/",
    license: "Apache-2.0",
    tags: ["iot", "automation", "smart-home", "self-hosted"],
    install: [
      { method: "manual", command: "Docker: docker run homeassistant/home-assistant" },
      { method: "aur", command: "yay -S home-assistant" },
    ],
  },

  // ==================== UTILITIES ====================
  {
    id: "7zip",
    name: "7-Zip",
    tagline: "High-ratio file archiver",
    description:
      "7-Zip is a free, open-source file archiver with a high compression ratio. Supports 7z, ZIP, RAR, TAR, GZIP and many other formats. Includes a file manager and AES-256 encryption for secure archives.",
    category: "utilities",
    homepage: "https://www.7-zip.org/",
    license: "LGPL-2.1",
    tags: ["archive", "compression", "files"],
    install: [
      { method: "apt", command: "sudo apt install p7zip-full" },
      { method: "flatpak", command: "flatpak install flathub org.7zip.7zip" },
      { method: "pacman", command: "sudo pacman -S p7zip" },
    ],
  },
  {
    id: "1password",
    name: "1Password",
    tagline: "Premium password manager",
    description:
      "1Password is a premium password manager that stores and autofills passwords, credit cards, and secure notes. Features Watchtower for breach monitoring, travel mode, and family/team sharing. Native Linux client available.",
    category: "utilities",
    homepage: "https://1password.com/",
    license: "Proprietary",
    tags: ["password", "security", "manager"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.onepassword.OnePassword" },
      { method: "deb", command: "Download .deb from 1password.com/downloads" },
      { method: "aur", command: "yay -S 1password" },
    ],
  },
  {
    id: "bitwarden",
    name: "Bitwarden",
    tagline: "Free, open-source password manager",
    description:
      "Bitwarden is a free, open-source password manager that stores and autofills credentials. Offers cross-platform sync, secure sharing, and a built-in authenticator. Self-host with Vaultwarden for full control.",
    category: "utilities",
    homepage: "https://bitwarden.com/",
    license: "GPL-3.0",
    tags: ["password", "security", "manager", "open-source"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.bitwarden.desktop" },
      { method: "aur", command: "yay -S bitwarden" },
    ],
  },
  {
    id: "anydesk",
    name: "AnyDesk",
    tagline: "Remote desktop application",
    description:
      "AnyDesk is a remote desktop application that provides fast, secure access to computers from anywhere. Features low latency, file transfer, and session recording. Popular for IT support and remote work.",
    category: "utilities",
    homepage: "https://anydesk.com/",
    license: "Proprietary",
    tags: ["remote", "desktop", "support"],
    install: [
      { method: "deb", command: "Download .deb from anydesk.com/downloads" },
      { method: "aur", command: "yay -S anydesk" },
    ],
  },
  {
    id: "flatseal",
    name: "Flatseal",
    tagline: "Manage Flatpak permissions",
    description:
      "Flatseal is a graphical utility to view and modify permissions of Flatpak applications. Lets you grant or revoke access to files, devices, network, and more. Essential for managing your Flatpak sandbox security.",
    category: "utilities",
    homepage: "https://github.com/tchx84/Flatseal",
    license: "GPL-3.0",
    tags: ["flatpak", "permissions", "security"],
    install: [
      { method: "flatpak", command: "flatpak install flathub com.github.tchx84.Flatseal" },
    ],
  },

  // ==================== TERMINAL ====================
  {
    id: "alacritty",
    name: "Alacritty",
    tagline: "GPU-accelerated terminal emulator",
    description:
      "Alacritty is a modern terminal emulator written in Rust with a strong focus on performance. Uses OpenGL for rendering, supports true colors, and is highly configurable via a TOML configuration file.",
    category: "terminal",
    homepage: "https://alacritty.org/",
    license: "Apache-2.0",
    tags: ["terminal", "gpu", "rust"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install alacritty" },
      { method: "flatpak", command: "flatpak install flathub org.alacritty.Alacritty" },
      { method: "pacman", command: "sudo pacman -S alacritty" },
    ],
  },
  {
    id: "kitty",
    name: "Kitty",
    tagline: "Fast, feature-rich GPU terminal",
    description:
      "Kitty is a fast, feature-rich GPU-based terminal emulator. Supports tabs, splits, image rendering in terminal, ligatures, and is highly scriptable. Uses its own rendering engine for low input latency.",
    category: "terminal",
    homepage: "https://sw.kovidgoyal.net/kitty/",
    license: "GPL-3.0",
    tags: ["terminal", "gpu", "tabs", "splits"],
    install: [
      { method: "apt", command: "sudo apt install kitty" },
      { method: "pacman", command: "sudo pacman -S kitty" },
      { method: "aur", command: "yay -S kitty" },
    ],
  },
  {
    id: "tmux",
    name: "tmux",
    tagline: "Terminal multiplexer",
    description:
      "tmux is a terminal multiplexer that lets you create and manage multiple terminal sessions in a single window. Supports splitting, detaching sessions, and scripting. Essential for terminal-based workflows.",
    category: "terminal",
    homepage: "https://github.com/tmux/tmux",
    license: "ISC",
    tags: ["terminal", "multiplexer", "sessions"],
    install: [
      { method: "apt", command: "sudo apt install tmux" },
      { method: "dnf", command: "sudo dnf install tmux" },
      { method: "pacman", command: "sudo pacman -S tmux" },
    ],
  },
  {
    id: "btop",
    name: "btop",
    tagline: "Resource monitor with a beautiful UI",
    description:
      "btop is a resource monitor that shows usage and stats for processor, memory, disks, network, and processes. Features a beautiful, customizable UI with mouse support. Written in C++ for excellent performance.",
    category: "terminal",
    homepage: "https://github.com/aristocratos/btop",
    license: "Apache-2.0",
    tags: ["monitor", "system", "processes", "performance"],
    install: [
      { method: "apt", command: "sudo apt install btop" },
      { method: "pacman", command: "sudo pacman -S btop" },
      { method: "aur", command: "yay -S btop" },
    ],
  },

  // ==================== SYSTEM ====================
  {
    id: "gnome-tweaks",
    name: "GNOME Tweaks",
    tagline: "Advanced GNOME settings",
    description:
      "GNOME Tweaks provides advanced settings for the GNOME desktop that are not available in the standard Settings app. Includes theme management, window behavior, font settings, and startup application configuration.",
    category: "system",
    homepage: "https://wiki.gnome.org/Apps/Tweaks",
    license: "GPL-3.0",
    tags: ["gnome", "settings", "customization"],
    install: [
      { method: "apt", command: "sudo apt install gnome-tweaks" },
      { method: "flatpak", command: "flatpak install flathub org.gnome.Tweaks" },
    ],
  },
  {
    id: "timeshift",
    name: "Timeshift",
    tagline: "System restore and backup tool",
    description:
      "Timeshift is a system restore utility that takes incremental snapshots of your system. Lets you roll back to a previous state if something breaks. Supports rsync and BTRFS snapshot modes. Essential for system safety.",
    category: "system",
    homepage: "https://github.com/teejee2008/timeshift",
    license: "GPL-2.0",
    tags: ["backup", "restore", "snapshot", "system"],
    install: [
      { method: "apt", command: "sudo apt install timeshift" },
      { method: "aur", command: "yay -S timeshift" },
    ],
  },
  {
    id: "gparted",
    name: "GParted",
    tagline: "GNOME partition editor",
    description:
      "GParted is a free, open-source partition editor for managing disk partitions. Supports creating, resizing, moving, and deleting partitions. Works with ext2/3/4, NTFS, FAT, and many other filesystems.",
    category: "system",
    homepage: "https://gparted.org/",
    license: "GPL-2.0",
    tags: ["partition", "disk", "filesystem"],
    install: [
      { method: "apt", command: "sudo apt install gparted" },
      { method: "flatpak", command: "flatpak install flathub org.gnome.GParted" },
    ],
  },

  // ==================== SECURITY ====================
  {
    id: "keepassxc",
    name: "KeePassXC",
    tagline: "Offline password manager",
    description:
      "KeePassXC is a free, open-source, offline password manager. Stores credentials in an encrypted database file. Supports autofill, password generation, and browser integration via KeePassXC-Browser extension.",
    category: "security",
    homepage: "https://keepassxc.org/",
    license: "GPL-3.0",
    tags: ["password", "security", "offline", "encryption"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install keepassxc" },
      { method: "flatpak", command: "flatpak install flathub org.keepassxc.KeePassXC" },
      { method: "snap", command: "sudo snap install keepassxc" },
    ],
  },
  {
    id: "veracrypt",
    name: "VeraCrypt",
    tagline: "On-the-fly disk encryption",
    description:
      "VeraCrypt is a free, open-source disk encryption software. Creates encrypted volumes and encrypts entire partitions. Based on TrueCrypt with improved security and performance. Supports hidden volumes and plausible deniability.",
    category: "security",
    homepage: "https://www.veracrypt.fr/",
    license: "Apache-2.0",
    tags: ["encryption", "disk", "security", "privacy"],
    install: [
      { method: "deb", command: "Download .deb from veracrypt.fr" },
      { method: "flatpak", command: "flatpak install flathub fr.veracrypt.veracrypt" },
      { method: "aur", command: "yay -S veracrypt" },
    ],
  },

  // ==================== VIRTUALIZATION ====================
  {
    id: "virtualbox",
    name: "VirtualBox",
    tagline: "x86 virtualization by Oracle",
    description:
      "VirtualBox is a free, open-source x86 virtualization product. Lets you run multiple guest operating systems on your Linux host. Features snapshot support, shared folders, and a rich extension pack for USB and more.",
    category: "virtualization",
    homepage: "https://www.virtualbox.org/",
    license: "GPL-3.0",
    tags: ["vm", "virtualization", "oracle"],
    install: [
      { method: "apt", command: "sudo apt install virtualbox" },
      { method: "aur", command: "yay -S virtualbox" },
    ],
  },
  {
    id: "virt-manager",
    name: "virt-manager",
    tagline: "KVM/QEMU virtual machine manager",
    description:
      "virt-manager is a desktop user interface for managing KVM and QEMU virtual machines. Provides a graphical way to create, configure, and run VMs. The standard virtualization tool for Linux hosts with KVM support.",
    category: "virtualization",
    homepage: "https://virt-manager.org/",
    license: "GPL-2.0",
    tags: ["vm", "kvm", "qemu", "virtualization"],
    install: [
      { method: "apt", command: "sudo apt install virt-manager" },
      { method: "dnf", command: "sudo dnf install virt-manager" },
      { method: "pacman", command: "sudo pacman -S virt-manager" },
    ],
  },

  // ==================== EDUCATION ====================
  {
    id: "anki",
    name: "Anki",
    tagline: "Spaced repetition flashcards",
    description:
      "Anki is a free, open-source flashcard program that uses spaced repetition to help you memorize anything. Features a powerful scheduling algorithm, sync across devices, and a rich add-on ecosystem. Popular for language learning.",
    category: "education",
    homepage: "https://apps.ankiweb.net/",
    license: "AGPL-3.0",
    tags: ["flashcards", "learning", "spaced-repetition"],
    install: [
      { method: "flatpak", command: "flatpak install flathub net.ankiweb.Anki" },
      { method: "apt", command: "Follow apps.ankiweb.net download instructions" },
      { method: "aur", command: "yay -S anki" },
    ],
  },
  {
    id: "stellarium",
    name: "Stellarium",
    tagline: "Free, open-source planetarium",
    description:
      "Stellarium is a free, open-source planetarium software that renders a realistic 3D sky in real time. Shows stars, constellations, planets, and deep-sky objects. Used by astronomers and educators worldwide.",
    category: "education",
    homepage: "https://stellarium.org/",
    license: "GPL-2.0",
    tags: ["astronomy", "planetarium", "education"],
    install: [
      { method: "apt", command: "sudo apt install stellarium" },
      { method: "flatpak", command: "flatpak install flathub org.stellarium.Stellarium" },
    ],
  },

  // ==================== GRAPHICS ====================
  {
    id: "inkscape",
    name: "Inkscape",
    tagline: "Free, open-source vector graphics editor",
    description:
      "Inkscape is a free, open-source vector graphics editor. Supports SVG format natively and provides tools for drawing, shapes, text, gradients, and path manipulation. The leading open-source alternative to Adobe Illustrator.",
    category: "graphics",
    homepage: "https://inkscape.org/",
    license: "GPL-2.0",
    tags: ["vector", "svg", "graphics", "design"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install inkscape" },
      { method: "flatpak", command: "flatpak install flathub org.inkscape.Inkscape" },
    ],
  },
  {
    id: "blender",
    name: "Blender",
    tagline: "Free, open-source 3D creation suite",
    description:
      "Blender is a free, open-source 3D creation suite. Supports modeling, sculpting, rigging, animation, simulation, rendering, compositing, video editing, and game creation. Used by professionals in film, games, and design.",
    category: "graphics",
    homepage: "https://www.blender.org/",
    license: "GPL-3.0",
    tags: ["3d", "modeling", "animation", "rendering"],
    featured: true,
    install: [
      { method: "apt", command: "sudo apt install blender" },
      { method: "flatpak", command: "flatpak install flathub org.blender.Blender" },
      { method: "snap", command: "sudo snap install blender" },
    ],
  },
  {
    id: "krita",
    name: "Krita",
    tagline: "Free digital painting application",
    description:
      "Krita is a free, open-source digital painting application. Supports brush engines, layers, filters, vector tools, and animation. Popular among illustrators and concept artists. Includes HDR support and Python scripting.",
    category: "graphics",
    homepage: "https://krita.org/",
    license: "GPL-3.0",
    tags: ["painting", "drawing", "digital-art", "illustration"],
    install: [
      { method: "apt", command: "sudo apt install krita" },
      { method: "flatpak", command: "flatpak install flathub org.kde.krita" },
      { method: "snap", command: "sudo snap install krita" },
    ],
  },
  {
    id: "gimp",
    name: "GIMP",
    tagline: "GNU Image Manipulation Program",
    description:
      "GIMP is an extensible cross-platform image editor used for photo retouching, image composition, and free-form drawing.",
    category: "graphics",
    homepage: "https://www.gimp.org/",
    license: "GPL-3.0",
    tags: ["photo", "image", "editing", "raster"],
    featured: true,
    install: [
      { method: "pacman", command: "sudo pacman -S gimp" },
      { method: "flatpak", command: "flatpak install flathub org.gimp.GIMP" },
      { method: "apt", command: "sudo apt install gimp" },
    ],
  },
  {
    id: "ghostty",
    name: "Ghostty",
    tagline: "Fast, native, feature-rich GPU terminal in Zig",
    description:
      "Ghostty is a modern terminal emulator built in Zig with native platform rendering (GTK on Linux), tabs, and instant performance.",
    category: "terminal",
    homepage: "https://ghostty.org/",
    license: "MIT",
    tags: ["terminal", "zig", "gpu", "fast"],
    featured: true,
    install: [
      { method: "aur", command: "paru -S ghostty" },
      { method: "paru", command: "paru -S ghostty-bin" },
    ],
  },
  {
    id: "vesktop",
    name: "Vesktop",
    tagline: "Vencord-powered Discord desktop with Wayland screensharing",
    description:
      "Vesktop is a lightweight Discord desktop client giving you Vencord plugin integration, crisp audio, and full Wayland screensharing with system audio.",
    category: "communications",
    homepage: "https://github.com/Vencord/Vesktop",
    license: "GPL-3.0",
    tags: ["discord", "chat", "wayland", "vencord"],
    featured: true,
    install: [
      { method: "aur", command: "paru -S vesktop-bin" },
      { method: "flatpak", command: "flatpak install flathub dev.vencord.Vesktop" },
    ],
  },
  {
    id: "btop",
    name: "btop",
    tagline: "Resource monitor that shows usage and stats",
    description:
      "btop is a modern, responsive TUI monitor for CPU, memory, disks, network, and processes with beautiful visual graphs.",
    category: "system",
    homepage: "https://github.com/aristocratos/btop",
    license: "Apache-2.0",
    tags: ["monitor", "tui", "cpu", "stats"],
    featured: true,
    install: [
      { method: "pacman", command: "sudo pacman -S btop" },
      { method: "apt", command: "sudo apt install btop" },
    ],
  },
  {
    id: "fastfetch",
    name: "fastfetch",
    tagline: "Lightning-fast neofetch-like system info tool",
    description:
      "Fastfetch is a neofetch-like tool for fetching system information and displaying it prettily, written in C for instant execution.",
    category: "system",
    homepage: "https://github.com/fastfetch-cli/fastfetch",
    license: "MIT",
    tags: ["sysinfo", "cli", "fast", "c"],
    featured: true,
    install: [
      { method: "pacman", command: "sudo pacman -S fastfetch" },
      { method: "apt", command: "sudo apt install fastfetch" },
    ],
  },
  {
    id: "flameshot",
    name: "Flameshot",
    tagline: "Powerful yet simple to use screenshot software",
    description:
      "Flameshot is a feature-packed screenshot utility with built-in annotations, blur, arrows, pins, and direct cloud uploads.",
    category: "utilities",
    homepage: "https://flameshot.org/",
    license: "GPL-3.0",
    tags: ["screenshot", "capture", "annotations"],
    featured: true,
    install: [
      { method: "pacman", command: "sudo pacman -S flameshot" },
      { method: "flatpak", command: "flatpak install flathub org.flameshot.Flameshot" },
      { method: "apt", command: "sudo apt install flameshot" },
    ],
  },
  {
    id: "heroic-games-launcher",
    name: "Heroic Games Launcher",
    tagline: "Native GOG, Epic Games, and Amazon Prime launcher",
    description:
      "Heroic is an open-source gaming launcher for Epic Games, GOG, and Amazon Games using Wine, Proton, and DXVK.",
    category: "games",
    homepage: "https://heroicgameslauncher.com/",
    license: "GPL-3.0",
    tags: ["gaming", "epic", "gog", "proton"],
    featured: true,
    install: [
      { method: "pacman", command: "sudo pacman -S heroic-games-launcher-bin" },
      { method: "aur", command: "paru -S heroic-games-launcher-bin" },
      { method: "flatpak", command: "flatpak install flathub com.heroicgameslauncher.hgl" },
    ],
  },
  {
    id: "protonup-qt",
    name: "ProtonUp-Qt",
    tagline: "Install and manage GE-Proton and Wine runners",
    description:
      "ProtonUp-Qt makes it easy to install and update GE-Proton, Luxtorpeda, and custom Wine versions for Steam and Lutris.",
    category: "games",
    homepage: "https://davidotek.github.io/protonup-qt/",
    license: "GPL-3.0",
    tags: ["gaming", "proton", "wine", "steam"],
    featured: false,
    install: [
      { method: "aur", command: "paru -S protonup-qt" },
      { method: "flatpak", command: "flatpak install flathub net.davidotek.pupgui2" },
    ],
  },
  {
    id: "calibre",
    name: "Calibre",
    tagline: "Comprehensive e-book manager and reader",
    description:
      "Calibre is the one stop solution to all your e-book needs. Organize books into libraries, convert between formats, and sync to e-readers.",
    category: "education",
    homepage: "https://calibre-ebook.com/",
    license: "GPL-3.0",
    tags: ["ebook", "reader", "library"],
    featured: true,
    install: [
      { method: "pacman", command: "sudo pacman -S calibre" },
      { method: "flatpak", command: "flatpak install flathub com.calibre_ebook.calibre" },
    ],
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    tagline: "Lightweight Bitwarden server written in Rust",
    description:
      "Vaultwarden is an alternative implementation of the Bitwarden server API written in Rust, ideal for self-hosting on low-power devices.",
    category: "self-hosted",
    homepage: "https://github.com/dani-garcia/vaultwarden",
    license: "AGPL-3.0",
    tags: ["passwords", "security", "rust", "server"],
    featured: true,
    install: [
      { method: "aur", command: "paru -S vaultwarden" },
    ],
  },
]

export const SOFTWARE_MAP: Record<string, SoftwareEntry> = SOFTWARE.reduce(
  (acc, s) => {
    acc[s.id] = s
    return acc
  },
  {} as Record<string, SoftwareEntry>
)
