# Moving Packall to a Go + Bubble Tea TUI

The decision and the staged path, written down so the work can be picked up
locally. Nothing here is urgent — step 1 already landed and is useful on its own.

## Why

The product's defining feature is vim-style keyboard navigation. A GUI you drive
from the home row is a terminal app with a 100 MB dependency tree attached. The
TUI also reaches machines the GUI cannot (SSH, headless servers), and it drops
`webkit2gtk-4.1`, `gtk3` and `polkit` from every PKGBUILD and spec.

The deeper reason is duplication. The same knowledge was implemented two to four
times across two languages and the copies had drifted:

- the catalogue existed three times — 215 entries in TypeScript, ~52 in
  `src-tauri/src/data.rs`, and a dead 941-line fork in `packages/shared/`;
- distro-family classification twice (`system.rs` and `actions.ts`), with
  different token lists;
- method preference three times — `pickOption()` in `actions.ts`, a cruder
  `build_action_command()` in `system.rs` used only by the CLI, and a third
  inline algorithm in `software-drawer.tsx`.

The GUI/CLI split caused that: the CLI could not reach the TypeScript catalogue,
so a worse copy was written in Rust. One terminal frontend in one language
removes the reason for the duplication.

## Vision

> **Set up a fresh Linux machine in one sitting, without googling a single
> install command.**

Two ideas hold it together:

1. **Curated, not complete.** `apt` and `pacman` already search a hundred
   thousand packages. Packall is the opposite: a few hundred apps someone chose,
   organised so you can discover them. The day it lists every package it has
   become a worse `apt`.
2. **It knows your machine.** You never type a package name or pick a method.
   Packall reads the distro, sees which tools exist, runs the right command.

Say no to: replacing apt/dnf/pacman, being a package search engine, being a
system updater (`topgrade` does that), and anything non-Linux.

---

## Step 1 — one catalogue — **DONE**

`catalog/packall.json` is now the single source of truth: 215 apps, 14
categories, with the original array order preserved (it is load-bearing — the UI
renders in array order and the keyboard tests assert on position).

- `npm run catalog` regenerates `src/lib/software.ts` and `src/lib/categories.ts`
- `npm run catalog:check` fails if they have drifted — worth adding to CI
- `packages/shared/` deleted (zero importers, verified)
- `catalog/catalog.go` embeds the same file with `//go:embed`

Verified: `npm run typecheck` clean, `npm test` 96/96 passing, generator is
idempotent. The only data change is that one entry's redundant `featured: false`
is now omitted; every consumer does a truthiness check.

**Still to do here:** point the Rust side at the same file. `src-tauri/src/data.rs`
is 929 lines of stale duplicate (~52 entries) read only by `cli.rs`. Replace its
two `vec![]` literals with:

```rust
static RAW: &str = include_str!("../../catalog/packall.json");
```

plus `serde` structs and a `OnceLock`. Note `featured` needs `#[serde(default)]`
since the JSON omits it when false. That deletes ~900 lines and incidentally
takes the existing Rust CLI from 52 apps to 215.

> I could not do this in the cloud container: `libwebkit2gtk-4.1-dev` is not
> available there, so the Tauri crate will not compile and I was not willing to
> push Rust I could not build. It should be a 20-minute job on your machine.
> Run `cargo test --manifest-path src-tauri/Cargo.toml` after — `data_test.rs`
> has 15 catalogue-invariant tests that will exercise it.

## Step 2 — the command logic in Go — **WRITTEN, NEEDS TESTS**

`internal/actions/actions.go` is a port of `src/lib/actions.ts` — the 370 lines
that carry all the operational knowledge. It compiles and vets clean, but **it
has no tests yet, so treat it as unverified.**

This is the de-risking step. Before writing any UI, port the 19 cases from
`src/test/actions.test.ts` into `internal/actions/actions_test.go`. If they pass,
the rest of the project is mechanical. If they fight you, you have learned that
for two days rather than two months.

The cases worth porting first, because they encode things that are easy to get
subtly wrong:

- `ParseOption` on a compound command takes only the first `&&` segment
- `ParseOption` on prose ("Download from …") yields `Automatable: false`
- apt install is `sudo sh -c "apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y X"`
- flatpak install is two commands — `remote-add --user --if-not-exists` then the install
- flatpak update/remove use `--user` with a `|| sudo … --system` fallback
- AUR picks `paru`, falls back to `yay`, and removal always goes through `pacman -Rns`
- `Pick` prefers the native method per family, falls back to flatpak, and for
  update/remove prefers whatever the entry is actually installed with
