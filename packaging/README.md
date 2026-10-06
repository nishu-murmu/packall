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
| Fedora COPR | `packaging/fedora/packall.spec` | Manual build, see [DEPLOY.md](DEPLOY.md#3-fedora--rhel--copr-manual) |
| openSUSE OBS | `packaging/fedora/packall.spec` | Manual build, see [DEPLOY.md](DEPLOY.md#4-opensuse--sle--obs-manual) |
| `install.sh` one-liner | **website repo**, `public/install.sh` | Served from `packall.app` |

> Flathub, the Snap Store, Windows and macOS are intentionally **not** targets:
> Packall installs software on the *host* with `apt`/`dnf`/`pacman`, which a
> sandbox cannot reach and which has no meaning off Linux. See
> [DEPLOY.md](DEPLOY.md#scope-linux-x86_64-only).

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

> `install.sh` is maintained in the **website** repo (`public/install.sh`), not
> here. It picks the native package per distro and falls back to the AppImage.

## Releasing a new version

1. Bump `version` in `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`
   and `Version:` in `packaging/fedora/packall.spec`. The AUR `pkgver` fields are
   rewritten from the tag by CI — leave them alone.
2. `git tag vX.Y.Z && git push --tags`.
3. The workflow builds, tests, publishes the release, updates the AUR and the
   APT/RPM repositories. COPR and OBS do not watch tags; rebuild them by hand.

See [DEPLOY.md](DEPLOY.md) for the full runbook, including the openSUSE OBS setup
and the per-channel one-time credentials.

## Status

The Rust and frontend test suites run in CI. The AUR, COPR and repository steps
need the secrets above and could not be exercised from the authoring environment —
run the workflow once with `workflow_dispatch` on a fork to validate them.
