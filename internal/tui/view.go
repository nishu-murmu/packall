package tui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/distro"
	"github.com/nishu-murmu/packall/internal/runner"
)

// Layout constants. Everything else is derived from the terminal size, so the
// UI works from an 80x24 ssh session up.
const (
	sidebarWidth = 24
	detailWidth  = 46
	minListWidth = 28
	headerHeight = 2
	footerHeight = 2
)

// contentHeight is the height available to the panes.
func (m Model) contentHeight() int {
	h := m.height - headerHeight - footerHeight
	if h < 3 {
		return 3
	}
	return h
}

// listHeight is how many rows a list pane can show, inside its border.
func (m Model) listHeight() int {
	return max(1, m.contentHeight()-2)
}

// logHeight is the room the job log gets, under the job list.
func (m Model) logHeight() int {
	return max(3, m.contentHeight()-2)
}

// sidebarOn reports whether there is room for the sidebar as well as a list.
func (m Model) sidebarOn() bool {
	return m.showSidebar && m.view == viewCatalogue &&
		m.width >= sidebarWidth+minListWidth
}

// detailOn reports whether the detail pane fits beside the list.
func (m Model) detailOn() bool {
	if m.view != viewCatalogue {
		return false
	}
	used := 0
	if m.sidebarOn() {
		used = sidebarWidth
	}
	return m.width-used >= detailWidth+minListWidth
}

// View renders the whole screen.
func (m Model) View() string {
	if !m.ready {
		return "\n  starting Packall…\n"
	}

	var body string
	switch m.view {
	case viewJobs:
		body = m.viewJobs()
	case viewDetail:
		body = m.viewDetailFull()
	case viewManagers:
		body = m.viewManagers()
	case viewInstalled:
		body = m.viewInstalled()
	default:
		body = m.viewCatalogue()
	}

	screen := lipgloss.JoinVertical(lipgloss.Left, m.viewHeader(), body, m.viewFooter())

	if m.showHelp {
		return m.centre(m.viewHelp())
	}
	return screen
}

// ------------------------------------------------------------------- chrome

func (m Model) viewHeader() string {
	left := m.styles.Title.Render("Packall")

	host := "detecting…"
	if m.host.Name != "" {
		host = m.host.Name
		if m.host.Preferred != "" {
			host += " · " + distro.Label(m.host.Preferred)
		}
	}
	right := m.styles.Host.Render(host)

	gap := m.width - lipgloss.Width(left) - lipgloss.Width(right)
	if gap < 1 {
		gap = 1
	}
	return left + strings.Repeat(" ", gap) + right + "\n"
}

func (m Model) viewFooter() string {
	// A flash message replaces the hints while it is up; it is more urgent.
	if m.flash != "" {
		return "\n" + m.styles.Prompt.Render("› "+m.flash)
	}

	var left string
	switch {
	case m.searching:
		left = m.search.View()
	case len(m.queue) > 0:
		left = m.styles.ItemQueued.Render(fmt.Sprintf("%d queued", len(m.queue)))
	case len(m.pkgQueue) > 0:
		left = m.styles.ItemQueued.Render(fmt.Sprintf("%d selected", len(m.pkgQueue)))
	case m.scanning:
		left = m.styles.Subtitle.Render("scanning installed packages…")
	}

	hints := m.help.ShortHelpView(m.keys.ShortHelp())
	if left == "" {
		return "\n" + hints
	}
	gap := m.width - lipgloss.Width(left) - lipgloss.Width(hints)
	if gap < 2 {
		return "\n" + left
	}
	return "\n" + left + strings.Repeat(" ", gap) + hints
}

// ---------------------------------------------------------------- catalogue

func (m Model) viewCatalogue() string {
	h := m.contentHeight()

	var panes []string
	remaining := m.width

	if m.sidebarOn() {
		panes = append(panes, m.pane(m.viewSidebar(), sidebarWidth, h, m.focus == paneSidebar))
		remaining -= sidebarWidth
	}

	detail := ""
	if m.detailOn() {
		detail = m.pane(m.viewDetailPane(), detailWidth, h, false)
		remaining -= detailWidth
	}

	panes = append(panes, m.pane(m.viewList(remaining-4), remaining, h, m.focus == paneList))
	if detail != "" {
		panes = append(panes, detail)
	}
	return lipgloss.JoinHorizontal(lipgloss.Top, panes...)
}

