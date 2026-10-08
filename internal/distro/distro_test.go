package distro

import (
	"bufio"
	"context"
	"strings"
	"testing"

	"github.com/nishu-murmu/packall/internal/actions"
)

func TestClassifyKnownDistros(t *testing.T) {
	for _, tc := range []struct {
		id, idLike string
		want       actions.Family
	}{
		// The four families, by their own id.
		{"arch", "", actions.Arch},
		{"debian", "", actions.Debian},
		{"fedora", "", actions.Fedora},
		{"opensuse-tumbleweed", "", actions.Suse},

		// Derivatives that name themselves and nothing else.
		{"manjaro", "", actions.Arch},
		{"endeavouros", "", actions.Arch},
		{"cachyos", "", actions.Arch},
		{"garuda", "", actions.Arch},
		{"artix", "", actions.Arch},
		{"ubuntu", "", actions.Debian},
		{"linuxmint", "", actions.Debian},
		{"pop", "", actions.Debian},
		{"elementary", "", actions.Debian},
		{"zorin", "", actions.Debian},
		{"kali", "", actions.Debian},
		{"raspbian", "", actions.Debian},
		{"neon", "", actions.Debian},
		{"rhel", "", actions.Fedora},
		{"centos", "", actions.Fedora},
		{"almalinux", "", actions.Fedora},
		{"rocky", "", actions.Fedora},
		{"nobara", "", actions.Fedora},
		{"ol", "", actions.Fedora},
		{"sles", "", actions.Suse},
		{"opensuse-leap", "", actions.Suse},

		// Derivatives found only through ID_LIKE.
		{"somethingnew", "ubuntu debian", actions.Debian},
		{"vanilla", "arch", actions.Arch},
		{"bazzite", "fedora", actions.Fedora},
		{"tumbleweed-slowroll", "opensuse suse", actions.Suse},

		// Case and quoting should not matter.
		{"Ubuntu", "Debian", actions.Debian},
		{"  fedora  ", "", actions.Fedora},

		// Unknown stays unknown rather than guessing.
		{"gentoo", "", actions.Other},
		{"alpine", "", actions.Other},
		{"void", "", actions.Other},
		{"nixos", "", actions.Other},
		{"", "", actions.Other},
	} {
		if got := Classify(tc.id, tc.idLike); got != tc.want {
			t.Errorf("Classify(%q, %q) = %q, want %q", tc.id, tc.idLike, got, tc.want)
		}
	}
}

// ID wins over ID_LIKE: Manjaro says ID_LIKE=arch and is arch, but a Debian
// derivative that listed both would be classified by what it actually is.
func TestClassifyPrefersTheMostSpecificMatch(t *testing.T) {
	if got := Classify("manjaro", "arch"); got != actions.Arch {
		t.Errorf("= %q, want arch", got)
	}
	if got := Classify("ubuntu", "debian"); got != actions.Debian {
		t.Errorf("= %q, want debian", got)
	}
}

func TestParseOSRelease(t *testing.T) {
	// A real Ubuntu os-release, quoting and all.
	const content = `PRETTY_NAME="Ubuntu 24.04.1 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.1 LTS (Noble Numbat)"
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
UBUNTU_CODENAME=noble
`
	id, idLike, name := parseOSRelease(bufio.NewScanner(strings.NewReader(content)))
	if id != "ubuntu" {
		t.Errorf("id = %q, want ubuntu", id)
	}
	if idLike != "debian" {
		t.Errorf("idLike = %q, want debian", idLike)
	}
	// PRETTY_NAME is the useful one, and must win over NAME whatever the order.
	if name != "Ubuntu 24.04.1 LTS" {
		t.Errorf("name = %q, want the pretty name", name)
	}
	if got := Classify(id, idLike); got != actions.Debian {
		t.Errorf("family = %q, want debian", got)
	}
}

func TestParseOSReleaseNameFallsBackWhenThereIsNoPrettyName(t *testing.T) {
	_, _, name := parseOSRelease(bufio.NewScanner(strings.NewReader("ID=arch\nNAME=\"Arch Linux\"\n")))
	if name != "Arch Linux" {
		t.Errorf("name = %q, want Arch Linux", name)
	}
}

func TestParseOSReleaseIgnoresJunk(t *testing.T) {
	const content = "# a comment\n\nnot-a-pair\nID=fedora\n"
	id, _, _ := parseOSRelease(bufio.NewScanner(strings.NewReader(content)))
	if id != "fedora" {
		t.Errorf("id = %q, want fedora", id)
	}
}

func TestPreferredPerFamily(t *testing.T) {
	mgr := func(ids ...string) []actions.Manager {
		var out []actions.Manager
		for _, id := range managers {
			available := false
			for _, want := range ids {
				if id == want {
					available = true
				}
			}
			out = append(out, actions.Manager{ID: id, Available: available})
		}
		return out
	}

	for _, tc := range []struct {
		name   string
		family actions.Family
		have   []string
		want   string
	}{
		{"debian prefers apt", actions.Debian, []string{"apt", "flatpak", "snap"}, "apt"},
		{"fedora prefers dnf", actions.Fedora, []string{"dnf", "flatpak"}, "dnf"},
		{"suse prefers zypper", actions.Suse, []string{"zypper", "flatpak"}, "zypper"},
		// An AUR helper is better than bare pacman, because it reaches both.
		{"arch prefers paru over pacman", actions.Arch, []string{"pacman", "paru"}, "paru"},
		{"arch falls back to yay", actions.Arch, []string{"pacman", "yay"}, "yay"},
		{"arch settles for pacman", actions.Arch, []string{"pacman"}, "pacman"},
		// With no native manager, a universal format is the answer.
		{"debian without apt", actions.Debian, []string{"flatpak"}, "flatpak"},
		{"unknown family", actions.Other, []string{"flatpak", "snap"}, "flatpak"},
		// Nothing at all is a real state, and must not panic.
		{"bare host", actions.Debian, nil, ""},
	} {
		if got := preferred(tc.family, mgr(tc.have...)); got != tc.want {
			t.Errorf("%s: = %q, want %q", tc.name, got, tc.want)
		}
	}
}

