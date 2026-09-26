# Supported Package Managers

LinuxDir supports multiple package formats and package managers for each software entry so that instructions work seamlessly regardless of whether you run Ubuntu, Arch Linux, Fedora, Debian, NixOS, or openSUSE.

## Supported Formats

| Format / Tool | Target Distributions | Characteristics |
|---|---|---|
| **APT** | Debian, Ubuntu, Pop!_OS, Mint | Native debian package manager with PPA support |
| **DNF** | Fedora, RHEL, CentOS Stream | Native RPM manager with COPR support |
| **Pacman** | Arch Linux, Manjaro, EndeavourOS | Fast rolling-release binary manager |
| **AUR** | Arch Linux | Arch User Repository scripts (`yay`, `paru`) |
| **Zypper** | openSUSE Leap & Tumbleweed | SUSE native RPM manager |
| **Flatpak** | Universal Linux | Sandboxed, verified runtimes via Flathub |
| **Snap** | Ubuntu, Debian, Fedora, Arch | Canonical sandboxed snap packages |
| **AppImage** | Universal Linux | Single-file portable self-contained executables |
| **Homebrew** | Linux / macOS | Alternative userland package manager (`brew install`) |
| **Debian (.deb)** | Debian / Ubuntu-derived | Standalone binary packages |
| **Manual** | Any | Tarball extraction, script, or GitHub release binary |