// pane frames content at a fixed size, highlighting the focused one.
func (m Model) pane(content string, width, height int, focused bool) string {
	style := m.styles.Pane
	if focused {
		style = m.styles.PaneActive
	}
	// The border takes 2 columns and 2 rows, the padding another 2 columns.
	return style.Width(max(1, width-2)).Height(max(1, height-2)).Render(content)
}

func (m Model) viewSidebar() string {
	rows := make([]string, 0, len(m.categories)+1)

	label := func(i int, name string, n int) string {
		text := name
		count := m.styles.Count.Render(fmt.Sprintf("%3d", n))
		pad := sidebarWidth - 6 - lipgloss.Width(text) - 3
		if pad < 1 {
			pad = 1
		}
		line := text + strings.Repeat(" ", pad) + count
		if i == m.catCursor {
			return m.styles.CategorySelected.Render("▸ " + line)
		}
		return m.styles.Category.Render("  " + line)
	}

	rows = append(rows, label(0, "All", len(catalog.All())))
	for i, c := range m.categories {
		rows = append(rows, label(i+1, c.Name, catalog.Count(c.ID)))
	}

	// Scroll the sidebar too; 14 categories plus All does not fit on 24 rows.
	height := m.listHeight()
	offset := scroll(0, m.catCursor, height, len(rows))
	if offset+height > len(rows) {
		height = len(rows) - offset
	}
	return strings.Join(rows[offset:offset+height], "\n")
}

// viewList renders the app list.
func (m Model) viewList(width int) string {
	if len(m.entries) == 0 {
		return m.styles.Empty.Render("nothing matches " + quote(m.search.Value()))
	}

	height := m.listHeight()
	end := min(m.offset+height, len(m.entries))
	ctx := m.host.Context(m.packages)

	rows := make([]string, 0, end-m.offset)
	for i := m.offset; i < end; i++ {
		rows = append(rows, m.listRow(m.entries[i], i == m.cursor, width, ctx))
	}
	return strings.Join(rows, "\n")
}

// listRow is one app: a queue marker, the name, its tagline, and how it would
// be installed here.
func (m Model) listRow(e *catalog.Entry, cursor bool, width int, ctx actions.Context) string {
	marker := "  "
	if m.queue[e.ID] {
		marker = m.styles.ItemQueued.Render("● ")
	}
	if cursor {
		marker = m.styles.ItemSelected.Render("▸ ")
	}
	if cursor && m.queue[e.ID] {
		marker = m.styles.ItemSelected.Render("▸") + m.styles.ItemQueued.Render("●")
	}

	// The right-hand badge says what this host would use, or why it cannot.
	badge := ""
	switch opt := actions.Pick(e, actions.Install, ctx); {
	case opt == nil:
		badge = m.styles.Skipped.Render("—")
	case actions.OptionInstalled(*opt, m.packages):
		badge = m.styles.Installed.Render("installed")
	default:
		badge = m.styles.Method.Render(string(opt.Method))
	}

	name := e.Name
	style := m.styles.Item
	if cursor {
		style = m.styles.ItemSelected
	}

	// name + tagline, truncated to fit, with the badge right-aligned.
	room := width - lipgloss.Width(marker) - lipgloss.Width(badge) - 2
	if room < 8 {
		return marker + style.Render(truncate(name, max(1, width-3)))
	}

	text := style.Render(name)
	if rest := room - lipgloss.Width(name) - 2; rest > 12 {
		text += "  " + m.styles.Subtitle.Render(truncate(e.Tagline, rest))
	}

	gap := width - lipgloss.Width(marker) - lipgloss.Width(text) - lipgloss.Width(badge)
	if gap < 1 {
		gap = 1
	}
	return marker + text + strings.Repeat(" ", gap) + badge
}

