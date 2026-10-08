// Package runner executes the commands the catalogue produces and streams what
// they print.
//
// The details here are ported from src-tauri/src/jobs.rs rather than
// reinvented, because they were learned the hard way:
//
//   - a carriage return is a line terminator too, which is the only reason
//     progress meters work at all: apt and pacman redraw in place with \r;
//   - percent detection takes the *last* NN% on a line, and falls back to
//     pacman's (3/10) counter;
//   - killing the child is not enough, the whole process group has to go, or
//     apt keeps running after cancel;
//   - a failing command stops the rest of its own job but not the batch.
package runner

import (
	"bufio"
	"context"
	"errors"
	"io"
	"os/exec"
	"strconv"
	"strings"
	"sync"
)

// Status is where one job has got to.
type Status string

const (
	Queued  Status = "queued"
	Running Status = "running"
	Done    Status = "done"
	Failed  Status = "failed"
	Skipped Status = "skipped"
)

// Job is one unit of work: everything that has to happen for one entry.
type Job struct {
	// ID identifies the job to the UI; the catalogue id, normally.
	ID string
	// Label is what the UI shows, e.g. "Firefox".
	Label string
	// Commands run in order. The first failure abandons the rest of this job.
	Commands []string
}

// Event is one thing that happened, sent in order on the channel Run returns.
type Event struct {
	// Job is the index of the job in the batch this is about, or -1 for an
	// event about the batch as a whole.
	Job int
	// Status is set on a state change, and empty on a Line or Percent event.
	Status Status
	// Line is one line the command printed, with the trailing \r or \n gone.
	Line string
	// Percent is a progress reading in 0..100, and -1 when the line carried no
	// progress information.
	Percent float64
	// Err is set when Status is Failed.
	Err error
	// Done is true on the single final event, after every job has finished.
	Done bool
}

// Shell is the program commands are handed to. The catalogue stores shell
// strings with pipes, quoting and || fallbacks, so they need a shell; sh is
// enough and is everywhere.
var Shell = []string{"/bin/sh", "-c"}

// Runner executes a batch of jobs.
type Runner struct {
	// Env holds extra environment entries, "K=V", for every command.
	Env []string
	// Dir is the working directory, or "" for the current one.
	Dir string
}

// Run starts the batch and returns a channel of events, closed after the final
// Done event. Cancelling ctx kills the running command's process group and ends
// the batch; jobs that had not started are reported Skipped.
func (r Runner) Run(ctx context.Context, jobs []Job) <-chan Event {
	out := make(chan Event, 256)

	go func() {
		defer close(out)

		for i, job := range jobs {
			if ctx.Err() != nil {
				out <- Event{Job: i, Status: Skipped, Percent: -1}
				continue
			}

			out <- Event{Job: i, Status: Running, Percent: -1}

			err := r.runJob(ctx, i, job, out)
			switch {
			case err == nil:
				out <- Event{Job: i, Status: Done, Percent: 100}
			case ctx.Err() != nil:
				// Cancelled rather than broken.
				out <- Event{Job: i, Status: Skipped, Percent: -1, Err: err}
			default:
				out <- Event{Job: i, Status: Failed, Percent: -1, Err: err}
			}
		}

		out <- Event{Job: -1, Done: true, Percent: -1}
	}()

	return out
}

// runJob runs one job's commands in order, stopping at the first failure.
func (r Runner) runJob(ctx context.Context, index int, job Job, out chan<- Event) error {
	for _, command := range job.Commands {
		if ctx.Err() != nil {
			return ctx.Err()
		}
		if err := r.exec(ctx, index, command, out); err != nil {
			return err
		}
	}
	return nil
}

// exec runs one shell command, forwarding every line it prints.
func (r Runner) exec(ctx context.Context, index int, command string, out chan<- Event) error {
	args := append(append([]string{}, Shell[1:]...), command)
	cmd := exec.Command(Shell[0], args...)
	cmd.Dir = r.Dir
	if len(r.Env) > 0 {
		cmd.Env = append(cmd.Environ(), r.Env...)
	}
	// Give the child its own process group so cancel can take its children too.
	setpgid(cmd)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	cmd.Stderr = cmd.Stdout

	if err := cmd.Start(); err != nil {
		return err
	}

	// Cancellation has to reach the group, so it cannot be left to
	// exec.CommandContext, which signals the child alone.
	stop := make(chan struct{})
	var once sync.Once
	closeStop := func() { once.Do(func() { close(stop) }) }
	defer closeStop()
	go func() {
		select {
		case <-ctx.Done():
			terminate(cmd)
		case <-stop:
		}
	}()

	pump(stdout, func(line string) {
		out <- Event{Job: index, Line: line, Percent: Percent(line)}
	})

	waitErr := cmd.Wait()
	closeStop()

	if waitErr != nil {
		if ctx.Err() != nil {
			return ctx.Err()
		}
		var exit *exec.ExitError
		if errors.As(waitErr, &exit) {
			return &CommandError{Command: command, Code: exit.ExitCode()}
		}
		return waitErr
	}
	return nil
}

// CommandError is a command that ran and failed.
type CommandError struct {
	Command string
	Code    int
}

func (e *CommandError) Error() string {
	return "exit status " + strconv.Itoa(e.Code) + ": " + e.Command
}

// pump reads output and calls emit once per line, treating both \n and \r as
// terminators. Without the \r case, a progress meter that redraws in place
// arrives as one enormous line at the end of the command.
func pump(r io.Reader, emit func(string)) {
	br := bufio.NewReaderSize(r, 64*1024)
	var buf strings.Builder

	flush := func() {
		if buf.Len() == 0 {
			return
		}
		line := strings.TrimRight(buf.String(), " \t")
		buf.Reset()
		if line != "" {
			emit(line)
		}
	}

	for {
		c, err := br.ReadByte()
		if err != nil {
			flush()
			return
		}
		switch c {
		case '\n', '\r':
			flush()
		default:
			buf.WriteByte(c)
			// A single very long line (a download with no terminator at all)
			// must not grow without bound.
			if buf.Len() > 1<<20 {
				flush()
			}
		}
	}
}

// Percent reads a progress reading out of one output line, or returns -1.
//
// It takes the *last* percentage on the line, because managers print things
// like "Downloading x (12%) ... 45%" where the useful number is at the end.
func Percent(line string) float64 {
	// "... 45%" style, scanning right to left.
	for i := len(line) - 1; i >= 0; i-- {
		if line[i] != '%' {
			continue
		}
		j := i
		for j > 0 && (isDigit(line[j-1]) || line[j-1] == '.') {
			j--
		}
		if j == i {
			continue
		}
		if v, err := strconv.ParseFloat(line[j:i], 64); err == nil && v >= 0 && v <= 100 {
			return v
		}
	}

	// pacman's "(3/10)" counter.
	if open := strings.IndexByte(line, '('); open >= 0 {
		if close := strings.IndexByte(line[open:], ')'); close > 0 {
			inner := strings.TrimSpace(line[open+1 : open+close])
			if a, b, ok := strings.Cut(inner, "/"); ok {
				x, err1 := strconv.ParseFloat(strings.TrimSpace(a), 64)
				y, err2 := strconv.ParseFloat(strings.TrimSpace(b), 64)
				if err1 == nil && err2 == nil && y > 0 && x <= y {
					return x / y * 100
				}
			}
		}
	}
	return -1
}

func isDigit(b byte) bool { return b >= '0' && b <= '9' }
