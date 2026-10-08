package runner

import (
	"context"
	"os/exec"
	"strings"
	"testing"
	"time"
)

func TestPercentTakesTheLastReadingOnTheLine(t *testing.T) {
	for _, tc := range []struct {
		line string
		want float64
	}{
		{"Downloading 45%", 45},
		{"Progress: [ 62%]", 62},
		{"nothing here", -1},
		{"", -1},
		// The useful number is the one at the end.
		{"fetching a (12%) ... 88%", 88},
		{"12.5%", 12.5},
		{"100%", 100},
		// Out of range is not progress.
		{"error 450%", -1},
		// A bare % with no digits in front of it is not progress.
		{"50 % done", -1},
		// pacman's counter form.
		{"(3/10) installing linux-firmware", 30},
		{"( 1 / 4 ) upgrading glibc", 25},
		// A counter that makes no sense is ignored.
		{"(9/4) nonsense", -1},
		{"(0/0) nothing", -1},
		// A percentage wins over a counter on the same line.
		{"(1/4) downloading 75%", 75},
	} {
		if got := Percent(tc.line); got != tc.want {
			t.Errorf("Percent(%q) = %v, want %v", tc.line, got, tc.want)
		}
	}
}

// A progress meter redraws in place with carriage returns. If \r is not treated
// as a terminator the whole meter arrives as one line when the command exits,
// which is the difference between a live progress bar and a frozen UI.
func TestPumpTreatsCarriageReturnAsALineTerminator(t *testing.T) {
	var got []string
	pump(strings.NewReader("10%\r20%\r30%\rdone\n"), func(line string) {
		got = append(got, line)
	})

	want := []string{"10%", "20%", "30%", "done"}
	if len(got) != len(want) {
		t.Fatalf("got %d lines %v, want %d %v", len(got), got, len(want), want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("line %d = %q, want %q", i, got[i], want[i])
		}
	}
}

func TestPumpHandlesCRLFAndEmptyLines(t *testing.T) {
	var got []string
	pump(strings.NewReader("one\r\n\r\ntwo\n\nthree"), func(line string) {
		got = append(got, line)
	})
	// \r\n must not produce a blank line between each real one, and a trailing
	// line with no terminator still has to arrive.
	want := []string{"one", "two", "three"}
	if strings.Join(got, "|") != strings.Join(want, "|") {
		t.Errorf("= %v, want %v", got, want)
	}
}

// requireShell skips tests that need a POSIX shell, so the suite still runs on
// a developer's Windows machine.
func requireShell(t *testing.T) {
	t.Helper()
	if _, err := exec.LookPath(Shell[0]); err != nil {
		t.Skipf("no %s on this host", Shell[0])
	}
}

// collect drains a run to completion and returns the events.
func collect(ch <-chan Event) []Event {
	var out []Event
	for ev := range ch {
		out = append(out, ev)
	}
	return out
}

func statuses(events []Event, job int) []Status {
	var out []Status
	for _, ev := range events {
		if ev.Job == job && ev.Status != "" {
			out = append(out, ev.Status)
		}
	}
	return out
}

func lines(events []Event, job int) []string {
	var out []string
	for _, ev := range events {
		if ev.Job == job && ev.Line != "" {
			out = append(out, ev.Line)
		}
	}
	return out
}

func TestRunReportsLinesAndCompletion(t *testing.T) {
	requireShell(t)

	events := collect(Runner{}.Run(context.Background(), []Job{
		{ID: "a", Label: "A", Commands: []string{"echo hello", "echo world"}},
	}))

	if got := lines(events, 0); strings.Join(got, "|") != "hello|world" {
		t.Errorf("lines = %v, want [hello world]", got)
	}
	if got := statuses(events, 0); strings.Join(asStrings(got), "|") != "running|done" {
		t.Errorf("statuses = %v, want [running done]", got)
	}
	last := events[len(events)-1]
	if !last.Done || last.Job != -1 {
		t.Errorf("final event = %+v, want the batch Done marker", last)
	}
}

