package tui

import (
	"strings"
	"testing"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/runner"
)

func testContext() actions.Context {
	return actions.Context{
		Family: actions.Debian,
		Managers: []actions.Manager{
			{ID: "apt", Available: true},
			{ID: "flatpak", Available: true},
		},
	}
}

func entries(t *testing.T, ids ...string) []*catalog.Entry {
	t.Helper()
	var out []*catalog.Entry
	for _, id := range ids {
		e, ok := catalog.ByID(id)
		if !ok {
			t.Fatalf("catalogue has no %q", id)
		}
		out = append(out, e)
	}
	return out
}

func TestNewBatchPlansCommands(t *testing.T) {
	b := NewBatch(actions.Install, entries(t, "firefox", "neovim"), testContext())

	if len(b.Jobs) != 2 {
		t.Fatalf("got %d jobs, want 2", len(b.Jobs))
	}
	for _, j := range b.Jobs {
		if j.Status != runner.Queued {
			t.Errorf("%s starts as %q, want queued", j.Label, j.Status)
		}
		if len(j.Command) == 0 {
			t.Errorf("%s has no commands", j.Label)
		}
		if j.Method != catalog.Apt {
			t.Errorf("%s picked %q, want apt on a debian host", j.Label, j.Method)
		}
	}
}

// An entry this host cannot handle must be visible as skipped, not silently
// dropped — otherwise the user queues five things and four happen.
func TestNewBatchMarksUnsupportedEntriesSkipped(t *testing.T) {
	bare := actions.Context{Family: actions.Debian, Managers: []actions.Manager{
		{ID: "apt", Available: false},
		{ID: "flatpak", Available: false},
		{ID: "snap", Available: false},
		{ID: "dnf", Available: false},
		{ID: "zypper", Available: false},
	}}

	b := NewBatch(actions.Install, entries(t, "firefox"), bare)
	if len(b.Jobs) != 1 {
		t.Fatalf("got %d jobs, want the entry kept", len(b.Jobs))
	}
	if b.Jobs[0].Status != runner.Skipped {
		t.Errorf("status = %q, want skipped", b.Jobs[0].Status)
	}
	if b.Jobs[0].Err == nil {
		t.Error("a skipped job needs a reason the UI can show")
	}

	// A skipped job is never handed to the runner.
	jobs, index := b.Runnable()
	if len(jobs) != 0 || len(index) != 0 {
		t.Errorf("Runnable = %v / %v, want nothing to run", jobs, index)
	}
}

func TestRunnableMapsIndicesBackPastSkippedJobs(t *testing.T) {
	b := &Batch{Jobs: []Job{
		{ID: "a", Status: runner.Skipped},
		{ID: "b", Status: runner.Queued, Command: []string{"true"}},
		{ID: "c", Status: runner.Skipped},
		{ID: "d", Status: runner.Queued, Command: []string{"true"}},
	}}

	jobs, index := b.Runnable()
	if len(jobs) != 2 {
		t.Fatalf("got %d runnable, want 2", len(jobs))
	}
	// Runner job 0 is batch job 1, runner job 1 is batch job 3. Getting this
	// wrong attributes output to the wrong package.
	if index[0] != 1 || index[1] != 3 {
		t.Errorf("index = %v, want [1 3]", index)
	}

	b.Apply(runner.Event{Job: 1, Status: runner.Running}, index)
	if b.Jobs[3].Status != runner.Running {
		t.Errorf("event for runner job 1 landed on the wrong batch job: %+v", b.Jobs)
	}
	if b.Active != 3 {
		t.Errorf("Active = %d, want 3", b.Active)
	}
}

func TestApplyFoldsEventsIntoState(t *testing.T) {
	b := &Batch{Active: -1, Jobs: []Job{{ID: "a", Label: "A", Status: runner.Queued, Percent: -1}}}
	index := []int{0}

	b.Apply(runner.Event{Job: 0, Status: runner.Running, Percent: -1}, index)
	if b.Jobs[0].Status != runner.Running || b.Active != 0 {
		t.Fatalf("after running: %+v active=%d", b.Jobs[0], b.Active)
	}

	b.Apply(runner.Event{Job: 0, Line: "Unpacking…", Percent: 40}, index)
	if got := b.Jobs[0].Last(); got != "Unpacking…" {
		t.Errorf("Last() = %q", got)
	}
	if b.Jobs[0].Percent != 40 {
		t.Errorf("percent = %v, want 40", b.Jobs[0].Percent)
	}

	// A line with no progress reading must not reset the bar to zero.
	b.Apply(runner.Event{Job: 0, Line: "Setting up…", Percent: -1}, index)
	if b.Jobs[0].Percent != 40 {
		t.Errorf("percent = %v after a line with no reading, want it held at 40",
			b.Jobs[0].Percent)
	}

	b.Apply(runner.Event{Job: 0, Status: runner.Done}, index)
	if b.Jobs[0].Status != runner.Done || b.Jobs[0].Percent != 100 {
		t.Errorf("after done: %+v", b.Jobs[0])
	}
}

