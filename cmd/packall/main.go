// Command packall browses and installs a curated catalogue of Linux software.
//
// With no arguments it opens the terminal interface. With arguments it runs the
// plain-text CLI, which stays first-class: it is what makes Packall scriptable,
// and it is the accessible path, since screen readers handle line output far
// better than a full-screen TUI.
package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"text/tabwriter"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/distro"
	"github.com/nishu-murmu/packall/internal/runner"
	"github.com/nishu-murmu/packall/internal/tui"
)

// version is set at build time: -ldflags "-X main.version=v0.2.0".
var version = "dev"

const usage = `packall — a curated catalogue of Linux software

usage:
  packall                       open the terminal interface
  packall list [category]       list the catalogue, or one category
  packall categories            list the categories
  packall search <query>        search by name, tag or description
  packall info <app>            show one app and how it installs here
  packall install <app>...      install apps
  packall update <app>...       update apps
  packall remove <app>...       remove apps
  packall doctor                show what this machine is and what it has

options:
  -n, --dry-run                 print the commands instead of running them
  -y, --yes                     do not ask for confirmation
  -h, --help                    show this help
  -V, --version                 show the version
`

func main() {
	args := os.Args[1:]

	// Flags can come before or after the subcommand.
	var dryRun, assumeYes bool
	var rest []string
	for _, a := range args {
		switch a {
		case "-n", "--dry-run":
			dryRun = true
		case "-y", "--yes":
			assumeYes = true
		case "-h", "--help", "help":
			fmt.Print(usage)
			return
		case "-V", "--version", "version":
			fmt.Printf("packall %s\n", version)
			return
		default:
			rest = append(rest, a)
		}
	}

	if len(rest) == 0 {
		if err := runTUI(); err != nil {
			fmt.Fprintln(os.Stderr, "packall:", err)
			os.Exit(1)
		}
		return
	}

	if err := runCLI(rest, dryRun, assumeYes); err != nil {
		fmt.Fprintln(os.Stderr, "packall:", err)
		os.Exit(1)
	}
}

func runTUI() error {
	p := tea.NewProgram(tui.New(), tea.WithAltScreen(), tea.WithMouseCellMotion())
	_, err := p.Run()
	return err
}

// ------------------------------------------------------------------------ cli

func runCLI(args []string, dryRun, assumeYes bool) error {
	command, rest := args[0], args[1:]

	switch command {
	case "list":
		return cmdList(rest)
	case "categories":
		return cmdCategories()
	case "search":
		if len(rest) == 0 {
			return fmt.Errorf("search needs a query")
		}
		return cmdSearch(strings.Join(rest, " "))
	case "info":
		if len(rest) == 0 {
			return fmt.Errorf("info needs an app")
		}
		return cmdInfo(rest[0])
	case "doctor":
		return cmdDoctor()
	case "install":
		return cmdAction(actions.Install, rest, dryRun, assumeYes)
	case "update", "upgrade":
		return cmdAction(actions.Update, rest, dryRun, assumeYes)
	case "remove", "uninstall":
		return cmdAction(actions.Remove, rest, dryRun, assumeYes)
	default:
		return fmt.Errorf("unknown command %q — try `packall --help`", command)
	}
}

func cmdCategories() error {
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	for _, c := range catalog.Categories() {
		fmt.Fprintf(w, "%s\t%d\t%s\n", c.ID, catalog.Count(c.ID), c.Description)
	}
	return w.Flush()
}

func cmdList(args []string) error {
	entries := catalog.All()
	if len(args) > 0 {
		entries = catalog.InCategory(args[0])
		if len(entries) == 0 {
			return fmt.Errorf("no category %q — try `packall categories`", args[0])
		}
	}
	return printEntries(entries)
}

func cmdSearch(query string) error {
	entries := catalog.Search(query)
	if len(entries) == 0 {
		return fmt.Errorf("nothing matches %q", query)
	}
	return printEntries(entries)
}

// printEntries lists entries with the method this host would use, so the output
// is useful rather than merely a catalogue dump.
func printEntries(entries []catalog.Entry) error {
	host := distro.Detect()
	ctx := host.Context(nil)

	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	for i := range entries {
		method := "—"
		if opt := actions.Pick(&entries[i], actions.Install, ctx); opt != nil {
			method = string(opt.Method)
		}
		fmt.Fprintf(w, "%s\t%s\t%s\n", entries[i].ID, method, entries[i].Tagline)
	}
	return w.Flush()
}

func cmdInfo(token string) error {
	e, ok := catalog.Lookup(token)
	if !ok {
		return fmt.Errorf("no app %q — try `packall search %s`", token, token)
	}

	host := distro.Detect()
	ctx := host.Context(nil)

	fmt.Printf("%s — %s\n\n", e.Name, e.Tagline)
	if e.Description != "" {
		fmt.Printf("%s\n\n", e.Description)
	}
	fmt.Printf("category  %s\n", e.Category)
	fmt.Printf("license   %s\n", e.License)
	fmt.Printf("homepage  %s\n", e.Homepage)
	if len(e.Tags) > 0 {
		fmt.Printf("tags      %s\n", strings.Join(e.Tags, " "))
	}

	fmt.Printf("\non this machine (%s)\n", host.Name)
	chosen := actions.Pick(e, actions.Install, ctx)
	if chosen == nil {
		fmt.Println("  nothing here can install it")
		if want := actions.MissingUniversal(e, ctx); want != "" {
			fmt.Printf("  install %s first and it becomes available\n", want)
		}
	} else {
		for _, c := range actions.Build(actions.Install, *chosen, host.Managers) {
			fmt.Printf("  %s\n", c)
		}
	}

	fmt.Println("\nevery option")
	for _, o := range e.Install {
		mark := " "
		if actions.MethodAvailable(o.Method, host.Managers) {
			mark = "✓"
		}
		fmt.Printf("  %s %-12s %s\n", mark, o.Method.Label(), o.Command)
	}
	return nil
}

