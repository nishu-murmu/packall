# Publishing Packall — step by step

Do these once. After that, pushing a `v*` tag publishes everything that is automated.

## 0. GitHub release (builds the binaries)
1. Merge to `main`, then: `git tag v0.1.0 && git push origin v0.1.0`
2. Actions → **Release**: runs tests, builds `.deb`, `.rpm`, AppImage, attaches them and `SHA256SUMS.txt` to the release.

## 1. AUR (Arch, Manjaro, EndeavourOS) — https://aur.archlinux.org
1. Register at aur.archlinux.org → My Account → add your **SSH public key**.
2. In the GitHub repo → Settings → Secrets → Actions add `AUR_USERNAME`, `AUR_EMAIL`, `AUR_SSH_PRIVATE_KEY` (the matching private key).
3. The `aur` job pushes `packall-bin` and `packall` on every tag. First time manually (optional):
   ```bash
   git clone ssh://aur@aur.archlinux.org/packall-bin.git && cd packall-bin
   cp ../packaging/aur/packall-bin/PKGBUILD . && updpkgsums && makepkg --printsrcinfo > .SRCINFO
   git add . && git commit -m "Initial import" && git push
   ```
4. Users: `paru -S packall-bin`.

## 2. APT repository (Debian, Ubuntu, Mint, Pop!_OS) — GitHub Pages
1. Create a GPG key: `gpg --quick-gen-key "Packall <you@example.com>" rsa4096 sign never`; export: `gpg --armor --export-secret-keys <ID>`.
2. Add it as secret `REPO_GPG_PRIVATE_KEY`.
3. Repo → Settings → Pages → Source: **Deploy from branch**, branch `gh-pages` / root (created by the first `repos` job run).
4. Users follow the APT commands in `packaging/README.md`.
5. Later, for the official archives: Ubuntu **PPA** (https://launchpad.net → create PPA → upload a source package with `dput`) or an **OBS** project (https://build.opensuse.org) which builds deb/rpm for many distros from one source.

## 3. Fedora / RHEL — COPR (https://copr.fedorainfracloud.org)
1. Log in with a Fedora account → **New Project** → name `packall`, chroots: fedora-rawhide/40/41, epel-9.
2. Sources → Add → **SCM**: clone URL `https://github.com/nishu-murmu/packall.git`, spec `packaging/fedora/packall.spec`, build method *rpkg/make srpm*; enable **Internet access during build** (npm and cargo need it).
3. Build. Users: `sudo dnf copr enable <you>/packall && sudo dnf install packall`.
4. The RPM repo on GitHub Pages (job `repos`) is an alternative that needs no account.

## 4. openSUSE — OBS (https://build.opensuse.org)
Create a home project → New Package → upload the spec and source tarball, enable the openSUSE Tumbleweed/Leap repositories. Users add the project repo with `zypper addrepo`.

## 5. AppImage (any distro)
Already attached to every release. Optional catalogue listing: https://appimage.github.io → submit a PR adding `data/Packall` (see their README).

## 6. Website — Cloudflare Pages
See the website repo README (Direct Upload project `packall`, API token, two GitHub secrets).

## Not applicable
- **Flathub / Snap Store**: Packall installs software on the host with `apt`/`dnf`/`pacman`; sandboxed formats cannot do that (Snap would need classic confinement approval).
