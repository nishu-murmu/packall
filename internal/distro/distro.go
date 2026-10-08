// Package distro reads what the host is and which package managers it has.
//
// This replaces the detection half of src-tauri/src/system.rs. The family token
// lists are ported from there verbatim, because they are more complete than the
// TypeScript copy they also existed in — `raspbian`, `neon`, `ol` and `sles` are
// all real and all easy to forget.
package distro

import (
	"bufio"
	"os"
	"os/exec"
	"strings"
	"sync"

	"github.com/nishu-murmu/packall/internal/actions"
)

// Info is everything detection found out about the host.
type Info struct {
	// ID is the os-release ID, e.g. "ubuntu".
	ID string
	// IDLike is the raw os-release ID_LIKE, e.g. "debian".
	IDLike string
	// Name is PRETTY_NAME when there is one, e.g. "Ubuntu 24.04.1 LTS".
	Name string
	// Family decides which manager is preferred.
	Family actions.Family
	// Managers is every manager Packall knows, each flagged available or not.
	Managers []actions.Manager
	// Preferred is the manager this host would reach for first.
	Preferred string
}

// managers are the tools Packall can drive, in the order a listing shows them.
// The AUR helpers come first so `Preferred` finds them before pacman.
var managers = []string{
	"paru", "yay", "pacman", "flatpak", "snap", "apt", "dnf", "zypper", "brew",
}

// Label is the human name for a manager id.
func Label(id string) string {
	switch id {
	case "paru":
		return "Paru (AUR)"
	case "yay":
		return "Yay (AUR)"
	case "pacman":
		return "Pacman"
	case "flatpak":
		return "Flatpak"
	case "snap":
		return "Snap"
	case "apt":
		return "APT"
	case "dnf":
		return "DNF"
	case "zypper":
		return "Zypper"
	case "brew":
		return "Homebrew"
	default:
		return id
	}
}

// familyTokens maps a family onto the os-release ID / ID_LIKE tokens that mean
// it. Ported from src-tauri/src/system.rs:532.
var familyTokens = []struct {
	family actions.Family
	tokens []string
}{
	{actions.Arch, []string{"arch", "manjaro", "endeavouros", "garuda", "artix", "cachyos"}},
	{actions.Debian, []string{"debian", "ubuntu", "linuxmint", "pop", "elementary",
		"zorin", "kali", "raspbian", "neon"}},
	{actions.Fedora, []string{"fedora", "rhel", "centos", "almalinux", "rocky", "nobara", "ol"}},
}

// Classify maps an os-release ID and ID_LIKE onto a package family.
func Classify(id, idLike string) actions.Family {
	tokens := append([]string{strings.ToLower(strings.TrimSpace(id))},
		strings.Fields(strings.ToLower(idLike))...)

	for _, ft := range familyTokens {
		for _, t := range tokens {
			for _, want := range ft.tokens {
				if t == want {
					return ft.family
				}
			}
		}
	}
	// openSUSE ships a dozen ids, all of which contain "suse"; SLE is "sles".
	for _, t := range tokens {
		if strings.Contains(t, "suse") || t == "sles" {
			return actions.Suse
		}
	}
	return actions.Other
}

// osReleasePaths are read in order; the first that exists wins.
var osReleasePaths = []string{"/etc/os-release", "/usr/lib/os-release"}

// parseOSRelease pulls ID, ID_LIKE and PRETTY_NAME out of an os-release file.
func parseOSRelease(r *bufio.Scanner) (id, idLike, name string) {
	for r.Scan() {
		line := strings.TrimSpace(r.Text())
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		value = strings.TrimSpace(strings.Trim(strings.TrimSpace(value), `"'`))
		switch key {
		case "ID":
			id = strings.ToLower(value)
		case "ID_LIKE":
			idLike = strings.ToLower(value)
		case "PRETTY_NAME":
			name = value
		case "NAME":
			if name == "" {
				name = value
			}
		}
	}
	return id, idLike, name
}

// readOSRelease returns the host's os-release fields, or zero values off Linux.
func readOSRelease() (id, idLike, name string) {
	for _, path := range osReleasePaths {
		f, err := os.Open(path)
		if err != nil {
			continue
		}
		id, idLike, name = parseOSRelease(bufio.NewScanner(f))
		f.Close()
		if id != "" {
			return id, idLike, name
		}
	}
	return "", "", ""
}

// preferred picks the manager this family reaches for first, among those the
// host actually has. Mirrors the priority table in actions.
func preferred(family actions.Family, found []actions.Manager) string {
	has := func(id string) bool {
		for _, m := range found {
			if m.ID == id && m.Available {
				return true
			}
		}
		return false
	}

	var order []string
	switch family {
	case actions.Arch:
		order = []string{"paru", "yay", "pacman", "flatpak", "snap"}
	case actions.Debian:
		order = []string{"apt", "flatpak", "snap"}
	case actions.Fedora:
		order = []string{"dnf", "flatpak", "snap"}
	case actions.Suse:
		order = []string{"zypper", "flatpak", "snap"}
	default:
		order = []string{"flatpak", "snap", "brew"}
	}
	for _, id := range order {
		if has(id) {
			return id
		}
	}
	// Nothing preferred is installed; name anything that is.
	for _, m := range found {
		if m.Available {
			return m.ID
		}
	}
	return ""
}

// probe reports which of the known managers are on PATH. exec.LookPath is the
// same question the Rust asked by shelling out to `which` once per manager.
func probe() []actions.Manager {
	out := make([]actions.Manager, 0, len(managers))
	for _, id := range managers {
		_, err := exec.LookPath(id)
		out = append(out, actions.Manager{ID: id, Available: err == nil})
	}
	return out
}

var (
	once   sync.Once
	cached Info
)

// Detect reads the host once and caches the answer for the process. Managers do
// not appear and disappear inside one run of the TUI, and a bootstrap that
// installs one calls Refresh.
func Detect() Info {
	once.Do(func() { cached = detect() })
	return cached
}

// Refresh re-reads the host. Call it after installing Flatpak or Snap, so the
// newly available method stops being greyed out.
func Refresh() Info {
	cached = detect()
	once.Do(func() {}) // make sure a later Detect does not overwrite this
	return cached
}

func detect() Info {
	id, idLike, name := readOSRelease()
	found := probe()
	family := Classify(id, idLike)

	if name == "" {
		name = "Linux"
		if id != "" {
			name = id
		}
	}
	return Info{
		ID:        id,
		IDLike:    idLike,
		Name:      name,
		Family:    family,
		Managers:  found,
		Preferred: preferred(family, found),
	}
}

// Available returns the ids of the managers the host has, in listing order.
func (i Info) Available() []string {
	var out []string
	for _, m := range i.Managers {
		if m.Available {
			out = append(out, m.ID)
		}
	}
	return out
}

// Has reports whether one manager is present.
func (i Info) Has(id string) bool {
	for _, m := range i.Managers {
		if m.ID == id {
			return m.Available
		}
	}
	return false
}

// Context turns detection into the context the command builder wants. Scanning
// installed packages is slow, so it is passed in rather than done here.
func (i Info) Context(packages []actions.Package) actions.Context {
	return actions.Context{Family: i.Family, Managers: i.Managers, Packages: packages}
}
