# Publishing Packall — step by step

Do the one-time setup per channel below. After that, pushing a `v*` tag publishes
everything marked **automated**.

For what each channel is built *from*, see [`README.md`](README.md). This file is
the operator's runbook.

| Channel | Reaches | Automated on tag? | Needs |
|---|---|---|---|
| GitHub release (`.deb`, `.rpm`, AppImage) | everyone | ✅ `build` + `checksums` | nothing |
| AUR `packall-bin`, `packall` | Arch, Manjaro, EndeavourOS | ✅ `aur` | 3 secrets |
| APT repo (GitHub Pages) | Debian, Ubuntu, Mint, Pop!_OS | ✅ `repos` | Pages on, GPG key optional |
| RPM repo (GitHub Pages) | Fedora, RHEL, openSUSE | ✅ `repos` | same as above |
| Fedora COPR | Fedora, RHEL, EPEL | ❌ manual | COPR project |
| openSUSE OBS | openSUSE, SLE | ❌ manual | OBS project |
| `install.sh` one-liner | everyone | ✅ (website repo) | Cloudflare Pages |
| AppImage catalogue | everyone | ❌ one-off PR | nothing |

## Scope: Linux x86_64 only

Packall drives the **host's** package managers (`apt`, `dnf`, `pacman`, `zypper`).
That shapes what it can ship to:

- **Windows and macOS are not targets.** There is no host package manager for
  Packall to drive, and `install.sh` exits on any non-Linux kernel. Developing on
  Windows is fine — `npm run web:dev` runs the frontend anywhere — but there is no
  Windows or macOS bundle to publish.
- **Flathub and the Snap Store are not targets.** A sandboxed app cannot run
  `apt`/`dnf` on the host. Snap would need classic-confinement approval from the
  Snap Store review team, which is granted sparingly and would not help Flatpak at
  all.
- **Only `x86_64` is published.** `install.sh` refuses other architectures; add an
  `aarch64` bundle before advertising ARM.

---

## 0. GitHub release — builds everything else

1. Merge to `main`, then `git tag v0.1.0 && git push origin v0.1.0`.
2. Actions → **Release** runs tests, builds `.deb` / `.rpm` / AppImage via
   `tauri-action`, and attaches them plus `SHA256SUMS.txt`.

Every other channel downloads from this release, so if this job fails, stop here.

## 1. AUR (Arch, Manjaro, EndeavourOS) — automated

