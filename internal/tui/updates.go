package tui

import (
	"context"
	"fmt"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/distro"
	"github.com/nishu-murmu/packall/internal/runner"
)

// confirmWindow is how long a first U waits for the second one. Upgrading the
// whole system is too big to hang off a single stray keypress.
const confirmWindow = 3 * time.Second

// updateState is the Updates view: every installed package with a newer
// version waiting, as the host's managers report it.
type updateState struct {
	list []distro.Upgrade
	// byKey indexes list by manager/name, for the Installed view's badges.
	byKey    map[string]distro.Upgrade
	checking bool
	checked  bool

	cursor int
	offset int
	queue  map[string]bool

	// confirmAll is when U was first pressed; a second press inside
	// confirmWindow starts the upgrade.
	confirmAll time.Time
}

type updatesMsg []distro.Upgrade

func checkUpdatesCmd() tea.Cmd {
	return func() tea.Msg { return updatesMsg(distro.CheckUpdates(context.Background())) }
}

// setUpdates replaces the update list and drops queued rows that went away.
func (s *updateState) set(list []distro.Upgrade) {
	s.list = list
	s.byKey = make(map[string]distro.Upgrade, len(list))
	for _, u := range list {
		s.byKey[u.Key()] = u
	}
	for k := range s.queue {
		if _, ok := s.byKey[k]; !ok {
			delete(s.queue, k)
		}
	}
	s.checking, s.checked = false, true
}

// upgradeFor returns the pending upgrade for an installed package, if any.
func (m Model) upgradeFor(p actions.Package) (distro.Upgrade, bool) {
	u, ok := m.updates.byKey[pkgKey(p)]
	return u, ok
}

// updatesList is the Updates view's rows, filtered by the search box.
func (m Model) updatesList() []distro.Upgrade {
	query := strings.ToLower(strings.TrimSpace(m.search.Value()))
	if query == "" {
		return m.updates.list
	}
	var out []distro.Upgrade
	for _, u := range m.updates.list {
		if strings.Contains(strings.ToLower(u.Name), query) ||
			strings.Contains(strings.ToLower(u.Manager), query) {
			out = append(out, u)
		}
	}
	return out
}

// selectedUpgrades returns the queued rows, in list order.
func (m Model) selectedUpgrades() []distro.Upgrade {
	var out []distro.Upgrade
	for _, u := range m.updates.list {
		if m.updates.queue[u.Key()] {
			out = append(out, u)
		}
	}
	return out
}

func (m *Model) clampUpdateCursor() {
	n := len(m.updatesList())
	m.updates.cursor = clamp(m.updates.cursor, n)
	m.updates.offset = scroll(m.updates.offset, m.updates.cursor, m.updatesListHeight(), n)
}

// updatesListHeight leaves room for the view's two header lines.
func (m Model) updatesListHeight() int { return max(1, m.listHeight()-2) }

// refreshUpdates starts a new check unless one is already running.
func (m *Model) refreshUpdates() tea.Cmd {
	if m.updates.checking {
		return nil
	}
	m.updates.checking = true
	return checkUpdatesCmd()
}

// upgradeAll arms, then on a second press starts, an upgrade of everything.
func (m Model) upgradeAll() (tea.Model, tea.Cmd) {
	if len(m.updates.list) == 0 {
		msg := "everything is up to date"
		if m.updates.checking {
			msg = "still checking for updates…"
		}
		m.flash, m.flashAt = msg, time.Now()
		return m, nil
	}
	if time.Since(m.updates.confirmAll) > confirmWindow {
		m.updates.confirmAll = time.Now()
		m.flash, m.flashAt = fmt.Sprintf("press U again to upgrade all %s",
			plural(len(m.updates.list), "package", "packages")), time.Now()
		return m, nil
	}
	m.updates.confirmAll = time.Time{}
	m.pending = actions.Update
	m.pendingPlan = NewUpgradeAllBatch(m.updates.list, m.host.Managers)
	return m.launch()
}

// upgradeOrder is the order whole-manager upgrades run in. The repositories
// go before the AUR, since AUR builds link against repository libraries.
var upgradeOrder = []string{"pacman", "aur", "apt", "dnf", "zypper", "flatpak", "snap", "brew"}

// NewUpgradeAllBatch plans one job per manager that has updates, each running
// that manager's own full upgrade.
func NewUpgradeAllBatch(list []distro.Upgrade, managers []actions.Manager) *Batch {
	b := &Batch{Action: actions.Update, Active: -1, Started: time.Now()}

	counts := map[string]int{}
	for _, u := range list {
		counts[u.Manager]++
	}
	seen := map[string]bool{}
	add := func(mgr string) {
		if seen[mgr] || counts[mgr] == 0 {
			return
		}
		seen[mgr] = true
		job := Job{
			ID:      "upgrade:" + mgr,
			Label:   fmt.Sprintf("%s — %s", distro.Label(mgr), plural(counts[mgr], "package", "packages")),
			Method:  catalog.Method(mgr),
			Status:  runner.Queued,
			Percent: -1,
		}
		if cmds := actions.UpgradeAll(mgr, managers); len(cmds) > 0 {
			job.Command = cmds
		} else {
			job.Status = runner.Skipped
			job.Err = fmt.Errorf("cannot upgrade %s packages from here", mgr)
		}
		b.Jobs = append(b.Jobs, job)
	}
	for _, mgr := range upgradeOrder {
		add(mgr)
	}
	for _, u := range list {
		add(u.Manager)
	}
	return b
}

