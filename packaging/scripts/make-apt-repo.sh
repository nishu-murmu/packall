#!/usr/bin/env bash
# Build a static, optionally signed APT repository from the release .deb files.
# Usage: make-apt-repo.sh <dir-with-debs> <output-dir> [GPG_KEY_ID]
# Publish <output-dir> with GitHub Pages (or any static host).
set -euo pipefail

debs=${1:?dir with .deb files}
out=${2:?output dir}
key=${3:-}

pool="$out/pool/main"
dist="$out/dists/stable/main/binary-amd64"
mkdir -p "$pool" "$dist"
cp "$debs"/*.deb "$pool/"

( cd "$out" && dpkg-scanpackages --arch amd64 pool/main > "$dist/Packages" )
gzip -9kf "$dist/Packages"

apt-ftparchive \
  -o APT::FTPArchive::Release::Origin=Packall \
  -o APT::FTPArchive::Release::Label=Packall \
  -o APT::FTPArchive::Release::Suite=stable \
  -o APT::FTPArchive::Release::Codename=stable \
  -o APT::FTPArchive::Release::Architectures=amd64 \
  -o APT::FTPArchive::Release::Components=main \
  release "$out/dists/stable" > "$out/dists/stable/Release"

if [[ -n "$key" ]]; then
  gpg --batch --yes --default-key "$key" -abs -o "$out/dists/stable/Release.gpg" "$out/dists/stable/Release"
  gpg --batch --yes --default-key "$key" --clearsign -o "$out/dists/stable/InRelease" "$out/dists/stable/Release"
  gpg --export "$key" | gpg --dearmor > "$out/packall.gpg" 2>/dev/null || gpg --export "$key" > "$out/packall.gpg"
fi
echo "APT repo written to $out"