1. Register at [aur.archlinux.org](https://aur.archlinux.org) → My Account → add
   your **SSH public key**.
2. Repo → Settings → Secrets → Actions: add `AUR_USERNAME`, `AUR_EMAIL`,
   `AUR_SSH_PRIVATE_KEY` (the matching private key).
3. The `aur` job rewrites `pkgver` from the tag, runs `updpkgsums`, and pushes both
   `packall-bin` (repackages the release `.deb`) and `packall` (builds from source).

First import, if you would rather do it by hand once:

```bash
git clone ssh://aur@aur.archlinux.org/packall-bin.git && cd packall-bin
cp ../packaging/aur/packall-bin/PKGBUILD . && updpkgsums && makepkg --printsrcinfo > .SRCINFO
git add . && git commit -m "Initial import" && git push
```

Users: `paru -S packall-bin`.

## 2. APT repository (Debian, Ubuntu, Mint, Pop!_OS) — automated

1. Create a signing key and export it:
   ```bash
   gpg --quick-gen-key "Packall <you@example.com>" rsa4096 sign never
   gpg --armor --export-secret-keys <KEY_ID>
   ```
2. Add the armored private key as the secret `REPO_GPG_PRIVATE_KEY`. Without it the
   repo is still published, just unsigned — and `apt` will refuse it unless users
   pass `[trusted=yes]`, so set it before announcing the repo.
3. Repo → Settings → Pages → Source **Deploy from branch**, branch `gh-pages`,
   folder `/`. The branch is created by the first `repos` run.
4. The job publishes with `keep_files: true`, so older versions stay installable.

User-facing commands live in [`README.md`](README.md#install-commands-for-users).

For the *official* archives later: an Ubuntu **PPA**
([launchpad.net](https://launchpad.net), upload a source package with `dput`) or an
OBS project — both need a vendored-source package, since Debian builders have no
network for `npm`/`cargo`.

## 3. Fedora / RHEL — COPR (manual)

1. Log in at [copr.fedorainfracloud.org](https://copr.fedorainfracloud.org) with a
   Fedora account → **New Project** → name `packall`.
2. Chroots: `fedora-42`, `fedora-43`, `fedora-rawhide`, `epel-9`, `epel-10`. Drop
   chroots as they go end-of-life; building for an EOL Fedora wastes quota.
3. Sources → Add → **SCM**: clone URL `https://github.com/nishu-murmu/packall.git`,
   spec `packaging/fedora/packall.spec`, build method *rpkg*. Enable **internet
   access during build** — `npm ci` and `cargo fetch` need it.
4. Bump `Version:` in the spec first (see [Releasing](#releasing-a-new-version));
   unlike the PKGBUILDs this is **not** automated.
5. Build. Users: `sudo dnf copr enable <you>/packall && sudo dnf install packall`.

The RPM repo on GitHub Pages (job `repos`) reaches the same users with no account,
so COPR is optional — its value is being a place Fedora users already trust.

## 4. openSUSE / SLE — OBS (manual)

The Open Build Service builds `.rpm` and `.deb` for many distributions from one
spec, so it is the cheapest way to cover openSUSE properly.

1. Sign in at [build.opensuse.org](https://build.opensuse.org) (an openSUSE account
   works) and open your `home:<username>` project.
2. **Create Package** → name `packall`.
3. Upload `packaging/fedora/packall.spec` (it is distribution-agnostic enough to
   start from) plus a source tarball, or point at this repo with a `_service` file
   using the `obs_scm` + `tar` + `recompress` services.
4. **Repositories** → Add → enable **openSUSE Tumbleweed** and
   **openSUSE Leap 15.6**. Add Fedora or Debian targets here too if you would
   rather maintain one builder than COPR plus GitHub Pages.
5. Enable network access for the build (`<service name="download_files"/>` or a
   vendored tarball), since `npm` and `cargo` fetch dependencies.
6. Install the CLI for local iteration: `zypper install osc`, then
   `osc checkout home:<username>/packall && osc build`.

Users:

```bash
sudo zypper addrepo https://download.opensuse.org/repositories/home:<username>/openSUSE_Tumbleweed/home:<username>.repo
sudo zypper refresh && sudo zypper install packall
```

Getting into **openSUSE Factory** (so `zypper install packall` works with no extra
repo) means submitting a request from your home project to Factory and passing
review — worth doing only once the package is stable.

## 5. AppImage (any distro) — automated

Attached to every release already. Optional listing in the AppImage catalogue:
open a PR at [appimage.github.io](https://appimage.github.io) adding `data/Packall`.

## 6. The `install.sh` one-liner

```bash
curl -fsSL https://packall.app/install.sh | sh
```

**The script is maintained in the website repo, not this one** —
`packall-website/public/install.sh`, served from the site root. It reads
`/etc/os-release`, prefers the AUR via `paru`/`yay` on Arch, then the `.deb` on
Debian families and the `.rpm` on Fedora and openSUSE, and otherwise drops an
AppImage into `~/.local/bin` with a `.desktop` entry.

It resolves the GitHub *latest release* API, so it only works after a non-draft,
non-prerelease tag exists. Update it whenever release asset names change.

## 7. Website — Cloudflare Pages

Deployed from the website repo on every push to `main`; see that repo's README for
the Direct Upload project, API token and the two GitHub secrets.

---

## Releasing a new version

1. Bump the version in **four** places in this repo — `package.json`,
   `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` and
   `packaging/fedora/packall.spec` (`Version:`). The AUR `pkgver` fields are
   rewritten from the tag by CI, so leave them alone.
2. Update `CHANGELOG.md`.
3. `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. Watch Actions → **Release**: `test` → `build` → `checksums`, `aur`, `repos`.
5. Trigger a COPR build and an OBS rebuild if you maintain them (neither watches
   tags).

## Known gaps

- The release workflow rewrites `pkgver` in the PKGBUILDs but **not** `Version:` in
  `packaging/fedora/packall.spec`. Forget step 1 above and COPR and OBS will
  cheerfully build a stale version number. Worth automating the same way the `aur`
  job does it.
- The AUR, COPR, OBS and Pages steps need credentials that were never exercised
  from the authoring environment. Run the workflow once with `workflow_dispatch` on
  a fork before trusting a real tag.
- Only `x86_64` is built; there is no `aarch64` bundle.