// NewUpgradeBatch plans updates for hand-picked packages, one job each.
// Pacman packages are skipped with the reason: on Arch the only supported way
// to update a repository package is to update them all.
func NewUpgradeBatch(sel []distro.Upgrade, managers []actions.Manager) *Batch {
	pkgs := make([]actions.Package, len(sel))
	for i, u := range sel {
		pkgs[i] = u.Package()
	}
	b := NewPackageBatch(actions.Update, pkgs, managers)
	for i, u := range sel {
		if u.Manager == "pacman" {
			b.Jobs[i].Status = runner.Skipped
			b.Jobs[i].Command = nil
			b.Jobs[i].Err = fmt.Errorf("Arch only supports full upgrades — press U")
		}
	}
	return b
}

// ---------------------------------------------------------------------- view

func (m Model) viewUpdates() string {
	list := m.updatesList()
	width := m.width - 4

	var header string
	switch {
	case m.updates.checking && !m.updates.checked:
		header = m.styles.Label.Render("Updates — checking…")
	case m.updates.checking:
		header = m.styles.Label.Render(fmt.Sprintf("Updates — %d available", len(m.updates.list))) +
			m.styles.Subtitle.Render("  · re-checking…")
	default:
		header = m.styles.Label.Render(fmt.Sprintf("Updates — %d available", len(m.updates.list)))
	}
	hint := m.styles.Key.Render("space") + m.styles.Subtitle.Render(" select  ") +
		m.styles.Key.Render("a") + m.styles.Subtitle.Render(" all  ") +
		m.styles.Key.Render("u") + m.styles.Subtitle.Render(" update selected  ") +
		m.styles.Key.Render("U") + m.styles.Subtitle.Render(" update everything  ") +
		m.styles.Key.Render("r") + m.styles.Subtitle.Render(" re-check")
	if lipgloss.Width(hint) > width {
		hint = ""
	}

	var content string
	switch {
	case !m.updates.checked:
		content = m.styles.Empty.Render("asking " + strings.Join(m.host.Available(), ", ") +
			" for newer versions…")
	case len(m.updates.list) == 0:
		content = m.styles.Installed.Render("✓ everything is up to date")
	case len(list) == 0:
		content = m.styles.Empty.Render("nothing matches " + quote(m.search.Value()))
	default:
		height := m.updatesListHeight()
		end := min(m.updates.offset+height, len(list))
		rows := make([]string, 0, end-m.updates.offset)
		for i := m.updates.offset; i < end; i++ {
			rows = append(rows, m.updateRow(list[i], i == m.updates.cursor, width))
		}
		content = strings.Join(rows, "\n")
	}

	return m.pane(header+"\n"+hint+"\n"+content, m.width, m.contentHeight(), true)
}

// updateRow is one upgradable package: marker, name, old → new, manager.
func (m Model) updateRow(u distro.Upgrade, cursor bool, width int) string {
	queued := m.updates.queue[u.Key()]
	marker := m.styles.Update.Render("↑ ")
	if queued {
		marker = m.styles.ItemQueued.Render("● ")
	}
	if cursor {
		marker = m.styles.ItemSelected.Render("▸ ")
		if queued {
			marker = m.styles.ItemSelected.Render("▸") + m.styles.ItemQueued.Render("●")
		}
	}

	style := m.styles.Item
	if cursor {
		style = m.styles.ItemSelected
	}

	badge := m.styles.Method.Render(u.Manager)
	versions := m.versionText(u)

	nameRoom := width - lipgloss.Width(marker) - lipgloss.Width(badge) - lipgloss.Width(versions) - 4
	if nameRoom < 8 {
		// Narrow terminal: the new version matters more than the old one.
		versions = m.styles.Update.Render(truncate(u.Latest, 16))
		nameRoom = max(8, width-lipgloss.Width(marker)-lipgloss.Width(badge)-lipgloss.Width(versions)-4)
	}
	name := style.Render(truncate(u.Name, nameRoom))

	gap := width - lipgloss.Width(marker) - lipgloss.Width(name) - lipgloss.Width(versions) - lipgloss.Width(badge) - 2
	if gap < 1 {
		gap = 1
	}
	return marker + name + strings.Repeat(" ", gap) + versions + "  " + badge
}

// versionText renders "1.2 → 1.3", or just "→ 1.3" when the manager does not
// report the installed version.
func (m Model) versionText(u distro.Upgrade) string {
	latest := m.styles.Update.Render(truncate(orDash(u.Latest), 24))
	if u.Current == "" {
		return m.styles.Subtitle.Render("→ ") + latest
	}
	return m.styles.Subtitle.Render(truncate(u.Current, 24)+" → ") + latest
}
