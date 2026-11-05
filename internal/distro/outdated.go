package distro

import (
	"bufio"
	"context"
	"errors"
	"os/exec"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/nishu-murmu/packall/internal/actions"
)

// checkTimeout bounds one manager's update check. Unlike the installed scan,
// most of these talk to the network, so they get longer.
const checkTimeout = 90 * time.Second

// Upgrade is an installed package that has a newer version waiting.
type Upgrade struct {
	// Manager is the id the installed scan reports, so the two line up.
	Manager string
	// Name matches actions.Package.Name for the same package.
	Name string
	// ID is the Flatpak application id; empty for every other manager.
	ID string
	// Current is the installed version, when the manager says. Flatpak and
	// DNF only report the new one.
	Current string
	// Latest is the version an update would bring in.
	Latest string
}

// Key identifies the package the same way the TUI keys installed packages.
func (u Upgrade) Key() string { return u.Manager + "/" + u.Name }

// Package converts the upgrade into the shape the command builder takes.
func (u Upgrade) Package() actions.Package {
	return actions.Package{Manager: u.Manager, Name: u.Name, Description: u.ID}
}

// checker is one manager's "what can be upgraded" query.
type checker struct {
	tool    string
	args    []string
	manager string
	parse   func(out string) []Upgrade
}

// arrowLine parses the "name old -> new" shape shared by pacman -Qu,
// checkupdates and the AUR helpers' -Qua.
func arrowLines(manager string) func(string) []Upgrade {
	return func(out string) []Upgrade {
		var ups []Upgrade
		eachLine(out, func(line string) {
			f := strings.Fields(line)
			if len(f) < 4 || f[2] != "->" {
				return
			}
			ups = append(ups, Upgrade{Manager: manager, Name: f[0], Current: f[1], Latest: f[3]})
		})
		return ups
	}
}

// aptLine is one row of `apt list --upgradable`:
//
//	firefox/jammy-updates 120.0+b2 amd64 [upgradable from: 119.0+b1]
var aptLine = regexp.MustCompile(`^([^/\s]+)/\S+\s+(\S+)\s+\S+\s+\[upgradable from:\s*([^\]]+)\]`)

func parseApt(out string) []Upgrade {
	var ups []Upgrade
	eachLine(out, func(line string) {
		m := aptLine.FindStringSubmatch(line)
		if m == nil {
			return
		}
		ups = append(ups, Upgrade{Manager: "apt", Name: m[1], Current: strings.TrimSpace(m[3]), Latest: m[2]})
	})
	return ups
}

// parseDnf reads `dnf check-update`: "name.arch  version  repo" rows, with an
// "Obsoleting Packages" section after them that is not an upgrade list.
func parseDnf(out string) []Upgrade {
	var ups []Upgrade
	seen := map[string]bool{}
	stop := false
	eachLine(out, func(line string) {
		if stop {
			return
		}
		if strings.HasPrefix(line, "Obsoleting") {
			stop = true
			return
		}
		// Continuation lines of a wrapped row start with whitespace.
		if line == "" || line[0] == ' ' || line[0] == '\t' {
			return
		}
		f := strings.Fields(line)
		if len(f) != 3 {
			return
		}
		dot := strings.LastIndex(f[0], ".")
		if dot <= 0 || !strings.ContainsAny(f[1], "0123456789") {
			return
		}
		name := f[0][:dot]
		// A multilib host lists the same package once per architecture.
		if seen[name] {
			return
		}
		seen[name] = true
		ups = append(ups, Upgrade{Manager: "dnf", Name: name, Latest: f[1]})
	})
	return ups
}

// parseZypper reads `zypper list-updates`, a table separated by pipes:
//
//	v | repo-oss | bash | 5.1-1.1 | 5.2-1.1 | x86_64
func parseZypper(out string) []Upgrade {
	var ups []Upgrade
	eachLine(out, func(line string) {
		cols := strings.Split(line, "|")
		if len(cols) < 6 {
			return
		}
		for i := range cols {
			cols[i] = strings.TrimSpace(cols[i])
		}
		// The header row says "S" in the status column; data rows say "v".
		if cols[0] != "v" || cols[2] == "" {
			return
		}
		ups = append(ups, Upgrade{Manager: "zypper", Name: cols[2], Current: cols[3], Latest: cols[4]})
	})
	return ups
}

// parseFlatpak reads `flatpak remote-ls --updates --app
// --columns=application,name,version`, tab separated.
func parseFlatpak(out string) []Upgrade {
	var ups []Upgrade
	eachLine(out, func(line string) {
		parts := strings.Split(line, "\t")
		id := strings.TrimSpace(parts[0])
		if id == "" || !strings.Contains(id, ".") {
			return
		}
		name := id
		if len(parts) > 1 && strings.TrimSpace(parts[1]) != "" {
			name = strings.TrimSpace(parts[1])
		}
		latest := ""
		if len(parts) > 2 {
			latest = strings.TrimSpace(parts[2])
		}
		ups = append(ups, Upgrade{Manager: "flatpak", Name: name, ID: id, Latest: latest})
	})
	return ups
}

