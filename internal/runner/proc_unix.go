//go:build unix

package runner

import (
	"os/exec"
	"syscall"
)

// setpgid puts the child in its own process group, so a cancel can signal the
// whole tree. apt and pacman spawn children; killing only the shell leaves them
// running and the dpkg lock held.
func setpgid(cmd *exec.Cmd) {
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{}
	}
	cmd.SysProcAttr.Setpgid = true
}

// terminate signals the child's whole process group. The negative pid is what
// makes kill(2) address the group rather than the one process.
func terminate(cmd *exec.Cmd) {
	if cmd.Process == nil {
		return
	}
	pgid := -cmd.Process.Pid
	// Ask first, so a manager can unwind its own transaction and release its
	// lock; SIGKILL during a dpkg run leaves the system needing --configure -a.
	if err := syscall.Kill(pgid, syscall.SIGTERM); err != nil {
		_ = syscall.Kill(pgid, syscall.SIGKILL)
	}
}
