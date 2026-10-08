package tui

import (
	"fmt"
	"strings"
	"time"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/runner"
)

// maxLinesPerJob caps the log kept per job. A full apt dist-upgrade prints tens
// of thousands of lines and nobody scrolls back that far; the tail is what
// matters when something fails.
const maxLinesPerJob = 400

// Job is one entry's work plus everything the UI shows about its progress.
// This is the Go equivalent of src/lib/jobs-reducer.ts.
type Job struct {
	ID      string
	Label   string
	Method  catalog.Method
	Command []string

	Status  runner.Status
	Percent float64
	Lines   []string
	Err     error
}

// Last returns the most recent output line, for a one-line status.
func (j Job) Last() string {
	if len(j.Lines) == 0 {
		return ""
	}
	return j.Lines[len(j.Lines)-1]
}

// Batch is one run of install, update or remove over a set of entries.
type Batch struct {
	Action actions.Action
	Jobs   []Job

	// Active is the index of the running job, or -1.
	Active int
	// Finished is set once the runner has reported the whole batch done.
	Finished bool
	// Cancelled records that the user stopped it rather than it completing.
	Cancelled bool

	Started time.Time
	Ended   time.Time
}

// NewBatch plans a batch: it resolves each entry to the commands this host
// needs. Entries nothing on this host can handle are recorded as skipped
// rather than dropped, so the user can see why.
func NewBatch(action actions.Action, entries []*catalog.Entry, ctx actions.Context) *Batch {
	b := &Batch{Action: action, Active: -1, Started: time.Now()}

	for _, e := range entries {
		job := Job{ID: e.ID, Label: e.Name, Status: runner.Queued, Percent: -1}

		cmds := actions.For(e, action, ctx)
		if cmds.Option == nil || len(cmds.Commands) == 0 {
			job.Status = runner.Skipped
			job.Err = fmt.Errorf("nothing on this host can %s %s", action, e.Name)
		} else {
			job.Method = cmds.Option.Method
			job.Command = cmds.Commands
		}
		b.Jobs = append(b.Jobs, job)
	}
	return b
}

// Runnable returns the jobs the runner should execute, and a mapping from each
// runner job index back to the index in Batch.Jobs. Skipped entries are not
// handed to the runner at all.
func (b *Batch) Runnable() ([]runner.Job, []int) {
	var jobs []runner.Job
	var index []int
	for i, j := range b.Jobs {
		if j.Status == runner.Skipped {
			continue
		}
		jobs = append(jobs, runner.Job{ID: j.ID, Label: j.Label, Commands: j.Command})
		index = append(index, i)
	}
	return jobs, index
}

// Apply folds one runner event into the batch. index maps the event's job
// number onto Batch.Jobs, as returned by Runnable.
func (b *Batch) Apply(ev runner.Event, index []int) {
	if ev.Done {
		b.Finished = true
		b.Active = -1
		b.Ended = time.Now()
		// Anything still queued when the batch ends never ran.
		for i := range b.Jobs {
			if b.Jobs[i].Status == runner.Queued || b.Jobs[i].Status == runner.Running {
				b.Jobs[i].Status = runner.Skipped
			}
		}
		return
	}

	if ev.Job < 0 || ev.Job >= len(index) {
		return
	}
	j := &b.Jobs[index[ev.Job]]

	if ev.Status != "" {
		j.Status = ev.Status
		if ev.Status == runner.Running {
			b.Active = index[ev.Job]
		}
		if ev.Err != nil {
			j.Err = ev.Err
		}
		if ev.Status == runner.Done {
			j.Percent = 100
		}
		return
	}

	if ev.Line != "" {
		j.Lines = append(j.Lines, ev.Line)
		if len(j.Lines) > maxLinesPerJob {
			// Drop from the front; the tail is the interesting end.
			j.Lines = j.Lines[len(j.Lines)-maxLinesPerJob:]
		}
	}
	if ev.Percent >= 0 {
		j.Percent = ev.Percent
	}
}

// Counts summarises the batch for the status line.
func (b *Batch) Counts() (done, failed, skipped, pending int) {
	for _, j := range b.Jobs {
		switch j.Status {
		case runner.Done:
			done++
		case runner.Failed:
			failed++
		case runner.Skipped:
			skipped++
		default:
			pending++
		}
	}
	return
}

// Progress is how far through the batch we are, in 0..1. A running job counts
// its own percentage, so the bar moves during a long download rather than
// jumping one notch per package.
func (b *Batch) Progress() float64 {
	if len(b.Jobs) == 0 {
		return 1
	}
	var sum float64
	for _, j := range b.Jobs {
		switch j.Status {
		case runner.Done, runner.Failed, runner.Skipped:
			sum += 1
		case runner.Running:
			if j.Percent > 0 {
				sum += j.Percent / 100
			}
		}
	}
	return sum / float64(len(b.Jobs))
}

// Summary is the one-line result shown when a batch ends.
func (b *Batch) Summary() string {
	done, failed, skipped, _ := b.Counts()

	var parts []string
	if done > 0 {
		parts = append(parts, fmt.Sprintf("%d %s", done, past(b.Action)))
	}
	if failed > 0 {
		parts = append(parts, fmt.Sprintf("%d failed", failed))
	}
	if skipped > 0 {
		parts = append(parts, fmt.Sprintf("%d skipped", skipped))
	}
	if len(parts) == 0 {
		return "nothing to do"
	}

	out := strings.Join(parts, ", ")
	if b.Cancelled {
		return "cancelled — " + out
	}
	return out
}

// past is the past participle used in the summary.
func past(a actions.Action) string {
	switch a {
	case actions.Install:
		return "installed"
	case actions.Update:
		return "updated"
	case actions.Remove:
		return "removed"
	default:
		return string(a)
	}
}

// Failures lists the jobs that failed, for the summary screen.
func (b *Batch) Failures() []Job {
	var out []Job
	for _, j := range b.Jobs {
		if j.Status == runner.Failed || (j.Status == runner.Skipped && j.Err != nil) {
			out = append(out, j)
		}
	}
	return out
}

// NeedsRoot reports whether any command in the batch uses sudo, which is what
// decides whether to prime the password before starting.
func (b *Batch) NeedsRoot() bool {
	for _, j := range b.Jobs {
		for _, c := range j.Command {
			if strings.Contains(c, "sudo ") {
				return true
			}
		}
	}
	return false
}

// NewPackageBatch plans work on packages found by the host scan, which have no
// catalogue entry behind them — the Installed view's update and remove.
func NewPackageBatch(action actions.Action, pkgs []actions.Package, managers []actions.Manager) *Batch {
	b := &Batch{Action: action, Active: -1, Started: time.Now()}

	for _, p := range pkgs {
		job := Job{
			ID:      p.Manager + "/" + p.Name,
			Label:   p.Name,
			Method:  catalog.Method(p.Manager),
			Status:  runner.Queued,
			Percent: -1,
		}
		cmds := actions.BuildForPackage(action, p, managers)
		if len(cmds) == 0 {
			job.Status = runner.Skipped
			job.Err = fmt.Errorf("cannot %s a %s package from here", action, p.Manager)
		} else {
			job.Command = cmds
		}
		b.Jobs = append(b.Jobs, job)
	}
	return b
}