// stderr is as interesting as stdout — a manager's errors are the output the
// user most needs to see.
func TestRunCapturesStderr(t *testing.T) {
	requireShell(t)

	events := collect(Runner{}.Run(context.Background(), []Job{
		{ID: "a", Commands: []string{"echo oops >&2"}},
	}))
	if got := lines(events, 0); strings.Join(got, "|") != "oops" {
		t.Errorf("lines = %v, want [oops]", got)
	}
}

func TestRunFailsTheJobButNotTheBatch(t *testing.T) {
	requireShell(t)

	events := collect(Runner{}.Run(context.Background(), []Job{
		{ID: "bad", Commands: []string{"exit 3", "echo never"}},
		{ID: "good", Commands: []string{"echo second"}},
	}))

	if got := statuses(events, 0); strings.Join(asStrings(got), "|") != "running|failed" {
		t.Errorf("job 0 = %v, want [running failed]", got)
	}
	// The rest of the *failing* job is abandoned.
	if got := lines(events, 0); len(got) != 0 {
		t.Errorf("job 0 printed %v, want nothing after the failure", got)
	}
	// The next job still runs.
	if got := statuses(events, 1); strings.Join(asStrings(got), "|") != "running|done" {
		t.Errorf("job 1 = %v, want [running done]", got)
	}
	if got := lines(events, 1); strings.Join(got, "|") != "second" {
		t.Errorf("job 1 lines = %v, want [second]", got)
	}
}

func TestRunReportsTheExitCode(t *testing.T) {
	requireShell(t)

	events := collect(Runner{}.Run(context.Background(), []Job{
		{ID: "bad", Commands: []string{"exit 7"}},
	}))

	for _, ev := range events {
		if ev.Status == Failed {
			var ce *CommandError
			if !asCommandError(ev.Err, &ce) {
				t.Fatalf("Err = %v (%T), want a *CommandError", ev.Err, ev.Err)
			}
			if ce.Code != 7 {
				t.Errorf("exit code = %d, want 7", ce.Code)
			}
			if !strings.Contains(ce.Error(), "exit 7") {
				t.Errorf("message = %q, want it to name the command", ce.Error())
			}
			return
		}
	}
	t.Fatal("no Failed event")
}

func TestRunCancelSkipsTheRestOfTheBatch(t *testing.T) {
	requireShell(t)

	ctx, cancel := context.WithCancel(context.Background())
	ch := Runner{}.Run(ctx, []Job{
		{ID: "slow", Commands: []string{"echo started; sleep 30"}},
		{ID: "next", Commands: []string{"echo never"}},
	})

	// Cancel once the first job has actually started.
	go func() {
		for ev := range ch {
			if ev.Line == "started" {
				cancel()
				return
			}
		}
	}()

	done := make(chan []Event, 1)
	go func() { done <- collect(ch) }()

	select {
	case events := <-done:
		// The queued job must be reported, not silently dropped.
		if got := statuses(events, 1); len(got) == 0 || got[len(got)-1] != Skipped {
			t.Errorf("job 1 = %v, want it skipped", got)
		}
		for _, ev := range events {
			if ev.Job == 1 && ev.Line != "" {
				t.Errorf("job 1 ran after cancel: %q", ev.Line)
			}
		}
	case <-time.After(20 * time.Second):
		t.Fatal("cancel did not stop the batch: the process group was not killed")
	}
}

func TestRunPassesEnv(t *testing.T) {
	requireShell(t)

	events := collect(Runner{Env: []string{"PACKALL_TEST=yes"}}.Run(
		context.Background(), []Job{{ID: "a", Commands: []string{"echo $PACKALL_TEST"}}}))
	if got := lines(events, 0); strings.Join(got, "|") != "yes" {
		t.Errorf("= %v, want [yes]", got)
	}
}

func TestRunEmptyBatchStillCompletes(t *testing.T) {
	events := collect(Runner{}.Run(context.Background(), nil))
	if len(events) != 1 || !events[0].Done {
		t.Errorf("= %+v, want just the Done marker", events)
	}
}

func asStrings(in []Status) []string {
	out := make([]string, len(in))
	for i, s := range in {
		out[i] = string(s)
	}
	return out
}

func asCommandError(err error, target **CommandError) bool {
	ce, ok := err.(*CommandError)
	if ok {
		*target = ce
	}
	return ok
}