func TestInfoHelpers(t *testing.T) {
	info := Info{Managers: []actions.Manager{
		{ID: "apt", Available: true},
		{ID: "dnf", Available: false},
		{ID: "flatpak", Available: true},
	}}

	if !info.Has("apt") || info.Has("dnf") || info.Has("nonexistent") {
		t.Error("Has reports the wrong availability")
	}
	if got := strings.Join(info.Available(), ","); got != "apt,flatpak" {
		t.Errorf("Available() = %q, want apt,flatpak", got)
	}

	ctx := info.Context(nil)
	if len(ctx.Managers) != 3 {
		t.Errorf("Context dropped managers: %v", ctx.Managers)
	}
}

// Detect must work on any host, including one with no os-release at all, since
// it runs before anything else in the TUI.
func TestDetectDoesNotPanic(t *testing.T) {
	info := Detect()
	if len(info.Managers) != len(managers) {
		t.Errorf("reported %d managers, want %d", len(info.Managers), len(managers))
	}
	if info.Name == "" {
		t.Error("Name is empty; it is shown in the status bar")
	}
	if info.Family == "" {
		t.Error("Family is empty; the command builder needs one")
	}
	// Every manager must have a label, or the UI prints a blank.
	for _, m := range info.Managers {
		if Label(m.ID) == "" {
			t.Errorf("no label for manager %q", m.ID)
		}
	}
}

func TestScanInstalledDoesNotPanic(t *testing.T) {
	// On a host with none of these managers this returns nothing, which is the
	// point: a missing manager contributes nothing instead of failing.
	pkgs := ScanInstalled(context.Background())
	for _, p := range pkgs {
		if p.Name == "" {
			t.Errorf("scanned a package with no name: %+v", p)
		}
		if p.Manager == "" {
			t.Errorf("scanned a package with no manager: %+v", p)
		}
	}
}

func TestScannerParsers(t *testing.T) {
	byTool := map[string]scanner{}
	for _, s := range scanners() {
		byTool[s.tool] = s
	}

	// dpkg-query lists packages that are merely configured as well as those
	// actually installed; counting the former offers to remove things that
	// are not there.
	apt := byTool["dpkg-query"]
	if p, ok := apt.parse("firefox\tinstall ok installed"); !ok || p.Name != "firefox" {
		t.Errorf("installed apt package = %+v, ok=%v", p, ok)
	}
	if _, ok := apt.parse("removed-thing\tdeinstall ok config-files"); ok {
		t.Error("a config-files-only package is not installed")
	}

	// Flatpak's application id is what update and remove need, and it goes in
	// Description, which is where the command builder looks.
	fp := byTool["flatpak"]
	p, ok := fp.parse("org.mozilla.firefox\tFirefox")
	if !ok || p.Name != "Firefox" || p.Description != "org.mozilla.firefox" {
		t.Errorf("flatpak = %+v, ok=%v; want name Firefox and id org.mozilla.firefox", p, ok)
	}
	// With no display name, the id has to serve as both.
	if p, ok := fp.parse("com.example.App"); !ok || p.Name != "com.example.App" {
		t.Errorf("flatpak without a name = %+v", p)
	}

	pac := byTool["pacman"]
	if p, ok := pac.parse("neovim 0.10.2-1"); !ok || p.Name != "neovim" || p.Manager != "pacman" {
		t.Errorf("pacman = %+v", p)
	}
	if _, ok := pac.parse(""); ok {
		t.Error("a blank line is not a package")
	}

	// -Qm output is reported as aur, so update and remove route through pacman.
	if p, ok := byTool["paru"].parse("spotify 1.2.3-1"); !ok || p.Manager != "aur" {
		t.Errorf("aur = %+v", p)
	}
}

func TestRPMScannerNamesTheRightManager(t *testing.T) {
	if got := rpmScanner(true).manager; got != "zypper" {
		t.Errorf("with zypper = %q, want zypper", got)
	}
	if got := rpmScanner(false).manager; got != "dnf" {
		t.Errorf("without zypper = %q, want dnf", got)
	}
	p, ok := rpmScanner(false).parse("firefox")
	if !ok || p.Name != "firefox" || p.Manager != "dnf" {
		t.Errorf("= %+v, ok=%v", p, ok)
	}
}

// The scan feeds the command builder, so the manager ids it reports have to be
// ones the builder recognises.
func TestScannedManagersAreOnesTheBuilderKnows(t *testing.T) {
	known := map[string]bool{
		"pacman": true, "aur": true, "apt": true, "dnf": true,
		"zypper": true, "flatpak": true, "snap": true, "brew": true,
	}
	all := append(scanners(), rpmScanner(false), rpmScanner(true))
	for _, s := range all {
		if !known[s.manager] {
			t.Errorf("scanner %q reports manager %q, which the command builder does not know",
				s.tool, s.manager)
		}
	}
}