- `Bootstrap` for snap adds `systemctl enable --now snapd.socket`, plus the
  `/snap` symlink on Arch and Fedora

```bash
go test ./internal/actions/ -v
```

## Step 3 — distro detection and the runner

Two packages, both straightforward, both better in Go than in the Rust they
replace.

**`internal/distro`** — parse `/etc/os-release` for `ID` and `ID_LIKE`, classify
into the five families, and probe managers with `exec.LookPath` (the Rust shells
out to `which` ten times; `LookPath` is the same thing without the subprocess).
Port the family token lists from `src-tauri/src/system.rs:532` — they are more
complete than the TypeScript ones (`raspbian`, `neon`, `ol`, `sles`).

**`internal/runner`** — run a command, stream its output, report progress.
Port these details from `src-tauri/src/jobs.rs` rather than reinventing; they
were learned the hard way:

- **Treat `\r` as a line terminator as well as `\n`.** This is the whole reason
  progress meters work — apt and pacman redraw in place with carriage returns.
- `parse_percent` scans for the *last* `NN%` on a line, and falls back to
  pacman's `(3/10)` counter form.
- Kill the whole process group, not just the child, or `apt` keeps running.
  In Go: `cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}` and then
  `syscall.Kill(-cmd.Process.Pid, syscall.SIGTERM)`.
- A failing command aborts the rest of *that* job but not the whole batch.

The 100 ms poll loop the Rust uses for cancellation becomes a `context.Context`.
The two pump threads become goroutines on a channel.

**Do not port `SudoShim`.** Those ~170 lines exist only because a GUI has no
terminal to prompt at; it writes the plaintext password to `$TMPDIR/…/pw` and
PATH-injects a fake `sudo` so AUR helpers pick it up. A TUI has a tty. Use
`tea.ExecProcess` to suspend the UI, run `sudo -v` so the password is cached by
sudo itself, then a keepalive goroutine running `sudo -n -v` every ~60 s for long
batches. That deletes the mechanism and the plaintext file with it — see
issue #4.

## Step 4 — the TUI

`internal/tui`, with Bubble Tea v1.3 / Lip Gloss v1.1 / Bubbles v1.0 (the stable
API; v2 differs). Bubbles already gives you `list`, `textinput`, `viewport`,
`progress` and `help`, which covers most of it.

Model the screen on what the desktop app already does, since the shape is known
to work: category sidebar, filterable app list, detail pane, a queue, and a
progress area. Keys stay as they are — `j k h l`, `Space`, `i`/`u`/`x`, `a`, `c`,
`gg`/`G`, `/`, `?`, `Esc`. Mouse works too; Bubble Tea supports it.

The Elm-style update loop fits the job queue well: the runner sends messages
(`started`, `line`, `percent`, `finished`) over a channel, and
`tea.Cmd` turns each into a `Msg`. That replaces `jobs-reducer.ts` almost
one-for-one.

## Step 5 — the entrypoint

`cmd/packall/main.go`: no arguments opens the TUI, arguments run the CLI.
`src-tauri/src/main.rs` already branches this way, so it is a continuation
rather than a U-turn.

```
packall                      # TUI
packall install firefox vlc  # non-interactive, plain output
packall search editor
packall info btop
```

Keep the plain-text CLI path first-class. It is what makes the project
scriptable, and it is also the accessible path — screen readers handle line
output far better than a full-screen TUI, which is the one real cost of this
direction.

## Step 6 — ship beside the GUI, delete nothing yet

Tag the last Tauri release first. Ship the TUI as `v0.2.0` with both in the
repo. Retire the GUI when install numbers say so, not before — a rewrite that
also deletes the working product is how these go wrong.

Packaging gets much simpler at that point: `CGO_ENABLED=0 go build` gives a
static binary with no glibc floor, so the `ubuntu-22.04` pin in CI and the
AppImage both become unnecessary, and the PKGBUILD/spec dependency lines go away.

## Website

The site has been reframed around the terminal already, and the copy is accurate
for the current desktop app. When the TUI ships it needs:

- `/install/` — swap bundles and dependencies for a one-line static binary
  install plus `go install`
- the "Light and native / Tauri v2 + Rust" line → "one static binary, no
  dependencies, runs over SSH"
- the hero — an asciinema cast of the real TUI instead of the simulated shell

None of that is urgent, and none of the current site is wasted by it.