func cmdDoctor() error {
	host := distro.Detect()

	fmt.Printf("packall   %s\n", version)
	fmt.Printf("system    %s\n", host.Name)
	fmt.Printf("id        %s", orDash(host.ID))
	if host.IDLike != "" {
		fmt.Printf(" (like %s)", host.IDLike)
	}
	fmt.Println()
	fmt.Printf("family    %s\n", host.Family)
	fmt.Printf("preferred %s\n", orDash(host.Preferred))

	fmt.Println("\nmanagers")
	for _, m := range host.Managers {
		mark := " "
		if m.Available {
			mark = "✓"
		}
		fmt.Printf("  %s %s\n", mark, distro.Label(m.ID))
	}
	if !tui.SudoAvailable() {
		fmt.Println("\n! sudo was not found; privileged installs will fail")
	}

	fmt.Printf("\ncatalogue %d apps in %d categories\n",
		len(catalog.All()), len(catalog.Categories()))
	return nil
}

// cmdAction installs, updates or removes, printing plain lines as it goes.
func cmdAction(action actions.Action, names []string, dryRun, assumeYes bool) error {
	if len(names) == 0 {
		return fmt.Errorf("%s needs at least one app", action)
	}

	var entries []*catalog.Entry
	var unknown []string
	for _, n := range names {
		if e, ok := catalog.Lookup(n); ok {
			entries = append(entries, e)
			continue
		}
		unknown = append(unknown, n)
	}
	if len(unknown) > 0 {
		return fmt.Errorf("not in the catalogue: %s", strings.Join(unknown, ", "))
	}

	host := distro.Detect()
	// Update and remove need to know what is installed to pick the method the
	// package actually came from; install does not, and the scan is slow.
	var packages []actions.Package
	if action != actions.Install {
		packages = distro.ScanInstalled(context.Background())
	}
	ctx := host.Context(packages)

	type plan struct {
		entry    *catalog.Entry
		commands []string
	}
	var planned []plan
	for _, e := range entries {
		cmds := actions.For(e, action, ctx)
		if cmds.Option == nil || len(cmds.Commands) == 0 {
			fmt.Fprintf(os.Stderr, "skipping %s: nothing here can %s it\n", e.Name, action)
			continue
		}
		planned = append(planned, plan{e, cmds.Commands})
	}
	if len(planned) == 0 {
		return fmt.Errorf("nothing to %s", action)
	}

	fmt.Printf("%s %d:\n", action, len(planned))
	for _, p := range planned {
		fmt.Printf("  %s\n", p.entry.Name)
		for _, c := range p.commands {
			fmt.Printf("    %s\n", c)
		}
	}

	if dryRun {
		return nil
	}
	if !assumeYes && !confirm() {
		fmt.Println("nothing was run")
		return nil
	}

	var jobs []runner.Job
	for _, p := range planned {
		jobs = append(jobs, runner.Job{ID: p.entry.ID, Label: p.entry.Name, Commands: p.commands})
	}

	// ctrl+c should stop the batch cleanly — and take the manager's process
	// group with it — rather than leaving apt half-way through.
	runCtx, cancel := signal.NotifyContext(context.Background(),
		os.Interrupt, syscall.SIGTERM)
	defer cancel()

	var failed int
	for ev := range (runner.Runner{Env: cliEnv()}).Run(runCtx, jobs) {
		switch {
		case ev.Done:
		case ev.Status == runner.Running:
			fmt.Printf("\n==> %s\n", jobs[ev.Job].Label)
		case ev.Status == runner.Done:
			fmt.Printf("    ok\n")
		case ev.Status == runner.Failed:
			failed++
			fmt.Printf("    failed: %v\n", ev.Err)
		case ev.Status == runner.Skipped:
			fmt.Printf("    skipped\n")
		case ev.Line != "":
			fmt.Printf("    %s\n", ev.Line)
		}
	}

	if failed > 0 {
		return fmt.Errorf("%d of %d failed", failed, len(jobs))
	}
	return nil
}

func cliEnv() []string {
	return []string{
		"DEBIAN_FRONTEND=noninteractive",
		"PAGER=cat",
		"SYSTEMD_PAGER=",
	}
}

func confirm() bool {
	fmt.Print("\nproceed? [y/N] ")
	var answer string
	if _, err := fmt.Scanln(&answer); err != nil {
		return false
	}
	answer = strings.ToLower(strings.TrimSpace(answer))
	return answer == "y" || answer == "yes"
}

func orDash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}