// ------------------------------------------------------------------- detail

// viewDetailPane is the side-by-side detail, kept short.
func (m Model) viewDetailPane() string {
	if len(m.entries) == 0 {
		return ""
	}
	return m.renderDetail(m.entries[m.cursor], detailWidth-4, false)
}

// viewDetailFull is the whole-screen detail reached with Enter.
func (m Model) viewDetailFull() string {
	e := m.detail
	if e == nil {
		return ""
	}
	return m.pane(m.renderDetail(e, m.width-6, true), m.width, m.contentHeight(), true)
}

// renderDetail describes one entry. verbose adds every install option, which is
// the point of the full-screen view.
func (m Model) renderDetail(e *catalog.Entry, width int, verbose bool) string {
	var b strings.Builder

	b.WriteString(m.styles.Name.Render(e.Name) + "\n")
	b.WriteString(m.styles.Tagline.Render(wrap(e.Tagline, width)) + "\n\n")

	field := func(label, value string) {
		if value == "" {
			return
		}
		b.WriteString(m.styles.Label.Render(label+"  ") +
			m.styles.Value.Render(value) + "\n")
	}
	field("license ", e.License)
	field("homepage", truncate(e.Homepage, width-10))

	if len(e.Tags) > 0 {
		b.WriteString(m.styles.Label.Render("tags     ") +
			m.styles.Tag.Render(strings.Join(e.Tags, " ")) + "\n")
	}

	if verbose {
		b.WriteString("\n" + m.styles.Value.Render(wrap(e.Description, width)) + "\n")
	}

	ctx := m.host.Context(m.packages)
	b.WriteString("\n" + m.styles.Label.Render("on this machine") + "\n")

	chosen := actions.Pick(e, actions.Install, ctx)
	if chosen == nil {
		b.WriteString(m.styles.Skipped.Render("  nothing here can install it") + "\n")
		if want := actions.MissingUniversal(e, ctx); want != "" {
			b.WriteString(m.styles.Subtitle.Render(
				"  install "+string(want)+" first and it becomes available") + "\n")
		}
	} else {
		for _, c := range actions.Build(actions.Install, *chosen, m.host.Managers) {
			b.WriteString("  " + m.styles.Command.Render(truncate(c, width-2)) + "\n")
		}
		if actions.OptionInstalled(*chosen, m.packages) {
			b.WriteString("  " + m.styles.Installed.Render("already installed") + "\n")
		}
	}

	if verbose {
		b.WriteString("\n" + m.styles.Label.Render("every option") + "\n")
		for _, o := range e.Install {
			mark := "  "
			avail := actions.MethodAvailable(o.Method, m.host.Managers)
			style := m.styles.Skipped
			if avail {
				mark, style = "✓ ", m.styles.Method
			}
			b.WriteString("  " + style.Render(mark+o.Method.Label()) + "  " +
				m.styles.Subtitle.Render(truncate(o.Command, max(10, width-20))) + "\n")
		}
	}
	return b.String()
}

// ----------------------------------------------------------------- installed

func (m Model) viewInstalled() string {
	list := m.installedList()

	var content string
	switch {
	case m.scanning:
		content = m.styles.Empty.Render("scanning " +
			strings.Join(m.host.Available(), ", ") + "…")
	case len(list) == 0 && m.search.Value() != "":
		content = m.styles.Empty.Render("nothing matches " + quote(m.search.Value()))
	case len(list) == 0:
		content = m.styles.Empty.Render("no packages found — is any package manager installed?")
	default:
		height := m.listHeight()
		end := min(m.pkgOffset+height, len(list))
		width := m.width - 4

		rows := make([]string, 0, end-m.pkgOffset)
		for i := m.pkgOffset; i < end; i++ {
			p := list[i]
			marker := "  "
			if m.pkgQueue[pkgKey(p)] {
				marker = m.styles.ItemQueued.Render("● ")
			}
			if i == m.pkgCursor {
				marker = m.styles.ItemSelected.Render("▸ ")
			}

			style := m.styles.Item
			if i == m.pkgCursor {
				style = m.styles.ItemSelected
			}
			badge := m.styles.Method.Render(p.Manager)
			name := style.Render(truncate(p.Name, max(8, width-24)))

			gap := width - lipgloss.Width(marker) - lipgloss.Width(name) - lipgloss.Width(badge)
			if gap < 1 {
				gap = 1
			}
			rows = append(rows, marker+name+strings.Repeat(" ", gap)+badge)
		}
		content = strings.Join(rows, "\n")
	}

	header := m.styles.Label.Render(fmt.Sprintf("Installed — %d packages", len(list))) + "\n"
	return m.pane(header+content, m.width, m.contentHeight(), true)
}

