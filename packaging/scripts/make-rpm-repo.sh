#!/usr/bin/env bash
# Build a static dnf/zypper repository from the release .rpm files.
# Usage: make-rpm-repo.sh <dir-with-rpms> <output-dir> [GPG_KEY_ID]
set -euo pipefail

rpms=${1:?dir with .rpm files}
out=${2:?output dir}
key=${3:-}

mkdir -p "$out/rpm"
cp "$rpms"/*.rpm "$out/rpm/"
cp "$(dirname "$0")/../repo/packall.repo" "$out/rpm/packall.repo"
if [[ -n "$key" ]]; then
  for f in "$out"/rpm/*.rpm; do rpmsign --addsign --define "_gpg_name $key" "$f"; done
fi
createrepo_c "$out/rpm"
if [[ -n "$key" ]]; then
  gpg --batch --yes --default-key "$key" --detach-sign --armor "$out/rpm/repodata/repomd.xml"
  gpg --export --armor "$key" > "$out/rpm/RPM-GPG-KEY-packall"
fi
echo "RPM repo written to $out/rpm"
