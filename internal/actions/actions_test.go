package actions

import (
	"strings"
	"testing"

	"github.com/nishu-murmu/packall/catalog"
)

// mgr builds a detected package manager, as internal/distro would report it.
func mgr(id string, available ...bool) Manager {
	ok := true
	if len(available) > 0 {
		ok = available[0]
	}
	return Manager{ID: id, Available: ok}
}

func opt(method catalog.Method, command string) catalog.Option {
	return catalog.Option{Method: method, Command: command}
}

// entry fetches a catalogue entry the tests rely on, failing loudly if the
// catalogue ever drops it.
func entry(t *testing.T, id string) *catalog.Entry {
	t.Helper()
	e, ok := catalog.ByID(id)
	if !ok {
		t.Fatalf("catalogue has no entry %q", id)
	}
	return e
}

func equal(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func contains(list []string, want string) bool {
	for _, s := range list {
		if s == want {
			return true
		}
	}
	return false
}

// ---------------------------------------------------------------- ParseOption

func TestParseOptionExtractsPackagesAndFlags(t *testing.T) {
	p := ParseOption(opt(catalog.Snap, "sudo snap install code --classic"))
	if !equal(p.Pkgs, []string{"code"}) {
		t.Errorf("pkgs = %v, want [code]", p.Pkgs)
	}
	if !equal(p.Flags, []string{"--classic"}) {
		t.Errorf("flags = %v, want [--classic]", p.Flags)
	}
	if !p.Automatable {
		t.Error("automatable = false, want true")
	}

	p = ParseOption(opt(catalog.Flatpak, "flatpak install flathub org.mozilla.firefox"))
	if !equal(p.Pkgs, []string{"org.mozilla.firefox"}) {
		t.Errorf("flatpak pkgs = %v, want [org.mozilla.firefox]", p.Pkgs)
	}
}

func TestParseOptionReadsOnlyTheFirstSegment(t *testing.T) {
	p := ParseOption(opt(catalog.Pacman,
		"sudo pacman -S docker docker-compose && sudo systemctl enable --now docker"))
	if !equal(p.Pkgs, []string{"docker", "docker-compose"}) {
		t.Errorf("pkgs = %v, want [docker docker-compose]", p.Pkgs)
	}
}

func TestParseOptionRejectsProse(t *testing.T) {
	for _, tc := range []catalog.Option{
		opt(catalog.Manual, "Download from zed.dev"),
		opt(catalog.Deb, "Download .deb from vivaldi.com"),
	} {
		if ParseOption(tc).Automatable {
			t.Errorf("%q: automatable = true, want false", tc.Command)
		}
	}
}

// ---------------------------------------------------------------------- Build

func TestBuildIsNonInteractiveForEveryManager(t *testing.T) {
	got := Build(Install, opt(catalog.Apt, "sudo apt install git"), nil)
	if len(got) != 1 || !strings.Contains(got[0], "apt-get install -y git") {
		t.Fatalf("apt install = %v", got)
	}
	// The whole point of the sh -c wrapper is one sudo for update + install.
	if !strings.HasPrefix(got[0], `sudo sh -c "apt-get update -qq;`) {
		t.Errorf("apt install should refresh the index under one sudo: %q", got[0])
	}

	for _, tc := range []struct {
		name string
		in   catalog.Option
		want []string
	}{
		{"dnf", opt(catalog.Dnf, "sudo dnf install git"), []string{"sudo dnf install -y git"}},
		{"pacman", opt(catalog.Pacman, "sudo pacman -S git"), []string{"sudo pacman -S --needed --noconfirm git"}},
		{"zypper", opt(catalog.Zypper, "sudo zypper install git"), []string{"sudo zypper --non-interactive install git"}},
		{"flatpak", opt(catalog.Flatpak, "flatpak install flathub org.x.Y"), []string{
			"flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
			"flatpak install --user -y --noninteractive flathub org.x.Y",
		}},
	} {
		if got := Build(Install, tc.in, nil); !equal(got, tc.want) {
			t.Errorf("%s install = %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestBuildUpdateAndRemove(t *testing.T) {
	for _, tc := range []struct {
		name   string
		action Action
		in     catalog.Option
		want   []string
	}{
		{"apt remove", Remove, opt(catalog.Apt, "sudo apt install git"), []string{"sudo apt-get remove -y git"}},
		{"pacman remove", Remove, opt(catalog.Pacman, "sudo pacman -S git"), []string{"sudo pacman -Rns --noconfirm git"}},
		{"dnf update", Update, opt(catalog.Dnf, "sudo dnf install git"), []string{"sudo dnf upgrade -y git"}},
	} {
		if got := Build(tc.action, tc.in, nil); !equal(got, tc.want) {
			t.Errorf("%s = %v, want %v", tc.name, got, tc.want)
		}
	}

	got := Build(Update, opt(catalog.Flatpak, "flatpak install flathub a.b.C"), nil)
	if len(got) != 1 || !strings.Contains(got[0], "flatpak update --user -y --noninteractive a.b.C ||") {
		t.Errorf("flatpak update = %v, want a --user form with a --system fallback", got)
	}
}

func TestBuildUsesTheInstalledAURHelper(t *testing.T) {
	o := opt(catalog.AUR, "yay -S vivaldi")

	got := Build(Install, o, []Manager{mgr("paru"), mgr("yay", false)})
	if len(got) != 1 || got[0] != "paru -S --needed --noconfirm vivaldi" {
		t.Errorf("with paru = %v", got)
	}

	got = Build(Install, o, []Manager{mgr("paru", false), mgr("yay")})
	if len(got) != 1 || !strings.HasPrefix(got[0], "yay -S") {
		t.Errorf("with only yay = %v", got)
	}

	// Helpers delegate removal to pacman, so removal never goes through them.
	got = Build(Remove, o, []Manager{mgr("paru"), mgr("yay")})
	if len(got) != 1 || got[0] != "sudo pacman -Rns --noconfirm vivaldi" {
		t.Errorf("aur remove = %v, want pacman -Rns", got)
	}
}

func TestBuildReturnsNothingForProse(t *testing.T) {
	if got := Build(Install, opt(catalog.Manual, "Download from zed.dev"), nil); len(got) != 0 {
		t.Errorf("= %v, want no commands", got)
	}
}

func TestBuildReplaysMultiStepInstallsVerbatim(t *testing.T) {
	o := catalog.Option{
		Method:  catalog.Apt,
		Command: "sudo curl -fsSLo key https://x",
		Steps: []catalog.Step{
			{Title: "key", Command: "sudo curl -fsSLo key https://x"},
			{Title: "install", Command: "sudo apt install brave-browser"},
		},
	}
	got := Build(Install, o, nil)
	if len(got) != 2 {
		t.Fatalf("= %v, want 2 commands", got)
	}
	if got[0] != o.Steps[0].Command || got[1] != o.Steps[1].Command {
		t.Errorf("= %v, want the steps as written", got)
	}
}

func TestBuildForPackage(t *testing.T) {
	pkg := Package{Manager: "flatpak", Name: "Firefox", Description: "org.mozilla.firefox"}
	want := []string{
		"flatpak uninstall --user -y --noninteractive org.mozilla.firefox || " +
			"sudo flatpak uninstall --system -y --noninteractive org.mozilla.firefox",
	}
	if got := BuildForPackage(Remove, pkg, nil); !equal(got, want) {
		t.Errorf("= %v, want %v", got, want)
	}
}

// ----------------------------------------------------------------------- Pick

func TestPickPrefersTheNativeManagerPerFamily(t *testing.T) {
	firefox := entry(t, "firefox")

	o := Pick(firefox, Install, Context{Family: Debian,
		Managers: []Manager{mgr("apt"), mgr("flatpak"), mgr("snap")}})
	if o == nil || o.Method != catalog.Apt {
		t.Errorf("debian picked %v, want apt", o)
	}

	o = Pick(entry(t, "neovim"), Install, Context{Family: Arch,
		Managers: []Manager{mgr("pacman"), mgr("flatpak")}})
	if o == nil || o.Method != catalog.Pacman {
		t.Errorf("arch picked %v, want pacman", o)
	}

	o = Pick(firefox, Install, Context{Family: Fedora,
		Managers: []Manager{mgr("dnf"), mgr("flatpak")}})
	if o == nil || o.Method != catalog.Dnf {
		t.Errorf("fedora picked %v, want dnf", o)
	}

	o = Pick(firefox, Install, Context{Family: Suse,
		Managers: []Manager{mgr("zypper"), mgr("flatpak")}})
	if o == nil || o.Method != catalog.Zypper {
		t.Errorf("suse picked %v, want zypper", o)
	}
}

func TestPickFallsBackToFlatpak(t *testing.T) {
	// Synthetic, so this tests the fallback rather than today's catalogue.
	flatpakOnly := &catalog.Entry{
		ID:      "flatpak-only",
		Install: []catalog.Option{opt(catalog.Flatpak, "flatpak install flathub com.example.App")},
	}
	o := Pick(flatpakOnly, Install, Context{Family: Fedora,
		Managers: []Manager{mgr("dnf"), mgr("flatpak")}})
	if o == nil || o.Method != catalog.Flatpak {
		t.Errorf("picked %v, want flatpak", o)
	}
}

func TestPickIgnoresMethodsWhoseToolIsMissing(t *testing.T) {
	o := Pick(entry(t, "firefox"), Install, Context{Family: Debian,
		Managers: []Manager{mgr("apt", false), mgr("flatpak", false), mgr("snap", false),
			mgr("dnf", false), mgr("zypper", false)}})
	if o != nil {
		t.Errorf("picked %v, want nothing installable", o)
	}
}

func TestPickHonoursForceMethod(t *testing.T) {
	o := Pick(entry(t, "firefox"), Install, Context{Family: Debian,
		Managers:    []Manager{mgr("apt"), mgr("flatpak")},
		ForceMethod: catalog.Flatpak})
	if o == nil || o.Method != catalog.Flatpak {
		t.Errorf("picked %v, want the forced flatpak", o)
	}
}

func TestPickUsesTheMethodThePackageWasInstalledWith(t *testing.T) {
	o := Pick(entry(t, "firefox"), Remove, Context{Family: Debian,
		Managers: []Manager{mgr("apt"), mgr("flatpak")},
		Packages: []Package{{Manager: "flatpak", Name: "Firefox", Description: "org.mozilla.firefox"}}})
	if o == nil || o.Method != catalog.Flatpak {
		t.Errorf("picked %v, want flatpak because that is what is installed", o)
	}
}

// -------------------------------------------------------------- distro filter

func TestMatchesFamilyForNativePackages(t *testing.T) {
	firefox := entry(t, "firefox")
	for _, f := range []Family{Debian, Fedora, Suse, Other} {
		if !MatchesFamily(firefox, f) {
			t.Errorf("firefox should match family %q", f)
		}
	}
}

func TestMatchesFamilyKeepsUniversalOnlyAppsInstallable(t *testing.T) {
	universal := &catalog.Entry{
		ID:      "universal-only",
		Install: []catalog.Option{opt(catalog.Flatpak, "flatpak install flathub com.example.App")},
	}
	for _, f := range []Family{Debian, Fedora, Arch, Suse} {
		// MatchesFamily is the *native package* question, so it is false here.
		if MatchesFamily(universal, f) {
			t.Errorf("family %q: a flatpak-only app has no native package", f)
		}
		// Installability is a separate question, and must still be yes.
		if Pick(universal, Install, Context{Family: f, Managers: []Manager{mgr("flatpak")}}) == nil {
			t.Errorf("family %q: a flatpak-only app must still be installable", f)
		}
	}
}

func TestMatchesFamilyExcludesWhatAFamilyCannotInstall(t *testing.T) {
	archOnly := &catalog.Entry{
		ID:      "arch-only",
		Install: []catalog.Option{opt(catalog.AUR, "paru -S something")},
	}
	if !MatchesFamily(archOnly, Arch) {
		t.Error("an AUR app should match arch")
	}
	for _, f := range []Family{Fedora, Suse, Debian} {
		if MatchesFamily(archOnly, f) {
			t.Errorf("an AUR app should not match %q", f)
		}
	}
}

func TestEveryFamilyHasRealNativePackages(t *testing.T) {
	all := catalog.All()
	for _, f := range []Family{Debian, Fedora, Arch, Suse} {
		n := 0
		for i := range all {
			if MatchesFamily(&all[i], f) {
				n++
			}
		}
		if n <= 50 {
			t.Errorf("family %q has only %d native packages, want > 50", f, n)
		}
	}
}

func TestEveryFamilyCanInstallMostOfTheCatalogue(t *testing.T) {
	all := catalog.All()
	managers := []Manager{mgr("apt"), mgr("dnf"), mgr("zypper"), mgr("pacman"),
		mgr("paru"), mgr("flatpak"), mgr("snap")}
	for _, f := range []Family{Debian, Fedora, Arch, Suse} {
		n := 0
		for i := range all {
			if SupportedOnHost(&all[i], Context{Family: f, Managers: managers}) {
				n++
			}
		}
		if n < 190 {
			t.Errorf("family %q can install only %d of %d entries, want >= 190", f, n, len(all))
		}
	}
}

// ------------------------------------------------------------------ bootstrap

func TestMissingUniversalAsksForFlatpak(t *testing.T) {
	got := MissingUniversal(entry(t, "firefox"), Context{Family: Fedora,
		Managers: []Manager{mgr("dnf", false), mgr("flatpak", false), mgr("apt", false),
			mgr("zypper", false), mgr("snap", false)}})
	if got != catalog.Flatpak {
		t.Errorf("= %q, want flatpak", got)
	}
}

func TestMissingUniversalStaysQuietWhenSomethingWorks(t *testing.T) {
	firefox := entry(t, "firefox")
	for _, ctx := range []Context{
		{Family: Debian, Managers: []Manager{mgr("apt")}},
		{Family: Fedora, Managers: []Manager{mgr("flatpak")}},
	} {
		if got := MissingUniversal(firefox, ctx); got != "" {
			t.Errorf("family %q: = %q, want no prompt", ctx.Family, got)
		}
	}
}

func TestBootstrapPerFamily(t *testing.T) {
	flathub := "flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo"

	for _, tc := range []struct {
		family Family
		first  string
	}{
		{Debian, "sudo apt-get install -y flatpak"},
		{Fedora, "sudo dnf install -y flatpak"},
		{Arch, "sudo pacman -S --needed --noconfirm flatpak"},
		{Suse, "sudo zypper --non-interactive install flatpak"},
	} {
		got := Bootstrap(catalog.Flatpak, tc.family, nil)
		if len(got) == 0 || got[0] != tc.first {
			t.Errorf("flatpak on %q = %v, want first %q", tc.family, got, tc.first)
		}
		if len(got) < 2 || got[len(got)-1] != flathub {
			t.Errorf("flatpak on %q must add the flathub remote: %v", tc.family, got)
		}
	}

	snap := Bootstrap(catalog.Snap, Fedora, nil)
	if len(snap) == 0 || snap[0] != "sudo dnf install -y snapd" {
		t.Fatalf("snap on fedora = %v", snap)
	}
	if !contains(snap, "sudo systemctl enable --now snapd.socket") {
		t.Errorf("snap needs its socket started: %v", snap)
	}
	// Arch and Fedora put snaps under /var/lib/snapd/snap and need the symlink.
	for _, f := range []Family{Arch, Fedora} {
		got := Bootstrap(catalog.Snap, f, []Manager{mgr("paru")})
		if !contains(got, "sudo ln -sf /var/lib/snapd/snap /snap") {
			t.Errorf("snap on %q needs the /snap symlink: %v", f, got)
		}
	}
	if got := Bootstrap(catalog.Snap, Debian, nil); contains(got, "sudo ln -sf /var/lib/snapd/snap /snap") {
		t.Errorf("debian ships /snap already: %v", got)
	}
	if got := Bootstrap(catalog.Snap, Arch, []Manager{mgr("yay")}); len(got) == 0 || got[0] != "yay -S --needed --noconfirm snapd" {
		t.Errorf("snapd on arch comes from the AUR: %v", got)
	}
	if got := Bootstrap(catalog.Flatpak, Other, nil); got != nil {
		t.Errorf("an unknown family has no native manager to bootstrap with: %v", got)
	}
}

// ----------------------------------------------------------------- invariants

func TestCatalogueIsWellFormed(t *testing.T) {
	if err := catalog.Err(); err != nil {
		t.Fatalf("embedded catalogue does not parse: %v", err)
	}

	all := catalog.All()
	if len(all) < 200 {
		t.Fatalf("catalogue has %d entries, want at least 200", len(all))
	}

	cats := map[string]bool{}
	for _, c := range catalog.Categories() {
		cats[c.ID] = true
	}

	seen := map[string]bool{}
	for i := range all {
		e := &all[i]
		if seen[e.ID] {
			t.Errorf("duplicate id %q", e.ID)
		}
		seen[e.ID] = true

		if e.Name == "" || e.Tagline == "" || e.Homepage == "" {
			t.Errorf("%s: missing name, tagline or homepage", e.ID)
		}
		if !cats[e.Category] {
			t.Errorf("%s: unknown category %q", e.ID, e.Category)
		}
		if len(e.Install) == 0 {
			t.Errorf("%s: no install options", e.ID)
		}
		if _, ok := catalog.ByID(e.ID); !ok {
			t.Errorf("%s: not reachable through ByID", e.ID)
		}
	}
}

// Every command must drive the package manager it claims to. A wrong name here
// only shows up when a user presses Install, so it is worth a test.
func TestEveryCommandDrivesItsOwnManager(t *testing.T) {
	prefix := map[catalog.Method]string{
		catalog.Apt:     "sudo apt",
		catalog.Dnf:     "sudo dnf",
		catalog.Zypper:  "sudo zypper",
		catalog.Pacman:  "sudo pacman",
		catalog.Flatpak: "flatpak ",
		catalog.Snap:    "sudo snap",
		catalog.Brew:    "brew ",
	}
	all := catalog.All()
	for i := range all {
		for _, o := range all[i].Install {
			want, ok := prefix[o.Method]
			if !ok {
				continue
			}
			// Multi-step options start with a key import or a repo add, not
			// with the manager itself.
			if len(o.Steps) > 0 {
				continue
			}
			first := strings.TrimSpace(strings.Split(o.Command, "&&")[0])
			if !strings.HasPrefix(first, want) {
				t.Errorf("%s: %q command is %q, want it to start with %q",
					all[i].ID, o.Method, first, want)
			}
		}
	}
}

func TestEveryEntryIsInstallableSomewhere(t *testing.T) {
	managers := []Manager{mgr("apt"), mgr("dnf"), mgr("zypper"), mgr("pacman"),
		mgr("paru"), mgr("yay"), mgr("flatpak"), mgr("snap"), mgr("brew")}
	all := catalog.All()
	for i := range all {
		automatable := false
		for _, o := range all[i].Install {
			if len(Build(Install, o, managers)) > 0 {
				automatable = true
				break
			}
		}
		if !automatable {
			t.Errorf("%s: no option can be automated on any host", all[i].ID)
		}
	}
}
