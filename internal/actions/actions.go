// Package actions turns catalogue entries into the exact shell commands to run.
//
// This is a port of src/lib/actions.ts, kept deliberately close to it so the two
// can be diffed while the Tauri app is still around. Everything here is pure: no
// process is started, nothing touches the filesystem. That is what makes the
// behaviour testable, and it is why the website can show the same commands.
package actions

import (
	"regexp"
	"strings"

	"github.com/nishu-murmu/packall/catalog"
)

// Action is what to do with an entry.
type Action string

const (
	Install Action = "install"
	Update  Action = "update"
	Remove  Action = "remove"
)

// Family is a distribution family, which decides which manager is preferred.
type Family string

const (
	Arch   Family = "arch"
	Debian Family = "debian"
	Fedora Family = "fedora"
	Suse   Family = "suse"
	Other  Family = "other"
)

// Methods a family installs natively, used by the catalogue filter.
var nativeMethods = map[Family][]catalog.Method{
	Debian: {catalog.Apt, catalog.Deb},
	Fedora: {catalog.Dnf},
	Arch:   {catalog.Pacman, catalog.AUR, catalog.Paru, catalog.Yay},
	Suse:   {catalog.Zypper},
}

// Order in which methods are tried for each family. Native first, then the
// universal formats. This table is the heart of "it knows your machine".
var methodPriority = map[Family][]catalog.Method{
	Arch:   {catalog.Pacman, catalog.AUR, catalog.Paru, catalog.Yay, catalog.Flatpak, catalog.Snap},
	Debian: {catalog.Apt, catalog.Flatpak, catalog.Snap},
	Fedora: {catalog.Dnf, catalog.Flatpak, catalog.Snap},
	Suse:   {catalog.Zypper, catalog.Flatpak, catalog.Snap},
	Other: {catalog.Flatpak, catalog.Snap, catalog.Pacman, catalog.Apt, catalog.Dnf,
		catalog.Zypper, catalog.AUR, catalog.Paru, catalog.Yay, catalog.Brew},
}

// Priority returns the method order for a family.
func Priority(f Family) []catalog.Method {
	if p, ok := methodPriority[f]; ok {
		return p
	}
	return methodPriority[Other]
}

// Manager is a package manager found on the host.
type Manager struct {
	ID        string
	Available bool
}

// Package is something the host reports as installed.
type Package struct {
	Manager string
	Name    string
	// Flatpak reports the application id here; the name is the display name.
	Description string
}

// Context is everything about the host that affects the choice of command.
type Context struct {
	Family   Family
	Managers []Manager
	Packages []Package
	// ForceMethod overrides the priority list when set.
	ForceMethod catalog.Method
}

// toolFor maps a catalogue method onto the binaries that must exist to use it.
func toolFor(m catalog.Method) []string {
	switch m {
	case catalog.AUR:
		return []string{"paru", "yay"}
	case catalog.Deb, catalog.AppImage, catalog.Manual:
		return nil
	default:
		return []string{string(m)}
	}
}

// MethodAvailable reports whether the host can use a method. With no detection
// data at all it assumes yes, so a listing still shows something useful.
func MethodAvailable(m catalog.Method, managers []Manager) bool {
	tools := toolFor(m)
	if len(tools) == 0 {
		return false
	}
	if len(managers) == 0 {
		return true
	}
	for _, tool := range tools {
		for _, mgr := range managers {
			if mgr.ID == tool && mgr.Available {
				return true
			}
		}
	}
	return false
}

// Parsed is a catalogue command broken back into its parts, so the same
// packages can be used for update and remove.
type Parsed struct {
	Method catalog.Method
	// Pkgs are package names or Flatpak application ids.
	Pkgs []string
	// Flags worth preserving, such as snap's --classic.
	Flags []string
	// Automatable is true when the command could be reproduced for any action.
	Automatable bool
}

type pattern struct {
	methods []catalog.Method
	re      *regexp.Regexp
}

