//go:build unix

package runner

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// Cancelling has to kill the process *group*. The shell Packall starts is not
// the thing holding the dpkg lock — its children are — so signalling the shell
// alone leaves apt running and the system wedged. This test proves the
// grandchild dies, which a test that only checks the batch stopped does not.
func TestCancelKillsGrandchildren(t *testing.T) {
	requireShell(t)

	dir := t.TempDir()
	marker := filepath.Join(dir, "alive")

	// The outer sh backgrounds a loop that keeps touching a file, then waits.
	// The loop is a grandchild: it survives a signal sent only to the shell.
	script := "(while true; do echo tick >> " + marker + "; sleep 0.1; done) & echo started; wait"

	ctx, cancel := context.WithCancel(context.Background())
	ch := Runner{}.Run(ctx, []Job{{ID: "nested", Commands: []string{script}}})

	for ev := range ch {
		if ev.Line == "started" {
			cancel()
			break
		}
	}
	// Drain so the runner goroutine can finish.
	go func() {
		for range ch {
		}
	}()

	// Give the signal time to land, then check the file stops growing.
	time.Sleep(600 * time.Millisecond)
	first := size(t, marker)
	time.Sleep(600 * time.Millisecond)
	second := size(t, marker)

	if second != first {
		t.Errorf("the grandchild is still running: marker grew from %d to %d bytes "+
			"after cancel — the process group was not signalled", first, second)
	}
}

func size(t *testing.T, path string) int64 {
	t.Helper()
	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return 0
		}
		t.Fatalf("stat %s: %v", path, err)
	}
	return info.Size()
}

// A cancel must ask before it insists: SIGKILL in the middle of a dpkg run
// leaves a system that needs `dpkg --configure -a` by hand.
func TestTerminateSendsSIGTERMFirst(t *testing.T) {
	requireShell(t)

	dir := t.TempDir()
	log := filepath.Join(dir, "trapped")

	script := "trap 'echo caught >> " + log + "; exit 0' TERM; echo started; " +
		"while true; do sleep 0.1; done"

	ctx, cancel := context.WithCancel(context.Background())
	ch := Runner{}.Run(ctx, []Job{{ID: "trap", Commands: []string{script}}})

	for ev := range ch {
		if ev.Line == "started" {
			cancel()
			break
		}
	}
	go func() {
		for range ch {
		}
	}()

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		if b, err := os.ReadFile(log); err == nil && strings.Contains(string(b), "caught") {
			return
		}
		time.Sleep(50 * time.Millisecond)
	}
	t.Error("the command never saw SIGTERM, so it had no chance to clean up")
}