func TestApplyDoneMarksStragglersSkipped(t *testing.T) {
	b := &Batch{Active: 0, Jobs: []Job{
		{ID: "a", Status: runner.Done},
		{ID: "b", Status: runner.Running},
		{ID: "c", Status: runner.Queued},
	}}

	b.Apply(runner.Event{Job: -1, Done: true}, []int{0, 1, 2})

	if !b.Finished || b.Active != -1 {
		t.Errorf("finished=%v active=%d", b.Finished, b.Active)
	}
	// A cancel leaves jobs running and queued; neither of those is a true
	// state once the batch is over.
	for i, want := range []runner.Status{runner.Done, runner.Skipped, runner.Skipped} {
		if b.Jobs[i].Status != want {
			t.Errorf("job %d = %q, want %q", i, b.Jobs[i].Status, want)
		}
	}
	if b.Ended.IsZero() {
		t.Error("Ended was not set")
	}
}

func TestApplyIgnoresOutOfRangeEvents(t *testing.T) {
	b := &Batch{Active: -1, Jobs: []Job{{ID: "a"}}}
	// Must not panic.
	b.Apply(runner.Event{Job: 5, Status: runner.Running}, []int{0})
	b.Apply(runner.Event{Job: -2, Line: "x"}, []int{0})
	if b.Jobs[0].Status != "" {
		t.Errorf("a bogus event changed state: %+v", b.Jobs[0])
	}
}

func TestLogIsCapped(t *testing.T) {
	b := &Batch{Active: -1, Jobs: []Job{{ID: "a"}}}
	index := []int{0}

	for i := 0; i < maxLinesPerJob*3; i++ {
		b.Apply(runner.Event{Job: 0, Line: "line", Percent: -1}, index)
	}
	if got := len(b.Jobs[0].Lines); got != maxLinesPerJob {
		t.Errorf("kept %d lines, want the cap of %d", got, maxLinesPerJob)
	}
}

// The cap has to drop from the front: when a command fails, the useful output
// is the last thing it said.
func TestLogKeepsTheTail(t *testing.T) {
	b := &Batch{Active: -1, Jobs: []Job{{ID: "a"}}}
	index := []int{0}

	for i := 0; i < maxLinesPerJob+10; i++ {
		b.Apply(runner.Event{Job: 0, Line: lineName(i), Percent: -1}, index)
	}
	last := b.Jobs[0].Lines[len(b.Jobs[0].Lines)-1]
	if last != lineName(maxLinesPerJob+9) {
		t.Errorf("last line = %q, want the most recent one", last)
	}
}

func lineName(i int) string {
	return "line-" + strings.Repeat("x", i%3) + itoa(i)
}

func itoa(i int) string {
	if i == 0 {
		return "0"
	}
	var b []byte
	for i > 0 {
		b = append([]byte{byte('0' + i%10)}, b...)
		i /= 10
	}
	return string(b)
}

func TestProgressCountsAPartlyDoneJob(t *testing.T) {
	b := &Batch{Jobs: []Job{
		{Status: runner.Done},
		{Status: runner.Running, Percent: 50},
		{Status: runner.Queued},
		{Status: runner.Queued},
	}}
	// 1 + 0.5 out of 4.
	if got := b.Progress(); got < 0.374 || got > 0.376 {
		t.Errorf("Progress() = %v, want ~0.375", got)
	}

	// A batch where everything was skipped is finished, not stuck at zero.
	all := &Batch{Jobs: []Job{{Status: runner.Skipped}, {Status: runner.Failed}}}
	if got := all.Progress(); got != 1 {
		t.Errorf("a resolved batch = %v, want 1", got)
	}
	if got := (&Batch{}).Progress(); got != 1 {
		t.Errorf("an empty batch = %v, want 1", got)
	}
}

