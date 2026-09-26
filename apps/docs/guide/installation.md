# Installation Guide

LinuxDir can be installed on any modern Linux distribution using multiple standard formats, or compiled directly from source.

## Prebuilt Binaries

Prebuilt binaries are available for x86_64 and aarch64 architectures.

### 1. AppImage (Universal Linux)

AppImage works out-of-the-box on almost all Linux distributions:

```bash
# Download the latest AppImage
wget https://github.com/nishu-murmu/almanac/releases/latest/download/LinuxDir.AppImage

# Make it executable
chmod +x LinuxDir.AppImage

# Run directly
./LinuxDir.AppImage
```

::: tip Integrating AppImages
You can integrate AppImages into your desktop menu using `appimaged` or `Geary` / `AppImageLauncher`.
:::

---

### 2. Debian / Ubuntu / Linux Mint (.deb)

Download and install using `dpkg` or `apt`:

```bash
wget https://github.com/nishu-murmu/almanac/releases/latest/download/linuxdir_amd64.deb
sudo apt install ./linuxdir_amd64.deb
```

To uninstall:
```bash
sudo apt remove linuxdir
```

---

### 3. Fedora / RHEL / openSUSE (.rpm)

```bash
wget https://github.com/nishu-murmu/almanac/releases/latest/download/linuxdir.x86_64.rpm
sudo dnf install ./linuxdir.x86_64.rpm
```

---

### 4. Arch Linux (AUR)

Using your favorite AUR helper (e.g. `paru` or `yay`):

```bash
paru -S linuxdir-bin
# or
yay -S linuxdir-bin
```

---

### 5. Flatpak

```bash
flatpak install flathub org.linuxdir.LinuxDir
flatpak run org.linuxdir.LinuxDir
```

---

## Building From Source

To build a standalone production release on your system:

```bash
git clone https://github.com/nishu-murmu/almanac.git
cd almanac
npm install
npm run build
cd src-tauri
cargo tauri build
```

The resulting package will be in `src-tauri/target/release/bundle/`.