// The catalogue stores human-readable commands; these pull the packages back
// out so the non-interactive form can be rebuilt.
var patterns = []pattern{
	{[]catalog.Method{catalog.Apt}, regexp.MustCompile(`^sudo\s+apt(?:-get)?\s+install\s+(?:-y\s+)?(.+)$`)},
	{[]catalog.Method{catalog.Dnf}, regexp.MustCompile(`^sudo\s+dnf\s+install\s+(?:-y\s+)?(.+)$`)},
	{[]catalog.Method{catalog.Zypper}, regexp.MustCompile(`^sudo\s+zypper\s+(?:--non-interactive\s+)?install\s+(?:-y\s+)?(.+)$`)},
	{[]catalog.Method{catalog.Pacman}, regexp.MustCompile(`^sudo\s+pacman\s+-S\s+(?:--needed\s+)?(?:--noconfirm\s+)?(.+)$`)},
	{[]catalog.Method{catalog.AUR, catalog.Paru, catalog.Yay}, regexp.MustCompile(`^(?:paru|yay)\s+-S\s+(?:--needed\s+)?(?:--noconfirm\s+)?(.+)$`)},
	{[]catalog.Method{catalog.Flatpak}, regexp.MustCompile(`^flatpak\s+install\s+(?:-y\s+)?(?:flathub\s+)?(.+)$`)},
	{[]catalog.Method{catalog.Snap}, regexp.MustCompile(`^sudo\s+snap\s+install\s+(.+)$`)},
	{[]catalog.Method{catalog.Brew}, regexp.MustCompile(`^brew\s+install\s+(?:--cask\s+)?(.+)$`)},
}

// firstSegment takes the left-hand side of a compound command.
func firstSegment(command string) string {
	return strings.TrimSpace(strings.Split(command, "&&")[0])
}

// ParseOption breaks a catalogue option back into packages and flags.
func ParseOption(opt catalog.Option) Parsed {
	out := Parsed{Method: opt.Method}
	command := firstSegment(opt.Command)
	for _, p := range patterns {
		if !containsMethod(p.methods, opt.Method) {
			continue
		}
		m := p.re.FindStringSubmatch(command)
		if m == nil {
			continue
		}
		for _, token := range strings.Fields(m[1]) {
			if strings.HasPrefix(token, "-") {
				out.Flags = append(out.Flags, token)
			} else {
				out.Pkgs = append(out.Pkgs, token)
			}
		}
		out.Automatable = len(out.Pkgs) > 0
		return out
	}
	return out
}

func containsMethod(list []catalog.Method, m catalog.Method) bool {
	for _, item := range list {
		if item == m {
			return true
		}
	}
	return false
}

// aurHelper picks the AUR helper the host actually has, preferring paru.
func aurHelper(managers []Manager) string {
	has := func(id string) bool {
		for _, m := range managers {
			if m.ID == id && m.Available {
				return true
			}
		}
		return false
	}
	if has("paru") {
		return "paru"
	}
	if has("yay") {
		return "yay"
	}
	return "paru"
}

// executable tells a real shell command from free-text "Download from ..."
// instructions, which the catalogue also carries.
var executable = regexp.MustCompile(`^(sudo|flatpak|snap|apt|dnf|zypper|pacman|paru|yay|brew|curl|wget|echo|sh|bash|mkdir|tar|chmod|install|cp|mv|ln|rpm|dpkg|add-apt-repository|gpg)\b`)

func looksExecutable(command string) bool {
	return executable.MatchString(strings.TrimSpace(command))
}

// Build returns the commands that perform an action for one option. An empty
// result means the option cannot be automated — the catalogue says to go and
// download something by hand.
func Build(action Action, opt catalog.Option, managers []Manager) []string {
	// Multi-step installs and compound commands are replayed as written.
	if action == Install && (len(opt.Steps) > 0 || strings.Contains(opt.Command, "&&")) {
		steps := make([]string, 0, len(opt.Steps))
		for _, s := range opt.Steps {
			steps = append(steps, s.Command)
		}
		if len(steps) == 0 {
			steps = []string{opt.Command}
		}
		ok := true
		for _, c := range steps {
			if !looksExecutable(c) {
				ok = false
				break
			}
		}
		if ok {
			return steps
		}
	}

	parsed := ParseOption(opt)
	if !parsed.Automatable {
		return nil
	}
	return commandsFor(action, parsed, managers)
}

// BuildForPackage produces update/remove commands for something known only from
// the host scan, with no catalogue entry behind it.
func BuildForPackage(action Action, pkg Package, managers []Manager) []string {
	method := catalog.Method(pkg.Manager)
	id := pkg.Name
	if method == catalog.Flatpak && pkg.Description != "" {
		id = pkg.Description
	}
	return commandsFor(action, Parsed{Method: method, Pkgs: []string{id}, Automatable: true}, managers)
}