// ------------------------------------------------------------------ managers

func (m Model) viewManagers() string {
	var b strings.Builder
	b.WriteString(m.styles.Label.Render("System") + "\n")
	b.WriteString("  " + m.styles.Value.Render(m.host.Name) + "\n")
	b.WriteString("  " + m.styles.Subtitle.Render(
		fmt.Sprintf("id %s · family %s", orDash(m.host.ID), m.host.Family)) + "\n\n")

	b.WriteString(m.styles.Label.Render("Package managers") + "\n")
	for _, mgr := range m.host.Managers {
		if mgr.Available {
			b.WriteString("  " + m.styles.Done.Render("✓ ") +
				m.styles.Value.Render(distro.Label(mgr.ID)) + "\n")
		} else {
			b.WriteString("  " + m.styles.Skipped.Render("· "+distro.Label(mgr.ID)) + "\n")
		}
	}

	if !SudoAvailable() {
		b.WriteString("\n" + m.styles.Error.Render(
			"sudo was not found — privileged installs will fail") + "\n")
	}

	b.WriteString("\n" + m.styles.Label.Render("Catalogue") + "\n")
	b.WriteString("  " + m.styles.Value.Render(fmt.Sprintf("%d apps in %d categories",
		len(catalog.All()), len(catalog.Categories()))) + "\n")

	return m.pane(b.String(), m.width, m.contentHeight(), true)
}

// ---------------------------------------------------------------------- jobs

func (m Model) viewJobs() string {
	if m.batch == nil {
		return ""
	}

	var b strings.Builder

	title := titleCase(string(m.batch.Action))
	done, failed, skipped, pending := m.batch.Counts()
	status := fmt.Sprintf("%d done", done)
	if failed > 0 {
		status += fmt.Sprintf(" · %d failed", failed)
	}
	if skipped > 0 {
		status += fmt.Sprintf(" · %d skipped", skipped)
	}
	if pending > 0 {
		status += fmt.Sprintf(" · %d to go", pending)
	}

	b.WriteString(m.styles.Name.Render(title) + "  " +
		m.styles.Subtitle.Render(status) + "\n")
	b.WriteString(m.progressBar(m.batch.Progress(), m.width-6) + "\n\n")

	// One line per job. On a short terminal, only the interesting ones.
	rows := m.jobRows()
	b.WriteString(strings.Join(rows, "\n") + "\n")

	if m.batch.Finished {
		b.WriteString("\n" + m.styles.Label.Render(m.batch.Summary()) + "\n")
		for _, f := range m.batch.Failures() {
			if f.Err != nil {
				b.WriteString("  " + m.styles.Failed.Render(f.Label+": "+f.Err.Error()) + "\n")
			}
		}
		b.WriteString("\n" + m.styles.Subtitle.Render("esc to go back") + "\n")
	} else if m.log.View() != "" {
		b.WriteString("\n" + m.styles.Log.Render(m.log.View()))
	}

	return m.pane(b.String(), m.width, m.contentHeight(), true)
}

