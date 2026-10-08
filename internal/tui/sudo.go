package tui

import (
	"context"
	"os/exec"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// Privileged work needs a password, and a TUI has somewhere to ask for one: the
// terminal it is already running in. So Packall does not handle the password at
// all. It suspends itself, runs `sudo -v`, and sudo prompts, validates and
// caches the credential in its own timestamp file.
//
// That is the whole reason the Rust SudoShim is not ported. A GUI has no tty, so
// it had to write the plaintext password to a file under $TMPDIR and PATH-inject
// a fake `sudo` so AUR helpers would pick it up — about 170 lines whose only
// purpose was to work around the absence of a terminal. See issue #4.
//
// What remains is the one real problem sudo's own caching has: the timestamp
// expires, by default after 15 minutes, and a batch of thirty packages on a slow
// connection can outlast it. A keepalive refreshes it in the background for as
// long as the batch runs.

// sudoKeepaliveInterval is comfortably inside the default 15-minute timeout,
// and short enough that a tightened sudoers timeout is still likely covered.
const sudoKeepaliveInterval = 60 * time.Second

// sudoKeepaliveCmd refreshes the cached credential while a batch runs, and
// stops as soon as ctx is done.
//
// `sudo -n -v` is non-interactive: if the credential has gone it fails rather
// than prompting, which matters because the UI is drawn over the terminal and a
// prompt appearing underneath it would be invisible. A failure here is not worth
// reporting — the command that needs root will report it properly.
func sudoKeepaliveCmd(ctx context.Context) tea.Cmd {
	return func() tea.Msg {
		go func() {
			t := time.NewTicker(sudoKeepaliveInterval)
			defer t.Stop()
			for {
				select {
				case <-ctx.Done():
					return
				case <-t.C:
					cmd := exec.Command("sudo", "-n", "-v")
					// Detach it from the terminal entirely, so nothing it
					// prints can land on top of the UI.
					cmd.Stdin, cmd.Stdout, cmd.Stderr = nil, nil, nil
					_ = cmd.Run()
				}
			}
		}()
		return nil
	}
}

// SudoAvailable reports whether sudo exists at all. On a system using doas or
// run0 the catalogue's commands will not work as written, and it is better to
// say so than to fail once per package.
func SudoAvailable() bool {
	_, err := exec.LookPath("sudo")
	return err == nil
}