func commandsFor(action Action, parsed Parsed, managers []Manager) []string {
	pkgs := strings.Join(parsed.Pkgs, " ")
	flags := strings.Join(parsed.Flags, " ")

	switch parsed.Method {
	case catalog.Apt:
		switch action {
		case Install:
			return []string{`sudo sh -c "apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y ` + pkgs + `"`}
		case Update:
			return []string{`sudo sh -c "apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y --only-upgrade ` + pkgs + `"`}
		default:
			return []string{"sudo apt-get remove -y " + pkgs}
		}

	case catalog.Dnf:
		switch action {
		case Install:
			return []string{"sudo dnf install -y " + pkgs}
		case Update:
			return []string{"sudo dnf upgrade -y " + pkgs}
		default:
			return []string{"sudo dnf remove -y " + pkgs}
		}

	case catalog.Zypper:
		switch action {
		case Install:
			return []string{"sudo zypper --non-interactive install " + pkgs}
		case Update:
			return []string{"sudo zypper --non-interactive update " + pkgs}
		default:
			return []string{"sudo zypper --non-interactive remove " + pkgs}
		}

	case catalog.Pacman:
		switch action {
		case Install:
			return []string{"sudo pacman -S --needed --noconfirm " + pkgs}
		case Update:
			return []string{"sudo pacman -S --noconfirm " + pkgs}
		default:
			return []string{"sudo pacman -Rns --noconfirm " + pkgs}
		}

	case catalog.AUR, catalog.Paru, catalog.Yay:
		helper := aurHelper(managers)
		switch action {
		case Install:
			return []string{helper + " -S --needed --noconfirm " + pkgs}
		case Update:
			return []string{helper + " -S --noconfirm " + pkgs}
		default:
			// Helpers delegate removal to pacman anyway.
			return []string{"sudo pacman -Rns --noconfirm " + pkgs}
		}

	case catalog.Flatpak:
		// Per-user installs need no privileges; update and remove fall back to
		// the system installation when the app lives there instead.
		switch action {
		case Install:
			return []string{
				"flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
				"flatpak install --user -y --noninteractive flathub " + pkgs,
			}
		case Update:
			return []string{"flatpak update --user -y --noninteractive " + pkgs +
				" || sudo flatpak update --system -y --noninteractive " + pkgs}
		default:
			return []string{"flatpak uninstall --user -y --noninteractive " + pkgs +
				" || sudo flatpak uninstall --system -y --noninteractive " + pkgs}
		}

	case catalog.Snap:
		switch action {
		case Install:
			return []string{strings.TrimSpace("sudo snap install " + pkgs + " " + flags)}
		case Update:
			return []string{"sudo snap refresh " + pkgs}
		default:
			return []string{"sudo snap remove " + pkgs}
		}

	case catalog.Brew:
		switch action {
		case Install:
			return []string{"brew install " + pkgs}
		case Update:
			return []string{"brew upgrade " + pkgs}
		default:
			return []string{"brew uninstall " + pkgs}
		}

	default:
		return nil
	}
}

// OptionInstalled reports whether the host scan says this option's package is
// already present.
func OptionInstalled(opt catalog.Option, packages []Package) bool {
	parsed := ParseOption(opt)
	if !parsed.Automatable {
		return false
	}
	for _, pkg := range parsed.Pkgs {
		for _, p := range packages {
			if !managerMatches(parsed.Method, p.Manager) {
				continue
			}
			if parsed.Method == catalog.Flatpak {
				if p.Description == pkg {
					return true
				}
				continue
			}
			if p.Name == pkg {
				return true
			}
		}
	}
	return false
}

// managerMatches treats the AUR helpers as pacman and dnf/zypper as rpm, since
// that is how the host reports packages installed through them.
func managerMatches(method catalog.Method, reported string) bool {
	if string(method) == reported {
		return true
	}
	switch method {
	case catalog.AUR, catalog.Paru, catalog.Yay:
		return reported == "aur" || reported == "pacman"
	case catalog.Dnf, catalog.Zypper:
		return reported == "dnf" || reported == "zypper"
	default:
		return false
	}
}

