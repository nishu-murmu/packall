package distro

import (
	"bufio"
	"context"
	"os/exec"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/nishu-murmu/packall/internal/actions"
)

// scanTimeout bounds one manager's query. `dpkg-query -W` on a large install is
// the slow one, and a hung manager must not hang the UI.
const scanTimeout = 20 * time.Second

// scanner is one manager's "what is installed" query and the parser for it.
type scanner struct {
	// tool is the binary that must exist for this scan to run. It is not always
	// the manager's own name: apt is read through dpkg-query, dnf through rpm.
	tool string
	args []string
	// manager is the id reported on each package.
	manager string
	// parse turns one output line into a package. ok=false skips the line.
	parse func(line string) (actions.Package, bool)
	// skipFirst drops a header line.
	skipFirst bool
}

// fields splits on whitespace and takes the first two columns, which is the
// shape of pacman -Qe, snap list and brew list --versions.
func twoColumns(manager string) func(string) (actions.Package, bool) {
	return func(line string) (actions.Package, bool) {
		f := strings.Fields(line)
		if len(f) < 1 || f[0] == "" {
			return actions.Package{}, false
		}
		return actions.Package{Manager: manager, Name: f[0]}, true
	}
}

func scanners() []scanner {
	return []scanner{
		{
			tool: "pacman", args: []string{"-Qe"}, manager: "pacman",
			parse: twoColumns("pacman"),
		},
		{
			// -Qm is "foreign" packages: everything not in a sync database,
			// which in practice means everything from the AUR.
			tool: "paru", args: []string{"-Qm"}, manager: "aur",
			parse: twoColumns("aur"),
		},
		{
			tool: "snap", args: []string{"list"}, manager: "snap",
			parse: twoColumns("snap"), skipFirst: true,
		},
		{
			tool: "brew", args: []string{"list", "--versions"}, manager: "brew",
			parse: twoColumns("brew"),
		},
		{
			tool:    "flatpak",
			args:    []string{"list", "--app", "--columns=application,name"},
			manager: "flatpak",
			parse: func(line string) (actions.Package, bool) {
				parts := strings.Split(line, "\t")
				appID := strings.TrimSpace(parts[0])
				if appID == "" {
					return actions.Package{}, false
				}
				name := appID
				if len(parts) > 1 && strings.TrimSpace(parts[1]) != "" {
					name = strings.TrimSpace(parts[1])
				}
				// The application id goes in Description, which is where the
				// command builder looks for it.
				return actions.Package{Manager: "flatpak", Name: name, Description: appID}, true
			},
		},
		{
			tool: "dpkg-query", args: []string{"-W", "-f=${Package}\t${Status}\n"},
			manager: "apt",
			parse: func(line string) (actions.Package, bool) {
				parts := strings.Split(line, "\t")
				// "install ok installed" — a removed-but-configured package
				// says "deinstall ok config-files" and must not count.
				if len(parts) < 2 || !strings.HasSuffix(strings.TrimSpace(parts[1]), "installed") {
					return actions.Package{}, false
				}
				name := strings.TrimSpace(parts[0])
				if name == "" {
					return actions.Package{}, false
				}
				return actions.Package{Manager: "apt", Name: name}, true
			},
		},
	}
}

// rpmScanner is built separately because which manager owns an rpm depends on
// the host: zypper on openSUSE, dnf everywhere else.
func rpmScanner(zypper bool) scanner {
	manager := "dnf"
	if zypper {
		manager = "zypper"
	}
	return scanner{
		tool: "rpm", args: []string{"-qa", "--qf", "%{NAME}\\n"},
		manager: manager,
		parse: func(line string) (actions.Package, bool) {
			name := strings.TrimSpace(line)
			if name == "" {
				return actions.Package{}, false
			}
			return actions.Package{Manager: manager, Name: name}, true
		},
	}
}

// run executes one scanner and returns what it found. A manager that is absent,
// fails or times out contributes nothing rather than failing the whole scan.
func (s scanner) run(ctx context.Context) []actions.Package {
	if _, err := exec.LookPath(s.tool); err != nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(ctx, scanTimeout)
	defer cancel()

	out, err := exec.CommandContext(ctx, s.tool, s.args...).Output()
	if err != nil {
		return nil
	}

	var pkgs []actions.Package
	sc := bufio.NewScanner(strings.NewReader(string(out)))
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	first := true
	for sc.Scan() {
		if first && s.skipFirst {
			first = false
			continue
		}
		first = false
		if p, ok := s.parse(sc.Text()); ok {
			pkgs = append(pkgs, p)
		}
	}
	return pkgs
}

// ScanInstalled asks every manager on the host what it has installed. The
// queries run in parallel, since each is dominated by waiting on a subprocess.
func ScanInstalled(ctx context.Context) []actions.Package {
	all := scanners()
	if _, err := exec.LookPath("rpm"); err == nil {
		_, zypper := exec.LookPath("zypper")
		all = append(all, rpmScanner(zypper == nil))
	}
	// paru and yay answer -Qm identically; only ask whichever exists.
	if _, err := exec.LookPath("paru"); err != nil {
		for i := range all {
			if all[i].tool == "paru" {
				all[i].tool = "yay"
			}
		}
	}

	var (
		wg  sync.WaitGroup
		mu  sync.Mutex
		out []actions.Package
	)
	for _, s := range all {
		wg.Add(1)
		go func(s scanner) {
			defer wg.Done()
			found := s.run(ctx)
			mu.Lock()
			out = append(out, found...)
			mu.Unlock()
		}(s)
	}
	wg.Wait()

	// Parallel scans finish in arbitrary order; sort so the Installed view and
	// the tests see a stable list.
	sort.Slice(out, func(i, j int) bool {
		if out[i].Manager != out[j].Manager {
			return out[i].Manager < out[j].Manager
		}
		return strings.ToLower(out[i].Name) < strings.ToLower(out[j].Name)
	})
	return out
}
