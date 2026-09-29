import type { SoftwareEntry } from "./types"

export const SOFTWARE: SoftwareEntry[] = [
  {
    "id": "firefox",
    "name": "Firefox",
    "tagline": "Fast, private, and secure web browser",
    "description": "Mozilla Firefox is a free and open-source web browser. Known for its strong privacy stance, customization options, and support for open web standards. Uses the Gecko rendering engine and is developed by the Mozilla Foundation.",
    "category": "browsers",
    "homepage": "https://www.mozilla.org/firefox/",
    "license": "MPL-2.0",
    "tags": [
      "browser",
      "web",
      "privacy",
      "gecko"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install firefox"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.mozilla.firefox"
      },
      {
        "method": "snap",
        "command": "sudo snap install firefox"
      }
    ]
  },
  {
    "id": "chromium",
    "name": "Chromium",
    "tagline": "Open-source browser project behind Chrome",
    "description": "Chromium is the open-source browser project that serves as the foundation for Google Chrome and many other browsers. It provides a fast, secure, and stable browsing experience using the Blink rendering engine.",
    "category": "browsers",
    "homepage": "https://www.chromium.org/",
    "license": "BSD-3-Clause",
    "tags": [
      "browser",
      "web",
      "blink"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install chromium-browser"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.chromium.Chromium"
      },
      {
        "method": "snap",
        "command": "sudo snap install chromium"
      }
    ]
  },
  {
    "id": "brave",
    "name": "Brave",
    "tagline": "Privacy-focused browser with built-in ad blocking",
    "description": "Brave is a free and open-source browser based on Chromium that blocks ads and website trackers out of the box. Includes built-in Tor for private browsing and optional crypto rewards system.",
    "category": "browsers",
    "homepage": "https://brave.com/",
    "license": "MPL-2.0",
    "tags": [
      "browser",
      "privacy",
      "adblock",
      "chromium"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.brave.Browser"
      },
      {
        "method": "apt",
        "command": "sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg && echo \"deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main\" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list && sudo apt update && sudo apt install -y brave-browser",
        "steps": [
          {
            "title": "Download Brave GPG Keyring",
            "command": "sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg",
            "description": "Imports the official cryptographic signing key"
          },
          {
            "title": "Add Brave Apt Repository",
            "command": "echo \"deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main\" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list",
            "description": "Configures package list source for Debian/Ubuntu"
          },
          {
            "title": "Refresh Package Index",
            "command": "sudo apt update",
            "description": "Syncs package lists from Brave's server"
          },
          {
            "title": "Install Brave Browser",
            "command": "sudo apt install -y brave-browser",
            "description": "Downloads and configures the latest stable binary"
          }
        ],
        "notes": "Official repository installation with automatic background updates"
      },
      {
        "method": "snap",
        "command": "sudo snap install brave"
      }
    ]
  },
  {
    "id": "vivaldi",
    "name": "Vivaldi",
    "tagline": "Highly customizable browser for power users",
    "description": "Vivaldi is a feature-rich, highly customizable web browser built for power users. Includes tab stacking, built-in note-taking, mouse gestures, and extensive theming options. Based on Chromium.",
    "category": "browsers",
    "homepage": "https://vivaldi.com/",
    "license": "Proprietary",
    "tags": [
      "browser",
      "customizable",
      "power-user"
    ],
    "install": [
      {
        "method": "deb",
        "command": "Download .deb from vivaldi.com"
      },
      {
        "method": "aur",
        "command": "yay -S vivaldi"
      }
    ]
  },
  {
    "id": "zen-browser",
    "name": "Zen Browser",
    "tagline": "Firefox-based browser focused on privacy and beauty",
    "description": "Zen Browser is a modern Firefox-based browser that emphasizes privacy, speed, and a beautiful user experience. Features a split-view, workspaces, and compact mode for efficient browsing.",
    "category": "browsers",
    "homepage": "https://zen-browser.app/",
    "license": "MPL-2.0",
    "tags": [
      "browser",
      "privacy",
      "firefox"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub app.zen_browser.zen"
      },
      {
        "method": "aur",
        "command": "yay -S zen-browser-bin"
      }
    ]
  },
  {
    "id": "tor-browser",
    "name": "Tor Browser",
    "tagline": "Anonymous browsing via the Tor network",
    "description": "Tor Browser isolates and routes web traffic through the encrypted Tor network to protect privacy and anonymity. Blocks trackers, defends against surveillance, and uses Firefox as its base.",
    "category": "browsers",
    "homepage": "https://www.torproject.org/",
    "license": "MPL-2.0",
    "tags": [
      "browser",
      "privacy",
      "anonymity",
      "tor"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.torproject.torbrowser-launcher"
      },
      {
        "method": "apt",
        "command": "sudo apt install torbrowser-launcher"
      }
    ]
  },
  {
    "id": "signal",
    "name": "Signal",
    "tagline": "End-to-end encrypted messaging",
    "description": "Signal is a free, open-source messaging app with end-to-end encryption for messages, voice, and video calls. Considered the gold standard for private communication. Developed by the Signal Foundation.",
    "category": "communications",
    "homepage": "https://signal.org/",
    "license": "AGPL-3.0",
    "tags": [
      "messaging",
      "encryption",
      "privacy",
      "voip"
    ],
    "featured": true,
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.signal.Signal"
      },
      {
        "method": "apt",
        "command": "Follow instructions at signal.org/download"
      },
      {
        "method": "aur",
        "command": "yay -S signal-desktop"
      }
    ]
  },
  {
    "id": "telegram",
    "name": "Telegram",
    "tagline": "Fast, cloud-based messaging with huge features",
    "description": "Telegram is a cloud-based messaging app with a focus on speed and security. Supports large group chats, channels, bots, file sharing up to 2GB, and optional end-to-end encrypted secret chats.",
    "category": "communications",
    "homepage": "https://telegram.org/",
    "license": "GPL-3.0",
    "tags": [
      "messaging",
      "cloud",
      "voip"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.telegram.desktop"
      },
      {
        "method": "apt",
        "command": "sudo snap install telegram-desktop"
      },
      {
        "method": "aur",
        "command": "yay -S telegram-desktop"
      }
    ]
  },
  {
    "id": "discord",
    "name": "Discord",
    "tagline": "Voice, video, and text chat for communities",
    "description": "Discord is a popular communication platform for communities, gamers, and teams. Offers voice channels, video calls, text messaging, screen sharing, and bot integrations. Available as a desktop app or web app.",
    "category": "communications",
    "homepage": "https://discord.com/",
    "license": "Proprietary",
    "tags": [
      "messaging",
      "voip",
      "gaming",
      "communities"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.discordapp.Discord"
      },
      {
        "method": "deb",
        "command": "Download .deb from discord.com"
      },
      {
        "method": "aur",
        "command": "yay -S discord"
      }
    ]
  },
  {
    "id": "slack",
    "name": "Slack",
    "tagline": "Team collaboration and messaging",
    "description": "Slack is a business messaging platform for team collaboration. Features channels, direct messages, file sharing, integrations with hundreds of services, and powerful search. Popular in professional environments.",
    "category": "communications",
    "homepage": "https://slack.com/",
    "license": "Proprietary",
    "tags": [
      "messaging",
      "team",
      "business",
      "collaboration"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.slack.Slack"
      },
      {
        "method": "deb",
        "command": "Download .deb from slack.com/downloads"
      },
      {
        "method": "snap",
        "command": "sudo snap install slack"
      }
    ]
  },
  {
    "id": "thunderbird",
    "name": "Thunderbird",
    "tagline": "Free, open-source email client",
    "description": "Mozilla Thunderbird is a free, open-source email, news, and chat client. Supports multiple accounts, RSS feeds, newsgroups, and includes a built-in calendar and contact manager. Highly extensible via add-ons.",
    "category": "communications",
    "homepage": "https://www.thunderbird.net/",
    "license": "MPL-2.0",
    "tags": [
      "email",
      "client",
      "calendar",
      "rss"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.mozilla.Thunderbird"
      },
      {
        "method": "apt",
        "command": "sudo apt install thunderbird"
      }
    ]
  },
  {
    "id": "element",
    "name": "Element",
    "tagline": "Matrix-based decentralized messaging",
    "description": "Element is a Matrix-based messaging client offering end-to-end encrypted, decentralized communication. Supports group chats, voice/video calls, file sharing, and bridges to other networks like IRC, Slack, and Discord.",
    "category": "communications",
    "homepage": "https://element.io/",
    "license": "AGPL-3.0",
    "tags": [
      "messaging",
      "matrix",
      "decentralized",
      "encryption"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub im.riot.Riot"
      },
      {
        "method": "apt",
        "command": "sudo apt install element-desktop"
      },
      {
        "method": "aur",
        "command": "yay -S element-desktop"
      }
    ]
  },
  {
    "id": "vscode",
    "name": "VS Code",
    "tagline": "Popular extensible code editor by Microsoft",
    "description": "Visual Studio Code is a free, source-available code editor with excellent TypeScript, JavaScript, and Python support. Features an integrated terminal, Git integration, debugging, and a massive extension marketplace.",
    "category": "development",
    "homepage": "https://code.visualstudio.com/",
    "license": "MIT",
    "tags": [
      "editor",
      "ide",
      "microsoft",
      "extensions"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg && sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg && echo \"deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main\" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null && rm -f packages.microsoft.gpg && sudo apt update && sudo apt install -y code",
        "steps": [
          {
            "title": "Download Microsoft Key",
            "command": "wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg",
            "description": "Retrieves Microsoft repository signing key"
          },
          {
            "title": "Install Keyring to Apt",
            "command": "sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg && rm -f packages.microsoft.gpg",
            "description": "Configures trusted key location"
          },
          {
            "title": "Add VS Code Repository",
            "command": "echo \"deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main\" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null",
            "description": "Creates apt sources list entry"
          },
          {
            "title": "Update & Install VS Code",
            "command": "sudo apt update && sudo apt install -y code",
            "description": "Fetches metadata and installs editor binary"
          }
        ],
        "notes": "Official Microsoft apt repository"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.visualstudio.code"
      },
      {
        "method": "deb",
        "command": "Download .deb from code.visualstudio.com"
      },
      {
        "method": "snap",
        "command": "sudo snap install code --classic"
      },
      {
        "method": "aur",
        "command": "yay -S visual-studio-code-bin"
      }
    ]
  },
  {
    "id": "neovim",
    "name": "Neovim",
    "tagline": "Modern, extensible Vim-fork editor",
    "description": "Neovim is a Vim-fork focused on extensibility and usability. Features a built-in LSP client, Lua scripting, async plugin architecture, and a modern terminal UI. The most popular Vim distribution among new power users.",
    "category": "development",
    "homepage": "https://neovim.io/",
    "license": "Apache-2.0",
    "tags": [
      "editor",
      "vim",
      "terminal",
      "lsp",
      "lua"
    ],
    "featured": true,
    "install": [
      {
        "method": "pacman",
        "command": "sudo pacman -S neovim"
      },
      {
        "method": "aur",
        "command": "paru -S neovim"
      },
      {
        "method": "apt",
        "command": "sudo apt install neovim"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub io.neovim.nvim"
      }
    ]
  },
  {
    "id": "zed",
    "name": "Zed",
    "tagline": "Blazing-fast collaborative code editor",
    "description": "Zed is a high-performance, GPU-accelerated code editor built in Rust by the creators of Atom. Features real-time collaboration, built-in terminal, and excellent language support. Open source as of 2024.",
    "category": "development",
    "homepage": "https://zed.dev/",
    "license": "GPL-3.0",
    "tags": [
      "editor",
      "rust",
      "collaboration",
      "gpu"
    ],
    "install": [
      {
        "method": "aur",
        "command": "yay -S zed"
      },
      {
        "method": "manual",
        "command": "Download from zed.dev"
      }
    ]
  },
  {
    "id": "docker",
    "name": "Docker",
    "tagline": "Container platform for building and shipping apps",
    "description": "Docker is a platform for developing, shipping, and running applications in containers. Provides a consistent runtime environment, simplifies deployment, and integrates with CI/CD pipelines. Industry standard for containerization.",
    "category": "development",
    "homepage": "https://www.docker.com/",
    "license": "Apache-2.0",
    "tags": [
      "containers",
      "devops",
      "deployment"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg && sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg && echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io && sudo usermod -aG docker $USER",
        "steps": [
          {
            "title": "Install Prerequisites",
            "command": "sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg",
            "description": "Installs SSL certificates and curl"
          },
          {
            "title": "Download Docker GPG Key",
            "command": "sudo install -m 0755 -d /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg && sudo chmod a+r /etc/apt/keyrings/docker.gpg",
            "description": "Imports official Docker signing key"
          },
          {
            "title": "Configure Apt Repository",
            "command": "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
            "description": "Adds repository for your Ubuntu/Debian release"
          },
          {
            "title": "Install Docker Engine & Compose",
            "command": "sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
            "description": "Installs core daemon, CLI, and plugins"
          },
          {
            "title": "Configure User Permissions",
            "command": "sudo usermod -aG docker $USER",
            "description": "Allows executing docker commands without sudo"
          }
        ],
        "notes": "Full official Docker CE installation with Compose and non-root setup"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S docker docker-compose && sudo systemctl enable --now docker"
      },
      {
        "method": "aur",
        "command": "yay -S docker"
      }
    ]
  },
  {
    "id": "podman",
    "name": "Podman",
    "tagline": "Daemonless, rootless container engine",
    "description": "Podman is a daemonless, rootless container engine that provides a Docker-compatible command line interface. Developed by Red Hat, it is a drop-in replacement for Docker with better security defaults.",
    "category": "development",
    "homepage": "https://podman.io/",
    "license": "Apache-2.0",
    "tags": [
      "containers",
      "rootless",
      "red-hat",
      "oci"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install podman"
      },
      {
        "method": "dnf",
        "command": "sudo dnf install podman"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S podman"
      }
    ]
  },
  {
    "id": "git",
    "name": "Git",
    "tagline": "Distributed version control system",
    "description": "Git is a free and open-source distributed version control system. Handles projects of any size with speed, efficiency, and a branching model that enables powerful workflows. The backbone of modern software development.",
    "category": "development",
    "homepage": "https://git-scm.com/",
    "license": "GPL-2.0",
    "tags": [
      "vcs",
      "version-control",
      "scm"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install git"
      },
      {
        "method": "dnf",
        "command": "sudo dnf install git"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S git"
      }
    ]
  },
  {
    "id": "postman",
    "name": "Postman",
    "tagline": "API development and testing platform",
    "description": "Postman is a collaboration platform for API development. Allows you to design, test, document, and share APIs. Features a graphical interface for building HTTP requests, automated testing, and environment management.",
    "category": "development",
    "homepage": "https://www.postman.com/",
    "license": "Proprietary",
    "tags": [
      "api",
      "http",
      "testing",
      "rest"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.getpostman.Postman"
      },
      {
        "method": "snap",
        "command": "sudo snap install postman"
      }
    ]
  },
  {
    "id": "libreoffice",
    "name": "LibreOffice",
    "tagline": "Free, open-source office suite",
    "description": "LibreOffice is a free and open-source office suite with a word processor (Writer), spreadsheet (Calc), presentation (Impress), drawing (Draw), database (Base), and math (Math) tools. Compatible with Microsoft Office formats.",
    "category": "documents",
    "homepage": "https://www.libreoffice.org/",
    "license": "MPL-2.0",
    "tags": [
      "office",
      "suite",
      "word",
      "spreadsheet",
      "presentation"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install libreoffice"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.libreoffice.LibreOffice"
      }
    ]
  },
  {
    "id": "onlyoffice",
    "name": "OnlyOffice",
    "tagline": "Office suite with excellent MS Office compatibility",
    "description": "OnlyOffice is an office suite with excellent Microsoft Office format compatibility. Includes document, spreadsheet, and presentation editors. Also offers a self-hosted document server for collaboration.",
    "category": "documents",
    "homepage": "https://www.onlyoffice.com/",
    "license": "AGPL-3.0",
    "tags": [
      "office",
      "suite",
      "collaboration"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.onlyoffice.desktopeditors"
      },
      {
        "method": "deb",
        "command": "Download .deb from onlyoffice.com"
      }
    ]
  },
  {
    "id": "obsidian",
    "name": "Obsidian",
    "tagline": "Knowledge base on top of a local Markdown folder",
    "description": "Obsidian is a powerful note-taking and knowledge management app that stores notes as plain Markdown files. Features backlinks, graph view, canvas, and a rich plugin ecosystem. Your data stays local and under your control.",
    "category": "documents",
    "homepage": "https://obsidian.md/",
    "license": "Proprietary",
    "tags": [
      "notes",
      "markdown",
      "knowledge-base",
      "pkms"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub md.obsidian.Obsidian"
      },
      {
        "method": "deb",
        "command": "Download .deb from obsidian.md"
      },
      {
        "method": "aur",
        "command": "yay -S obsidian"
      }
    ]
  },
  {
    "id": "okular",
    "name": "Okular",
    "tagline": "Universal document viewer by KDE",
    "description": "Okular is a universal document viewer developed by KDE. Supports PDF, EPUB, DjVu, CHM, Comics, and many more formats. Features annotation tools, bookmarks, and excellent rendering quality.",
    "category": "documents",
    "homepage": "https://okular.kde.org/",
    "license": "GPL-2.0",
    "tags": [
      "pdf",
      "viewer",
      "kde",
      "document"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install okular"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.kde.okular"
      }
    ]
  },
  {
    "id": "steam",
    "name": "Steam",
    "tagline": "Gaming platform and store by Valve",
    "description": "Steam is the largest PC gaming platform by Valve. Provides game purchasing, automatic updates, community features, and Proton for running Windows games on Linux. Includes Steam Workshop for mods.",
    "category": "games",
    "homepage": "https://store.steampowered.com/",
    "license": "Proprietary",
    "tags": [
      "gaming",
      "store",
      "proton",
      "valve"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install steam"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.valvesoftware.Steam"
      },
      {
        "method": "aur",
        "command": "yay -S steam"
      }
    ]
  },
  {
    "id": "lutris",
    "name": "Lutris",
    "tagline": "Open gaming platform for all your games",
    "description": "Lutris is a gaming platform that helps you install and manage games from various sources. Supports Steam, GOG, Epic, emulators, and more. Includes install scripts for thousands of games and manages Wine prefixes.",
    "category": "games",
    "homepage": "https://lutris.net/",
    "license": "GPL-3.0",
    "tags": [
      "gaming",
      "emulation",
      "wine",
      "manager"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub net.lutris.Lutris"
      },
      {
        "method": "apt",
        "command": "Follow lutris.net download instructions"
      },
      {
        "method": "aur",
        "command": "yay -S lutris"
      }
    ]
  },
  {
    "id": "heroic",
    "name": "Heroic Games Launcher",
    "tagline": "GOG and Epic Games launcher for Linux",
    "description": "Heroic Games Launcher is a native Linux GUI for GOG and Epic Games Store. Lets you install, update, and play games from both stores with Wine/Proton support. Features cloud saves and game library management.",
    "category": "games",
    "homepage": "https://heroicgameslauncher.com/",
    "license": "GPL-3.0",
    "tags": [
      "gaming",
      "epic",
      "gog",
      "wine"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.heroicgameslauncher.hgl"
      },
      {
        "method": "aur",
        "command": "yay -S heroic-games-launcher-bin"
      }
    ]
  },
  {
    "id": "wine",
    "name": "WINE",
    "tagline": "Run Windows applications on Linux",
    "description": "WINE is a compatibility layer capable of running Windows applications on Linux, macOS, and BSD. Translates Windows API calls to POSIX calls. The foundation for Proton and many game compatibility setups.",
    "category": "games",
    "homepage": "https://www.winehq.org/",
    "license": "LGPL-2.1",
    "tags": [
      "compatibility",
      "windows",
      "gaming"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install wine"
      },
      {
        "method": "dnf",
        "command": "sudo dnf install wine"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S wine"
      }
    ]
  },
  {
    "id": "vlc",
    "name": "VLC",
    "tagline": "Plays everything, everywhere",
    "description": "VLC is a free and open-source media player that plays virtually any audio and video format. Supports streaming, subtitles, screen recording, and a wide range of codecs without needing external packs.",
    "category": "multimedia",
    "homepage": "https://www.videolan.org/",
    "license": "GPL-2.0",
    "tags": [
      "player",
      "video",
      "audio",
      "media"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install vlc"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.videolan.VLC"
      },
      {
        "method": "snap",
        "command": "sudo snap install vlc"
      }
    ]
  },
  {
    "id": "obs-studio",
    "name": "OBS Studio",
    "tagline": "Free, open-source streaming and recording",
    "description": "OBS Studio is free and open-source software for video recording and live streaming. Supports multiple sources, scenes, filters, transitions, and plugins. The industry standard for content creators on Linux.",
    "category": "multimedia",
    "homepage": "https://obsproject.com/",
    "license": "GPL-2.0",
    "tags": [
      "streaming",
      "recording",
      "video",
      "broadcasting"
    ],
    "featured": true,
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.obsproject.Studio"
      },
      {
        "method": "apt",
        "command": "sudo apt install obs-studio"
      },
      {
        "method": "aur",
        "command": "yay -S obs-studio"
      }
    ]
  },
  {
    "id": "audacity",
    "name": "Audacity",
    "tagline": "Free, open-source audio editor",
    "description": "Audacity is a free, open-source, cross-platform audio editor. Supports recording, editing, mixing, and exporting audio. Includes effects, noise reduction, multi-track editing, and support for various audio formats.",
    "category": "multimedia",
    "homepage": "https://www.audacityteam.org/",
    "license": "GPL-2.0",
    "tags": [
      "audio",
      "editor",
      "recording",
      "music"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install audacity"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.audacityteam.Audacity"
      }
    ]
  },
  {
    "id": "kdenlive",
    "name": "Kdenlive",
    "tagline": "Free, open-source video editor",
    "description": "Kdenlive is a free, open-source multi-track video editor built on the MLT framework. Supports a wide range of formats, effects, transitions, and timeline editing. A professional-grade NLE for Linux.",
    "category": "multimedia",
    "homepage": "https://kdenlive.org/",
    "license": "GPL-3.0",
    "tags": [
      "video",
      "editor",
      "nle",
      "kde"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.kde.kdenlive"
      },
      {
        "method": "apt",
        "command": "sudo apt install kdenlive"
      }
    ]
  },
  {
    "id": "handbrake",
    "name": "HandBrake",
    "tagline": "Open-source video transcoder",
    "description": "HandBrake is a tool for converting video from nearly any format to a selection of modern, widely supported codecs. Features hardware acceleration, batch encoding, chapter markers, and subtitles.",
    "category": "multimedia",
    "homepage": "https://handbrake.fr/",
    "license": "GPL-2.0",
    "tags": [
      "video",
      "transcoder",
      "converter",
      "encoder"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub fr.handbrake.ghb"
      },
      {
        "method": "apt",
        "command": "sudo apt install handbrake"
      },
      {
        "method": "aur",
        "command": "yay -S handbrake"
      }
    ]
  },
  {
    "id": "nextcloud",
    "name": "Nextcloud",
    "tagline": "Self-hosted cloud storage and collaboration",
    "description": "Nextcloud is a self-hosted cloud storage platform with file sync, sharing, calendar, contacts, and collaboration features. Includes a rich app ecosystem and end-to-end encryption. A privacy-focused alternative to Google Drive.",
    "category": "self-hosted",
    "homepage": "https://nextcloud.com/",
    "license": "AGPL-3.0",
    "tags": [
      "cloud",
      "storage",
      "self-hosted",
      "collaboration"
    ],
    "featured": true,
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.nextcloud.desktopclient"
      },
      {
        "method": "manual",
        "command": "Docker: docker run nextcloud"
      },
      {
        "method": "apt",
        "command": "Follow nextcloud.com/install guide"
      }
    ]
  },
  {
    "id": "jellyfin",
    "name": "Jellyfin",
    "tagline": "Free, open-source media server",
    "description": "Jellyfin is a free, open-source media system that lets you stream your movies, TV shows, and music to any device. No tracking, no premium tiers, no data collection. A volunteer-built alternative to Plex.",
    "category": "self-hosted",
    "homepage": "https://jellyfin.org/",
    "license": "GPL-2.0",
    "tags": [
      "media",
      "server",
      "streaming",
      "self-hosted"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.jellyfin.JellyfinServer"
      },
      {
        "method": "manual",
        "command": "Docker: docker run jellyfin/jellyfin"
      },
      {
        "method": "aur",
        "command": "yay -S jellyfin"
      }
    ]
  },
  {
    "id": "vaultwarden",
    "name": "Vaultwarden",
    "tagline": "Lightweight Bitwarden-compatible server",
    "description": "Vaultwarden is a lightweight, self-hosted password manager server compatible with Bitwarden clients. Written in Rust, it uses minimal resources while providing the full Bitwarden API including organizations and attachments.",
    "category": "self-hosted",
    "homepage": "https://github.com/dani-garcia/vaultwarden",
    "license": "AGPL-3.0",
    "tags": [
      "password",
      "security",
      "self-hosted",
      "bitwarden"
    ],
    "install": [
      {
        "method": "manual",
        "command": "Docker: docker run vaultwarden/server"
      },
      {
        "method": "aur",
        "command": "yay -S vaultwarden-bin"
      }
    ]
  },
  {
    "id": "home-assistant",
    "name": "Home Assistant",
    "tagline": "Open-source home automation platform",
    "description": "Home Assistant is a free, open-source home automation platform focused on local control and privacy. Integrates with thousands of smart devices and services. Supports automation, dashboards, and voice assistants.",
    "category": "self-hosted",
    "homepage": "https://www.home-assistant.io/",
    "license": "Apache-2.0",
    "tags": [
      "iot",
      "automation",
      "smart-home",
      "self-hosted"
    ],
    "install": [
      {
        "method": "manual",
        "command": "Docker: docker run homeassistant/home-assistant"
      },
      {
        "method": "aur",
        "command": "yay -S home-assistant"
      }
    ]
  },
  {
    "id": "7zip",
    "name": "7-Zip",
    "tagline": "High-ratio file archiver",
    "description": "7-Zip is a free, open-source file archiver with a high compression ratio. Supports 7z, ZIP, RAR, TAR, GZIP and many other formats. Includes a file manager and AES-256 encryption for secure archives.",
    "category": "utilities",
    "homepage": "https://www.7-zip.org/",
    "license": "LGPL-2.1",
    "tags": [
      "archive",
      "compression",
      "files"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install p7zip-full"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.7zip.7zip"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S p7zip"
      }
    ]
  },
  {
    "id": "1password",
    "name": "1Password",
    "tagline": "Premium password manager",
    "description": "1Password is a premium password manager that stores and autofills passwords, credit cards, and secure notes. Features Watchtower for breach monitoring, travel mode, and family/team sharing. Native Linux client available.",
    "category": "utilities",
    "homepage": "https://1password.com/",
    "license": "Proprietary",
    "tags": [
      "password",
      "security",
      "manager"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.onepassword.OnePassword"
      },
      {
        "method": "deb",
        "command": "Download .deb from 1password.com/downloads"
      },
      {
        "method": "aur",
        "command": "yay -S 1password"
      }
    ]
  },
  {
    "id": "bitwarden",
    "name": "Bitwarden",
    "tagline": "Free, open-source password manager",
    "description": "Bitwarden is a free, open-source password manager that stores and autofills credentials. Offers cross-platform sync, secure sharing, and a built-in authenticator. Self-host with Vaultwarden for full control.",
    "category": "utilities",
    "homepage": "https://bitwarden.com/",
    "license": "GPL-3.0",
    "tags": [
      "password",
      "security",
      "manager",
      "open-source"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.bitwarden.desktop"
      },
      {
        "method": "aur",
        "command": "yay -S bitwarden"
      }
    ]
  },
  {
    "id": "anydesk",
    "name": "AnyDesk",
    "tagline": "Remote desktop application",
    "description": "AnyDesk is a remote desktop application that provides fast, secure access to computers from anywhere. Features low latency, file transfer, and session recording. Popular for IT support and remote work.",
    "category": "utilities",
    "homepage": "https://anydesk.com/",
    "license": "Proprietary",
    "tags": [
      "remote",
      "desktop",
      "support"
    ],
    "install": [
      {
        "method": "deb",
        "command": "Download .deb from anydesk.com/downloads"
      },
      {
        "method": "aur",
        "command": "yay -S anydesk"
      }
    ]
  },
  {
    "id": "flatseal",
    "name": "Flatseal",
    "tagline": "Manage Flatpak permissions",
    "description": "Flatseal is a graphical utility to view and modify permissions of Flatpak applications. Lets you grant or revoke access to files, devices, network, and more. Essential for managing your Flatpak sandbox security.",
    "category": "utilities",
    "homepage": "https://github.com/tchx84/Flatseal",
    "license": "GPL-3.0",
    "tags": [
      "flatpak",
      "permissions",
      "security"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.github.tchx84.Flatseal"
      }
    ]
  },
  {
    "id": "alacritty",
    "name": "Alacritty",
    "tagline": "GPU-accelerated terminal emulator",
    "description": "Alacritty is a modern terminal emulator written in Rust with a strong focus on performance. Uses OpenGL for rendering, supports true colors, and is highly configurable via a TOML configuration file.",
    "category": "terminal",
    "homepage": "https://alacritty.org/",
    "license": "Apache-2.0",
    "tags": [
      "terminal",
      "gpu",
      "rust"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install alacritty"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.alacritty.Alacritty"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S alacritty"
      }
    ]
  },
  {
    "id": "kitty",
    "name": "Kitty",
    "tagline": "Fast, feature-rich GPU terminal",
    "description": "Kitty is a fast, feature-rich GPU-based terminal emulator. Supports tabs, splits, image rendering in terminal, ligatures, and is highly scriptable. Uses its own rendering engine for low input latency.",
    "category": "terminal",
    "homepage": "https://sw.kovidgoyal.net/kitty/",
    "license": "GPL-3.0",
    "tags": [
      "terminal",
      "gpu",
      "tabs",
      "splits"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install kitty"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kitty"
      },
      {
        "method": "aur",
        "command": "yay -S kitty"
      }
    ]
  },
  {
    "id": "tmux",
    "name": "tmux",
    "tagline": "Terminal multiplexer",
    "description": "tmux is a terminal multiplexer that lets you create and manage multiple terminal sessions in a single window. Supports splitting, detaching sessions, and scripting. Essential for terminal-based workflows.",
    "category": "terminal",
    "homepage": "https://github.com/tmux/tmux",
    "license": "ISC",
    "tags": [
      "terminal",
      "multiplexer",
      "sessions"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install tmux"
      },
      {
        "method": "dnf",
        "command": "sudo dnf install tmux"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S tmux"
      }
    ]
  },
  {
    "id": "btop",
    "name": "btop",
    "tagline": "Resource monitor with a beautiful UI",
    "description": "btop is a resource monitor that shows usage and stats for processor, memory, disks, network, and processes. Features a beautiful, customizable UI with mouse support. Written in C++ for excellent performance.",
    "category": "terminal",
    "homepage": "https://github.com/aristocratos/btop",
    "license": "Apache-2.0",
    "tags": [
      "monitor",
      "system",
      "processes",
      "performance"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install btop"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S btop"
      },
      {
        "method": "aur",
        "command": "yay -S btop"
      }
    ]
  },
  {
    "id": "gnome-tweaks",
    "name": "GNOME Tweaks",
    "tagline": "Advanced GNOME settings",
    "description": "GNOME Tweaks provides advanced settings for the GNOME desktop that are not available in the standard Settings app. Includes theme management, window behavior, font settings, and startup application configuration.",
    "category": "system",
    "homepage": "https://wiki.gnome.org/Apps/Tweaks",
    "license": "GPL-3.0",
    "tags": [
      "gnome",
      "settings",
      "customization"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install gnome-tweaks"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.gnome.Tweaks"
      }
    ]
  },
  {
    "id": "timeshift",
    "name": "Timeshift",
    "tagline": "System restore and backup tool",
    "description": "Timeshift is a system restore utility that takes incremental snapshots of your system. Lets you roll back to a previous state if something breaks. Supports rsync and BTRFS snapshot modes. Essential for system safety.",
    "category": "system",
    "homepage": "https://github.com/teejee2008/timeshift",
    "license": "GPL-2.0",
    "tags": [
      "backup",
      "restore",
      "snapshot",
      "system"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install timeshift"
      },
      {
        "method": "aur",
        "command": "yay -S timeshift"
      }
    ]
  },
  {
    "id": "gparted",
    "name": "GParted",
    "tagline": "GNOME partition editor",
    "description": "GParted is a free, open-source partition editor for managing disk partitions. Supports creating, resizing, moving, and deleting partitions. Works with ext2/3/4, NTFS, FAT, and many other filesystems.",
    "category": "system",
    "homepage": "https://gparted.org/",
    "license": "GPL-2.0",
    "tags": [
      "partition",
      "disk",
      "filesystem"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install gparted"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.gnome.GParted"
      }
    ]
  },
  {
    "id": "keepassxc",
    "name": "KeePassXC",
    "tagline": "Offline password manager",
    "description": "KeePassXC is a free, open-source, offline password manager. Stores credentials in an encrypted database file. Supports autofill, password generation, and browser integration via KeePassXC-Browser extension.",
    "category": "security",
    "homepage": "https://keepassxc.org/",
    "license": "GPL-3.0",
    "tags": [
      "password",
      "security",
      "offline",
      "encryption"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install keepassxc"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.keepassxc.KeePassXC"
      },
      {
        "method": "snap",
        "command": "sudo snap install keepassxc"
      }
    ]
  },
  {
    "id": "veracrypt",
    "name": "VeraCrypt",
    "tagline": "On-the-fly disk encryption",
    "description": "VeraCrypt is a free, open-source disk encryption software. Creates encrypted volumes and encrypts entire partitions. Based on TrueCrypt with improved security and performance. Supports hidden volumes and plausible deniability.",
    "category": "security",
    "homepage": "https://www.veracrypt.fr/",
    "license": "Apache-2.0",
    "tags": [
      "encryption",
      "disk",
      "security",
      "privacy"
    ],
    "install": [
      {
        "method": "deb",
        "command": "Download .deb from veracrypt.fr"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub fr.veracrypt.veracrypt"
      },
      {
        "method": "aur",
        "command": "yay -S veracrypt"
      }
    ]
  },
  {
    "id": "virtualbox",
    "name": "VirtualBox",
    "tagline": "x86 virtualization by Oracle",
    "description": "VirtualBox is a free, open-source x86 virtualization product. Lets you run multiple guest operating systems on your Linux host. Features snapshot support, shared folders, and a rich extension pack for USB and more.",
    "category": "virtualization",
    "homepage": "https://www.virtualbox.org/",
    "license": "GPL-3.0",
    "tags": [
      "vm",
      "virtualization",
      "oracle"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install virtualbox"
      },
      {
        "method": "aur",
        "command": "yay -S virtualbox"
      }
    ]
  },
  {
    "id": "virt-manager",
    "name": "virt-manager",
    "tagline": "KVM/QEMU virtual machine manager",
    "description": "virt-manager is a desktop user interface for managing KVM and QEMU virtual machines. Provides a graphical way to create, configure, and run VMs. The standard virtualization tool for Linux hosts with KVM support.",
    "category": "virtualization",
    "homepage": "https://virt-manager.org/",
    "license": "GPL-2.0",
    "tags": [
      "vm",
      "kvm",
      "qemu",
      "virtualization"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install virt-manager"
      },
      {
        "method": "dnf",
        "command": "sudo dnf install virt-manager"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S virt-manager"
      }
    ]
  },
  {
    "id": "anki",
    "name": "Anki",
    "tagline": "Spaced repetition flashcards",
    "description": "Anki is a free, open-source flashcard program that uses spaced repetition to help you memorize anything. Features a powerful scheduling algorithm, sync across devices, and a rich add-on ecosystem. Popular for language learning.",
    "category": "education",
    "homepage": "https://apps.ankiweb.net/",
    "license": "AGPL-3.0",
    "tags": [
      "flashcards",
      "learning",
      "spaced-repetition"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub net.ankiweb.Anki"
      },
      {
        "method": "apt",
        "command": "Follow apps.ankiweb.net download instructions"
      },
      {
        "method": "aur",
        "command": "yay -S anki"
      }
    ]
  },
  {
    "id": "stellarium",
    "name": "Stellarium",
    "tagline": "Free, open-source planetarium",
    "description": "Stellarium is a free, open-source planetarium software that renders a realistic 3D sky in real time. Shows stars, constellations, planets, and deep-sky objects. Used by astronomers and educators worldwide.",
    "category": "education",
    "homepage": "https://stellarium.org/",
    "license": "GPL-2.0",
    "tags": [
      "astronomy",
      "planetarium",
      "education"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install stellarium"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.stellarium.Stellarium"
      }
    ]
  },
  {
    "id": "inkscape",
    "name": "Inkscape",
    "tagline": "Free, open-source vector graphics editor",
    "description": "Inkscape is a free, open-source vector graphics editor. Supports SVG format natively and provides tools for drawing, shapes, text, gradients, and path manipulation. The leading open-source alternative to Adobe Illustrator.",
    "category": "graphics",
    "homepage": "https://inkscape.org/",
    "license": "GPL-2.0",
    "tags": [
      "vector",
      "svg",
      "graphics",
      "design"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install inkscape"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.inkscape.Inkscape"
      }
    ]
  },
  {
    "id": "blender",
    "name": "Blender",
    "tagline": "Free, open-source 3D creation suite",
    "description": "Blender is a free, open-source 3D creation suite. Supports modeling, sculpting, rigging, animation, simulation, rendering, compositing, video editing, and game creation. Used by professionals in film, games, and design.",
    "category": "graphics",
    "homepage": "https://www.blender.org/",
    "license": "GPL-3.0",
    "tags": [
      "3d",
      "modeling",
      "animation",
      "rendering"
    ],
    "featured": true,
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install blender"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.blender.Blender"
      },
      {
        "method": "snap",
        "command": "sudo snap install blender"
      }
    ]
  },
  {
    "id": "krita",
    "name": "Krita",
    "tagline": "Free digital painting application",
    "description": "Krita is a free, open-source digital painting application. Supports brush engines, layers, filters, vector tools, and animation. Popular among illustrators and concept artists. Includes HDR support and Python scripting.",
    "category": "graphics",
    "homepage": "https://krita.org/",
    "license": "GPL-3.0",
    "tags": [
      "painting",
      "drawing",
      "digital-art",
      "illustration"
    ],
    "install": [
      {
        "method": "apt",
        "command": "sudo apt install krita"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.kde.krita"
      },
      {
        "method": "snap",
        "command": "sudo snap install krita"
      }
    ]
  },
  {
    "id": "gimp",
    "name": "GIMP",
    "tagline": "GNU Image Manipulation Program",
    "description": "GIMP is an extensible cross-platform image editor used for photo retouching, image composition, and free-form drawing.",
    "category": "graphics",
    "homepage": "https://www.gimp.org/",
    "license": "GPL-3.0",
    "tags": [
      "photo",
      "image",
      "editing",
      "raster"
    ],
    "featured": true,
    "install": [
      {
        "method": "pacman",
        "command": "sudo pacman -S gimp"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.gimp.GIMP"
      },
      {
        "method": "apt",
        "command": "sudo apt install gimp"
      }
    ]
  },
  {
    "id": "ghostty",
    "name": "Ghostty",
    "tagline": "Fast, native, feature-rich GPU terminal in Zig",
    "description": "Ghostty is a modern terminal emulator built in Zig with native platform rendering (GTK on Linux), tabs, and instant performance.",
    "category": "terminal",
    "homepage": "https://ghostty.org/",
    "license": "MIT",
    "tags": [
      "terminal",
      "zig",
      "gpu",
      "fast"
    ],
    "featured": true,
    "install": [
      {
        "method": "aur",
        "command": "paru -S ghostty"
      },
      {
        "method": "paru",
        "command": "paru -S ghostty-bin"
      }
    ]
  },
  {
    "id": "vesktop",
    "name": "Vesktop",
    "tagline": "Vencord-powered Discord desktop with Wayland screensharing",
    "description": "Vesktop is a lightweight Discord desktop client giving you Vencord plugin integration, crisp audio, and full Wayland screensharing with system audio.",
    "category": "communications",
    "homepage": "https://github.com/Vencord/Vesktop",
    "license": "GPL-3.0",
    "tags": [
      "discord",
      "chat",
      "wayland",
      "vencord"
    ],
    "featured": true,
    "install": [
      {
        "method": "aur",
        "command": "paru -S vesktop-bin"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub dev.vencord.Vesktop"
      }
    ]
  },
  {
    "id": "fastfetch",
    "name": "fastfetch",
    "tagline": "Lightning-fast neofetch-like system info tool",
    "description": "Fastfetch is a neofetch-like tool for fetching system information and displaying it prettily, written in C for instant execution.",
    "category": "system",
    "homepage": "https://github.com/fastfetch-cli/fastfetch",
    "license": "MIT",
    "tags": [
      "sysinfo",
      "cli",
      "fast",
      "c"
    ],
    "featured": true,
    "install": [
      {
        "method": "pacman",
        "command": "sudo pacman -S fastfetch"
      },
      {
        "method": "apt",
        "command": "sudo apt install fastfetch"
      }
    ]
  },
  {
    "id": "flameshot",
    "name": "Flameshot",
    "tagline": "Powerful yet simple to use screenshot software",
    "description": "Flameshot is a feature-packed screenshot utility with built-in annotations, blur, arrows, pins, and direct cloud uploads.",
    "category": "utilities",
    "homepage": "https://flameshot.org/",
    "license": "GPL-3.0",
    "tags": [
      "screenshot",
      "capture",
      "annotations"
    ],
    "featured": true,
    "install": [
      {
        "method": "pacman",
        "command": "sudo pacman -S flameshot"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub org.flameshot.Flameshot"
      },
      {
        "method": "apt",
        "command": "sudo apt install flameshot"
      }
    ]
  },
  {
    "id": "heroic-games-launcher",
    "name": "Heroic Games Launcher",
    "tagline": "Native GOG, Epic Games, and Amazon Prime launcher",
    "description": "Heroic is an open-source gaming launcher for Epic Games, GOG, and Amazon Games using Wine, Proton, and DXVK.",
    "category": "games",
    "homepage": "https://heroicgameslauncher.com/",
    "license": "GPL-3.0",
    "tags": [
      "gaming",
      "epic",
      "gog",
      "proton"
    ],
    "featured": true,
    "install": [
      {
        "method": "pacman",
        "command": "sudo pacman -S heroic-games-launcher-bin"
      },
      {
        "method": "aur",
        "command": "paru -S heroic-games-launcher-bin"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.heroicgameslauncher.hgl"
      }
    ]
  },
  {
    "id": "protonup-qt",
    "name": "ProtonUp-Qt",
    "tagline": "Install and manage GE-Proton and Wine runners",
    "description": "ProtonUp-Qt makes it easy to install and update GE-Proton, Luxtorpeda, and custom Wine versions for Steam and Lutris.",
    "category": "games",
    "homepage": "https://davidotek.github.io/protonup-qt/",
    "license": "GPL-3.0",
    "tags": [
      "gaming",
      "proton",
      "wine",
      "steam"
    ],
    "featured": false,
    "install": [
      {
        "method": "aur",
        "command": "paru -S protonup-qt"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub net.davidotek.pupgui2"
      }
    ]
  },
  {
    "id": "calibre",
    "name": "Calibre",
    "tagline": "Comprehensive e-book manager and reader",
    "description": "Calibre is the one stop solution to all your e-book needs. Organize books into libraries, convert between formats, and sync to e-readers.",
    "category": "education",
    "homepage": "https://calibre-ebook.com/",
    "license": "GPL-3.0",
    "tags": [
      "ebook",
      "reader",
      "library"
    ],
    "featured": true,
    "install": [
      {
        "method": "pacman",
        "command": "sudo pacman -S calibre"
      },
      {
        "method": "flatpak",
        "command": "flatpak install flathub com.calibre_ebook.calibre"
      }
    ]
  },
  {
    "id": "librewolf",
    "name": "LibreWolf",
    "tagline": "Essential tool for browsers",
    "description": "LibreWolf is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=LibreWolf",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "librewolf"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub librewolf"
      },
      {
        "method": "apt",
        "command": "sudo apt install librewolf"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S librewolf"
      }
    ]
  },
  {
    "id": "waterfox",
    "name": "Waterfox",
    "tagline": "Essential tool for browsers",
    "description": "Waterfox is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Waterfox",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "waterfox"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub waterfox"
      },
      {
        "method": "apt",
        "command": "sudo apt install waterfox"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S waterfox"
      }
    ]
  },
  {
    "id": "google-chrome",
    "name": "Google Chrome",
    "tagline": "Essential tool for browsers",
    "description": "Google Chrome is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Google%20Chrome",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "google-chrome"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub google-chrome"
      },
      {
        "method": "apt",
        "command": "sudo apt install google-chrome"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S google-chrome"
      }
    ]
  },
  {
    "id": "helium",
    "name": "Helium",
    "tagline": "Essential tool for browsers",
    "description": "Helium is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Helium",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "helium"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub helium"
      },
      {
        "method": "apt",
        "command": "sudo apt install helium"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S helium"
      }
    ]
  },
  {
    "id": "ungoogled-chromium",
    "name": "Ungoogled Chromium",
    "tagline": "Essential tool for browsers",
    "description": "Ungoogled Chromium is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Ungoogled%20Chromium",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "ungoogled-chromium"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ungoogled-chromium"
      },
      {
        "method": "apt",
        "command": "sudo apt install ungoogled-chromium"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ungoogled-chromium"
      }
    ]
  },
  {
    "id": "konqueror",
    "name": "Konqueror",
    "tagline": "Essential tool for browsers",
    "description": "Konqueror is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Konqueror",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "konqueror"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub konqueror"
      },
      {
        "method": "apt",
        "command": "sudo apt install konqueror"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S konqueror"
      }
    ]
  },
  {
    "id": "falkon",
    "name": "Falkon",
    "tagline": "Essential tool for browsers",
    "description": "Falkon is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Falkon",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "falkon"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub falkon"
      },
      {
        "method": "apt",
        "command": "sudo apt install falkon"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S falkon"
      }
    ]
  },
  {
    "id": "gnome-web",
    "name": "GNOME Web",
    "tagline": "Essential tool for browsers",
    "description": "GNOME Web is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=GNOME%20Web",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "gnome-web"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub gnome-web"
      },
      {
        "method": "apt",
        "command": "sudo apt install gnome-web"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S gnome-web"
      }
    ]
  },
  {
    "id": "qutebrowser",
    "name": "qutebrowser",
    "tagline": "Essential tool for browsers",
    "description": "qutebrowser is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=qutebrowser",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "qutebrowser"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub qutebrowser"
      },
      {
        "method": "apt",
        "command": "sudo apt install qutebrowser"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S qutebrowser"
      }
    ]
  },
  {
    "id": "nyxt",
    "name": "Nyxt",
    "tagline": "Essential tool for browsers",
    "description": "Nyxt is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Nyxt",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "nyxt"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub nyxt"
      },
      {
        "method": "apt",
        "command": "sudo apt install nyxt"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S nyxt"
      }
    ]
  },
  {
    "id": "floorp",
    "name": "Floorp",
    "tagline": "Essential tool for browsers",
    "description": "Floorp is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Floorp",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "floorp"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub floorp"
      },
      {
        "method": "apt",
        "command": "sudo apt install floorp"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S floorp"
      }
    ]
  },
  {
    "id": "mullvad-browser",
    "name": "Mullvad Browser",
    "tagline": "Essential tool for browsers",
    "description": "Mullvad Browser is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Mullvad%20Browser",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "mullvad-browser"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub mullvad-browser"
      },
      {
        "method": "apt",
        "command": "sudo apt install mullvad-browser"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S mullvad-browser"
      }
    ]
  },
  {
    "id": "microsoft-edge",
    "name": "Microsoft Edge",
    "tagline": "Essential tool for browsers",
    "description": "Microsoft Edge is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Microsoft%20Edge",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "microsoft-edge"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub microsoft-edge"
      },
      {
        "method": "apt",
        "command": "sudo apt install microsoft-edge"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S microsoft-edge"
      }
    ]
  },
  {
    "id": "opera",
    "name": "Opera",
    "tagline": "Essential tool for browsers",
    "description": "Opera is an application for Linux. Auto-generated entry.",
    "category": "browsers",
    "homepage": "https://github.com/search?q=Opera",
    "license": "Unknown",
    "tags": [
      "browsers",
      "linux",
      "opera"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub opera"
      },
      {
        "method": "apt",
        "command": "sudo apt install opera"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S opera"
      }
    ]
  },
  {
    "id": "syncthing",
    "name": "Syncthing",
    "tagline": "Essential tool for utilities",
    "description": "Syncthing is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=Syncthing",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "syncthing"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub syncthing"
      },
      {
        "method": "apt",
        "command": "sudo apt install syncthing"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S syncthing"
      }
    ]
  },
  {
    "id": "qbittorrent",
    "name": "qBittorrent",
    "tagline": "Essential tool for utilities",
    "description": "qBittorrent is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=qBittorrent",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "qbittorrent"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub qbittorrent"
      },
      {
        "method": "apt",
        "command": "sudo apt install qbittorrent"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S qbittorrent"
      }
    ]
  },
  {
    "id": "transmission",
    "name": "Transmission",
    "tagline": "Essential tool for utilities",
    "description": "Transmission is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=Transmission",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "transmission"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub transmission"
      },
      {
        "method": "apt",
        "command": "sudo apt install transmission"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S transmission"
      }
    ]
  },
  {
    "id": "localsend",
    "name": "LocalSend",
    "tagline": "Essential tool for utilities",
    "description": "LocalSend is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=LocalSend",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "localsend"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub localsend"
      },
      {
        "method": "apt",
        "command": "sudo apt install localsend"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S localsend"
      }
    ]
  },
  {
    "id": "filezilla",
    "name": "FileZilla",
    "tagline": "Essential tool for utilities",
    "description": "FileZilla is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=FileZilla",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "filezilla"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub filezilla"
      },
      {
        "method": "apt",
        "command": "sudo apt install filezilla"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S filezilla"
      }
    ]
  },
  {
    "id": "dropbox",
    "name": "Dropbox",
    "tagline": "Essential tool for utilities",
    "description": "Dropbox is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=Dropbox",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "dropbox"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub dropbox"
      },
      {
        "method": "apt",
        "command": "sudo apt install dropbox"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S dropbox"
      }
    ]
  },
  {
    "id": "ab-download-manager",
    "name": "AB Download Manager",
    "tagline": "Essential tool for utilities",
    "description": "AB Download Manager is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=AB%20Download%20Manager",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "ab-download-manager"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ab-download-manager"
      },
      {
        "method": "apt",
        "command": "sudo apt install ab-download-manager"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ab-download-manager"
      }
    ]
  },
  {
    "id": "free-download-manager",
    "name": "Free Download Manager",
    "tagline": "Essential tool for utilities",
    "description": "Free Download Manager is an application for Linux. Auto-generated entry.",
    "category": "utilities",
    "homepage": "https://github.com/search?q=Free%20Download%20Manager",
    "license": "Unknown",
    "tags": [
      "utilities",
      "linux",
      "free-download-manager"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub free-download-manager"
      },
      {
        "method": "apt",
        "command": "sudo apt install free-download-manager"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S free-download-manager"
      }
    ]
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "tagline": "Essential tool for development",
    "description": "Cursor is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Cursor",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "cursor"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub cursor"
      },
      {
        "method": "apt",
        "command": "sudo apt install cursor"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S cursor"
      }
    ]
  },
  {
    "id": "vscodium",
    "name": "VSCodium",
    "tagline": "Essential tool for development",
    "description": "VSCodium is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=VSCodium",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "vscodium"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub vscodium"
      },
      {
        "method": "apt",
        "command": "sudo apt install vscodium"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S vscodium"
      }
    ]
  },
  {
    "id": "intellij-idea",
    "name": "Intellij IDEA",
    "tagline": "Essential tool for development",
    "description": "Intellij IDEA is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Intellij%20IDEA",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "intellij-idea"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub intellij-idea"
      },
      {
        "method": "apt",
        "command": "sudo apt install intellij-idea"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S intellij-idea"
      }
    ]
  },
  {
    "id": "pycharm",
    "name": "Pycharm",
    "tagline": "Essential tool for development",
    "description": "Pycharm is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Pycharm",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "pycharm"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub pycharm"
      },
      {
        "method": "apt",
        "command": "sudo apt install pycharm"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S pycharm"
      }
    ]
  },
  {
    "id": "clion",
    "name": "CLion",
    "tagline": "Essential tool for development",
    "description": "CLion is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=CLion",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "clion"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub clion"
      },
      {
        "method": "apt",
        "command": "sudo apt install clion"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S clion"
      }
    ]
  },
  {
    "id": "arduino-ide",
    "name": "Arduino IDE",
    "tagline": "Essential tool for development",
    "description": "Arduino IDE is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Arduino%20IDE",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "arduino-ide"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub arduino-ide"
      },
      {
        "method": "apt",
        "command": "sudo apt install arduino-ide"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S arduino-ide"
      }
    ]
  },
  {
    "id": "sublime-text",
    "name": "Sublime Text",
    "tagline": "Essential tool for development",
    "description": "Sublime Text is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Sublime%20Text",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "sublime-text"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub sublime-text"
      },
      {
        "method": "apt",
        "command": "sudo apt install sublime-text"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S sublime-text"
      }
    ]
  },
  {
    "id": "kate",
    "name": "Kate",
    "tagline": "Essential tool for development",
    "description": "Kate is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Kate",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "kate"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kate"
      },
      {
        "method": "apt",
        "command": "sudo apt install kate"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kate"
      }
    ]
  },
  {
    "id": "geany",
    "name": "Geany",
    "tagline": "Essential tool for development",
    "description": "Geany is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Geany",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "geany"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub geany"
      },
      {
        "method": "apt",
        "command": "sudo apt install geany"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S geany"
      }
    ]
  },
  {
    "id": "vim",
    "name": "Vim",
    "tagline": "Essential tool for development",
    "description": "Vim is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Vim",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "vim"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub vim"
      },
      {
        "method": "apt",
        "command": "sudo apt install vim"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S vim"
      }
    ]
  },
  {
    "id": "helix",
    "name": "Helix",
    "tagline": "Essential tool for development",
    "description": "Helix is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Helix",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "helix"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub helix"
      },
      {
        "method": "apt",
        "command": "sudo apt install helix"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S helix"
      }
    ]
  },
  {
    "id": "micro",
    "name": "Micro",
    "tagline": "Essential tool for development",
    "description": "Micro is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Micro",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "micro"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub micro"
      },
      {
        "method": "apt",
        "command": "sudo apt install micro"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S micro"
      }
    ]
  },
  {
    "id": "emacs",
    "name": "Emacs",
    "tagline": "Essential tool for development",
    "description": "Emacs is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Emacs",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "emacs"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub emacs"
      },
      {
        "method": "apt",
        "command": "sudo apt install emacs"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S emacs"
      }
    ]
  },
  {
    "id": "opencode",
    "name": "OpenCode",
    "tagline": "Essential tool for development",
    "description": "OpenCode is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=OpenCode",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "opencode"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub opencode"
      },
      {
        "method": "apt",
        "command": "sudo apt install opencode"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S opencode"
      }
    ]
  },
  {
    "id": "openai-codex",
    "name": "OpenAI Codex",
    "tagline": "Essential tool for development",
    "description": "OpenAI Codex is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=OpenAI%20Codex",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "openai-codex"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub openai-codex"
      },
      {
        "method": "apt",
        "command": "sudo apt install openai-codex"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S openai-codex"
      }
    ]
  },
  {
    "id": "gemini-cli",
    "name": "Gemini CLI",
    "tagline": "Essential tool for development",
    "description": "Gemini CLI is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Gemini%20CLI",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "gemini-cli"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub gemini-cli"
      },
      {
        "method": "apt",
        "command": "sudo apt install gemini-cli"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S gemini-cli"
      }
    ]
  },
  {
    "id": "claude-code",
    "name": "Claude Code",
    "tagline": "Essential tool for development",
    "description": "Claude Code is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Claude%20Code",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "claude-code"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub claude-code"
      },
      {
        "method": "apt",
        "command": "sudo apt install claude-code"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S claude-code"
      }
    ]
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "tagline": "Essential tool for development",
    "description": "Ollama is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Ollama",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "ollama"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ollama"
      },
      {
        "method": "apt",
        "command": "sudo apt install ollama"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ollama"
      }
    ]
  },
  {
    "id": "llama-cpp",
    "name": "llama.cpp",
    "tagline": "Essential tool for development",
    "description": "llama.cpp is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=llama.cpp",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "llama-cpp"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub llama-cpp"
      },
      {
        "method": "apt",
        "command": "sudo apt install llama-cpp"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S llama-cpp"
      }
    ]
  },
  {
    "id": "jan",
    "name": "Jan",
    "tagline": "Essential tool for development",
    "description": "Jan is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Jan",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "jan"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub jan"
      },
      {
        "method": "apt",
        "command": "sudo apt install jan"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S jan"
      }
    ]
  },
  {
    "id": "darktable",
    "name": "Darktable",
    "tagline": "Essential tool for graphics",
    "description": "Darktable is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=Darktable",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "darktable"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub darktable"
      },
      {
        "method": "apt",
        "command": "sudo apt install darktable"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S darktable"
      }
    ]
  },
  {
    "id": "freecad",
    "name": "FreeCAD",
    "tagline": "Essential tool for graphics",
    "description": "FreeCAD is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=FreeCAD",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "freecad"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub freecad"
      },
      {
        "method": "apt",
        "command": "sudo apt install freecad"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S freecad"
      }
    ]
  },
  {
    "id": "kicad",
    "name": "KiCad",
    "tagline": "Essential tool for graphics",
    "description": "KiCad is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=KiCad",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "kicad"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kicad"
      },
      {
        "method": "apt",
        "command": "sudo apt install kicad"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kicad"
      }
    ]
  },
  {
    "id": "ultimaker-cura",
    "name": "UltiMaker Cura",
    "tagline": "Essential tool for graphics",
    "description": "UltiMaker Cura is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=UltiMaker%20Cura",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "ultimaker-cura"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ultimaker-cura"
      },
      {
        "method": "apt",
        "command": "sudo apt install ultimaker-cura"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ultimaker-cura"
      }
    ]
  },
  {
    "id": "godot-engine",
    "name": "Godot Engine",
    "tagline": "Essential tool for graphics",
    "description": "Godot Engine is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=Godot%20Engine",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "godot-engine"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub godot-engine"
      },
      {
        "method": "apt",
        "command": "sudo apt install godot-engine"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S godot-engine"
      }
    ]
  },
  {
    "id": "kolourpaint",
    "name": "KolourPaint",
    "tagline": "Essential tool for graphics",
    "description": "KolourPaint is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=KolourPaint",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "kolourpaint"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kolourpaint"
      },
      {
        "method": "apt",
        "command": "sudo apt install kolourpaint"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kolourpaint"
      }
    ]
  },
  {
    "id": "orcaslicer",
    "name": "OrcaSlicer",
    "tagline": "Essential tool for graphics",
    "description": "OrcaSlicer is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=OrcaSlicer",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "orcaslicer"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub orcaslicer"
      },
      {
        "method": "apt",
        "command": "sudo apt install orcaslicer"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S orcaslicer"
      }
    ]
  },
  {
    "id": "davinci-resolve",
    "name": "DaVinci Resolve",
    "tagline": "Essential tool for graphics",
    "description": "DaVinci Resolve is an application for Linux. Auto-generated entry.",
    "category": "graphics",
    "homepage": "https://github.com/search?q=DaVinci%20Resolve",
    "license": "Unknown",
    "tags": [
      "graphics",
      "linux",
      "davinci-resolve"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub davinci-resolve"
      },
      {
        "method": "apt",
        "command": "sudo apt install davinci-resolve"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S davinci-resolve"
      }
    ]
  },
  {
    "id": "ivpn",
    "name": "IVPN",
    "tagline": "Essential tool for system",
    "description": "IVPN is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=IVPN",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "ivpn"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ivpn"
      },
      {
        "method": "apt",
        "command": "sudo apt install ivpn"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ivpn"
      }
    ]
  },
  {
    "id": "proton-vpn",
    "name": "Proton VPN",
    "tagline": "Essential tool for system",
    "description": "Proton VPN is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Proton%20VPN",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "proton-vpn"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub proton-vpn"
      },
      {
        "method": "apt",
        "command": "sudo apt install proton-vpn"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S proton-vpn"
      }
    ]
  },
  {
    "id": "mullvad-vpn",
    "name": "Mullvad VPN",
    "tagline": "Essential tool for system",
    "description": "Mullvad VPN is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Mullvad%20VPN",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "mullvad-vpn"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub mullvad-vpn"
      },
      {
        "method": "apt",
        "command": "sudo apt install mullvad-vpn"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S mullvad-vpn"
      }
    ]
  },
  {
    "id": "tailscale",
    "name": "Tailscale",
    "tagline": "Essential tool for system",
    "description": "Tailscale is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Tailscale",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "tailscale"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub tailscale"
      },
      {
        "method": "apt",
        "command": "sudo apt install tailscale"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S tailscale"
      }
    ]
  },
  {
    "id": "wireguard",
    "name": "WireGuard",
    "tagline": "Essential tool for system",
    "description": "WireGuard is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=WireGuard",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "wireguard"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub wireguard"
      },
      {
        "method": "apt",
        "command": "sudo apt install wireguard"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S wireguard"
      }
    ]
  },
  {
    "id": "openvpn",
    "name": "OpenVPN",
    "tagline": "Essential tool for system",
    "description": "OpenVPN is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=OpenVPN",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "openvpn"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub openvpn"
      },
      {
        "method": "apt",
        "command": "sudo apt install openvpn"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S openvpn"
      }
    ]
  },
  {
    "id": "nmap",
    "name": "Nmap",
    "tagline": "Essential tool for system",
    "description": "Nmap is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Nmap",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "nmap"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub nmap"
      },
      {
        "method": "apt",
        "command": "sudo apt install nmap"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S nmap"
      }
    ]
  },
  {
    "id": "openssh",
    "name": "OpenSSH",
    "tagline": "Essential tool for system",
    "description": "OpenSSH is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=OpenSSH",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "openssh"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub openssh"
      },
      {
        "method": "apt",
        "command": "sudo apt install openssh"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S openssh"
      }
    ]
  },
  {
    "id": "remmina",
    "name": "Remmina",
    "tagline": "Essential tool for system",
    "description": "Remmina is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Remmina",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "remmina"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub remmina"
      },
      {
        "method": "apt",
        "command": "sudo apt install remmina"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S remmina"
      }
    ]
  },
  {
    "id": "zsh",
    "name": "Zsh",
    "tagline": "Essential tool for terminal",
    "description": "Zsh is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Zsh",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "zsh"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub zsh"
      },
      {
        "method": "apt",
        "command": "sudo apt install zsh"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S zsh"
      }
    ]
  },
  {
    "id": "oh-my-zsh",
    "name": "Oh My Zsh",
    "tagline": "Essential tool for terminal",
    "description": "Oh My Zsh is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Oh%20My%20Zsh",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "oh-my-zsh"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub oh-my-zsh"
      },
      {
        "method": "apt",
        "command": "sudo apt install oh-my-zsh"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S oh-my-zsh"
      }
    ]
  },
  {
    "id": "fish",
    "name": "Fish",
    "tagline": "Essential tool for terminal",
    "description": "Fish is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Fish",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "fish"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub fish"
      },
      {
        "method": "apt",
        "command": "sudo apt install fish"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S fish"
      }
    ]
  },
  {
    "id": "starship",
    "name": "Starship",
    "tagline": "Essential tool for terminal",
    "description": "Starship is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Starship",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "starship"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub starship"
      },
      {
        "method": "apt",
        "command": "sudo apt install starship"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S starship"
      }
    ]
  },
  {
    "id": "wezterm",
    "name": "WezTerm",
    "tagline": "Essential tool for terminal",
    "description": "WezTerm is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=WezTerm",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "wezterm"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub wezterm"
      },
      {
        "method": "apt",
        "command": "sudo apt install wezterm"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S wezterm"
      }
    ]
  },
  {
    "id": "foot",
    "name": "Foot",
    "tagline": "Essential tool for terminal",
    "description": "Foot is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Foot",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "foot"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub foot"
      },
      {
        "method": "apt",
        "command": "sudo apt install foot"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S foot"
      }
    ]
  },
  {
    "id": "ptyxis",
    "name": "Ptyxis",
    "tagline": "Essential tool for terminal",
    "description": "Ptyxis is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Ptyxis",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "ptyxis"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ptyxis"
      },
      {
        "method": "apt",
        "command": "sudo apt install ptyxis"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ptyxis"
      }
    ]
  },
  {
    "id": "mpv",
    "name": "mpv",
    "tagline": "Essential tool for multimedia",
    "description": "mpv is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=mpv",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "mpv"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub mpv"
      },
      {
        "method": "apt",
        "command": "sudo apt install mpv"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S mpv"
      }
    ]
  },
  {
    "id": "celluloid",
    "name": "Celluloid",
    "tagline": "Essential tool for multimedia",
    "description": "Celluloid is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Celluloid",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "celluloid"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub celluloid"
      },
      {
        "method": "apt",
        "command": "sudo apt install celluloid"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S celluloid"
      }
    ]
  },
  {
    "id": "strawberry",
    "name": "Strawberry",
    "tagline": "Essential tool for multimedia",
    "description": "Strawberry is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Strawberry",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "strawberry"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub strawberry"
      },
      {
        "method": "apt",
        "command": "sudo apt install strawberry"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S strawberry"
      }
    ]
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "tagline": "Essential tool for multimedia",
    "description": "Spotify is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Spotify",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "spotify"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub spotify"
      },
      {
        "method": "apt",
        "command": "sudo apt install spotify"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S spotify"
      }
    ]
  },
  {
    "id": "ffmpeg",
    "name": "FFmpeg",
    "tagline": "Essential tool for multimedia",
    "description": "FFmpeg is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=FFmpeg",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "ffmpeg"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ffmpeg"
      },
      {
        "method": "apt",
        "command": "sudo apt install ffmpeg"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ffmpeg"
      }
    ]
  },
  {
    "id": "stremio",
    "name": "Stremio",
    "tagline": "Essential tool for multimedia",
    "description": "Stremio is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Stremio",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "stremio"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub stremio"
      },
      {
        "method": "apt",
        "command": "sudo apt install stremio"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S stremio"
      }
    ]
  },
  {
    "id": "kodi",
    "name": "Kodi",
    "tagline": "Essential tool for multimedia",
    "description": "Kodi is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Kodi",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "kodi"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kodi"
      },
      {
        "method": "apt",
        "command": "sudo apt install kodi"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kodi"
      }
    ]
  },
  {
    "id": "haruna",
    "name": "Haruna",
    "tagline": "Essential tool for multimedia",
    "description": "Haruna is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Haruna",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "haruna"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub haruna"
      },
      {
        "method": "apt",
        "command": "sudo apt install haruna"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S haruna"
      }
    ]
  },
  {
    "id": "shortwave",
    "name": "Shortwave",
    "tagline": "Essential tool for multimedia",
    "description": "Shortwave is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Shortwave",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "shortwave"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub shortwave"
      },
      {
        "method": "apt",
        "command": "sudo apt install shortwave"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S shortwave"
      }
    ]
  },
  {
    "id": "parabolic",
    "name": "Parabolic",
    "tagline": "Essential tool for multimedia",
    "description": "Parabolic is an application for Linux. Auto-generated entry.",
    "category": "multimedia",
    "homepage": "https://github.com/search?q=Parabolic",
    "license": "Unknown",
    "tags": [
      "multimedia",
      "linux",
      "parabolic"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub parabolic"
      },
      {
        "method": "apt",
        "command": "sudo apt install parabolic"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S parabolic"
      }
    ]
  },
  {
    "id": "kde-partition-manager",
    "name": "KDE Partition Manager",
    "tagline": "Essential tool for system",
    "description": "KDE Partition Manager is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=KDE%20Partition%20Manager",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "kde-partition-manager"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kde-partition-manager"
      },
      {
        "method": "apt",
        "command": "sudo apt install kde-partition-manager"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kde-partition-manager"
      }
    ]
  },
  {
    "id": "kde-connect",
    "name": "KDE Connect",
    "tagline": "Essential tool for system",
    "description": "KDE Connect is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=KDE%20Connect",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "kde-connect"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kde-connect"
      },
      {
        "method": "apt",
        "command": "sudo apt install kde-connect"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kde-connect"
      }
    ]
  },
  {
    "id": "bleachbit",
    "name": "BleachBit",
    "tagline": "Essential tool for system",
    "description": "BleachBit is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=BleachBit",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "bleachbit"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub bleachbit"
      },
      {
        "method": "apt",
        "command": "sudo apt install bleachbit"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S bleachbit"
      }
    ]
  },
  {
    "id": "dconf-editor",
    "name": "dconf Editor",
    "tagline": "Essential tool for system",
    "description": "dconf Editor is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=dconf%20Editor",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "dconf-editor"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub dconf-editor"
      },
      {
        "method": "apt",
        "command": "sudo apt install dconf-editor"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S dconf-editor"
      }
    ]
  },
  {
    "id": "borgbackup",
    "name": "BorgBackup",
    "tagline": "Essential tool for system",
    "description": "BorgBackup is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=BorgBackup",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "borgbackup"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub borgbackup"
      },
      {
        "method": "apt",
        "command": "sudo apt install borgbackup"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S borgbackup"
      }
    ]
  },
  {
    "id": "restic",
    "name": "Restic",
    "tagline": "Essential tool for system",
    "description": "Restic is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Restic",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "restic"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub restic"
      },
      {
        "method": "apt",
        "command": "sudo apt install restic"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S restic"
      }
    ]
  },
  {
    "id": "flatpak",
    "name": "Flatpak",
    "tagline": "Essential tool for system",
    "description": "Flatpak is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Flatpak",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "flatpak"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub flatpak"
      },
      {
        "method": "apt",
        "command": "sudo apt install flatpak"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S flatpak"
      }
    ]
  },
  {
    "id": "filelight",
    "name": "Filelight",
    "tagline": "Essential tool for system",
    "description": "Filelight is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Filelight",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "filelight"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub filelight"
      },
      {
        "method": "apt",
        "command": "sudo apt install filelight"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S filelight"
      }
    ]
  },
  {
    "id": "conky",
    "name": "Conky",
    "tagline": "Essential tool for system",
    "description": "Conky is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Conky",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "conky"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub conky"
      },
      {
        "method": "apt",
        "command": "sudo apt install conky"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S conky"
      }
    ]
  },
  {
    "id": "fsearch",
    "name": "FSearch",
    "tagline": "Essential tool for system",
    "description": "FSearch is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=FSearch",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "fsearch"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub fsearch"
      },
      {
        "method": "apt",
        "command": "sudo apt install fsearch"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S fsearch"
      }
    ]
  },
  {
    "id": "cpu-x",
    "name": "CPU-X",
    "tagline": "Essential tool for system",
    "description": "CPU-X is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=CPU-X",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "cpu-x"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub cpu-x"
      },
      {
        "method": "apt",
        "command": "sudo apt install cpu-x"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S cpu-x"
      }
    ]
  },
  {
    "id": "mission-center",
    "name": "Mission Center",
    "tagline": "Essential tool for system",
    "description": "Mission Center is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=Mission%20Center",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "mission-center"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub mission-center"
      },
      {
        "method": "apt",
        "command": "sudo apt install mission-center"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S mission-center"
      }
    ]
  },
  {
    "id": "openrgb",
    "name": "OpenRGB",
    "tagline": "Essential tool for system",
    "description": "OpenRGB is an application for Linux. Auto-generated entry.",
    "category": "system",
    "homepage": "https://github.com/search?q=OpenRGB",
    "license": "Unknown",
    "tags": [
      "system",
      "linux",
      "openrgb"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub openrgb"
      },
      {
        "method": "apt",
        "command": "sudo apt install openrgb"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S openrgb"
      }
    ]
  },
  {
    "id": "git-lfs",
    "name": "Git LFS",
    "tagline": "Essential tool for development",
    "description": "Git LFS is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Git%20LFS",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "git-lfs"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub git-lfs"
      },
      {
        "method": "apt",
        "command": "sudo apt install git-lfs"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S git-lfs"
      }
    ]
  },
  {
    "id": "lazygit",
    "name": "LazyGit",
    "tagline": "Essential tool for development",
    "description": "LazyGit is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=LazyGit",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "lazygit"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub lazygit"
      },
      {
        "method": "apt",
        "command": "sudo apt install lazygit"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S lazygit"
      }
    ]
  },
  {
    "id": "podman-desktop",
    "name": "Podman Desktop",
    "tagline": "Essential tool for development",
    "description": "Podman Desktop is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Podman%20Desktop",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "podman-desktop"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub podman-desktop"
      },
      {
        "method": "apt",
        "command": "sudo apt install podman-desktop"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S podman-desktop"
      }
    ]
  },
  {
    "id": "incus",
    "name": "Incus",
    "tagline": "Essential tool for development",
    "description": "Incus is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Incus",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "incus"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub incus"
      },
      {
        "method": "apt",
        "command": "sudo apt install incus"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S incus"
      }
    ]
  },
  {
    "id": "kubectl",
    "name": "kubectl",
    "tagline": "Essential tool for development",
    "description": "kubectl is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=kubectl",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "kubectl"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub kubectl"
      },
      {
        "method": "apt",
        "command": "sudo apt install kubectl"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S kubectl"
      }
    ]
  },
  {
    "id": "vagrant",
    "name": "Vagrant",
    "tagline": "Essential tool for development",
    "description": "Vagrant is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Vagrant",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "vagrant"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub vagrant"
      },
      {
        "method": "apt",
        "command": "sudo apt install vagrant"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S vagrant"
      }
    ]
  },
  {
    "id": "gnome-boxes",
    "name": "GNOME Boxes",
    "tagline": "Essential tool for development",
    "description": "GNOME Boxes is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=GNOME%20Boxes",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "gnome-boxes"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub gnome-boxes"
      },
      {
        "method": "apt",
        "command": "sudo apt install gnome-boxes"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S gnome-boxes"
      }
    ]
  },
  {
    "id": "dbeaver",
    "name": "DBeaver",
    "tagline": "Essential tool for development",
    "description": "DBeaver is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=DBeaver",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "dbeaver"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub dbeaver"
      },
      {
        "method": "apt",
        "command": "sudo apt install dbeaver"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S dbeaver"
      }
    ]
  },
  {
    "id": "meld",
    "name": "Meld",
    "tagline": "Essential tool for development",
    "description": "Meld is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Meld",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "meld"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub meld"
      },
      {
        "method": "apt",
        "command": "sudo apt install meld"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S meld"
      }
    ]
  },
  {
    "id": "wireshark",
    "name": "Wireshark",
    "tagline": "Essential tool for development",
    "description": "Wireshark is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Wireshark",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "wireshark"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub wireshark"
      },
      {
        "method": "apt",
        "command": "sudo apt install wireshark"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S wireshark"
      }
    ]
  },
  {
    "id": "bruno",
    "name": "Bruno",
    "tagline": "Essential tool for development",
    "description": "Bruno is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Bruno",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "bruno"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub bruno"
      },
      {
        "method": "apt",
        "command": "sudo apt install bruno"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S bruno"
      }
    ]
  },
  {
    "id": "hoppscotch",
    "name": "Hoppscotch",
    "tagline": "Essential tool for development",
    "description": "Hoppscotch is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Hoppscotch",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "hoppscotch"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub hoppscotch"
      },
      {
        "method": "apt",
        "command": "sudo apt install hoppscotch"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S hoppscotch"
      }
    ]
  },
  {
    "id": "yaak",
    "name": "Yaak",
    "tagline": "Essential tool for development",
    "description": "Yaak is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Yaak",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "yaak"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub yaak"
      },
      {
        "method": "apt",
        "command": "sudo apt install yaak"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S yaak"
      }
    ]
  },
  {
    "id": "imhex",
    "name": "ImHex",
    "tagline": "Essential tool for development",
    "description": "ImHex is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=ImHex",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "imhex"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub imhex"
      },
      {
        "method": "apt",
        "command": "sudo apt install imhex"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S imhex"
      }
    ]
  },
  {
    "id": "cmake",
    "name": "CMake",
    "tagline": "Essential tool for development",
    "description": "CMake is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=CMake",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "cmake"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub cmake"
      },
      {
        "method": "apt",
        "command": "sudo apt install cmake"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S cmake"
      }
    ]
  },
  {
    "id": "prism-launcher",
    "name": "Prism Launcher",
    "tagline": "Essential tool for games",
    "description": "Prism Launcher is an application for Linux. Auto-generated entry.",
    "category": "games",
    "homepage": "https://github.com/search?q=Prism%20Launcher",
    "license": "Unknown",
    "tags": [
      "games",
      "linux",
      "prism-launcher"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub prism-launcher"
      },
      {
        "method": "apt",
        "command": "sudo apt install prism-launcher"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S prism-launcher"
      }
    ]
  },
  {
    "id": "retroarch",
    "name": "RetroArch",
    "tagline": "Essential tool for games",
    "description": "RetroArch is an application for Linux. Auto-generated entry.",
    "category": "games",
    "homepage": "https://github.com/search?q=RetroArch",
    "license": "Unknown",
    "tags": [
      "games",
      "linux",
      "retroarch"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub retroarch"
      },
      {
        "method": "apt",
        "command": "sudo apt install retroarch"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S retroarch"
      }
    ]
  },
  {
    "id": "mangohud",
    "name": "MangoHud",
    "tagline": "Essential tool for games",
    "description": "MangoHud is an application for Linux. Auto-generated entry.",
    "category": "games",
    "homepage": "https://github.com/search?q=MangoHud",
    "license": "Unknown",
    "tags": [
      "games",
      "linux",
      "mangohud"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub mangohud"
      },
      {
        "method": "apt",
        "command": "sudo apt install mangohud"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S mangohud"
      }
    ]
  },
  {
    "id": "gamemode",
    "name": "GameMode",
    "tagline": "Essential tool for games",
    "description": "GameMode is an application for Linux. Auto-generated entry.",
    "category": "games",
    "homepage": "https://github.com/search?q=GameMode",
    "license": "Unknown",
    "tags": [
      "games",
      "linux",
      "gamemode"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub gamemode"
      },
      {
        "method": "apt",
        "command": "sudo apt install gamemode"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S gamemode"
      }
    ]
  },
  {
    "id": "antimicrox",
    "name": "AntiMicroX",
    "tagline": "Essential tool for games",
    "description": "AntiMicroX is an application for Linux. Auto-generated entry.",
    "category": "games",
    "homepage": "https://github.com/search?q=AntiMicroX",
    "license": "Unknown",
    "tags": [
      "games",
      "linux",
      "antimicrox"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub antimicrox"
      },
      {
        "method": "apt",
        "command": "sudo apt install antimicrox"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S antimicrox"
      }
    ]
  },
  {
    "id": "goverlay",
    "name": "GOverlay",
    "tagline": "Essential tool for games",
    "description": "GOverlay is an application for Linux. Auto-generated entry.",
    "category": "games",
    "homepage": "https://github.com/search?q=GOverlay",
    "license": "Unknown",
    "tags": [
      "games",
      "linux",
      "goverlay"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub goverlay"
      },
      {
        "method": "apt",
        "command": "sudo apt install goverlay"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S goverlay"
      }
    ]
  },
  {
    "id": "logseq",
    "name": "Logseq",
    "tagline": "Essential tool for documents",
    "description": "Logseq is an application for Linux. Auto-generated entry.",
    "category": "documents",
    "homepage": "https://github.com/search?q=Logseq",
    "license": "Unknown",
    "tags": [
      "documents",
      "linux",
      "logseq"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub logseq"
      },
      {
        "method": "apt",
        "command": "sudo apt install logseq"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S logseq"
      }
    ]
  },
  {
    "id": "joplin",
    "name": "Joplin",
    "tagline": "Essential tool for documents",
    "description": "Joplin is an application for Linux. Auto-generated entry.",
    "category": "documents",
    "homepage": "https://github.com/search?q=Joplin",
    "license": "Unknown",
    "tags": [
      "documents",
      "linux",
      "joplin"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub joplin"
      },
      {
        "method": "apt",
        "command": "sudo apt install joplin"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S joplin"
      }
    ]
  },
  {
    "id": "zathura",
    "name": "Zathura",
    "tagline": "Essential tool for documents",
    "description": "Zathura is an application for Linux. Auto-generated entry.",
    "category": "documents",
    "homepage": "https://github.com/search?q=Zathura",
    "license": "Unknown",
    "tags": [
      "documents",
      "linux",
      "zathura"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub zathura"
      },
      {
        "method": "apt",
        "command": "sudo apt install zathura"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S zathura"
      }
    ]
  },
  {
    "id": "xournal",
    "name": "Xournal++",
    "tagline": "Essential tool for documents",
    "description": "Xournal++ is an application for Linux. Auto-generated entry.",
    "category": "documents",
    "homepage": "https://github.com/search?q=Xournal%2B%2B",
    "license": "Unknown",
    "tags": [
      "documents",
      "linux",
      "xournal"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub xournal"
      },
      {
        "method": "apt",
        "command": "sudo apt install xournal"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S xournal"
      }
    ]
  },
  {
    "id": "zotero",
    "name": "Zotero",
    "tagline": "Essential tool for documents",
    "description": "Zotero is an application for Linux. Auto-generated entry.",
    "category": "documents",
    "homepage": "https://github.com/search?q=Zotero",
    "license": "Unknown",
    "tags": [
      "documents",
      "linux",
      "zotero"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub zotero"
      },
      {
        "method": "apt",
        "command": "sudo apt install zotero"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S zotero"
      }
    ]
  },
  {
    "id": "trilium-notes",
    "name": "Trilium Notes",
    "tagline": "Essential tool for documents",
    "description": "Trilium Notes is an application for Linux. Auto-generated entry.",
    "category": "documents",
    "homepage": "https://github.com/search?q=Trilium%20Notes",
    "license": "Unknown",
    "tags": [
      "documents",
      "linux",
      "trilium-notes"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub trilium-notes"
      },
      {
        "method": "apt",
        "command": "sudo apt install trilium-notes"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S trilium-notes"
      }
    ]
  },
  {
    "id": "gnupg",
    "name": "GnuPG",
    "tagline": "Essential tool for security",
    "description": "GnuPG is an application for Linux. Auto-generated entry.",
    "category": "security",
    "homepage": "https://github.com/search?q=GnuPG",
    "license": "Unknown",
    "tags": [
      "security",
      "linux",
      "gnupg"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub gnupg"
      },
      {
        "method": "apt",
        "command": "sudo apt install gnupg"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S gnupg"
      }
    ]
  },
  {
    "id": "firejail",
    "name": "Firejail",
    "tagline": "Essential tool for security",
    "description": "Firejail is an application for Linux. Auto-generated entry.",
    "category": "security",
    "homepage": "https://github.com/search?q=Firejail",
    "license": "Unknown",
    "tags": [
      "security",
      "linux",
      "firejail"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub firejail"
      },
      {
        "method": "apt",
        "command": "sudo apt install firejail"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S firejail"
      }
    ]
  },
  {
    "id": "clamav",
    "name": "ClamAV",
    "tagline": "Essential tool for security",
    "description": "ClamAV is an application for Linux. Auto-generated entry.",
    "category": "security",
    "homepage": "https://github.com/search?q=ClamAV",
    "license": "Unknown",
    "tags": [
      "security",
      "linux",
      "clamav"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub clamav"
      },
      {
        "method": "apt",
        "command": "sudo apt install clamav"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S clamav"
      }
    ]
  },
  {
    "id": "ente-auth",
    "name": "Ente Auth",
    "tagline": "Essential tool for security",
    "description": "Ente Auth is an application for Linux. Auto-generated entry.",
    "category": "security",
    "homepage": "https://github.com/search?q=Ente%20Auth",
    "license": "Unknown",
    "tags": [
      "security",
      "linux",
      "ente-auth"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ente-auth"
      },
      {
        "method": "apt",
        "command": "sudo apt install ente-auth"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ente-auth"
      }
    ]
  },
  {
    "id": "python-3",
    "name": "Python 3",
    "tagline": "Essential tool for development",
    "description": "Python 3 is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Python%203",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "python-3"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub python-3"
      },
      {
        "method": "apt",
        "command": "sudo apt install python-3"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S python-3"
      }
    ]
  },
  {
    "id": "node-js",
    "name": "Node.js",
    "tagline": "Essential tool for development",
    "description": "Node.js is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Node.js",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "node-js"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub node-js"
      },
      {
        "method": "apt",
        "command": "sudo apt install node-js"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S node-js"
      }
    ]
  },
  {
    "id": "go",
    "name": "Go",
    "tagline": "Essential tool for development",
    "description": "Go is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Go",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "go"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub go"
      },
      {
        "method": "apt",
        "command": "sudo apt install go"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S go"
      }
    ]
  },
  {
    "id": "rust",
    "name": "Rust",
    "tagline": "Essential tool for development",
    "description": "Rust is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Rust",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "rust"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub rust"
      },
      {
        "method": "apt",
        "command": "sudo apt install rust"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S rust"
      }
    ]
  },
  {
    "id": "ruby",
    "name": "Ruby",
    "tagline": "Essential tool for development",
    "description": "Ruby is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Ruby",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "ruby"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ruby"
      },
      {
        "method": "apt",
        "command": "sudo apt install ruby"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ruby"
      }
    ]
  },
  {
    "id": "php",
    "name": "PHP",
    "tagline": "Essential tool for development",
    "description": "PHP is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=PHP",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "php"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub php"
      },
      {
        "method": "apt",
        "command": "sudo apt install php"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S php"
      }
    ]
  },
  {
    "id": "openjdk",
    "name": "OpenJDK",
    "tagline": "Essential tool for development",
    "description": "OpenJDK is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=OpenJDK",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "openjdk"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub openjdk"
      },
      {
        "method": "apt",
        "command": "sudo apt install openjdk"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S openjdk"
      }
    ]
  },
  {
    "id": "deno",
    "name": "Deno",
    "tagline": "Essential tool for development",
    "description": "Deno is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Deno",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "deno"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub deno"
      },
      {
        "method": "apt",
        "command": "sudo apt install deno"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S deno"
      }
    ]
  },
  {
    "id": "bun",
    "name": "Bun",
    "tagline": "Essential tool for development",
    "description": "Bun is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=Bun",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "bun"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub bun"
      },
      {
        "method": "apt",
        "command": "sudo apt install bun"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S bun"
      }
    ]
  },
  {
    "id": "npm",
    "name": "npm",
    "tagline": "Essential tool for development",
    "description": "npm is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=npm",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "npm"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub npm"
      },
      {
        "method": "apt",
        "command": "sudo apt install npm"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S npm"
      }
    ]
  },
  {
    "id": "pnpm",
    "name": "pnpm",
    "tagline": "Essential tool for development",
    "description": "pnpm is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=pnpm",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "pnpm"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub pnpm"
      },
      {
        "method": "apt",
        "command": "sudo apt install pnpm"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S pnpm"
      }
    ]
  },
  {
    "id": "yarn",
    "name": "yarn",
    "tagline": "Essential tool for development",
    "description": "yarn is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=yarn",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "yarn"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub yarn"
      },
      {
        "method": "apt",
        "command": "sudo apt install yarn"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S yarn"
      }
    ]
  },
  {
    "id": "uv",
    "name": "uv",
    "tagline": "Essential tool for development",
    "description": "uv is an application for Linux. Auto-generated entry.",
    "category": "development",
    "homepage": "https://github.com/search?q=uv",
    "license": "Unknown",
    "tags": [
      "development",
      "linux",
      "uv"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub uv"
      },
      {
        "method": "apt",
        "command": "sudo apt install uv"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S uv"
      }
    ]
  },
  {
    "id": "htop",
    "name": "htop",
    "tagline": "Essential tool for terminal",
    "description": "htop is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=htop",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "htop"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub htop"
      },
      {
        "method": "apt",
        "command": "sudo apt install htop"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S htop"
      }
    ]
  },
  {
    "id": "eza",
    "name": "eza",
    "tagline": "Essential tool for terminal",
    "description": "eza is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=eza",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "eza"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub eza"
      },
      {
        "method": "apt",
        "command": "sudo apt install eza"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S eza"
      }
    ]
  },
  {
    "id": "bat",
    "name": "bat",
    "tagline": "Essential tool for terminal",
    "description": "bat is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=bat",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "bat"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub bat"
      },
      {
        "method": "apt",
        "command": "sudo apt install bat"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S bat"
      }
    ]
  },
  {
    "id": "fzf",
    "name": "fzf",
    "tagline": "Essential tool for terminal",
    "description": "fzf is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=fzf",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "fzf"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub fzf"
      },
      {
        "method": "apt",
        "command": "sudo apt install fzf"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S fzf"
      }
    ]
  },
  {
    "id": "ripgrep",
    "name": "ripgrep",
    "tagline": "Essential tool for terminal",
    "description": "ripgrep is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=ripgrep",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "ripgrep"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ripgrep"
      },
      {
        "method": "apt",
        "command": "sudo apt install ripgrep"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ripgrep"
      }
    ]
  },
  {
    "id": "zoxide",
    "name": "zoxide",
    "tagline": "Essential tool for terminal",
    "description": "zoxide is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=zoxide",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "zoxide"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub zoxide"
      },
      {
        "method": "apt",
        "command": "sudo apt install zoxide"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S zoxide"
      }
    ]
  },
  {
    "id": "tldr",
    "name": "tldr",
    "tagline": "Essential tool for terminal",
    "description": "tldr is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=tldr",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "tldr"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub tldr"
      },
      {
        "method": "apt",
        "command": "sudo apt install tldr"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S tldr"
      }
    ]
  },
  {
    "id": "wget",
    "name": "wget",
    "tagline": "Essential tool for terminal",
    "description": "wget is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=wget",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "wget"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub wget"
      },
      {
        "method": "apt",
        "command": "sudo apt install wget"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S wget"
      }
    ]
  },
  {
    "id": "curl",
    "name": "curl",
    "tagline": "Essential tool for terminal",
    "description": "curl is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=curl",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "curl"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub curl"
      },
      {
        "method": "apt",
        "command": "sudo apt install curl"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S curl"
      }
    ]
  },
  {
    "id": "aria2",
    "name": "aria2",
    "tagline": "Essential tool for terminal",
    "description": "aria2 is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=aria2",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "aria2"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub aria2"
      },
      {
        "method": "apt",
        "command": "sudo apt install aria2"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S aria2"
      }
    ]
  },
  {
    "id": "yazi",
    "name": "yazi",
    "tagline": "Essential tool for terminal",
    "description": "yazi is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=yazi",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "yazi"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub yazi"
      },
      {
        "method": "apt",
        "command": "sudo apt install yazi"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S yazi"
      }
    ]
  },
  {
    "id": "ranger",
    "name": "ranger",
    "tagline": "Essential tool for terminal",
    "description": "ranger is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=ranger",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "ranger"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ranger"
      },
      {
        "method": "apt",
        "command": "sudo apt install ranger"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ranger"
      }
    ]
  },
  {
    "id": "ncdu",
    "name": "ncdu",
    "tagline": "Essential tool for terminal",
    "description": "ncdu is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=ncdu",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "ncdu"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub ncdu"
      },
      {
        "method": "apt",
        "command": "sudo apt install ncdu"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S ncdu"
      }
    ]
  },
  {
    "id": "fd",
    "name": "fd",
    "tagline": "Essential tool for terminal",
    "description": "fd is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=fd",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "fd"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub fd"
      },
      {
        "method": "apt",
        "command": "sudo apt install fd"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S fd"
      }
    ]
  },
  {
    "id": "zellij",
    "name": "Zellij",
    "tagline": "Essential tool for terminal",
    "description": "Zellij is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Zellij",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "zellij"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub zellij"
      },
      {
        "method": "apt",
        "command": "sudo apt install zellij"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S zellij"
      }
    ]
  },
  {
    "id": "superfile",
    "name": "Superfile",
    "tagline": "Essential tool for terminal",
    "description": "Superfile is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=Superfile",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "superfile"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub superfile"
      },
      {
        "method": "apt",
        "command": "sudo apt install superfile"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S superfile"
      }
    ]
  },
  {
    "id": "rsync",
    "name": "rsync",
    "tagline": "Essential tool for terminal",
    "description": "rsync is an application for Linux. Auto-generated entry.",
    "category": "terminal",
    "homepage": "https://github.com/search?q=rsync",
    "license": "Unknown",
    "tags": [
      "terminal",
      "linux",
      "rsync"
    ],
    "install": [
      {
        "method": "flatpak",
        "command": "flatpak install flathub rsync"
      },
      {
        "method": "apt",
        "command": "sudo apt install rsync"
      },
      {
        "method": "pacman",
        "command": "sudo pacman -S rsync"
      }
    ]
  }
];

export const SOFTWARE_MAP: Record<string, SoftwareEntry> = Object.fromEntries(
  SOFTWARE.map((entry) => [entry.id, entry])
)
