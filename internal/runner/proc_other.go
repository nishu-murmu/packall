//go:build !unix

package runner

import "os/exec"

// Packall only runs for real on Linux; these keep the package building on a
// developer's Windows or Plan 9 machine so the tests can be run there.
func setpgid(*exec.Cmd) {}

func terminate(cmd *exec.Cmd) {
	if cmd.Process != nil {
		_ = cmd.Process.Kill()
	}
}