// Pick chooses the option to use. Update and remove prefer whatever the entry
// is actually installed with; install follows the family's priority list.
// A nil result means nothing on this host can do it.
func Pick(e *catalog.Entry, action Action, ctx Context) *catalog.Option {
	var usable []catalog.Option
	for _, o := range e.Install {
		if ParseOption(o).Automatable || len(o.Steps) > 0 || strings.Contains(o.Command, "&&") {
			usable = append(usable, o)
		}
	}

	var available []catalog.Option
	for _, o := range usable {
		if MethodAvailable(o.Method, ctx.Managers) {
			available = append(available, o)
		}
	}
	if len(available) == 0 {
		return nil
	}

	if ctx.ForceMethod != "" {
		for i := range available {
			if available[i].Method == ctx.ForceMethod {
				return &available[i]
			}
		}
	}

	if action != Install {
		for i := range available {
			if OptionInstalled(available[i], ctx.Packages) {
				return &available[i]
			}
		}
	}

	priority := Priority(ctx.Family)
	best, bestRank := 0, rank(priority, available[0].Method)
	for i := 1; i < len(available); i++ {
		if r := rank(priority, available[i].Method); r < bestRank {
			best, bestRank = i, r
		}
	}
	return &available[best]
}

func rank(priority []catalog.Method, m catalog.Method) int {
	for i, p := range priority {
		if p == m {
			return i
		}
	}
	return 99
}

// Commands is the whole job for one entry: the option chosen and the commands
// to run. Commands is empty when nothing can be done on this host.
type Commands struct {
	Option   *catalog.Option
	Commands []string
}

// For resolves an entry straight to runnable commands.
func For(e *catalog.Entry, action Action, ctx Context) Commands {
	opt := Pick(e, action, ctx)
	if opt == nil {
		return Commands{}
	}
	return Commands{Option: opt, Commands: Build(action, *opt, ctx.Managers)}
}

// SupportedOnHost reports whether this host can install the entry at all.
func SupportedOnHost(e *catalog.Entry, ctx Context) bool {
	return Pick(e, Install, ctx) != nil
}

// MissingUniversal names the universal runtime that would unlock an entry when
// nothing else can install it, so the caller can offer to set it up first.
// Returns "" when the entry is already installable or beyond help.
func MissingUniversal(e *catalog.Entry, ctx Context) catalog.Method {
	if Pick(e, Install, ctx) != nil {
		return ""
	}
	has := func(m catalog.Method) bool {
		for _, o := range e.Install {
			if o.Method == m && ParseOption(o).Automatable {
				return true
			}
		}
		return false
	}
	if has(catalog.Flatpak) && !MethodAvailable(catalog.Flatpak, ctx.Managers) {
		return catalog.Flatpak
	}
	if has(catalog.Snap) && !MethodAvailable(catalog.Snap, ctx.Managers) {
		return catalog.Snap
	}
	return ""
}

// Bootstrap returns the commands that install Flatpak or Snap itself, using the
// family's native manager.
func Bootstrap(tool catalog.Method, family Family, managers []Manager) []string {
	pkg := "flatpak"
	if tool == catalog.Snap {
		pkg = "snapd"
	}

	var install string
	switch family {
	case Debian:
		install = "sudo apt-get install -y " + pkg
	case Fedora:
		install = "sudo dnf install -y " + pkg
	case Suse:
		install = "sudo zypper --non-interactive install " + pkg
	case Arch:
		if tool == catalog.Flatpak {
			install = "sudo pacman -S --needed --noconfirm flatpak"
		} else {
			install = aurHelper(managers) + " -S --needed --noconfirm snapd"
		}
	default:
		return nil
	}

	if tool == catalog.Flatpak {
		return []string{
			install,
			"flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
		}
	}
	// Snap needs its socket running, and Arch and Fedora want the /snap symlink.
	out := []string{install, "sudo systemctl enable --now snapd.socket"}
	if family == Arch || family == Fedora {
		out = append(out, "sudo ln -sf /var/lib/snapd/snap /snap")
	}
	return out
}

// MatchesFamily reports whether an entry has an option a family can install
// natively — the catalogue's distro filter.
func MatchesFamily(e *catalog.Entry, family Family) bool {
	native, ok := nativeMethods[family]
	if !ok {
		return true
	}
	for _, o := range e.Install {
		if containsMethod(native, o.Method) {
			return true
		}
	}
	return false
}
