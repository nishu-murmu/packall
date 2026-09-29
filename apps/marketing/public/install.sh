#!/usr/bin/env bash

# Almanac Unified Installer
set -e

echo "========================================"
echo "    Almanac - Setup & Installation      "
echo "========================================"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

if [ "$OS" != "Linux" ]; then
    echo "❌ Error: This install script currently only supports Linux."
    echo "Please visit https://github.com/nishu-murmu/almanac/releases to download the macOS or Windows installers."
    exit 1
fi

if [ "$ARCH" != "x86_64" ]; then
    echo "❌ Error: This script currently only supports x86_64 Linux architectures."
    exit 1
fi

echo "🔍 Fetching the latest release from GitHub..."
REPO="nishu-murmu/almanac"
LATEST_RELEASE_URL="https://api.github.com/repos/$REPO/releases/latest"

# Fetch latest tag
TAG=$(curl -sL $LATEST_RELEASE_URL | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$TAG" ]; then
    echo "❌ Error: Failed to fetch the latest release from GitHub."
    echo "Please check your internet connection or GitHub API rate limits."
    exit 1
fi

echo "✨ Found latest version: $TAG"

# Fetch the AppImage download URL
# The GitHub action will upload an asset ending with .AppImage
ASSET_URL=$(curl -sL $LATEST_RELEASE_URL | grep '"browser_download_url":' | grep '\.AppImage"' | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$ASSET_URL" ]; then
    echo "❌ Error: Could not find an AppImage for version $TAG."
    echo "Please download the .deb or .rpm manually from GitHub Releases."
    exit 1
fi

echo "📥 Downloading Almanac AppImage..."
echo "URL: $ASSET_URL"

# Setup directories
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"

mkdir -p "$BIN_DIR"
mkdir -p "$APP_DIR"

APPIMAGE_PATH="$BIN_DIR/almanac"

# Download the file
curl -L -o "$APPIMAGE_PATH" "$ASSET_URL"

# Make it executable
chmod +x "$APPIMAGE_PATH"

echo "⚙️ Setting up desktop integration..."
# Create a desktop entry so it shows up in the user's app launcher
cat <<EOF > "$APP_DIR/almanac.desktop"
[Desktop Entry]
Name=Almanac
Exec=$APPIMAGE_PATH
Icon=utilities-terminal
Type=Application
Categories=Utility;System;
Comment=The Keyboard-Driven Linux Software Directory
Terminal=false
EOF

echo ""
echo "============================================================"
echo "✅ Almanac ($TAG) has been installed successfully! "
echo "============================================================"
echo ""
echo "Executable location: $BIN_DIR/almanac"
echo "Desktop entry:       $APP_DIR/almanac.desktop"
echo ""
echo "👉 You can now launch 'Almanac' from your application menu,"
echo "   or simply type 'almanac' in your terminal."
echo "============================================================"