// parseSnap reads `snap refresh --list`, whose Version column is the new one.
func parseSnap(out string) []Upgrade {
	var ups []Upgrade
	eachLine(out, func(line string) {
		f := strings.Fields(line)
		if len(f) < 2 || f[0] == "Name" || strings.HasPrefix(line, "All snaps") {
			return
		}
		ups = append(ups, Upgrade{Manager: "snap", Name: f[0], Latest: f[1]})
	})
	return ups
}

// brewLine is one row of `brew outdated --verbose`. Formulae say "<", casks
// that track "latest" say "!=", and several installed versions are listed
// comma-separated:
//
//	wget (1.21.3) < 1.21.4
//	python@3.12 (3.12.0, 3.12.1) < 3.12.2
var brewLine = regexp.MustCompile(`^(\S+)\s+\(([^)]*)\)\s+(?:<|!=)\s+(\S+)`)

func parseBrew(out string) []Upgrade {
	var ups []Upgrade
	eachLine(out, func(line string) {
		m := brewLine.FindStringSubmatch(line)
		if m == nil {
			return
		}
		current := m[2]
		if i := strings.LastIndex(current, ","); i >= 0 {
			current = current[i+1:]
		}
		ups = append(ups, Upgrade{Manager: "brew", Name: m[1], Current: strings.TrimSpace(current), Latest: m[3]})
	})
	return ups
}

func eachLine(out string, fn func(string)) {
	sc := bufio.NewScanner(strings.NewReader(out))
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		fn(strings.TrimRight(sc.Text(), "\r"))
	}
}

// checkers lists the queries for whatever is on this host. None of them needs
// root: each reads the manager's own cache, or a private copy of it.
func checkers() []checker {
	var out []checker
	has := func(tool string) bool {
		_, err := exec.LookPath(tool)
		return err == nil
	}

	// checkupdates (pacman-contrib) syncs into a temporary database, so it sees
	// new versions without touching the system's. pacman -Qu only knows what
	// the last -Sy fetched.
	switch {
	case has("checkupdates"):
		out = append(out, checker{tool: "checkupdates", args: []string{"--nocolor"}, manager: "pacman", parse: arrowLines("pacman")})
	case has("pacman"):
		out = append(out, checker{tool: "pacman", args: []string{"-Qu"}, manager: "pacman", parse: arrowLines("pacman")})
	}
	switch {
	case has("paru"):
		out = append(out, checker{tool: "paru", args: []string{"-Qua"}, manager: "aur", parse: arrowLines("aur")})
	case has("yay"):
		out = append(out, checker{tool: "yay", args: []string{"-Qua"}, manager: "aur", parse: arrowLines("aur")})
	}
	if has("apt") && has("dpkg-query") {
		out = append(out, checker{tool: "apt", args: []string{"list", "--upgradable"}, manager: "apt", parse: parseApt})
	}
	switch {
	case has("zypper"):
		out = append(out, checker{tool: "zypper", args: []string{"--non-interactive", "--quiet", "list-updates"}, manager: "zypper", parse: parseZypper})
	case has("dnf"):
		out = append(out, checker{tool: "dnf", args: []string{"check-update", "--quiet"}, manager: "dnf", parse: parseDnf})
	}
	if has("flatpak") {
		out = append(out, checker{tool: "flatpak", args: []string{"remote-ls", "--updates", "--app", "--columns=application,name,version"}, manager: "flatpak", parse: parseFlatpak})
	}
	if has("snap") {
		out = append(out, checker{tool: "snap", args: []string{"refresh", "--list"}, manager: "snap", parse: parseSnap})
	}
	if has("brew") {
		out = append(out, checker{tool: "brew", args: []string{"outdated", "--verbose"}, manager: "brew", parse: parseBrew})
	}
	return out
}

func (c checker) run(ctx context.Context) []Upgrade {
	ctx, cancel := context.WithTimeout(ctx, checkTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, c.tool, c.args...)
	cmd.Env = append(cmd.Environ(), "LC_ALL=C", "NO_COLOR=1")
	out, err := cmd.Output()
	if err != nil {
		// Several of these use the exit code as an answer rather than an
		// error: dnf says 100 when there are updates, checkupdates 2 and the
		// AUR helpers 1 when there are none. Whatever they printed still counts.
		var exit *exec.ExitError
		if !errors.As(err, &exit) || ctx.Err() != nil {
			return nil
		}
	}
	return c.parse(string(out))
}

// CheckUpdates asks every manager on the host what it could upgrade. The
// queries run in parallel; one that fails or times out contributes nothing.
func CheckUpdates(ctx context.Context) []Upgrade {
	var (
		wg  sync.WaitGroup
		mu  sync.Mutex
		out []Upgrade
	)
	for _, c := range checkers() {
		wg.Add(1)
		go func(c checker) {
			defer wg.Done()
			found := c.run(ctx)
			mu.Lock()
			out = append(out, found...)
			mu.Unlock()
		}(c)
	}
	wg.Wait()

	sort.Slice(out, func(i, j int) bool {
		if out[i].Manager != out[j].Manager {
			return out[i].Manager < out[j].Manager
		}
		return strings.ToLower(out[i].Name) < strings.ToLower(out[j].Name)
	})
	return out
}
