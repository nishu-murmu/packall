// GENERATED FILE — do not edit by hand.
// Source: catalog/packall.json. Regenerate with: npm run catalog
import type { SoftwareEntry } from "./types"

export const SOFTWARE: SoftwareEntry[] = [
  {
    id: "firefox",
    name: "Firefox",
    tagline: "Fast, private, and secure web browser",
    description: "Mozilla Firefox is a free and open-source web browser. Known for its strong privacy stance, customization options, and support for open web standards. Uses the Gecko rendering engine and is developed by the Mozilla Foundation.",
    category: "browsers",
    homepage: "https://www.mozilla.org/firefox/",
    license: "MPL-2.0",
    tags: [
      "browser",
      "web",
      "privacy",
      "gecko",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S firefox",
      },
      {
        method: "apt",
        command: "sudo apt install firefox",
      },
      {
        method: "dnf",
        command: "sudo dnf install firefox",
      },
      {
        method: "zypper",
        command: "sudo zypper install MozillaFirefox",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.mozilla.firefox",
      },
      {
        method: "snap",
        command: "sudo snap install firefox",
      },
    ],
  },
  {
    id: "chromium",
    name: "Chromium",
    tagline: "Open-source browser project behind Chrome",
    description: "Chromium is the open-source browser project that serves as the foundation for Google Chrome and many other browsers. It provides a fast, secure, and stable browsing experience using the Blink rendering engine.",
    category: "browsers",
    homepage: "https://www.chromium.org/",
    license: "BSD-3-Clause",
    tags: [
      "browser",
      "web",
      "blink",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S chromium",
      },
      {
        method: "apt",
        command: "sudo apt install chromium-browser",
      },
      {
        method: "dnf",
        command: "sudo dnf install chromium",
      },
      {
        method: "zypper",
        command: "sudo zypper install chromium",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.chromium.Chromium",
      },
      {
        method: "snap",
        command: "sudo snap install chromium",
      },
    ],
  },
  {
    id: "brave",
    name: "Brave",
    tagline: "Privacy-focused browser with built-in ad blocking",
    description: "Brave is a free and open-source browser based on Chromium that blocks ads and website trackers out of the box. Includes built-in Tor for private browsing and optional crypto rewards system.",
    category: "browsers",
    homepage: "https://brave.com/",
    license: "MPL-2.0",
    tags: [
      "browser",
      "privacy",
      "adblock",
      "chromium",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S brave-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.brave.Browser",
      },
      {
        method: "snap",
        command: "sudo snap install brave",
      },
      {
        method: "script",
        command: "curl -fsS https://dl.brave.com/install.sh | sh",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsS https://dl.brave.com/install.sh | sh",
          },
        ],
      },
      {
        method: "apt",
        command: "sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg && echo \"deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main\" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list && sudo apt update && sudo apt install -y brave-browser",
        steps: [
          {
            title: "Download Brave GPG Keyring",
            command: "sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg",
            description: "Imports the official cryptographic signing key",
          },
          {
            title: "Add Brave Apt Repository",
            command: "echo \"deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main\" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list",
            description: "Configures package list source for Debian/Ubuntu",
          },
          {
            title: "Refresh Package Index",
            command: "sudo apt update",
            description: "Syncs package lists from Brave's server",
          },
          {
            title: "Install Brave Browser",
            command: "sudo apt install -y brave-browser",
            description: "Downloads and configures the latest stable binary",
          },
        ],
        notes: "Official repository installation with automatic background updates",
      },
    ],
  },
  {
    id: "vivaldi",
    name: "Vivaldi",
    tagline: "Highly customizable browser for power users",
    description: "Vivaldi is a feature-rich, highly customizable web browser built for power users. Includes tab stacking, built-in note-taking, mouse gestures, and extensive theming options. Based on Chromium.",
    category: "browsers",
    homepage: "https://vivaldi.com/",
    license: "Proprietary",
    tags: [
      "browser",
      "customizable",
      "power-user",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S vivaldi",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.vivaldi.Vivaldi",
      },
      {
        method: "snap",
        command: "sudo snap install vivaldi",
      },
      {
        method: "deb",
        command: "Download .deb from vivaldi.com",
      },
    ],
  },
  {
    id: "zen-browser",
    name: "Zen Browser",
    tagline: "Firefox-based browser focused on privacy and beauty",
    description: "Zen Browser is a modern Firefox-based browser that emphasizes privacy, speed, and a beautiful user experience. Features a split-view, workspaces, and compact mode for efficient browsing.",
    category: "browsers",
    homepage: "https://zen-browser.app/",
    license: "MPL-2.0",
    tags: [
      "browser",
      "privacy",
      "firefox",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S zen-browser-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub app.zen_browser.zen",
      },
    ],
  },
  {
    id: "tor-browser",
    name: "Tor Browser",
    tagline: "Anonymous browsing via the Tor network",
    description: "Tor Browser isolates and routes web traffic through the encrypted Tor network to protect privacy and anonymity. Blocks trackers, defends against surveillance, and uses Firefox as its base.",
    category: "browsers",
    homepage: "https://www.torproject.org/",
    license: "MPL-2.0",
    tags: [
      "browser",
      "privacy",
      "anonymity",
      "tor",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S torbrowser-launcher",
      },
      {
        method: "apt",
        command: "sudo apt install torbrowser-launcher",
      },
      {
        method: "dnf",
        command: "sudo dnf install torbrowser-launcher",
      },
      {
        method: "zypper",
        command: "sudo zypper install torbrowser-launcher",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.torproject.torbrowser-launcher",
      },
    ],
  },
  {
    id: "signal",
    name: "Signal",
    tagline: "End-to-end encrypted messaging",
    description: "Signal is a free, open-source messaging app with end-to-end encryption for messages, voice, and video calls. Considered the gold standard for private communication. Developed by the Signal Foundation.",
    category: "communications",
    homepage: "https://signal.org/",
    license: "AGPL-3.0",
    tags: [
      "messaging",
      "encryption",
      "privacy",
      "voip",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S signal-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.signal.Signal",
      },
      {
        method: "snap",
        command: "sudo snap install signal-desktop",
      },
      {
        method: "manual",
        command: "Follow instructions at signal.org/download",
      },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    tagline: "Fast, cloud-based messaging with huge features",
    description: "Telegram is a cloud-based messaging app with a focus on speed and security. Supports large group chats, channels, bots, file sharing up to 2GB, and optional end-to-end encrypted secret chats.",
    category: "communications",
    homepage: "https://telegram.org/",
    license: "GPL-3.0",
    tags: [
      "messaging",
      "cloud",
      "voip",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S telegram-desktop",
      },
      {
        method: "zypper",
        command: "sudo zypper install telegram-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.telegram.desktop",
      },
      {
        method: "snap",
        command: "sudo snap install telegram-desktop",
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    tagline: "Voice, video, and text chat for communities",
    description: "Discord is a popular communication platform for communities, gamers, and teams. Offers voice channels, video calls, text messaging, screen sharing, and bot integrations. Available as a desktop app or web app.",
    category: "communications",
    homepage: "https://discord.com/",
    license: "Proprietary",
    tags: [
      "messaging",
      "voip",
      "gaming",
      "communities",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S discord",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.discordapp.Discord",
      },
      {
        method: "snap",
        command: "sudo snap install discord",
      },
      {
        method: "deb",
        command: "Download .deb from discord.com",
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "Team collaboration and messaging",
    description: "Slack is a business messaging platform for team collaboration. Features channels, direct messages, file sharing, integrations with hundreds of services, and powerful search. Popular in professional environments.",
    category: "communications",
    homepage: "https://slack.com/",
    license: "Proprietary",
    tags: [
      "messaging",
      "team",
      "business",
      "collaboration",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S slack-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.slack.Slack",
      },
      {
        method: "snap",
        command: "sudo snap install slack",
      },
      {
        method: "deb",
        command: "Download .deb from slack.com/downloads",
      },
    ],
  },
  {
    id: "thunderbird",
    name: "Thunderbird",
    tagline: "Free, open-source email client",
    description: "Mozilla Thunderbird is a free, open-source email, news, and chat client. Supports multiple accounts, RSS feeds, newsgroups, and includes a built-in calendar and contact manager. Highly extensible via add-ons.",
    category: "communications",
    homepage: "https://www.thunderbird.net/",
    license: "MPL-2.0",
    tags: [
      "email",
      "client",
      "calendar",
      "rss",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S thunderbird",
      },
      {
        method: "apt",
        command: "sudo apt install thunderbird",
      },
      {
        method: "dnf",
        command: "sudo dnf install thunderbird",
      },
      {
        method: "zypper",
        command: "sudo zypper install MozillaThunderbird",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.mozilla.Thunderbird",
      },
      {
        method: "snap",
        command: "sudo snap install thunderbird",
      },
    ],
  },
  {
    id: "element",
    name: "Element",
    tagline: "Matrix-based decentralized messaging",
    description: "Element is a Matrix-based messaging client offering end-to-end encrypted, decentralized communication. Supports group chats, voice/video calls, file sharing, and bridges to other networks like IRC, Slack, and Discord.",
    category: "communications",
    homepage: "https://element.io/",
    license: "AGPL-3.0",
    tags: [
      "messaging",
      "matrix",
      "decentralized",
      "encryption",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S element-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub im.riot.Riot",
      },
    ],
  },
  {
    id: "vscode",
    name: "VS Code",
    tagline: "Popular extensible code editor by Microsoft",
    description: "Visual Studio Code is a free, source-available code editor with excellent TypeScript, JavaScript, and Python support. Features an integrated terminal, Git integration, debugging, and a massive extension marketplace.",
    category: "development",
    homepage: "https://code.visualstudio.com/",
    license: "MIT",
    tags: [
      "editor",
      "ide",
      "microsoft",
      "extensions",
    ],
    featured: true,
    install: [
      {
        method: "aur",
        command: "paru -S visual-studio-code-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.visualstudio.code",
      },
      {
        method: "snap",
        command: "sudo snap install code --classic",
      },
      {
        method: "apt",
        command: "wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg && sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg && echo \"deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main\" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null && rm -f packages.microsoft.gpg && sudo apt update && sudo apt install -y code",
        steps: [
          {
            title: "Download Microsoft Key",
            command: "wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg",
            description: "Retrieves Microsoft repository signing key",
          },
          {
            title: "Install Keyring to Apt",
            command: "sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg && rm -f packages.microsoft.gpg",
            description: "Configures trusted key location",
          },
          {
            title: "Add VS Code Repository",
            command: "echo \"deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main\" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null",
            description: "Creates apt sources list entry",
          },
          {
            title: "Update & Install VS Code",
            command: "sudo apt update && sudo apt install -y code",
            description: "Fetches metadata and installs editor binary",
          },
        ],
        notes: "Official Microsoft apt repository",
      },
      {
        method: "deb",
        command: "Download .deb from code.visualstudio.com",
      },
    ],
  },
  {
    id: "neovim",
    name: "Neovim",
    tagline: "Modern, extensible Vim-fork editor",
    description: "Neovim is a Vim-fork focused on extensibility and usability. Features a built-in LSP client, Lua scripting, async plugin architecture, and a modern terminal UI. The most popular Vim distribution among new power users.",
    category: "development",
    homepage: "https://neovim.io/",
    license: "Apache-2.0",
    tags: [
      "editor",
      "vim",
      "terminal",
      "lsp",
      "lua",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S neovim",
      },
      {
        method: "apt",
        command: "sudo apt install neovim",
      },
      {
        method: "dnf",
        command: "sudo dnf install neovim",
      },
      {
        method: "zypper",
        command: "sudo zypper install neovim",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.neovim.nvim",
      },
      {
        method: "snap",
        command: "sudo snap install nvim --classic",
      },
    ],
  },
  {
    id: "zed",
    name: "Zed",
    tagline: "Blazing-fast collaborative code editor",
    description: "Zed is a high-performance, GPU-accelerated code editor built in Rust by the creators of Atom. Features real-time collaboration, built-in terminal, and excellent language support. Open source as of 2024.",
    category: "development",
    homepage: "https://zed.dev/",
    license: "GPL-3.0",
    tags: [
      "editor",
      "rust",
      "collaboration",
      "gpu",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S zed",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub dev.zed.Zed",
      },
      {
        method: "script",
        command: "curl -f https://zed.dev/install.sh | sh",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -f https://zed.dev/install.sh | sh",
          },
        ],
      },
      {
        method: "manual",
        command: "Download from zed.dev",
      },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    tagline: "Container platform for building and shipping apps",
    description: "Docker is a platform for developing, shipping, and running applications in containers. Provides a consistent runtime environment, simplifies deployment, and integrates with CI/CD pipelines. Industry standard for containerization.",
    category: "development",
    homepage: "https://www.docker.com/",
    license: "Apache-2.0",
    tags: [
      "containers",
      "devops",
      "deployment",
    ],
    install: [
      {
        method: "dnf",
        command: "sudo dnf install moby-engine",
      },
      {
        method: "zypper",
        command: "sudo zypper install docker",
      },
      {
        method: "apt",
        command: "sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg && sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg && echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io && sudo usermod -aG docker $USER",
        steps: [
          {
            title: "Install Prerequisites",
            command: "sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg",
            description: "Installs SSL certificates and curl",
          },
          {
            title: "Download Docker GPG Key",
            command: "sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg && sudo chmod a+r /etc/apt/keyrings/docker.gpg",
            description: "Imports official Docker signing key",
          },
          {
            title: "Configure Apt Repository",
            command: "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
            description: "Adds repository for your Ubuntu/Debian release",
          },
          {
            title: "Install Docker Engine & Compose",
            command: "sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
            description: "Installs core daemon, CLI, and plugins",
          },
          {
            title: "Configure User Permissions",
            command: "sudo usermod -aG docker $USER",
            description: "Allows executing docker commands without sudo",
          },
        ],
        notes: "Full official Docker CE installation with Compose and non-root setup",
      },
      {
        method: "pacman",
        command: "sudo pacman -S docker docker-compose && sudo systemctl enable --now docker",
      },
    ],
  },
  {
    id: "podman",
    name: "Podman",
    tagline: "Daemonless, rootless container engine",
    description: "Podman is a daemonless, rootless container engine that provides a Docker-compatible command line interface. Developed by Red Hat, it is a drop-in replacement for Docker with better security defaults.",
    category: "development",
    homepage: "https://podman.io/",
    license: "Apache-2.0",
    tags: [
      "containers",
      "rootless",
      "red-hat",
      "oci",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S podman",
      },
      {
        method: "apt",
        command: "sudo apt install podman",
      },
      {
        method: "dnf",
        command: "sudo dnf install podman",
      },
      {
        method: "zypper",
        command: "sudo zypper install podman",
      },
    ],
  },
  {
    id: "git",
    name: "Git",
    tagline: "Distributed version control system",
    description: "Git is a free and open-source distributed version control system. Handles projects of any size with speed, efficiency, and a branching model that enables powerful workflows. The backbone of modern software development.",
    category: "development",
    homepage: "https://git-scm.com/",
    license: "GPL-2.0",
    tags: [
      "vcs",
      "version-control",
      "scm",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S git",
      },
      {
        method: "apt",
        command: "sudo apt install git",
      },
      {
        method: "dnf",
        command: "sudo dnf install git",
      },
      {
        method: "zypper",
        command: "sudo zypper install git",
      },
    ],
  },
  {
    id: "postman",
    name: "Postman",
    tagline: "API development and testing platform",
    description: "Postman is a collaboration platform for API development. Allows you to design, test, document, and share APIs. Features a graphical interface for building HTTP requests, automated testing, and environment management.",
    category: "development",
    homepage: "https://www.postman.com/",
    license: "Proprietary",
    tags: [
      "api",
      "http",
      "testing",
      "rest",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S postman-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.getpostman.Postman",
      },
      {
        method: "snap",
        command: "sudo snap install postman",
      },
    ],
  },
  {
    id: "libreoffice",
    name: "LibreOffice",
    tagline: "Free, open-source office suite",
    description: "LibreOffice is a free and open-source office suite with a word processor (Writer), spreadsheet (Calc), presentation (Impress), drawing (Draw), database (Base), and math (Math) tools. Compatible with Microsoft Office formats.",
    category: "documents",
    homepage: "https://www.libreoffice.org/",
    license: "MPL-2.0",
    tags: [
      "office",
      "suite",
      "word",
      "spreadsheet",
      "presentation",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S libreoffice-fresh",
      },
      {
        method: "apt",
        command: "sudo apt install libreoffice",
      },
      {
        method: "dnf",
        command: "sudo dnf install libreoffice",
      },
      {
        method: "zypper",
        command: "sudo zypper install libreoffice",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.libreoffice.LibreOffice",
      },
      {
        method: "snap",
        command: "sudo snap install libreoffice",
      },
    ],
  },
  {
    id: "onlyoffice",
    name: "OnlyOffice",
    tagline: "Office suite with excellent MS Office compatibility",
    description: "OnlyOffice is an office suite with excellent Microsoft Office format compatibility. Includes document, spreadsheet, and presentation editors. Also offers a self-hosted document server for collaboration.",
    category: "documents",
    homepage: "https://www.onlyoffice.com/",
    license: "AGPL-3.0",
    tags: [
      "office",
      "suite",
      "collaboration",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S onlyoffice-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.onlyoffice.desktopeditors",
      },
      {
        method: "snap",
        command: "sudo snap install onlyoffice-desktopeditors",
      },
      {
        method: "deb",
        command: "Download .deb from onlyoffice.com",
      },
    ],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    tagline: "Knowledge base on top of a local Markdown folder",
    description: "Obsidian is a powerful note-taking and knowledge management app that stores notes as plain Markdown files. Features backlinks, graph view, canvas, and a rich plugin ecosystem. Your data stays local and under your control.",
    category: "documents",
    homepage: "https://obsidian.md/",
    license: "Proprietary",
    tags: [
      "notes",
      "markdown",
      "knowledge-base",
      "pkms",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S obsidian",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub md.obsidian.Obsidian",
      },
      {
        method: "snap",
        command: "sudo snap install obsidian --classic",
      },
      {
        method: "deb",
        command: "Download .deb from obsidian.md",
      },
    ],
  },
  {
    id: "okular",
    name: "Okular",
    tagline: "Universal document viewer by KDE",
    description: "Okular is a universal document viewer developed by KDE. Supports PDF, EPUB, DjVu, CHM, Comics, and many more formats. Features annotation tools, bookmarks, and excellent rendering quality.",
    category: "documents",
    homepage: "https://okular.kde.org/",
    license: "GPL-2.0",
    tags: [
      "pdf",
      "viewer",
      "kde",
      "document",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S okular",
      },
      {
        method: "apt",
        command: "sudo apt install okular",
      },
      {
        method: "dnf",
        command: "sudo dnf install okular",
      },
      {
        method: "zypper",
        command: "sudo zypper install okular",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.okular",
      },
      {
        method: "snap",
        command: "sudo snap install okular",
      },
    ],
  },
  {
    id: "steam",
    name: "Steam",
    tagline: "Gaming platform and store by Valve",
    description: "Steam is the largest PC gaming platform by Valve. Provides game purchasing, automatic updates, community features, and Proton for running Windows games on Linux. Includes Steam Workshop for mods.",
    category: "games",
    homepage: "https://store.steampowered.com/",
    license: "Proprietary",
    tags: [
      "gaming",
      "store",
      "proton",
      "valve",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S steam",
      },
      {
        method: "apt",
        command: "sudo apt install steam-installer",
      },
      {
        method: "zypper",
        command: "sudo zypper install steam",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.valvesoftware.Steam",
      },
      {
        method: "snap",
        command: "sudo snap install steam",
      },
    ],
  },
  {
    id: "lutris",
    name: "Lutris",
    tagline: "Open gaming platform for all your games",
    description: "Lutris is a gaming platform that helps you install and manage games from various sources. Supports Steam, GOG, Epic, emulators, and more. Includes install scripts for thousands of games and manages Wine prefixes.",
    category: "games",
    homepage: "https://lutris.net/",
    license: "GPL-3.0",
    tags: [
      "gaming",
      "emulation",
      "wine",
      "manager",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S lutris",
      },
      {
        method: "apt",
        command: "sudo apt install lutris",
      },
      {
        method: "dnf",
        command: "sudo dnf install lutris",
      },
      {
        method: "zypper",
        command: "sudo zypper install lutris",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.lutris.Lutris",
      },
      {
        method: "manual",
        command: "Follow lutris.net download instructions",
      },
    ],
  },
  {
    id: "heroic",
    name: "Heroic Games Launcher",
    tagline: "GOG and Epic Games launcher for Linux",
    description: "Heroic Games Launcher is a native Linux GUI for GOG and Epic Games Store. Lets you install, update, and play games from both stores with Wine/Proton support. Features cloud saves and game library management.",
    category: "games",
    homepage: "https://heroicgameslauncher.com/",
    license: "GPL-3.0",
    tags: [
      "gaming",
      "epic",
      "gog",
      "wine",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S heroic-games-launcher-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.heroicgameslauncher.hgl",
      },
    ],
  },
  {
    id: "wine",
    name: "WINE",
    tagline: "Run Windows applications on Linux",
    description: "WINE is a compatibility layer capable of running Windows applications on Linux, macOS, and BSD. Translates Windows API calls to POSIX calls. The foundation for Proton and many game compatibility setups.",
    category: "games",
    homepage: "https://www.winehq.org/",
    license: "LGPL-2.1",
    tags: [
      "compatibility",
      "windows",
      "gaming",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S wine",
      },
      {
        method: "apt",
        command: "sudo apt install wine",
      },
      {
        method: "dnf",
        command: "sudo dnf install wine",
      },
      {
        method: "zypper",
        command: "sudo zypper install wine",
      },
    ],
  },
  {
    id: "vlc",
    name: "VLC",
    tagline: "Plays everything, everywhere",
    description: "VLC is a free and open-source media player that plays virtually any audio and video format. Supports streaming, subtitles, screen recording, and a wide range of codecs without needing external packs.",
    category: "multimedia",
    homepage: "https://www.videolan.org/",
    license: "GPL-2.0",
    tags: [
      "player",
      "video",
      "audio",
      "media",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S vlc",
      },
      {
        method: "apt",
        command: "sudo apt install vlc",
      },
      {
        method: "dnf",
        command: "sudo dnf install vlc",
      },
      {
        method: "zypper",
        command: "sudo zypper install vlc",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.videolan.VLC",
      },
      {
        method: "snap",
        command: "sudo snap install vlc",
      },
    ],
  },
  {
    id: "obs-studio",
    name: "OBS Studio",
    tagline: "Free, open-source streaming and recording",
    description: "OBS Studio is free and open-source software for video recording and live streaming. Supports multiple sources, scenes, filters, transitions, and plugins. The industry standard for content creators on Linux.",
    category: "multimedia",
    homepage: "https://obsproject.com/",
    license: "GPL-2.0",
    tags: [
      "streaming",
      "recording",
      "video",
      "broadcasting",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S obs-studio",
      },
      {
        method: "apt",
        command: "sudo apt install obs-studio",
      },
      {
        method: "dnf",
        command: "sudo dnf install obs-studio",
      },
      {
        method: "zypper",
        command: "sudo zypper install obs-studio",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.obsproject.Studio",
      },
      {
        method: "snap",
        command: "sudo snap install obs-studio",
      },
    ],
  },
  {
    id: "audacity",
    name: "Audacity",
    tagline: "Free, open-source audio editor",
    description: "Audacity is a free, open-source, cross-platform audio editor. Supports recording, editing, mixing, and exporting audio. Includes effects, noise reduction, multi-track editing, and support for various audio formats.",
    category: "multimedia",
    homepage: "https://www.audacityteam.org/",
    license: "GPL-2.0",
    tags: [
      "audio",
      "editor",
      "recording",
      "music",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S audacity",
      },
      {
        method: "apt",
        command: "sudo apt install audacity",
      },
      {
        method: "dnf",
        command: "sudo dnf install audacity",
      },
      {
        method: "zypper",
        command: "sudo zypper install audacity",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.audacityteam.Audacity",
      },
      {
        method: "snap",
        command: "sudo snap install audacity",
      },
    ],
  },
  {
    id: "kdenlive",
    name: "Kdenlive",
    tagline: "Free, open-source video editor",
    description: "Kdenlive is a free, open-source multi-track video editor built on the MLT framework. Supports a wide range of formats, effects, transitions, and timeline editing. A professional-grade NLE for Linux.",
    category: "multimedia",
    homepage: "https://kdenlive.org/",
    license: "GPL-3.0",
    tags: [
      "video",
      "editor",
      "nle",
      "kde",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kdenlive",
      },
      {
        method: "apt",
        command: "sudo apt install kdenlive",
      },
      {
        method: "dnf",
        command: "sudo dnf install kdenlive",
      },
      {
        method: "zypper",
        command: "sudo zypper install kdenlive",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.kdenlive",
      },
      {
        method: "snap",
        command: "sudo snap install kdenlive",
      },
    ],
  },
  {
    id: "handbrake",
    name: "HandBrake",
    tagline: "Open-source video transcoder",
    description: "HandBrake is a tool for converting video from nearly any format to a selection of modern, widely supported codecs. Features hardware acceleration, batch encoding, chapter markers, and subtitles.",
    category: "multimedia",
    homepage: "https://handbrake.fr/",
    license: "GPL-2.0",
    tags: [
      "video",
      "transcoder",
      "converter",
      "encoder",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S handbrake",
      },
      {
        method: "apt",
        command: "sudo apt install handbrake",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub fr.handbrake.ghb",
      },
    ],
  },
  {
    id: "nextcloud",
    name: "Nextcloud",
    tagline: "Self-hosted cloud storage and collaboration",
    description: "Nextcloud is a self-hosted cloud storage platform with file sync, sharing, calendar, contacts, and collaboration features. Includes a rich app ecosystem and end-to-end encryption. A privacy-focused alternative to Google Drive.",
    category: "self-hosted",
    homepage: "https://nextcloud.com/",
    license: "AGPL-3.0",
    tags: [
      "cloud",
      "storage",
      "self-hosted",
      "collaboration",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S nextcloud-client",
      },
      {
        method: "apt",
        command: "sudo apt install nextcloud-desktop",
      },
      {
        method: "dnf",
        command: "sudo dnf install nextcloud-client",
      },
      {
        method: "zypper",
        command: "sudo zypper install nextcloud-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.nextcloud.desktopclient.nextcloud",
      },
      {
        method: "manual",
        command: "Docker: docker run nextcloud",
      },
      {
        method: "manual",
        command: "Follow nextcloud.com/install guide",
      },
    ],
  },
  {
    id: "jellyfin",
    name: "Jellyfin",
    tagline: "Free, open-source media server",
    description: "Jellyfin is a free, open-source media system that lets you stream your movies, TV shows, and music to any device. No tracking, no premium tiers, no data collection. A volunteer-built alternative to Plex.",
    category: "self-hosted",
    homepage: "https://jellyfin.org/",
    license: "GPL-2.0",
    tags: [
      "media",
      "server",
      "streaming",
      "self-hosted",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S jellyfin-server jellyfin-web",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.jellyfin.JellyfinServer",
      },
      {
        method: "script",
        command: "curl -fsSL https://repo.jellyfin.org/install-debuntu.sh | sudo bash",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://repo.jellyfin.org/install-debuntu.sh | sudo bash",
          },
        ],
      },
      {
        method: "manual",
        command: "Docker: docker run jellyfin/jellyfin",
      },
    ],
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    tagline: "Lightweight Bitwarden-compatible server",
    description: "Vaultwarden is a lightweight, self-hosted password manager server compatible with Bitwarden clients. Written in Rust, it uses minimal resources while providing the full Bitwarden API including organizations and attachments.",
    category: "self-hosted",
    homepage: "https://github.com/dani-garcia/vaultwarden",
    license: "AGPL-3.0",
    tags: [
      "password",
      "security",
      "self-hosted",
      "bitwarden",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S vaultwarden",
      },
      {
        method: "script",
        command: "sudo docker run -d --name vaultwarden --restart unless-stopped -v vw-data:/data -p 8080:80 vaultwarden/server:latest",
        steps: [
          {
            title: "Run the official installer",
            command: "sudo docker run -d --name vaultwarden --restart unless-stopped -v vw-data:/data -p 8080:80 vaultwarden/server:latest",
          },
        ],
      },
      {
        method: "manual",
        command: "Docker: docker run vaultwarden/server",
      },
    ],
  },
  {
    id: "home-assistant",
    name: "Home Assistant",
    tagline: "Open-source home automation platform",
    description: "Home Assistant is a free, open-source home automation platform focused on local control and privacy. Integrates with thousands of smart devices and services. Supports automation, dashboards, and voice assistants.",
    category: "self-hosted",
    homepage: "https://www.home-assistant.io/",
    license: "Apache-2.0",
    tags: [
      "iot",
      "automation",
      "smart-home",
      "self-hosted",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S home-assistant",
      },
      {
        method: "script",
        command: "sudo docker run -d --name homeassistant --restart unless-stopped --privileged --network host -e TZ=UTC -v homeassistant-config:/config ghcr.io/home-assistant/home-assistant:stable",
        steps: [
          {
            title: "Run the official installer",
            command: "sudo docker run -d --name homeassistant --restart unless-stopped --privileged --network host -e TZ=UTC -v homeassistant-config:/config ghcr.io/home-assistant/home-assistant:stable",
          },
        ],
      },
      {
        method: "manual",
        command: "Docker: docker run homeassistant/home-assistant",
      },
    ],
  },
  {
    id: "7zip",
    name: "7-Zip",
    tagline: "High-ratio file archiver",
    description: "7-Zip is a free, open-source file archiver with a high compression ratio. Supports 7z, ZIP, RAR, TAR, GZIP and many other formats. Includes a file manager and AES-256 encryption for secure archives.",
    category: "utilities",
    homepage: "https://www.7-zip.org/",
    license: "LGPL-2.1",
    tags: [
      "archive",
      "compression",
      "files",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S 7zip",
      },
      {
        method: "apt",
        command: "sudo apt install 7zip",
      },
      {
        method: "dnf",
        command: "sudo dnf install 7zip",
      },
      {
        method: "zypper",
        command: "sudo zypper install 7zip",
      },
    ],
  },
  {
    id: "1password",
    name: "1Password",
    tagline: "Premium password manager",
    description: "1Password is a premium password manager that stores and autofills passwords, credit cards, and secure notes. Features Watchtower for breach monitoring, travel mode, and family/team sharing. Native Linux client available.",
    category: "utilities",
    homepage: "https://1password.com/",
    license: "Proprietary",
    tags: [
      "password",
      "security",
      "manager",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S 1password",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.onepassword.OnePassword",
      },
      {
        method: "deb",
        command: "Download .deb from 1password.com/downloads",
      },
    ],
  },
  {
    id: "bitwarden",
    name: "Bitwarden",
    tagline: "Free, open-source password manager",
    description: "Bitwarden is a free, open-source password manager that stores and autofills credentials. Offers cross-platform sync, secure sharing, and a built-in authenticator. Self-host with Vaultwarden for full control.",
    category: "utilities",
    homepage: "https://bitwarden.com/",
    license: "GPL-3.0",
    tags: [
      "password",
      "security",
      "manager",
      "open-source",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S bitwarden",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.bitwarden.desktop",
      },
      {
        method: "snap",
        command: "sudo snap install bitwarden",
      },
    ],
  },
  {
    id: "anydesk",
    name: "AnyDesk",
    tagline: "Remote desktop application",
    description: "AnyDesk is a remote desktop application that provides fast, secure access to computers from anywhere. Features low latency, file transfer, and session recording. Popular for IT support and remote work.",
    category: "utilities",
    homepage: "https://anydesk.com/",
    license: "Proprietary",
    tags: [
      "remote",
      "desktop",
      "support",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S anydesk-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.anydesk.Anydesk",
      },
      {
        method: "deb",
        command: "Download .deb from anydesk.com/downloads",
      },
    ],
  },
  {
    id: "flatseal",
    name: "Flatseal",
    tagline: "Manage Flatpak permissions",
    description: "Flatseal is a graphical utility to view and modify permissions of Flatpak applications. Lets you grant or revoke access to files, devices, network, and more. Essential for managing your Flatpak sandbox security.",
    category: "utilities",
    homepage: "https://github.com/tchx84/Flatseal",
    license: "GPL-3.0",
    tags: [
      "flatpak",
      "permissions",
      "security",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S flatseal",
      },
      {
        method: "dnf",
        command: "sudo dnf install flatseal",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.github.tchx84.Flatseal",
      },
    ],
  },
  {
    id: "alacritty",
    name: "Alacritty",
    tagline: "GPU-accelerated terminal emulator",
    description: "Alacritty is a modern terminal emulator written in Rust with a strong focus on performance. Uses OpenGL for rendering, supports true colors, and is highly configurable via a TOML configuration file.",
    category: "terminal",
    homepage: "https://alacritty.org/",
    license: "Apache-2.0",
    tags: [
      "terminal",
      "gpu",
      "rust",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S alacritty",
      },
      {
        method: "apt",
        command: "sudo apt install alacritty",
      },
      {
        method: "dnf",
        command: "sudo dnf install alacritty",
      },
      {
        method: "zypper",
        command: "sudo zypper install alacritty",
      },
      {
        method: "snap",
        command: "sudo snap install alacritty --classic",
      },
    ],
  },
  {
    id: "kitty",
    name: "Kitty",
    tagline: "Fast, feature-rich GPU terminal",
    description: "Kitty is a fast, feature-rich GPU-based terminal emulator. Supports tabs, splits, image rendering in terminal, ligatures, and is highly scriptable. Uses its own rendering engine for low input latency.",
    category: "terminal",
    homepage: "https://sw.kovidgoyal.net/kitty/",
    license: "GPL-3.0",
    tags: [
      "terminal",
      "gpu",
      "tabs",
      "splits",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kitty",
      },
      {
        method: "apt",
        command: "sudo apt install kitty",
      },
      {
        method: "dnf",
        command: "sudo dnf install kitty",
      },
      {
        method: "zypper",
        command: "sudo zypper install kitty",
      },
    ],
  },
  {
    id: "tmux",
    name: "tmux",
    tagline: "Terminal multiplexer",
    description: "tmux is a terminal multiplexer that lets you create and manage multiple terminal sessions in a single window. Supports splitting, detaching sessions, and scripting. Essential for terminal-based workflows.",
    category: "terminal",
    homepage: "https://github.com/tmux/tmux",
    license: "ISC",
    tags: [
      "terminal",
      "multiplexer",
      "sessions",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S tmux",
      },
      {
        method: "apt",
        command: "sudo apt install tmux",
      },
      {
        method: "dnf",
        command: "sudo dnf install tmux",
      },
      {
        method: "zypper",
        command: "sudo zypper install tmux",
      },
    ],
  },
  {
    id: "btop",
    name: "btop",
    tagline: "Resource monitor with a beautiful UI",
    description: "btop is a resource monitor that shows usage and stats for processor, memory, disks, network, and processes. Features a beautiful, customizable UI with mouse support. Written in C++ for excellent performance.",
    category: "terminal",
    homepage: "https://github.com/aristocratos/btop",
    license: "Apache-2.0",
    tags: [
      "monitor",
      "system",
      "processes",
      "performance",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S btop",
      },
      {
        method: "apt",
        command: "sudo apt install btop",
      },
      {
        method: "dnf",
        command: "sudo dnf install btop",
      },
      {
        method: "zypper",
        command: "sudo zypper install btop",
      },
    ],
  },
  {
    id: "gnome-tweaks",
    name: "GNOME Tweaks",
    tagline: "Advanced GNOME settings",
    description: "GNOME Tweaks provides advanced settings for the GNOME desktop that are not available in the standard Settings app. Includes theme management, window behavior, font settings, and startup application configuration.",
    category: "system",
    homepage: "https://wiki.gnome.org/Apps/Tweaks",
    license: "GPL-3.0",
    tags: [
      "gnome",
      "settings",
      "customization",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S gnome-tweaks",
      },
      {
        method: "apt",
        command: "sudo apt install gnome-tweaks",
      },
      {
        method: "dnf",
        command: "sudo dnf install gnome-tweaks",
      },
      {
        method: "zypper",
        command: "sudo zypper install gnome-tweaks",
      },
    ],
  },
  {
    id: "timeshift",
    name: "Timeshift",
    tagline: "System restore and backup tool",
    description: "Timeshift is a system restore utility that takes incremental snapshots of your system. Lets you roll back to a previous state if something breaks. Supports rsync and BTRFS snapshot modes. Essential for system safety.",
    category: "system",
    homepage: "https://github.com/teejee2008/timeshift",
    license: "GPL-2.0",
    tags: [
      "backup",
      "restore",
      "snapshot",
      "system",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S timeshift",
      },
      {
        method: "apt",
        command: "sudo apt install timeshift",
      },
      {
        method: "dnf",
        command: "sudo dnf install timeshift",
      },
      {
        method: "zypper",
        command: "sudo zypper install timeshift",
      },
    ],
  },
  {
    id: "gparted",
    name: "GParted",
    tagline: "GNOME partition editor",
    description: "GParted is a free, open-source partition editor for managing disk partitions. Supports creating, resizing, moving, and deleting partitions. Works with ext2/3/4, NTFS, FAT, and many other filesystems.",
    category: "system",
    homepage: "https://gparted.org/",
    license: "GPL-2.0",
    tags: [
      "partition",
      "disk",
      "filesystem",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S gparted",
      },
      {
        method: "apt",
        command: "sudo apt install gparted",
      },
      {
        method: "dnf",
        command: "sudo dnf install gparted",
      },
      {
        method: "zypper",
        command: "sudo zypper install gparted",
      },
    ],
  },
  {
    id: "keepassxc",
    name: "KeePassXC",
    tagline: "Offline password manager",
    description: "KeePassXC is a free, open-source, offline password manager. Stores credentials in an encrypted database file. Supports autofill, password generation, and browser integration via KeePassXC-Browser extension.",
    category: "security",
    homepage: "https://keepassxc.org/",
    license: "GPL-3.0",
    tags: [
      "password",
      "security",
      "offline",
      "encryption",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S keepassxc",
      },
      {
        method: "apt",
        command: "sudo apt install keepassxc",
      },
      {
        method: "dnf",
        command: "sudo dnf install keepassxc",
      },
      {
        method: "zypper",
        command: "sudo zypper install keepassxc",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.keepassxc.KeePassXC",
      },
      {
        method: "snap",
        command: "sudo snap install keepassxc",
      },
    ],
  },
  {
    id: "veracrypt",
    name: "VeraCrypt",
    tagline: "On-the-fly disk encryption",
    description: "VeraCrypt is a free, open-source disk encryption software. Creates encrypted volumes and encrypts entire partitions. Based on TrueCrypt with improved security and performance. Supports hidden volumes and plausible deniability.",
    category: "security",
    homepage: "https://www.veracrypt.fr/",
    license: "Apache-2.0",
    tags: [
      "encryption",
      "disk",
      "security",
      "privacy",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S veracrypt",
      },
      {
        method: "deb",
        command: "Download .deb from veracrypt.fr",
      },
    ],
  },
  {
    id: "virtualbox",
    name: "VirtualBox",
    tagline: "x86 virtualization by Oracle",
    description: "VirtualBox is a free, open-source x86 virtualization product. Lets you run multiple guest operating systems on your Linux host. Features snapshot support, shared folders, and a rich extension pack for USB and more.",
    category: "virtualization",
    homepage: "https://www.virtualbox.org/",
    license: "GPL-3.0",
    tags: [
      "vm",
      "virtualization",
      "oracle",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S virtualbox virtualbox-host-modules-arch",
      },
      {
        method: "apt",
        command: "sudo apt install virtualbox",
      },
      {
        method: "zypper",
        command: "sudo zypper install virtualbox",
      },
    ],
  },
  {
    id: "virt-manager",
    name: "virt-manager",
    tagline: "KVM/QEMU virtual machine manager",
    description: "virt-manager is a desktop user interface for managing KVM and QEMU virtual machines. Provides a graphical way to create, configure, and run VMs. The standard virtualization tool for Linux hosts with KVM support.",
    category: "virtualization",
    homepage: "https://virt-manager.org/",
    license: "GPL-2.0",
    tags: [
      "vm",
      "kvm",
      "qemu",
      "virtualization",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S virt-manager",
      },
      {
        method: "apt",
        command: "sudo apt install virt-manager",
      },
      {
        method: "dnf",
        command: "sudo dnf install virt-manager",
      },
      {
        method: "zypper",
        command: "sudo zypper install virt-manager",
      },
    ],
  },
  {
    id: "anki",
    name: "Anki",
    tagline: "Spaced repetition flashcards",
    description: "Anki is a free, open-source flashcard program that uses spaced repetition to help you memorize anything. Features a powerful scheduling algorithm, sync across devices, and a rich add-on ecosystem. Popular for language learning.",
    category: "education",
    homepage: "https://apps.ankiweb.net/",
    license: "AGPL-3.0",
    tags: [
      "flashcards",
      "learning",
      "spaced-repetition",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S anki-bin",
      },
      {
        method: "apt",
        command: "sudo apt install anki",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.ankiweb.Anki",
      },
      {
        method: "snap",
        command: "sudo snap install anki-woodrow",
      },
      {
        method: "manual",
        command: "Follow apps.ankiweb.net download instructions",
      },
    ],
  },
  {
    id: "stellarium",
    name: "Stellarium",
    tagline: "Free, open-source planetarium",
    description: "Stellarium is a free, open-source planetarium software that renders a realistic 3D sky in real time. Shows stars, constellations, planets, and deep-sky objects. Used by astronomers and educators worldwide.",
    category: "education",
    homepage: "https://stellarium.org/",
    license: "GPL-2.0",
    tags: [
      "astronomy",
      "planetarium",
      "education",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S stellarium",
      },
      {
        method: "apt",
        command: "sudo apt install stellarium",
      },
      {
        method: "dnf",
        command: "sudo dnf install stellarium",
      },
      {
        method: "zypper",
        command: "sudo zypper install stellarium",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.stellarium.Stellarium",
      },
      {
        method: "snap",
        command: "sudo snap install stellarium",
      },
    ],
  },
  {
    id: "inkscape",
    name: "Inkscape",
    tagline: "Free, open-source vector graphics editor",
    description: "Inkscape is a free, open-source vector graphics editor. Supports SVG format natively and provides tools for drawing, shapes, text, gradients, and path manipulation. The leading open-source alternative to Adobe Illustrator.",
    category: "graphics",
    homepage: "https://inkscape.org/",
    license: "GPL-2.0",
    tags: [
      "vector",
      "svg",
      "graphics",
      "design",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S inkscape",
      },
      {
        method: "apt",
        command: "sudo apt install inkscape",
      },
      {
        method: "dnf",
        command: "sudo dnf install inkscape",
      },
      {
        method: "zypper",
        command: "sudo zypper install inkscape",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.inkscape.Inkscape",
      },
      {
        method: "snap",
        command: "sudo snap install inkscape",
      },
    ],
  },
  {
    id: "blender",
    name: "Blender",
    tagline: "Free, open-source 3D creation suite",
    description: "Blender is a free, open-source 3D creation suite. Supports modeling, sculpting, rigging, animation, simulation, rendering, compositing, video editing, and game creation. Used by professionals in film, games, and design.",
    category: "graphics",
    homepage: "https://www.blender.org/",
    license: "GPL-3.0",
    tags: [
      "3d",
      "modeling",
      "animation",
      "rendering",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S blender",
      },
      {
        method: "apt",
        command: "sudo apt install blender",
      },
      {
        method: "dnf",
        command: "sudo dnf install blender",
      },
      {
        method: "zypper",
        command: "sudo zypper install blender",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.blender.Blender",
      },
      {
        method: "snap",
        command: "sudo snap install blender --classic",
      },
    ],
  },
  {
    id: "krita",
    name: "Krita",
    tagline: "Free digital painting application",
    description: "Krita is a free, open-source digital painting application. Supports brush engines, layers, filters, vector tools, and animation. Popular among illustrators and concept artists. Includes HDR support and Python scripting.",
    category: "graphics",
    homepage: "https://krita.org/",
    license: "GPL-3.0",
    tags: [
      "painting",
      "drawing",
      "digital-art",
      "illustration",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S krita",
      },
      {
        method: "apt",
        command: "sudo apt install krita",
      },
      {
        method: "dnf",
        command: "sudo dnf install krita",
      },
      {
        method: "zypper",
        command: "sudo zypper install krita",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.krita",
      },
      {
        method: "snap",
        command: "sudo snap install krita",
      },
    ],
  },
  {
    id: "gimp",
    name: "GIMP",
    tagline: "GNU Image Manipulation Program",
    description: "GIMP is an extensible cross-platform image editor used for photo retouching, image composition, and free-form drawing.",
    category: "graphics",
    homepage: "https://www.gimp.org/",
    license: "GPL-3.0",
    tags: [
      "photo",
      "image",
      "editing",
      "raster",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S gimp",
      },
      {
        method: "apt",
        command: "sudo apt install gimp",
      },
      {
        method: "dnf",
        command: "sudo dnf install gimp",
      },
      {
        method: "zypper",
        command: "sudo zypper install gimp",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.gimp.GIMP",
      },
      {
        method: "snap",
        command: "sudo snap install gimp",
      },
    ],
  },
  {
    id: "ghostty",
    name: "Ghostty",
    tagline: "Fast, native, feature-rich GPU terminal in Zig",
    description: "Ghostty is a modern terminal emulator built in Zig with native platform rendering (GTK on Linux), tabs, and instant performance.",
    category: "terminal",
    homepage: "https://ghostty.org/",
    license: "MIT",
    tags: [
      "terminal",
      "zig",
      "gpu",
      "fast",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ghostty",
      },
      {
        method: "zypper",
        command: "sudo zypper install ghostty",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.mitchellh.ghostty",
      },
      {
        method: "snap",
        command: "sudo snap install ghostty --classic",
      },
    ],
  },
  {
    id: "vesktop",
    name: "Vesktop",
    tagline: "Vencord-powered Discord desktop with Wayland screensharing",
    description: "Vesktop is a lightweight Discord desktop client giving you Vencord plugin integration, crisp audio, and full Wayland screensharing with system audio.",
    category: "communications",
    homepage: "https://github.com/Vencord/Vesktop",
    license: "GPL-3.0",
    tags: [
      "discord",
      "chat",
      "wayland",
      "vencord",
    ],
    featured: true,
    install: [
      {
        method: "aur",
        command: "paru -S vesktop-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub dev.vencord.Vesktop",
      },
    ],
  },
  {
    id: "fastfetch",
    name: "fastfetch",
    tagline: "Lightning-fast neofetch-like system info tool",
    description: "Fastfetch is a neofetch-like tool for fetching system information and displaying it prettily, written in C for instant execution.",
    category: "system",
    homepage: "https://github.com/fastfetch-cli/fastfetch",
    license: "MIT",
    tags: [
      "sysinfo",
      "cli",
      "fast",
      "c",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S fastfetch",
      },
      {
        method: "apt",
        command: "sudo apt install -y fastfetch || (sudo add-apt-repository -y ppa:zhangsongcui3371/fastfetch && sudo apt update && sudo apt install -y fastfetch)",
        steps: [
          {
            title: "Install with apt",
            command: "sudo apt install -y fastfetch || (sudo add-apt-repository -y ppa:zhangsongcui3371/fastfetch && sudo apt update && sudo apt install -y fastfetch)",
          },
        ],
      },
      {
        method: "dnf",
        command: "sudo dnf install fastfetch",
      },
      {
        method: "zypper",
        command: "sudo zypper install fastfetch",
      },
    ],
  },
  {
    id: "flameshot",
    name: "Flameshot",
    tagline: "Powerful yet simple to use screenshot software",
    description: "Flameshot is a feature-packed screenshot utility with built-in annotations, blur, arrows, pins, and direct cloud uploads.",
    category: "utilities",
    homepage: "https://flameshot.org/",
    license: "GPL-3.0",
    tags: [
      "screenshot",
      "capture",
      "annotations",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S flameshot",
      },
      {
        method: "apt",
        command: "sudo apt install flameshot",
      },
      {
        method: "dnf",
        command: "sudo dnf install flameshot",
      },
      {
        method: "zypper",
        command: "sudo zypper install flameshot",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.flameshot.Flameshot",
      },
    ],
  },
  {
    id: "heroic-games-launcher",
    name: "Heroic Games Launcher",
    tagline: "Native GOG, Epic Games, and Amazon Prime launcher",
    description: "Heroic is an open-source gaming launcher for Epic Games, GOG, and Amazon Games using Wine, Proton, and DXVK.",
    category: "games",
    homepage: "https://heroicgameslauncher.com/",
    license: "GPL-3.0",
    tags: [
      "gaming",
      "epic",
      "gog",
      "proton",
    ],
    featured: true,
    install: [
      {
        method: "aur",
        command: "paru -S heroic-games-launcher-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.heroicgameslauncher.hgl",
      },
    ],
  },
  {
    id: "protonup-qt",
    name: "ProtonUp-Qt",
    tagline: "Install and manage GE-Proton and Wine runners",
    description: "ProtonUp-Qt makes it easy to install and update GE-Proton, Luxtorpeda, and custom Wine versions for Steam and Lutris.",
    category: "games",
    homepage: "https://davidotek.github.io/protonup-qt/",
    license: "GPL-3.0",
    tags: [
      "gaming",
      "proton",
      "wine",
      "steam",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S protonup-qt-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.davidotek.pupgui2",
      },
    ],
  },
  {
    id: "calibre",
    name: "Calibre",
    tagline: "Comprehensive e-book manager and reader",
    description: "Calibre is the one stop solution to all your e-book needs. Organize books into libraries, convert between formats, and sync to e-readers.",
    category: "education",
    homepage: "https://calibre-ebook.com/",
    license: "GPL-3.0",
    tags: [
      "ebook",
      "reader",
      "library",
    ],
    featured: true,
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S calibre",
      },
      {
        method: "apt",
        command: "sudo apt install calibre",
      },
      {
        method: "dnf",
        command: "sudo dnf install calibre",
      },
      {
        method: "zypper",
        command: "sudo zypper install calibre",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.calibre_ebook.calibre",
      },
    ],
  },
  {
    id: "librewolf",
    name: "LibreWolf",
    tagline: "Essential tool for browsers",
    description: "LibreWolf is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=LibreWolf",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "librewolf",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S librewolf-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.gitlab.librewolf-community",
      },
    ],
  },
  {
    id: "waterfox",
    name: "Waterfox",
    tagline: "Essential tool for browsers",
    description: "Waterfox is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Waterfox",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "waterfox",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S waterfox-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.waterfox.waterfox",
      },
    ],
  },
  {
    id: "google-chrome",
    name: "Google Chrome",
    tagline: "Essential tool for browsers",
    description: "Google Chrome is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Google%20Chrome",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "google-chrome",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S google-chrome",
      },
      {
        method: "apt",
        command: "wget -qO /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt install -y /tmp/google-chrome.deb",
        steps: [
          {
            title: "Install with apt",
            command: "wget -qO /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt install -y /tmp/google-chrome.deb",
          },
        ],
      },
      {
        method: "dnf",
        command: "sudo dnf install -y https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm",
        steps: [
          {
            title: "Install with dnf",
            command: "sudo dnf install -y https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm",
          },
        ],
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.google.Chrome",
      },
    ],
  },
  {
    id: "helium",
    name: "Helium",
    tagline: "Essential tool for browsers",
    description: "Helium is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Helium",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "helium",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S helium-browser-bin",
      },
    ],
  },
  {
    id: "ungoogled-chromium",
    name: "Ungoogled Chromium",
    tagline: "Essential tool for browsers",
    description: "Ungoogled Chromium is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Ungoogled%20Chromium",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "ungoogled-chromium",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S ungoogled-chromium-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.ungoogled_software.ungoogled_chromium",
      },
    ],
  },
  {
    id: "konqueror",
    name: "Konqueror",
    tagline: "Essential tool for browsers",
    description: "Konqueror is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Konqueror",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "konqueror",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S konqueror",
      },
      {
        method: "apt",
        command: "sudo apt install konqueror",
      },
      {
        method: "dnf",
        command: "sudo dnf install konqueror",
      },
      {
        method: "zypper",
        command: "sudo zypper install konqueror",
      },
    ],
  },
  {
    id: "falkon",
    name: "Falkon",
    tagline: "Essential tool for browsers",
    description: "Falkon is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Falkon",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "falkon",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S falkon",
      },
      {
        method: "apt",
        command: "sudo apt install falkon",
      },
      {
        method: "dnf",
        command: "sudo dnf install falkon",
      },
      {
        method: "zypper",
        command: "sudo zypper install falkon",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.falkon",
      },
    ],
  },
  {
    id: "gnome-web",
    name: "GNOME Web",
    tagline: "Essential tool for browsers",
    description: "GNOME Web is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=GNOME%20Web",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "gnome-web",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S epiphany",
      },
      {
        method: "apt",
        command: "sudo apt install epiphany-browser",
      },
      {
        method: "dnf",
        command: "sudo dnf install epiphany",
      },
      {
        method: "zypper",
        command: "sudo zypper install epiphany",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.gnome.Epiphany",
      },
    ],
  },
  {
    id: "qutebrowser",
    name: "qutebrowser",
    tagline: "Essential tool for browsers",
    description: "qutebrowser is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=qutebrowser",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "qutebrowser",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S qutebrowser",
      },
      {
        method: "apt",
        command: "sudo apt install qutebrowser",
      },
      {
        method: "dnf",
        command: "sudo dnf install qutebrowser",
      },
      {
        method: "zypper",
        command: "sudo zypper install qutebrowser",
      },
    ],
  },
  {
    id: "nyxt",
    name: "Nyxt",
    tagline: "Essential tool for browsers",
    description: "Nyxt is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Nyxt",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "nyxt",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S nyxt",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub engineer.atlas.Nyxt",
      },
    ],
  },
  {
    id: "floorp",
    name: "Floorp",
    tagline: "Essential tool for browsers",
    description: "Floorp is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Floorp",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "floorp",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S floorp-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub one.ablaze.floorp",
      },
    ],
  },
  {
    id: "mullvad-browser",
    name: "Mullvad Browser",
    tagline: "Essential tool for browsers",
    description: "Mullvad Browser is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Mullvad%20Browser",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "mullvad-browser",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S mullvad-browser-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.mullvad.MullvadBrowser",
      },
    ],
  },
  {
    id: "microsoft-edge",
    name: "Microsoft Edge",
    tagline: "Essential tool for browsers",
    description: "Microsoft Edge is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Microsoft%20Edge",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "microsoft-edge",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S microsoft-edge-stable-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.microsoft.Edge",
      },
    ],
  },
  {
    id: "opera",
    name: "Opera",
    tagline: "Essential tool for browsers",
    description: "Opera is an application for Linux. Auto-generated entry.",
    category: "browsers",
    homepage: "https://github.com/search?q=Opera",
    license: "Unknown",
    tags: [
      "browsers",
      "linux",
      "opera",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S opera",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.opera.Opera",
      },
      {
        method: "snap",
        command: "sudo snap install opera",
      },
    ],
  },
  {
    id: "syncthing",
    name: "Syncthing",
    tagline: "Essential tool for utilities",
    description: "Syncthing is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=Syncthing",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "syncthing",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S syncthing",
      },
      {
        method: "apt",
        command: "sudo apt install syncthing",
      },
      {
        method: "dnf",
        command: "sudo dnf install syncthing",
      },
      {
        method: "zypper",
        command: "sudo zypper install syncthing",
      },
    ],
  },
  {
    id: "qbittorrent",
    name: "qBittorrent",
    tagline: "Essential tool for utilities",
    description: "qBittorrent is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=qBittorrent",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "qbittorrent",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S qbittorrent",
      },
      {
        method: "apt",
        command: "sudo apt install qbittorrent",
      },
      {
        method: "dnf",
        command: "sudo dnf install qbittorrent",
      },
      {
        method: "zypper",
        command: "sudo zypper install qbittorrent",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.qbittorrent.qBittorrent",
      },
    ],
  },
  {
    id: "transmission",
    name: "Transmission",
    tagline: "Essential tool for utilities",
    description: "Transmission is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=Transmission",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "transmission",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S transmission-gtk",
      },
      {
        method: "apt",
        command: "sudo apt install transmission-gtk",
      },
      {
        method: "dnf",
        command: "sudo dnf install transmission-gtk",
      },
      {
        method: "zypper",
        command: "sudo zypper install transmission-gtk",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.transmissionbt.Transmission",
      },
    ],
  },
  {
    id: "localsend",
    name: "LocalSend",
    tagline: "Essential tool for utilities",
    description: "LocalSend is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=LocalSend",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "localsend",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S localsend-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.localsend.localsend_app",
      },
      {
        method: "snap",
        command: "sudo snap install localsend",
      },
    ],
  },
  {
    id: "filezilla",
    name: "FileZilla",
    tagline: "Essential tool for utilities",
    description: "FileZilla is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=FileZilla",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "filezilla",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S filezilla",
      },
      {
        method: "apt",
        command: "sudo apt install filezilla",
      },
      {
        method: "dnf",
        command: "sudo dnf install filezilla",
      },
      {
        method: "zypper",
        command: "sudo zypper install filezilla",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.filezillaproject.Filezilla",
      },
    ],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    tagline: "Essential tool for utilities",
    description: "Dropbox is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=Dropbox",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "dropbox",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S dropbox",
      },
      {
        method: "apt",
        command: "sudo apt install nautilus-dropbox",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.dropbox.Client",
      },
    ],
  },
  {
    id: "ab-download-manager",
    name: "AB Download Manager",
    tagline: "Essential tool for utilities",
    description: "AB Download Manager is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=AB%20Download%20Manager",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "ab-download-manager",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S ab-download-manager-bin",
      },
      {
        method: "script",
        command: "bash -c \"$(curl -fsSL https://raw.githubusercontent.com/amir1376/ab-download-manager/master/scripts/install.sh)\"",
        steps: [
          {
            title: "Run the official installer",
            command: "bash -c \"$(curl -fsSL https://raw.githubusercontent.com/amir1376/ab-download-manager/master/scripts/install.sh)\"",
          },
        ],
      },
    ],
  },
  {
    id: "free-download-manager",
    name: "Free Download Manager",
    tagline: "Essential tool for utilities",
    description: "Free Download Manager is an application for Linux. Auto-generated entry.",
    category: "utilities",
    homepage: "https://github.com/search?q=Free%20Download%20Manager",
    license: "Unknown",
    tags: [
      "utilities",
      "linux",
      "free-download-manager",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S freedownloadmanager",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.freedownloadmanager.Manager",
      },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    tagline: "Essential tool for development",
    description: "Cursor is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Cursor",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "cursor",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S cursor-bin",
      },
    ],
  },
  {
    id: "vscodium",
    name: "VSCodium",
    tagline: "Essential tool for development",
    description: "VSCodium is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=VSCodium",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "vscodium",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S vscodium-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.vscodium.codium",
      },
      {
        method: "snap",
        command: "sudo snap install codium --classic",
      },
    ],
  },
  {
    id: "intellij-idea",
    name: "Intellij IDEA",
    tagline: "Essential tool for development",
    description: "Intellij IDEA is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Intellij%20IDEA",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "intellij-idea",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S intellij-idea-community-edition",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.jetbrains.IntelliJ-IDEA-Community",
      },
      {
        method: "snap",
        command: "sudo snap install intellij-idea-community --classic",
      },
    ],
  },
  {
    id: "pycharm",
    name: "Pycharm",
    tagline: "Essential tool for development",
    description: "Pycharm is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Pycharm",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "pycharm",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S pycharm-community-edition",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.jetbrains.PyCharm-Community",
      },
      {
        method: "snap",
        command: "sudo snap install pycharm-community --classic",
      },
    ],
  },
  {
    id: "clion",
    name: "CLion",
    tagline: "Essential tool for development",
    description: "CLion is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=CLion",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "clion",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S clion",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.jetbrains.CLion",
      },
      {
        method: "snap",
        command: "sudo snap install clion --classic",
      },
    ],
  },
  {
    id: "arduino-ide",
    name: "Arduino IDE",
    tagline: "Essential tool for development",
    description: "Arduino IDE is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Arduino%20IDE",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "arduino-ide",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S arduino-ide",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub cc.arduino.IDE2",
      },
    ],
  },
  {
    id: "sublime-text",
    name: "Sublime Text",
    tagline: "Essential tool for development",
    description: "Sublime Text is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Sublime%20Text",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "sublime-text",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S sublime-text-4",
      },
      {
        method: "snap",
        command: "sudo snap install sublime-text --classic",
      },
    ],
  },
  {
    id: "kate",
    name: "Kate",
    tagline: "Essential tool for development",
    description: "Kate is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Kate",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "kate",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kate",
      },
      {
        method: "apt",
        command: "sudo apt install kate",
      },
      {
        method: "dnf",
        command: "sudo dnf install kate",
      },
      {
        method: "zypper",
        command: "sudo zypper install kate",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.kate",
      },
    ],
  },
  {
    id: "geany",
    name: "Geany",
    tagline: "Essential tool for development",
    description: "Geany is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Geany",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "geany",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S geany",
      },
      {
        method: "apt",
        command: "sudo apt install geany",
      },
      {
        method: "dnf",
        command: "sudo dnf install geany",
      },
      {
        method: "zypper",
        command: "sudo zypper install geany",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.geany.Geany",
      },
    ],
  },
  {
    id: "vim",
    name: "Vim",
    tagline: "Essential tool for development",
    description: "Vim is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Vim",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "vim",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S vim",
      },
      {
        method: "apt",
        command: "sudo apt install vim",
      },
      {
        method: "dnf",
        command: "sudo dnf install vim-enhanced",
      },
      {
        method: "zypper",
        command: "sudo zypper install vim",
      },
    ],
  },
  {
    id: "helix",
    name: "Helix",
    tagline: "Essential tool for development",
    description: "Helix is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Helix",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "helix",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S helix",
      },
      {
        method: "dnf",
        command: "sudo dnf install helix",
      },
      {
        method: "zypper",
        command: "sudo zypper install helix",
      },
      {
        method: "snap",
        command: "sudo snap install helix --classic",
      },
    ],
  },
  {
    id: "micro",
    name: "Micro",
    tagline: "Essential tool for development",
    description: "Micro is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Micro",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "micro",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S micro",
      },
      {
        method: "apt",
        command: "sudo apt install micro",
      },
      {
        method: "dnf",
        command: "sudo dnf install micro",
      },
      {
        method: "zypper",
        command: "sudo zypper install micro-editor",
      },
      {
        method: "snap",
        command: "sudo snap install micro --classic",
      },
    ],
  },
  {
    id: "emacs",
    name: "Emacs",
    tagline: "Essential tool for development",
    description: "Emacs is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Emacs",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "emacs",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S emacs",
      },
      {
        method: "apt",
        command: "sudo apt install emacs",
      },
      {
        method: "dnf",
        command: "sudo dnf install emacs",
      },
      {
        method: "zypper",
        command: "sudo zypper install emacs",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.gnu.emacs",
      },
    ],
  },
  {
    id: "opencode",
    name: "OpenCode",
    tagline: "Essential tool for development",
    description: "OpenCode is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=OpenCode",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "opencode",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S opencode-bin",
      },
      {
        method: "script",
        command: "curl -fsSL https://opencode.ai/install | bash",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://opencode.ai/install | bash",
          },
        ],
      },
    ],
  },
  {
    id: "openai-codex",
    name: "OpenAI Codex",
    tagline: "Essential tool for development",
    description: "OpenAI Codex is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=OpenAI%20Codex",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "openai-codex",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S openai-codex-bin",
      },
      {
        method: "script",
        command: "sudo npm install -g @openai/codex",
        steps: [
          {
            title: "Run the official installer",
            command: "sudo npm install -g @openai/codex",
          },
        ],
      },
    ],
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    tagline: "Essential tool for development",
    description: "Gemini CLI is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Gemini%20CLI",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "gemini-cli",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S gemini-cli",
      },
      {
        method: "script",
        command: "sudo npm install -g @google/gemini-cli",
        steps: [
          {
            title: "Run the official installer",
            command: "sudo npm install -g @google/gemini-cli",
          },
        ],
      },
    ],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    tagline: "Essential tool for development",
    description: "Claude Code is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Claude%20Code",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "claude-code",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S claude-code",
      },
      {
        method: "script",
        command: "curl -fsSL https://claude.ai/install.sh | bash",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://claude.ai/install.sh | bash",
          },
        ],
      },
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    tagline: "Essential tool for development",
    description: "Ollama is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Ollama",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "ollama",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ollama",
      },
      {
        method: "dnf",
        command: "sudo dnf install ollama",
      },
      {
        method: "zypper",
        command: "sudo zypper install ollama",
      },
      {
        method: "script",
        command: "curl -fsSL https://ollama.com/install.sh | sh",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://ollama.com/install.sh | sh",
          },
        ],
      },
    ],
  },
  {
    id: "llama-cpp",
    name: "llama.cpp",
    tagline: "Essential tool for development",
    description: "llama.cpp is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=llama.cpp",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "llama-cpp",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S llama.cpp",
      },
      {
        method: "dnf",
        command: "sudo dnf install llama-cpp",
      },
    ],
  },
  {
    id: "jan",
    name: "Jan",
    tagline: "Essential tool for development",
    description: "Jan is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Jan",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "jan",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S jan-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub ai.jan.Jan",
      },
    ],
  },
  {
    id: "darktable",
    name: "Darktable",
    tagline: "Essential tool for graphics",
    description: "Darktable is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=Darktable",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "darktable",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S darktable",
      },
      {
        method: "apt",
        command: "sudo apt install darktable",
      },
      {
        method: "dnf",
        command: "sudo dnf install darktable",
      },
      {
        method: "zypper",
        command: "sudo zypper install darktable",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.darktable.Darktable",
      },
    ],
  },
  {
    id: "freecad",
    name: "FreeCAD",
    tagline: "Essential tool for graphics",
    description: "FreeCAD is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=FreeCAD",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "freecad",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S freecad",
      },
      {
        method: "dnf",
        command: "sudo dnf install freecad",
      },
      {
        method: "zypper",
        command: "sudo zypper install FreeCAD",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.freecad.FreeCAD",
      },
    ],
  },
  {
    id: "kicad",
    name: "KiCad",
    tagline: "Essential tool for graphics",
    description: "KiCad is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=KiCad",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "kicad",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kicad",
      },
      {
        method: "apt",
        command: "sudo apt install kicad",
      },
      {
        method: "dnf",
        command: "sudo dnf install kicad",
      },
      {
        method: "zypper",
        command: "sudo zypper install kicad",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kicad.KiCad",
      },
    ],
  },
  {
    id: "ultimaker-cura",
    name: "UltiMaker Cura",
    tagline: "Essential tool for graphics",
    description: "UltiMaker Cura is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=UltiMaker%20Cura",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "ultimaker-cura",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S cura-bin",
      },
      {
        method: "dnf",
        command: "sudo dnf install cura",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.ultimaker.cura",
      },
    ],
  },
  {
    id: "godot-engine",
    name: "Godot Engine",
    tagline: "Essential tool for graphics",
    description: "Godot Engine is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=Godot%20Engine",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "godot-engine",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S godot",
      },
      {
        method: "apt",
        command: "sudo apt install godot3",
      },
      {
        method: "dnf",
        command: "sudo dnf install godot",
      },
      {
        method: "zypper",
        command: "sudo zypper install godot",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.godotengine.Godot",
      },
    ],
  },
  {
    id: "kolourpaint",
    name: "KolourPaint",
    tagline: "Essential tool for graphics",
    description: "KolourPaint is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=KolourPaint",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "kolourpaint",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kolourpaint",
      },
      {
        method: "apt",
        command: "sudo apt install kolourpaint",
      },
      {
        method: "dnf",
        command: "sudo dnf install kolourpaint",
      },
      {
        method: "zypper",
        command: "sudo zypper install kolourpaint",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.kolourpaint",
      },
    ],
  },
  {
    id: "orcaslicer",
    name: "OrcaSlicer",
    tagline: "Essential tool for graphics",
    description: "OrcaSlicer is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=OrcaSlicer",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "orcaslicer",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S orca-slicer-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.softfever.OrcaSlicer",
      },
    ],
  },
  {
    id: "davinci-resolve",
    name: "DaVinci Resolve",
    tagline: "Essential tool for graphics",
    description: "DaVinci Resolve is an application for Linux. Auto-generated entry.",
    category: "graphics",
    homepage: "https://github.com/search?q=DaVinci%20Resolve",
    license: "Unknown",
    tags: [
      "graphics",
      "linux",
      "davinci-resolve",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S davinci-resolve",
      },
    ],
  },
  {
    id: "ivpn",
    name: "IVPN",
    tagline: "Essential tool for system",
    description: "IVPN is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=IVPN",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "ivpn",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S ivpn",
      },
    ],
  },
  {
    id: "proton-vpn",
    name: "Proton VPN",
    tagline: "Essential tool for system",
    description: "Proton VPN is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Proton%20VPN",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "proton-vpn",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S proton-vpn-gtk-app",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.protonvpn.www",
      },
    ],
  },
  {
    id: "mullvad-vpn",
    name: "Mullvad VPN",
    tagline: "Essential tool for system",
    description: "Mullvad VPN is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Mullvad%20VPN",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "mullvad-vpn",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S mullvad-vpn-bin",
      },
      {
        method: "apt",
        command: "sudo curl -fsSLo /usr/share/keyrings/mullvad-keyring.asc https://repository.mullvad.net/deb/mullvad-keyring.asc && echo \"deb [signed-by=/usr/share/keyrings/mullvad-keyring.asc arch=$(dpkg --print-architecture)] https://repository.mullvad.net/deb/stable stable main\" | sudo tee /etc/apt/sources.list.d/mullvad.list && sudo apt update && sudo apt install -y mullvad-vpn",
        steps: [
          {
            title: "Install with apt",
            command: "sudo curl -fsSLo /usr/share/keyrings/mullvad-keyring.asc https://repository.mullvad.net/deb/mullvad-keyring.asc && echo \"deb [signed-by=/usr/share/keyrings/mullvad-keyring.asc arch=$(dpkg --print-architecture)] https://repository.mullvad.net/deb/stable stable main\" | sudo tee /etc/apt/sources.list.d/mullvad.list && sudo apt update && sudo apt install -y mullvad-vpn",
          },
        ],
      },
      {
        method: "dnf",
        command: "sudo dnf config-manager addrepo --from-repofile=https://repository.mullvad.net/rpm/stable/mullvad.repo && sudo dnf install -y mullvad-vpn",
        steps: [
          {
            title: "Install with dnf",
            command: "sudo dnf config-manager addrepo --from-repofile=https://repository.mullvad.net/rpm/stable/mullvad.repo && sudo dnf install -y mullvad-vpn",
          },
        ],
      },
    ],
  },
  {
    id: "tailscale",
    name: "Tailscale",
    tagline: "Essential tool for system",
    description: "Tailscale is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Tailscale",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "tailscale",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S tailscale",
      },
      {
        method: "zypper",
        command: "sudo zypper install tailscale",
      },
      {
        method: "script",
        command: "curl -fsSL https://tailscale.com/install.sh | sh",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://tailscale.com/install.sh | sh",
          },
        ],
      },
    ],
  },
  {
    id: "wireguard",
    name: "WireGuard",
    tagline: "Essential tool for system",
    description: "WireGuard is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=WireGuard",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "wireguard",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S wireguard-tools",
      },
      {
        method: "apt",
        command: "sudo apt install wireguard-tools",
      },
      {
        method: "dnf",
        command: "sudo dnf install wireguard-tools",
      },
      {
        method: "zypper",
        command: "sudo zypper install wireguard-tools",
      },
    ],
  },
  {
    id: "openvpn",
    name: "OpenVPN",
    tagline: "Essential tool for system",
    description: "OpenVPN is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=OpenVPN",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "openvpn",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S openvpn",
      },
      {
        method: "apt",
        command: "sudo apt install openvpn",
      },
      {
        method: "dnf",
        command: "sudo dnf install openvpn",
      },
      {
        method: "zypper",
        command: "sudo zypper install openvpn",
      },
    ],
  },
  {
    id: "nmap",
    name: "Nmap",
    tagline: "Essential tool for system",
    description: "Nmap is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Nmap",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "nmap",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S nmap",
      },
      {
        method: "apt",
        command: "sudo apt install nmap",
      },
      {
        method: "dnf",
        command: "sudo dnf install nmap",
      },
      {
        method: "zypper",
        command: "sudo zypper install nmap",
      },
    ],
  },
  {
    id: "openssh",
    name: "OpenSSH",
    tagline: "Essential tool for system",
    description: "OpenSSH is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=OpenSSH",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "openssh",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S openssh",
      },
      {
        method: "apt",
        command: "sudo apt install openssh-server",
      },
      {
        method: "dnf",
        command: "sudo dnf install openssh-server openssh-clients",
      },
      {
        method: "zypper",
        command: "sudo zypper install openssh",
      },
    ],
  },
  {
    id: "remmina",
    name: "Remmina",
    tagline: "Essential tool for system",
    description: "Remmina is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Remmina",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "remmina",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S remmina",
      },
      {
        method: "apt",
        command: "sudo apt install remmina",
      },
      {
        method: "dnf",
        command: "sudo dnf install remmina",
      },
      {
        method: "zypper",
        command: "sudo zypper install remmina",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.remmina.Remmina",
      },
    ],
  },
  {
    id: "zsh",
    name: "Zsh",
    tagline: "Essential tool for terminal",
    description: "Zsh is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Zsh",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "zsh",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S zsh",
      },
      {
        method: "apt",
        command: "sudo apt install zsh",
      },
      {
        method: "dnf",
        command: "sudo dnf install zsh",
      },
      {
        method: "zypper",
        command: "sudo zypper install zsh",
      },
    ],
  },
  {
    id: "oh-my-zsh",
    name: "Oh My Zsh",
    tagline: "Essential tool for terminal",
    description: "Oh My Zsh is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Oh%20My%20Zsh",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "oh-my-zsh",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S oh-my-zsh-git",
      },
      {
        method: "script",
        command: "sh -c \"$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)\" \"\" --unattended",
        steps: [
          {
            title: "Run the official installer",
            command: "sh -c \"$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)\" \"\" --unattended",
          },
        ],
      },
    ],
  },
  {
    id: "fish",
    name: "Fish",
    tagline: "Essential tool for terminal",
    description: "Fish is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Fish",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "fish",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S fish",
      },
      {
        method: "apt",
        command: "sudo apt install fish",
      },
      {
        method: "dnf",
        command: "sudo dnf install fish",
      },
      {
        method: "zypper",
        command: "sudo zypper install fish",
      },
    ],
  },
  {
    id: "starship",
    name: "Starship",
    tagline: "Essential tool for terminal",
    description: "Starship is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Starship",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "starship",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S starship",
      },
      {
        method: "zypper",
        command: "sudo zypper install starship",
      },
      {
        method: "script",
        command: "curl -sS https://starship.rs/install.sh | sh -s -- -y",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -sS https://starship.rs/install.sh | sh -s -- -y",
          },
        ],
      },
    ],
  },
  {
    id: "wezterm",
    name: "WezTerm",
    tagline: "Essential tool for terminal",
    description: "WezTerm is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=WezTerm",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "wezterm",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S wezterm",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.wezfurlong.wezterm",
      },
    ],
  },
  {
    id: "foot",
    name: "Foot",
    tagline: "Essential tool for terminal",
    description: "Foot is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Foot",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "foot",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S foot",
      },
      {
        method: "apt",
        command: "sudo apt install foot",
      },
      {
        method: "dnf",
        command: "sudo dnf install foot",
      },
      {
        method: "zypper",
        command: "sudo zypper install foot",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub page.codeberg.dnkl.foot",
      },
    ],
  },
  {
    id: "ptyxis",
    name: "Ptyxis",
    tagline: "Essential tool for terminal",
    description: "Ptyxis is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Ptyxis",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "ptyxis",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ptyxis",
      },
      {
        method: "dnf",
        command: "sudo dnf install ptyxis",
      },
      {
        method: "zypper",
        command: "sudo zypper install ptyxis",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub app.devsuite.Ptyxis",
      },
    ],
  },
  {
    id: "mpv",
    name: "mpv",
    tagline: "Essential tool for multimedia",
    description: "mpv is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=mpv",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "mpv",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S mpv",
      },
      {
        method: "apt",
        command: "sudo apt install mpv",
      },
      {
        method: "dnf",
        command: "sudo dnf install mpv",
      },
      {
        method: "zypper",
        command: "sudo zypper install mpv",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.mpv.Mpv",
      },
    ],
  },
  {
    id: "celluloid",
    name: "Celluloid",
    tagline: "Essential tool for multimedia",
    description: "Celluloid is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Celluloid",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "celluloid",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S celluloid",
      },
      {
        method: "apt",
        command: "sudo apt install celluloid",
      },
      {
        method: "dnf",
        command: "sudo dnf install celluloid",
      },
      {
        method: "zypper",
        command: "sudo zypper install celluloid",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.celluloid_player.Celluloid",
      },
    ],
  },
  {
    id: "strawberry",
    name: "Strawberry",
    tagline: "Essential tool for multimedia",
    description: "Strawberry is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Strawberry",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "strawberry",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S strawberry",
      },
      {
        method: "apt",
        command: "sudo apt install strawberry",
      },
      {
        method: "dnf",
        command: "sudo dnf install strawberry",
      },
      {
        method: "zypper",
        command: "sudo zypper install strawberry",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.strawberrymusicplayer.strawberry",
      },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    tagline: "Essential tool for multimedia",
    description: "Spotify is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Spotify",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "spotify",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S spotify-launcher",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.spotify.Client",
      },
      {
        method: "snap",
        command: "sudo snap install spotify",
      },
    ],
  },
  {
    id: "ffmpeg",
    name: "FFmpeg",
    tagline: "Essential tool for multimedia",
    description: "FFmpeg is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=FFmpeg",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "ffmpeg",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ffmpeg",
      },
      {
        method: "apt",
        command: "sudo apt install ffmpeg",
      },
      {
        method: "dnf",
        command: "sudo dnf install ffmpeg-free",
      },
      {
        method: "zypper",
        command: "sudo zypper install ffmpeg-7",
      },
    ],
  },
  {
    id: "stremio",
    name: "Stremio",
    tagline: "Essential tool for multimedia",
    description: "Stremio is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Stremio",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "stremio",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S stremio",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.stremio.Stremio",
      },
    ],
  },
  {
    id: "kodi",
    name: "Kodi",
    tagline: "Essential tool for multimedia",
    description: "Kodi is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Kodi",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "kodi",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kodi",
      },
      {
        method: "apt",
        command: "sudo apt install kodi",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub tv.kodi.Kodi",
      },
    ],
  },
  {
    id: "haruna",
    name: "Haruna",
    tagline: "Essential tool for multimedia",
    description: "Haruna is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Haruna",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "haruna",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S haruna",
      },
      {
        method: "apt",
        command: "sudo apt install haruna",
      },
      {
        method: "dnf",
        command: "sudo dnf install haruna",
      },
      {
        method: "zypper",
        command: "sudo zypper install haruna",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.haruna",
      },
    ],
  },
  {
    id: "shortwave",
    name: "Shortwave",
    tagline: "Essential tool for multimedia",
    description: "Shortwave is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Shortwave",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "shortwave",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S shortwave",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub de.haeckerfelix.Shortwave",
      },
    ],
  },
  {
    id: "parabolic",
    name: "Parabolic",
    tagline: "Essential tool for multimedia",
    description: "Parabolic is an application for Linux. Auto-generated entry.",
    category: "multimedia",
    homepage: "https://github.com/search?q=Parabolic",
    license: "Unknown",
    tags: [
      "multimedia",
      "linux",
      "parabolic",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S parabolic",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.nickvision.tubeconverter",
      },
    ],
  },
  {
    id: "kde-partition-manager",
    name: "KDE Partition Manager",
    tagline: "Essential tool for system",
    description: "KDE Partition Manager is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=KDE%20Partition%20Manager",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "kde-partition-manager",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S partitionmanager",
      },
      {
        method: "apt",
        command: "sudo apt install partitionmanager",
      },
      {
        method: "dnf",
        command: "sudo dnf install kde-partitionmanager",
      },
      {
        method: "zypper",
        command: "sudo zypper install partitionmanager",
      },
    ],
  },
  {
    id: "kde-connect",
    name: "KDE Connect",
    tagline: "Essential tool for system",
    description: "KDE Connect is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=KDE%20Connect",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "kde-connect",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kdeconnect",
      },
      {
        method: "apt",
        command: "sudo apt install kdeconnect",
      },
      {
        method: "dnf",
        command: "sudo dnf install kde-connect",
      },
      {
        method: "zypper",
        command: "sudo zypper install kdeconnect-kde",
      },
    ],
  },
  {
    id: "bleachbit",
    name: "BleachBit",
    tagline: "Essential tool for system",
    description: "BleachBit is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=BleachBit",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "bleachbit",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S bleachbit",
      },
      {
        method: "apt",
        command: "sudo apt install bleachbit",
      },
      {
        method: "dnf",
        command: "sudo dnf install bleachbit",
      },
      {
        method: "zypper",
        command: "sudo zypper install bleachbit",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.bleachbit.BleachBit",
      },
    ],
  },
  {
    id: "dconf-editor",
    name: "dconf Editor",
    tagline: "Essential tool for system",
    description: "dconf Editor is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=dconf%20Editor",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "dconf-editor",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S dconf-editor",
      },
      {
        method: "apt",
        command: "sudo apt install dconf-editor",
      },
      {
        method: "dnf",
        command: "sudo dnf install dconf-editor",
      },
      {
        method: "zypper",
        command: "sudo zypper install dconf-editor",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub ca.desrt.dconf-editor",
      },
    ],
  },
  {
    id: "borgbackup",
    name: "BorgBackup",
    tagline: "Essential tool for system",
    description: "BorgBackup is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=BorgBackup",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "borgbackup",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S borg",
      },
      {
        method: "apt",
        command: "sudo apt install borgbackup",
      },
      {
        method: "dnf",
        command: "sudo dnf install borgbackup",
      },
      {
        method: "zypper",
        command: "sudo zypper install borgbackup",
      },
    ],
  },
  {
    id: "restic",
    name: "Restic",
    tagline: "Essential tool for system",
    description: "Restic is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Restic",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "restic",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S restic",
      },
      {
        method: "apt",
        command: "sudo apt install restic",
      },
      {
        method: "dnf",
        command: "sudo dnf install restic",
      },
      {
        method: "zypper",
        command: "sudo zypper install restic",
      },
    ],
  },
  {
    id: "flatpak",
    name: "Flatpak",
    tagline: "Essential tool for system",
    description: "Flatpak is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Flatpak",
    license: "Unknown",
    tags: [
      "system",
      "linux",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S flatpak",
      },
      {
        method: "apt",
        command: "sudo apt install flatpak",
      },
      {
        method: "dnf",
        command: "sudo dnf install flatpak",
      },
      {
        method: "zypper",
        command: "sudo zypper install flatpak",
      },
    ],
  },
  {
    id: "filelight",
    name: "Filelight",
    tagline: "Essential tool for system",
    description: "Filelight is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Filelight",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "filelight",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S filelight",
      },
      {
        method: "apt",
        command: "sudo apt install filelight",
      },
      {
        method: "dnf",
        command: "sudo dnf install filelight",
      },
      {
        method: "zypper",
        command: "sudo zypper install filelight",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.kde.filelight",
      },
    ],
  },
  {
    id: "conky",
    name: "Conky",
    tagline: "Essential tool for system",
    description: "Conky is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Conky",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "conky",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S conky",
      },
      {
        method: "apt",
        command: "sudo apt install conky-all",
      },
      {
        method: "dnf",
        command: "sudo dnf install conky",
      },
      {
        method: "zypper",
        command: "sudo zypper install conky",
      },
    ],
  },
  {
    id: "fsearch",
    name: "FSearch",
    tagline: "Essential tool for system",
    description: "FSearch is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=FSearch",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "fsearch",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S fsearch",
      },
      {
        method: "dnf",
        command: "sudo dnf install fsearch",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.cboxdoerfer.FSearch",
      },
    ],
  },
  {
    id: "cpu-x",
    name: "CPU-X",
    tagline: "Essential tool for system",
    description: "CPU-X is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=CPU-X",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "cpu-x",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S cpu-x",
      },
      {
        method: "apt",
        command: "sudo apt install cpu-x",
      },
      {
        method: "dnf",
        command: "sudo dnf install cpu-x",
      },
      {
        method: "zypper",
        command: "sudo zypper install cpu-x",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.thetumultuousunicornofdarkness.cpu-x",
      },
    ],
  },
  {
    id: "mission-center",
    name: "Mission Center",
    tagline: "Essential tool for system",
    description: "Mission Center is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=Mission%20Center",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "mission-center",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S mission-center",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.missioncenter.MissionCenter",
      },
    ],
  },
  {
    id: "openrgb",
    name: "OpenRGB",
    tagline: "Essential tool for system",
    description: "OpenRGB is an application for Linux. Auto-generated entry.",
    category: "system",
    homepage: "https://github.com/search?q=OpenRGB",
    license: "Unknown",
    tags: [
      "system",
      "linux",
      "openrgb",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S openrgb",
      },
      {
        method: "dnf",
        command: "sudo dnf install openrgb",
      },
      {
        method: "zypper",
        command: "sudo zypper install OpenRGB",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.openrgb.OpenRGB",
      },
    ],
  },
  {
    id: "git-lfs",
    name: "Git LFS",
    tagline: "Essential tool for development",
    description: "Git LFS is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Git%20LFS",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "git-lfs",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S git-lfs",
      },
      {
        method: "apt",
        command: "sudo apt install git-lfs",
      },
      {
        method: "dnf",
        command: "sudo dnf install git-lfs",
      },
      {
        method: "zypper",
        command: "sudo zypper install git-lfs",
      },
    ],
  },
  {
    id: "lazygit",
    name: "LazyGit",
    tagline: "Essential tool for development",
    description: "LazyGit is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=LazyGit",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "lazygit",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S lazygit",
      },
      {
        method: "zypper",
        command: "sudo zypper install lazygit",
      },
      {
        method: "script",
        command: "sh -c 'V=$(curl -s https://api.github.com/repos/jesseduffield/lazygit/releases/latest | grep -Po \"\\\"tag_name\\\": *\\\"v\\K[^\\\"]*\") && curl -Lo /tmp/lazygit.tar.gz \"https://github.com/jesseduffield/lazygit/releases/download/v${V}/lazygit_${V}_Linux_$(uname -m | sed s/aarch64/arm64/).tar.gz\" && tar xf /tmp/lazygit.tar.gz -C /tmp lazygit && sudo install /tmp/lazygit -D -t /usr/local/bin/'",
        steps: [
          {
            title: "Run the official installer",
            command: "sh -c 'V=$(curl -s https://api.github.com/repos/jesseduffield/lazygit/releases/latest | grep -Po \"\\\"tag_name\\\": *\\\"v\\K[^\\\"]*\") && curl -Lo /tmp/lazygit.tar.gz \"https://github.com/jesseduffield/lazygit/releases/download/v${V}/lazygit_${V}_Linux_$(uname -m | sed s/aarch64/arm64/).tar.gz\" && tar xf /tmp/lazygit.tar.gz -C /tmp lazygit && sudo install /tmp/lazygit -D -t /usr/local/bin/'",
          },
        ],
      },
    ],
  },
  {
    id: "podman-desktop",
    name: "Podman Desktop",
    tagline: "Essential tool for development",
    description: "Podman Desktop is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Podman%20Desktop",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "podman-desktop",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S podman-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.podman_desktop.PodmanDesktop",
      },
    ],
  },
  {
    id: "incus",
    name: "Incus",
    tagline: "Essential tool for development",
    description: "Incus is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Incus",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "incus",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S incus",
      },
      {
        method: "apt",
        command: "sudo apt install incus",
      },
      {
        method: "dnf",
        command: "sudo dnf install incus",
      },
      {
        method: "zypper",
        command: "sudo zypper install incus",
      },
    ],
  },
  {
    id: "kubectl",
    name: "kubectl",
    tagline: "Essential tool for development",
    description: "kubectl is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=kubectl",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "kubectl",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S kubectl",
      },
      {
        method: "snap",
        command: "sudo snap install kubectl --classic",
      },
    ],
  },
  {
    id: "vagrant",
    name: "Vagrant",
    tagline: "Essential tool for development",
    description: "Vagrant is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Vagrant",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "vagrant",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S vagrant",
      },
      {
        method: "apt",
        command: "wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && echo \"deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(. /etc/os-release && echo $VERSION_CODENAME) main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list && sudo apt update && sudo apt install -y vagrant",
        steps: [
          {
            title: "Install with apt",
            command: "wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && echo \"deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(. /etc/os-release && echo $VERSION_CODENAME) main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list && sudo apt update && sudo apt install -y vagrant",
          },
        ],
      },
      {
        method: "dnf",
        command: "sudo dnf install vagrant",
      },
    ],
  },
  {
    id: "gnome-boxes",
    name: "GNOME Boxes",
    tagline: "Essential tool for development",
    description: "GNOME Boxes is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=GNOME%20Boxes",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "gnome-boxes",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S gnome-boxes",
      },
      {
        method: "apt",
        command: "sudo apt install gnome-boxes",
      },
      {
        method: "dnf",
        command: "sudo dnf install gnome-boxes",
      },
      {
        method: "zypper",
        command: "sudo zypper install gnome-boxes",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.gnome.Boxes",
      },
    ],
  },
  {
    id: "dbeaver",
    name: "DBeaver",
    tagline: "Essential tool for development",
    description: "DBeaver is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=DBeaver",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "dbeaver",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S dbeaver",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.dbeaver.DBeaverCommunity",
      },
      {
        method: "snap",
        command: "sudo snap install dbeaver-ce",
      },
    ],
  },
  {
    id: "meld",
    name: "Meld",
    tagline: "Essential tool for development",
    description: "Meld is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Meld",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "meld",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S meld",
      },
      {
        method: "apt",
        command: "sudo apt install meld",
      },
      {
        method: "dnf",
        command: "sudo dnf install meld",
      },
      {
        method: "zypper",
        command: "sudo zypper install meld",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.gnome.meld",
      },
    ],
  },
  {
    id: "wireshark",
    name: "Wireshark",
    tagline: "Essential tool for development",
    description: "Wireshark is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Wireshark",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "wireshark",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S wireshark-qt",
      },
      {
        method: "apt",
        command: "sudo apt install wireshark",
      },
      {
        method: "dnf",
        command: "sudo dnf install wireshark",
      },
      {
        method: "zypper",
        command: "sudo zypper install wireshark",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.wireshark.Wireshark",
      },
    ],
  },
  {
    id: "bruno",
    name: "Bruno",
    tagline: "Essential tool for development",
    description: "Bruno is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Bruno",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "bruno",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S bruno",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.usebruno.Bruno",
      },
      {
        method: "snap",
        command: "sudo snap install bruno",
      },
    ],
  },
  {
    id: "hoppscotch",
    name: "Hoppscotch",
    tagline: "Essential tool for development",
    description: "Hoppscotch is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Hoppscotch",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "hoppscotch",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S hoppscotch-bin",
      },
    ],
  },
  {
    id: "yaak",
    name: "Yaak",
    tagline: "Essential tool for development",
    description: "Yaak is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Yaak",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "yaak",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S yaak-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub app.yaak.Yaak",
      },
      {
        method: "snap",
        command: "sudo snap install yaak",
      },
    ],
  },
  {
    id: "imhex",
    name: "ImHex",
    tagline: "Essential tool for development",
    description: "ImHex is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=ImHex",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "imhex",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S imhex",
      },
      {
        method: "dnf",
        command: "sudo dnf install imhex",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.werwolv.ImHex",
      },
    ],
  },
  {
    id: "cmake",
    name: "CMake",
    tagline: "Essential tool for development",
    description: "CMake is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=CMake",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "cmake",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S cmake",
      },
      {
        method: "apt",
        command: "sudo apt install cmake",
      },
      {
        method: "dnf",
        command: "sudo dnf install cmake",
      },
      {
        method: "zypper",
        command: "sudo zypper install cmake",
      },
      {
        method: "snap",
        command: "sudo snap install cmake --classic",
      },
    ],
  },
  {
    id: "prism-launcher",
    name: "Prism Launcher",
    tagline: "Essential tool for games",
    description: "Prism Launcher is an application for Linux. Auto-generated entry.",
    category: "games",
    homepage: "https://github.com/search?q=Prism%20Launcher",
    license: "Unknown",
    tags: [
      "games",
      "linux",
      "prism-launcher",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S prismlauncher",
      },
      {
        method: "dnf",
        command: "sudo dnf install prismlauncher",
      },
      {
        method: "zypper",
        command: "sudo zypper install prismlauncher",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.prismlauncher.PrismLauncher",
      },
    ],
  },
  {
    id: "retroarch",
    name: "RetroArch",
    tagline: "Essential tool for games",
    description: "RetroArch is an application for Linux. Auto-generated entry.",
    category: "games",
    homepage: "https://github.com/search?q=RetroArch",
    license: "Unknown",
    tags: [
      "games",
      "linux",
      "retroarch",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S retroarch",
      },
      {
        method: "apt",
        command: "sudo apt install retroarch",
      },
      {
        method: "dnf",
        command: "sudo dnf install retroarch",
      },
      {
        method: "zypper",
        command: "sudo zypper install retroarch",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.libretro.RetroArch",
      },
    ],
  },
  {
    id: "mangohud",
    name: "MangoHud",
    tagline: "Essential tool for games",
    description: "MangoHud is an application for Linux. Auto-generated entry.",
    category: "games",
    homepage: "https://github.com/search?q=MangoHud",
    license: "Unknown",
    tags: [
      "games",
      "linux",
      "mangohud",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S mangohud",
      },
      {
        method: "apt",
        command: "sudo apt install mangohud",
      },
      {
        method: "dnf",
        command: "sudo dnf install mangohud",
      },
      {
        method: "zypper",
        command: "sudo zypper install mangohud",
      },
    ],
  },
  {
    id: "gamemode",
    name: "GameMode",
    tagline: "Essential tool for games",
    description: "GameMode is an application for Linux. Auto-generated entry.",
    category: "games",
    homepage: "https://github.com/search?q=GameMode",
    license: "Unknown",
    tags: [
      "games",
      "linux",
      "gamemode",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S gamemode",
      },
      {
        method: "apt",
        command: "sudo apt install gamemode",
      },
      {
        method: "dnf",
        command: "sudo dnf install gamemode",
      },
      {
        method: "zypper",
        command: "sudo zypper install gamemode",
      },
    ],
  },
  {
    id: "antimicrox",
    name: "AntiMicroX",
    tagline: "Essential tool for games",
    description: "AntiMicroX is an application for Linux. Auto-generated entry.",
    category: "games",
    homepage: "https://github.com/search?q=AntiMicroX",
    license: "Unknown",
    tags: [
      "games",
      "linux",
      "antimicrox",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S antimicrox",
      },
      {
        method: "apt",
        command: "sudo apt install antimicrox",
      },
      {
        method: "dnf",
        command: "sudo dnf install antimicrox",
      },
      {
        method: "zypper",
        command: "sudo zypper install antimicrox",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.antimicrox.antimicrox",
      },
    ],
  },
  {
    id: "goverlay",
    name: "GOverlay",
    tagline: "Essential tool for games",
    description: "GOverlay is an application for Linux. Auto-generated entry.",
    category: "games",
    homepage: "https://github.com/search?q=GOverlay",
    license: "Unknown",
    tags: [
      "games",
      "linux",
      "goverlay",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S goverlay",
      },
      {
        method: "apt",
        command: "sudo apt install goverlay",
      },
      {
        method: "dnf",
        command: "sudo dnf install goverlay",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.github.benjamimgois.goverlay",
      },
    ],
  },
  {
    id: "logseq",
    name: "Logseq",
    tagline: "Essential tool for documents",
    description: "Logseq is an application for Linux. Auto-generated entry.",
    category: "documents",
    homepage: "https://github.com/search?q=Logseq",
    license: "Unknown",
    tags: [
      "documents",
      "linux",
      "logseq",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S logseq-desktop-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.logseq.Logseq",
      },
    ],
  },
  {
    id: "joplin",
    name: "Joplin",
    tagline: "Essential tool for documents",
    description: "Joplin is an application for Linux. Auto-generated entry.",
    category: "documents",
    homepage: "https://github.com/search?q=Joplin",
    license: "Unknown",
    tags: [
      "documents",
      "linux",
      "joplin",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S joplin-desktop",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub net.cozic.joplin_desktop",
      },
      {
        method: "snap",
        command: "sudo snap install joplin-desktop",
      },
    ],
  },
  {
    id: "zathura",
    name: "Zathura",
    tagline: "Essential tool for documents",
    description: "Zathura is an application for Linux. Auto-generated entry.",
    category: "documents",
    homepage: "https://github.com/search?q=Zathura",
    license: "Unknown",
    tags: [
      "documents",
      "linux",
      "zathura",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S zathura zathura-pdf-mupdf",
      },
      {
        method: "apt",
        command: "sudo apt install zathura",
      },
      {
        method: "dnf",
        command: "sudo dnf install zathura zathura-pdf-mupdf",
      },
      {
        method: "zypper",
        command: "sudo zypper install zathura",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.pwmt.zathura",
      },
    ],
  },
  {
    id: "xournal",
    name: "Xournal++",
    tagline: "Essential tool for documents",
    description: "Xournal++ is an application for Linux. Auto-generated entry.",
    category: "documents",
    homepage: "https://github.com/search?q=Xournal%2B%2B",
    license: "Unknown",
    tags: [
      "documents",
      "linux",
      "xournal",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S xournalpp",
      },
      {
        method: "apt",
        command: "sudo apt install xournalpp",
      },
      {
        method: "dnf",
        command: "sudo dnf install xournalpp",
      },
      {
        method: "zypper",
        command: "sudo zypper install xournalpp",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub com.github.xournalpp.xournalpp",
      },
    ],
  },
  {
    id: "zotero",
    name: "Zotero",
    tagline: "Essential tool for documents",
    description: "Zotero is an application for Linux. Auto-generated entry.",
    category: "documents",
    homepage: "https://github.com/search?q=Zotero",
    license: "Unknown",
    tags: [
      "documents",
      "linux",
      "zotero",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S zotero-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.zotero.Zotero",
      },
    ],
  },
  {
    id: "trilium-notes",
    name: "Trilium Notes",
    tagline: "Essential tool for documents",
    description: "Trilium Notes is an application for Linux. Auto-generated entry.",
    category: "documents",
    homepage: "https://github.com/search?q=Trilium%20Notes",
    license: "Unknown",
    tags: [
      "documents",
      "linux",
      "trilium-notes",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S trilium-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub org.triliumnotes.Trilium",
      },
    ],
  },
  {
    id: "gnupg",
    name: "GnuPG",
    tagline: "Essential tool for security",
    description: "GnuPG is an application for Linux. Auto-generated entry.",
    category: "security",
    homepage: "https://github.com/search?q=GnuPG",
    license: "Unknown",
    tags: [
      "security",
      "linux",
      "gnupg",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S gnupg",
      },
      {
        method: "apt",
        command: "sudo apt install gnupg",
      },
      {
        method: "dnf",
        command: "sudo dnf install gnupg2",
      },
      {
        method: "zypper",
        command: "sudo zypper install gpg2",
      },
    ],
  },
  {
    id: "firejail",
    name: "Firejail",
    tagline: "Essential tool for security",
    description: "Firejail is an application for Linux. Auto-generated entry.",
    category: "security",
    homepage: "https://github.com/search?q=Firejail",
    license: "Unknown",
    tags: [
      "security",
      "linux",
      "firejail",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S firejail",
      },
      {
        method: "apt",
        command: "sudo apt install firejail",
      },
      {
        method: "dnf",
        command: "sudo dnf install firejail",
      },
      {
        method: "zypper",
        command: "sudo zypper install firejail",
      },
    ],
  },
  {
    id: "clamav",
    name: "ClamAV",
    tagline: "Essential tool for security",
    description: "ClamAV is an application for Linux. Auto-generated entry.",
    category: "security",
    homepage: "https://github.com/search?q=ClamAV",
    license: "Unknown",
    tags: [
      "security",
      "linux",
      "clamav",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S clamav",
      },
      {
        method: "apt",
        command: "sudo apt install clamav",
      },
      {
        method: "dnf",
        command: "sudo dnf install clamav",
      },
      {
        method: "zypper",
        command: "sudo zypper install clamav",
      },
    ],
  },
  {
    id: "ente-auth",
    name: "Ente Auth",
    tagline: "Essential tool for security",
    description: "Ente Auth is an application for Linux. Auto-generated entry.",
    category: "security",
    homepage: "https://github.com/search?q=Ente%20Auth",
    license: "Unknown",
    tags: [
      "security",
      "linux",
      "ente-auth",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S ente-auth-bin",
      },
      {
        method: "flatpak",
        command: "flatpak install flathub io.ente.auth",
      },
    ],
  },
  {
    id: "python-3",
    name: "Python 3",
    tagline: "Essential tool for development",
    description: "Python 3 is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Python%203",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "python-3",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S python",
      },
      {
        method: "apt",
        command: "sudo apt install python3",
      },
      {
        method: "dnf",
        command: "sudo dnf install python3",
      },
      {
        method: "zypper",
        command: "sudo zypper install python3",
      },
    ],
  },
  {
    id: "node-js",
    name: "Node.js",
    tagline: "Essential tool for development",
    description: "Node.js is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Node.js",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "node-js",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S nodejs",
      },
      {
        method: "apt",
        command: "sudo apt install nodejs",
      },
      {
        method: "dnf",
        command: "sudo dnf install nodejs",
      },
      {
        method: "zypper",
        command: "sudo zypper install nodejs",
      },
    ],
  },
  {
    id: "go",
    name: "Go",
    tagline: "Essential tool for development",
    description: "Go is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Go",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "go",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S go",
      },
      {
        method: "apt",
        command: "sudo apt install golang-go",
      },
      {
        method: "dnf",
        command: "sudo dnf install golang",
      },
      {
        method: "zypper",
        command: "sudo zypper install go",
      },
    ],
  },
  {
    id: "rust",
    name: "Rust",
    tagline: "Essential tool for development",
    description: "Rust is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Rust",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "rust",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S rust",
      },
      {
        method: "apt",
        command: "sudo apt install rustc cargo",
      },
      {
        method: "dnf",
        command: "sudo dnf install rust cargo",
      },
      {
        method: "zypper",
        command: "sudo zypper install rust",
      },
      {
        method: "script",
        command: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
        steps: [
          {
            title: "Run the official installer",
            command: "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
          },
        ],
      },
    ],
  },
  {
    id: "ruby",
    name: "Ruby",
    tagline: "Essential tool for development",
    description: "Ruby is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Ruby",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "ruby",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ruby",
      },
      {
        method: "apt",
        command: "sudo apt install ruby",
      },
      {
        method: "dnf",
        command: "sudo dnf install ruby",
      },
      {
        method: "zypper",
        command: "sudo zypper install ruby",
      },
    ],
  },
  {
    id: "php",
    name: "PHP",
    tagline: "Essential tool for development",
    description: "PHP is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=PHP",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "php",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S php",
      },
      {
        method: "apt",
        command: "sudo apt install php-cli",
      },
      {
        method: "dnf",
        command: "sudo dnf install php-cli",
      },
      {
        method: "zypper",
        command: "sudo zypper install php8",
      },
    ],
  },
  {
    id: "openjdk",
    name: "OpenJDK",
    tagline: "Essential tool for development",
    description: "OpenJDK is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=OpenJDK",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "openjdk",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S jdk-openjdk",
      },
      {
        method: "apt",
        command: "sudo apt install default-jdk",
      },
      {
        method: "dnf",
        command: "sudo dnf install java-latest-openjdk-devel",
      },
      {
        method: "zypper",
        command: "sudo zypper install java-21-openjdk-devel",
      },
    ],
  },
  {
    id: "deno",
    name: "Deno",
    tagline: "Essential tool for development",
    description: "Deno is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Deno",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "deno",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S deno",
      },
      {
        method: "zypper",
        command: "sudo zypper install deno",
      },
      {
        method: "script",
        command: "curl -fsSL https://deno.land/install.sh | sh -s -- -y",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://deno.land/install.sh | sh -s -- -y",
          },
        ],
      },
    ],
  },
  {
    id: "bun",
    name: "Bun",
    tagline: "Essential tool for development",
    description: "Bun is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=Bun",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "bun",
    ],
    install: [
      {
        method: "aur",
        command: "paru -S bun-bin",
      },
      {
        method: "script",
        command: "curl -fsSL https://bun.sh/install | bash",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://bun.sh/install | bash",
          },
        ],
      },
    ],
  },
  {
    id: "npm",
    name: "npm",
    tagline: "Essential tool for development",
    description: "npm is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=npm",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "npm",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S npm",
      },
      {
        method: "apt",
        command: "sudo apt install npm",
      },
      {
        method: "dnf",
        command: "sudo dnf install npm",
      },
      {
        method: "zypper",
        command: "sudo zypper install npm",
      },
    ],
  },
  {
    id: "pnpm",
    name: "pnpm",
    tagline: "Essential tool for development",
    description: "pnpm is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=pnpm",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "pnpm",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S pnpm",
      },
      {
        method: "dnf",
        command: "sudo dnf install pnpm",
      },
      {
        method: "script",
        command: "curl -fsSL https://get.pnpm.io/install.sh | sh -",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -fsSL https://get.pnpm.io/install.sh | sh -",
          },
        ],
      },
    ],
  },
  {
    id: "yarn",
    name: "yarn",
    tagline: "Essential tool for development",
    description: "yarn is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=yarn",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "yarn",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S yarn",
      },
      {
        method: "apt",
        command: "sudo apt install yarnpkg",
      },
      {
        method: "dnf",
        command: "sudo dnf install yarnpkg",
      },
      {
        method: "zypper",
        command: "sudo zypper install yarn",
      },
    ],
  },
  {
    id: "uv",
    name: "uv",
    tagline: "Essential tool for development",
    description: "uv is an application for Linux. Auto-generated entry.",
    category: "development",
    homepage: "https://github.com/search?q=uv",
    license: "Unknown",
    tags: [
      "development",
      "linux",
      "uv",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S uv",
      },
      {
        method: "dnf",
        command: "sudo dnf install uv",
      },
      {
        method: "zypper",
        command: "sudo zypper install uv",
      },
      {
        method: "script",
        command: "curl -LsSf https://astral.sh/uv/install.sh | sh",
        steps: [
          {
            title: "Run the official installer",
            command: "curl -LsSf https://astral.sh/uv/install.sh | sh",
          },
        ],
      },
    ],
  },
  {
    id: "htop",
    name: "htop",
    tagline: "Essential tool for terminal",
    description: "htop is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=htop",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "htop",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S htop",
      },
      {
        method: "apt",
        command: "sudo apt install htop",
      },
      {
        method: "dnf",
        command: "sudo dnf install htop",
      },
      {
        method: "zypper",
        command: "sudo zypper install htop",
      },
    ],
  },
  {
    id: "eza",
    name: "eza",
    tagline: "Essential tool for terminal",
    description: "eza is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=eza",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "eza",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S eza",
      },
      {
        method: "apt",
        command: "sudo apt install eza",
      },
      {
        method: "dnf",
        command: "sudo dnf install eza",
      },
      {
        method: "zypper",
        command: "sudo zypper install eza",
      },
    ],
  },
  {
    id: "bat",
    name: "bat",
    tagline: "Essential tool for terminal",
    description: "bat is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=bat",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "bat",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S bat",
      },
      {
        method: "apt",
        command: "sudo apt install bat",
      },
      {
        method: "dnf",
        command: "sudo dnf install bat",
      },
      {
        method: "zypper",
        command: "sudo zypper install bat",
      },
    ],
  },
  {
    id: "fzf",
    name: "fzf",
    tagline: "Essential tool for terminal",
    description: "fzf is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=fzf",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "fzf",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S fzf",
      },
      {
        method: "apt",
        command: "sudo apt install fzf",
      },
      {
        method: "dnf",
        command: "sudo dnf install fzf",
      },
      {
        method: "zypper",
        command: "sudo zypper install fzf",
      },
    ],
  },
  {
    id: "ripgrep",
    name: "ripgrep",
    tagline: "Essential tool for terminal",
    description: "ripgrep is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=ripgrep",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "ripgrep",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ripgrep",
      },
      {
        method: "apt",
        command: "sudo apt install ripgrep",
      },
      {
        method: "dnf",
        command: "sudo dnf install ripgrep",
      },
      {
        method: "zypper",
        command: "sudo zypper install ripgrep",
      },
    ],
  },
  {
    id: "zoxide",
    name: "zoxide",
    tagline: "Essential tool for terminal",
    description: "zoxide is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=zoxide",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "zoxide",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S zoxide",
      },
      {
        method: "apt",
        command: "sudo apt install zoxide",
      },
      {
        method: "dnf",
        command: "sudo dnf install zoxide",
      },
      {
        method: "zypper",
        command: "sudo zypper install zoxide",
      },
    ],
  },
  {
    id: "tldr",
    name: "tldr",
    tagline: "Essential tool for terminal",
    description: "tldr is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=tldr",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "tldr",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S tealdeer",
      },
      {
        method: "apt",
        command: "sudo apt install tealdeer",
      },
      {
        method: "dnf",
        command: "sudo dnf install tealdeer",
      },
      {
        method: "zypper",
        command: "sudo zypper install tealdeer",
      },
    ],
  },
  {
    id: "wget",
    name: "wget",
    tagline: "Essential tool for terminal",
    description: "wget is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=wget",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "wget",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S wget",
      },
      {
        method: "apt",
        command: "sudo apt install wget",
      },
      {
        method: "dnf",
        command: "sudo dnf install wget",
      },
      {
        method: "zypper",
        command: "sudo zypper install wget",
      },
    ],
  },
  {
    id: "curl",
    name: "curl",
    tagline: "Essential tool for terminal",
    description: "curl is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=curl",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "curl",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S curl",
      },
      {
        method: "apt",
        command: "sudo apt install curl",
      },
      {
        method: "dnf",
        command: "sudo dnf install curl",
      },
      {
        method: "zypper",
        command: "sudo zypper install curl",
      },
    ],
  },
  {
    id: "aria2",
    name: "aria2",
    tagline: "Essential tool for terminal",
    description: "aria2 is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=aria2",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "aria2",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S aria2",
      },
      {
        method: "apt",
        command: "sudo apt install aria2",
      },
      {
        method: "dnf",
        command: "sudo dnf install aria2",
      },
      {
        method: "zypper",
        command: "sudo zypper install aria2",
      },
    ],
  },
  {
    id: "yazi",
    name: "yazi",
    tagline: "Essential tool for terminal",
    description: "yazi is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=yazi",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "yazi",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S yazi",
      },
      {
        method: "zypper",
        command: "sudo zypper install yazi",
      },
      {
        method: "snap",
        command: "sudo snap install yazi --classic",
      },
    ],
  },
  {
    id: "ranger",
    name: "ranger",
    tagline: "Essential tool for terminal",
    description: "ranger is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=ranger",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "ranger",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ranger",
      },
      {
        method: "apt",
        command: "sudo apt install ranger",
      },
      {
        method: "dnf",
        command: "sudo dnf install ranger",
      },
      {
        method: "zypper",
        command: "sudo zypper install ranger",
      },
    ],
  },
  {
    id: "ncdu",
    name: "ncdu",
    tagline: "Essential tool for terminal",
    description: "ncdu is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=ncdu",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "ncdu",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S ncdu",
      },
      {
        method: "apt",
        command: "sudo apt install ncdu",
      },
      {
        method: "dnf",
        command: "sudo dnf install ncdu",
      },
      {
        method: "zypper",
        command: "sudo zypper install ncdu",
      },
    ],
  },
  {
    id: "fd",
    name: "fd",
    tagline: "Essential tool for terminal",
    description: "fd is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=fd",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "fd",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S fd",
      },
      {
        method: "apt",
        command: "sudo apt install fd-find",
      },
      {
        method: "dnf",
        command: "sudo dnf install fd-find",
      },
      {
        method: "zypper",
        command: "sudo zypper install fd",
      },
    ],
  },
  {
    id: "zellij",
    name: "Zellij",
    tagline: "Essential tool for terminal",
    description: "Zellij is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Zellij",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "zellij",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S zellij",
      },
      {
        method: "dnf",
        command: "sudo dnf install zellij",
      },
      {
        method: "zypper",
        command: "sudo zypper install zellij",
      },
    ],
  },
  {
    id: "superfile",
    name: "Superfile",
    tagline: "Essential tool for terminal",
    description: "Superfile is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=Superfile",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "superfile",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S superfile",
      },
      {
        method: "script",
        command: "bash -c \"$(curl -sLo- https://superfile.netlify.app/install.sh)\"",
        steps: [
          {
            title: "Run the official installer",
            command: "bash -c \"$(curl -sLo- https://superfile.netlify.app/install.sh)\"",
          },
        ],
      },
    ],
  },
  {
    id: "rsync",
    name: "rsync",
    tagline: "Essential tool for terminal",
    description: "rsync is an application for Linux. Auto-generated entry.",
    category: "terminal",
    homepage: "https://github.com/search?q=rsync",
    license: "Unknown",
    tags: [
      "terminal",
      "linux",
      "rsync",
    ],
    install: [
      {
        method: "pacman",
        command: "sudo pacman -S rsync",
      },
      {
        method: "apt",
        command: "sudo apt install rsync",
      },
      {
        method: "dnf",
        command: "sudo dnf install rsync",
      },
      {
        method: "zypper",
        command: "sudo zypper install rsync",
      },
    ],
  },
]

export const SOFTWARE_MAP: Record<string, SoftwareEntry> = Object.fromEntries(
  SOFTWARE.map((entry) => [entry.id, entry])
)