func TestCountsAndSummary(t *testing.T) {
	b := &Batch{Action: actions.Install, Jobs: []Job{
		{Status: runner.Done}, {Status: runner.Done},
		{Status: runner.Failed}, {Status: runner.Skipped},
		{Status: runner.Queued},
	}}

	done, failed, skipped, pending := b.Counts()
	if done != 2 || failed != 1 || skipped != 1 || pending != 1 {
		t.Errorf("counts = %d/%d/%d/%d, want 2/1/1/1", done, failed, skipped, pending)
	}

	got := b.Summary()
	for _, want := range []string{"2 installed", "1 failed", "1 skipped"} {
		if !strings.Contains(got, want) {
			t.Errorf("Summary() = %q, want it to mention %q", got, want)
		}
	}

	b.Cancelled = true
	if !strings.HasPrefix(b.Summary(), "cancelled") {
		t.Errorf("a cancelled batch should say so: %q", b.Summary())
	}

	if got := (&Batch{Action: actions.Remove}).Summary(); got != "nothing to do" {
		t.Errorf("empty summary = %q", got)
	}
}

func TestSummaryUsesThePastTenseOfTheAction(t *testing.T) {
	for action, want := range map[actions.Action]string{
		actions.Install: "installed",
		actions.Update:  "updated",
		actions.Remove:  "removed",
	} {
		b := &Batch{Action: action, Jobs: []Job{{Status: runner.Done}}}
		if got := b.Summary(); !strings.Contains(got, want) {
			t.Errorf("%s summary = %q, want %q", action, got, want)
		}
	}
}

func TestNeedsRoot(t *testing.T) {
	// A flatpak --user install needs no privileges, and must not provoke a
	// password prompt.
	flatpakOnly := &Batch{Jobs: []Job{{Command: []string{
		"flatpak install --user -y --noninteractive flathub org.x.Y",
	}}}}
	if flatpakOnly.NeedsRoot() {
		t.Error("a per-user flatpak install does not need root")
	}

	apt := &Batch{Jobs: []Job{
		{Command: []string{"flatpak install --user -y flathub org.x.Y"}},
		{Command: []string{`sudo sh -c "apt-get install -y git"`}},
	}}
	if !apt.NeedsRoot() {
		t.Error("a batch containing an apt install needs root")
	}
}

func TestFailuresListsWhatWentWrong(t *testing.T) {
	b := &Batch{Jobs: []Job{
		{Label: "ok", Status: runner.Done},
		{Label: "broken", Status: runner.Failed, Err: errString("exit 1")},
		{Label: "unsupported", Status: runner.Skipped, Err: errString("no method")},
		// A job skipped by a cancel has no error and is not a failure.
		{Label: "cancelled", Status: runner.Skipped},
	}}

	got := b.Failures()
	if len(got) != 2 {
		t.Fatalf("got %d failures %v, want 2", len(got), got)
	}
	if got[0].Label != "broken" || got[1].Label != "unsupported" {
		t.Errorf("= %v", got)
	}
}

type errString string

func (e errString) Error() string { return string(e) }

func TestNewPackageBatchUsesTheScannedManager(t *testing.T) {
	pkgs := []actions.Package{
		{Manager: "flatpak", Name: "Firefox", Description: "org.mozilla.firefox"},
		{Manager: "apt", Name: "git"},
	}
	b := NewPackageBatch(actions.Remove, pkgs, nil)

	if len(b.Jobs) != 2 {
		t.Fatalf("got %d jobs, want 2", len(b.Jobs))
	}
	// Flatpak removal must use the application id, not the display name.
	if !strings.Contains(strings.Join(b.Jobs[0].Command, " "), "org.mozilla.firefox") {
		t.Errorf("flatpak job = %v, want the application id", b.Jobs[0].Command)
	}
	if !strings.Contains(strings.Join(b.Jobs[1].Command, " "), "apt-get remove") {
		t.Errorf("apt job = %v", b.Jobs[1].Command)
	}
	if b.Jobs[0].ID == b.Jobs[1].ID {
		t.Error("jobs need distinct ids")
	}
}

func TestNewPackageBatchSkipsManagersItCannotDrive(t *testing.T) {
	b := NewPackageBatch(actions.Remove,
		[]actions.Package{{Manager: "nix", Name: "hello"}}, nil)
	if b.Jobs[0].Status != runner.Skipped {
		t.Errorf("status = %q, want skipped for an unknown manager", b.Jobs[0].Status)
	}
	if b.Jobs[0].Err == nil {
		t.Error("the user needs to be told why")
	}
}