// jobRows renders the per-job status lines, trimmed to the room available.
func (m Model) jobRows() []string {
	spinner := []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}

	room := m.contentHeight() - 8
	if room < 3 {
		room = 3
	}

	jobs := m.batch.Jobs
	// With more jobs than room, centre the window on the running one.
	start := 0
	if len(jobs) > room && m.batch.Active > 0 {
		start = scroll(0, m.batch.Active, room, len(jobs))
	}
	end := min(start+room, len(jobs))

	rows := make([]string, 0, end-start)
	for i := start; i < end; i++ {
		j := jobs[i]

		var mark string
		switch j.Status {
		case runner.Done:
			mark = m.styles.Done.Render("✓")
		case runner.Failed:
			mark = m.styles.Failed.Render("✗")
		case runner.Running:
			mark = m.styles.Running.Render(spinner[m.spin%len(spinner)])
		case runner.Skipped:
			mark = m.styles.Skipped.Render("–")
		default:
			mark = m.styles.Queued.Render("·")
		}

		line := mark + " " + j.Label
		if j.Method != "" {
			line += " " + m.styles.Method.Render("("+string(j.Method)+")")
		}
		if j.Status == runner.Running && j.Percent > 0 {
			line += m.styles.Subtitle.Render(fmt.Sprintf(" %.0f%%", j.Percent))
		}
		if j.Status == runner.Skipped && j.Err != nil {
			line += m.styles.Skipped.Render(" — " + j.Err.Error())
		}
		rows = append(rows, truncate(line, m.width-6))
	}
	if end < len(jobs) {
		rows = append(rows, m.styles.Subtitle.Render(
			fmt.Sprintf("  … %d more", len(jobs)-end)))
	}
	return rows
}

// progressBar draws the batch's overall progress.
func (m Model) progressBar(fraction float64, width int) string {
	if width < 10 {
		return ""
	}
	if fraction < 0 {
		fraction = 0
	}
	if fraction > 1 {
		fraction = 1
	}
	filled := int(fraction * float64(width))
	return m.styles.Running.Render(strings.Repeat("█", filled)) +
		m.styles.Queued.Render(strings.Repeat("░", width-filled)) +
		m.styles.Subtitle.Render(fmt.Sprintf(" %3.0f%%", fraction*100))
}

// ---------------------------------------------------------------------- help

func (m Model) viewHelp() string {
	var b strings.Builder
	b.WriteString(m.styles.Title.Render("Keys") + "\n\n")
	b.WriteString(m.help.FullHelpView(m.keys.FullHelp()))
	b.WriteString("\n\n" + m.styles.Subtitle.Render("any key to close"))
	return m.styles.Overlay.Render(b.String())
}

// centre places a box alone on the screen. lipgloss v1 cannot composite one
// layer over another, so the help overlay replaces the view rather than
// floating above it; any key brings the view straight back.
func (m Model) centre(box string) string {
	return lipgloss.Place(m.width, m.height, lipgloss.Center, lipgloss.Center, box)
}

// titleCase capitalises the first rune. strings.Title is deprecated, and the
// words here are single lowercase verbs.
func titleCase(s string) string {
	if s == "" {
		return s
	}
	r := []rune(s)
	return strings.ToUpper(string(r[0])) + string(r[1:])
}

// ------------------------------------------------------------------- helpers

func truncate(s string, width int) string {
	if width <= 0 {
		return ""
	}
	if lipgloss.Width(s) <= width {
		return s
	}
	// Cut by runes, not bytes, and leave room for the ellipsis.
	runes := []rune(s)
	if width <= 1 {
		return string(runes[:1])
	}
	for len(runes) > 0 && lipgloss.Width(string(runes))+1 > width {
		runes = runes[:len(runes)-1]
	}
	return string(runes) + "…"
}

// wrap breaks text at word boundaries.
func wrap(s string, width int) string {
	if width <= 0 || s == "" {
		return s
	}
	words := strings.Fields(s)
	if len(words) == 0 {
		return ""
	}

	var lines []string
	line := words[0]
	for _, w := range words[1:] {
		if len(line)+1+len(w) > width {
			lines = append(lines, line)
			line = w
			continue
		}
		line += " " + w
	}
	return strings.Join(append(lines, line), "\n")
}

func quote(s string) string {
	if s == "" {
		return "the filter"
	}
	return "\"" + s + "\""
}

func orDash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
