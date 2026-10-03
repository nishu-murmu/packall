# Packaging Packall

Everything needed to ship Packall to the major Linux distributions. The release
workflow (`.github/workflows/release.yml`) automates most of it when you push a
`v*` tag.

| Target | Source in this repo | How it ships |
| --- | --- | --- |
| `.deb` (Debian, Ubuntu, Mint, Pop!_OS) | `tauri.conf.json` → `bundle.linux.deb` | Built by `tauri-action`, attached to the GitHub release, mirrored in the APT repo |
| `.rpm` (Fedora, RHEL, openSUSE) | `tauri.conf.json` → `bundle.linux.rpm`, `packaging/fedora/packall.spec` | Built by `tauri-action`; spec is for COPR / Fedora review |
| AppImage (any distro) | built by Tauri | GitHub release asset |
| AUR `packall-bin` | `packaging/aur/packall-bin/PKGBUILD` | Repackages the release `.deb`; pushed by the `aur` job |
| AUR `packall` | `packaging/aur/packall/PKGBUILD` | Builds from source; pushed by the `aur` job |
| APT repo | `packaging/scripts/make-apt-repo.sh` | GitHub Pages (`gh-pages`) |
| RPM repo | `packaging/scripts/make-rpm-repo.sh` | GitHub Pages (`gh-pages`) |

> Flatpak is intentionally **not** a target: Packall installs software on the
> *host* with `apt`/`dnf`/`pacman`, which a Flatpak sandbox cannot reach.

## One-time setup

1. **Release** — push a tag: `git tag v0.1.0 && git push origin v0.1.0`.
2. **AUR** — create an AUR account, add an SSH key, then add repo secrets
   `AUR_USERNAME`, `AUR_EMAIL`, `AUR_SSH_PRIVATE_KEY`. The first push creates the
   `packall-bin` and `packall` packages.
3. **APT / RPM repos** — enable GitHub Pages on the `gh-pages` branch. Optionally
   add `REPO_GPG_PRIVATE_KEY` (armored) so the repos are signed.
4. **Fedora COPR** — create a COPR project, add a "Custom"/SCM source pointing at
   this repo with spec path `packaging/fedora/packall.spec`, and enable network
   access during the build (npm/cargo download dependencies).
5. **Debian / Ubuntu archives (optional, later)** — for inclusion in the official
   archives you will need a vendored-source Debian package; until then use the
   APT repo below or a PPA/OBS project fed from the `.deb`.

## Install commands for users

```bash
# Arch / Manjaro / EndeavourOS
paru -S packall-bin          # or: yay -S packall-bin

# Debian / Ubuntu (APT repo)
curl -fsSL https://nishu-murmu.github.io/packall/packall.gpg | sudo tee /usr/share/keyrings/packall.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/packall.gpg] https://nishu-murmu.github.io/packall stable main" | sudo tee /etc/apt/sources.list.d/packall.list
sudo apt update && sudo apt install packall

# Fedora / RHEL (RPM repo)
sudo dnf config-manager addrepo --from-repofile=https://nishu-murmu.github.io/packall/rpm/packall.repo
sudo dnf install packall

# Anywhere
curl -fsSL https://packall.app/install.sh | sh
```

## Releasing a new version

1. Bump `version` in `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`
   and the `pkgver`/`Version` fields in `packaging/`.
2. `git tag vX.Y.Z && git push --tags`.
3. The workflow builds, tests, publishes the release, updates the AUR and the
   APT/RPM repositories.

## Status

The Rust and frontend test suites run in CI. The AUR, COPR and repository steps
need the secrets above and could not be exercised from the authoring environment —
run the workflow once with `workflow_dispatch` on a fork to validate them.
