package tui

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
)

// ready returns a model sized like an ordinary terminal, with a host already
// detected so the view does not sit in its loading state.
func ready(t *testing.T) Model {
	t.Helper()

	m := New()
	next, _ := m.Update(tea.WindowSizeMsg{Width: 120, Height: 40})
	m = next.(Model)
	next, _ = m.Update(hostMsg{
		ID: "ubuntu", IDLike: "debian", Name: "Ubuntu 24.04", Family: actions.Debian,
		Managers: []actions.Manager{
			{ID: "apt", Available: true},
			{ID: "flatpak", Available: true},
		},
		Preferred: "apt",
	})
	m = next.(Model)
	next, _ = m.Update(scanMsg(nil))
	return next.(Model)
}

// press sends one keystroke.
func press(t *testing.T, m Model, keys ...string) Model {
	t.Helper()
	for _, k := range keys {
		var msg tea.KeyMsg
		switch k {
		case " ":
			msg = tea.KeyMsg{Type: tea.KeySpace}
		case "esc":
			msg = tea.KeyMsg{Type: tea.KeyEscape}
		case "enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		default:
			msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(k)}
		}
		next, _ := m.Update(msg)
		m = next.(Model)
	}
	return m
}

func TestNewStartsOnTheWholeCatalogue(t *testing.T) {
	m := ready(t)
	if m.view != viewCatalogue {
		t.Errorf("view = %v, want the catalogue", m.view)
	}
	if len(m.entries) != len(catalog.All()) {
		t.Errorf("showing %d entries, want all %d", len(m.entries), len(catalog.All()))
	}
	if m.cursor != 0 {
		t.Errorf("cursor = %d, want 0", m.cursor)
	}
}

func TestJKMoveTheCursorAndStopAtTheEnds(t *testing.T) {
	m := ready(t)

	m = press(t, m, "j", "j", "j")
	if m.cursor != 3 {
		t.Errorf("after jjj cursor = %d, want 3", m.cursor)
	}
	m = press(t, m, "k")
	if m.cursor != 2 {
		t.Errorf("after k cursor = %d, want 2", m.cursor)
	}

	// Up from the top must stay at the top rather than wrapping or going
	// negative and panicking the renderer.
	m = press(t, m, "k", "k", "k", "k")
	if m.cursor != 0 {
		t.Errorf("cursor = %d, want it clamped to 0", m.cursor)
	}

	m = press(t, m, "G")
	if want := len(m.entries) - 1; m.cursor != want {
		t.Errorf("after G cursor = %d, want %d", m.cursor, want)
	}
	m = press(t, m, "j", "j")
	if want := len(m.entries) - 1; m.cursor != want {
		t.Errorf("cursor = %d, want it clamped to %d", m.cursor, want)
	}
}

func TestGGJumpsToTheTop(t *testing.T) {
	m := press(t, ready(t), "G")
	m = press(t, m, "g", "g")
	if m.cursor != 0 {
		t.Errorf("after gg cursor = %d, want 0", m.cursor)
	}
}

// A single g is not a command, and a g followed by something else must not
// silently act.
func TestASingleGDoesNothing(t *testing.T) {
	m := press(t, ready(t), "G")
	last := m.cursor

	m = press(t, m, "g")
	if m.cursor != last {
		t.Errorf("one g moved the cursor to %d", m.cursor)
	}
	if !m.gPressed {
		t.Error("the pending g was not recorded")
	}

	m = press(t, m, "j")
	if m.gPressed {
		t.Error("the pending g should have been cancelled by the j")
	}
}

func TestSpaceTogglesTheQueue(t *testing.T) {
	m := ready(t)
	first := m.entries[0].ID

	m = press(t, m, " ")
	if !m.queue[first] {
		t.Errorf("%s was not queued", first)
	}
	m = press(t, m, " ")
	if m.queue[first] {
		t.Errorf("%s was not removed from the queue", first)
	}
}

func TestAQueuesEverythingVisibleAndCClears(t *testing.T) {
	m := ready(t)

	m = press(t, m, "a")
	if len(m.queue) != len(m.entries) {
		t.Errorf("queued %d, want all %d visible", len(m.queue), len(m.entries))
	}

	m = press(t, m, "c")
	if len(m.queue) != 0 {
		t.Errorf("queue still holds %d", len(m.queue))
	}
}

// `a` is "select everything *visible*", so a filter has to narrow it.
func TestAOnlyQueuesWhatTheFilterShows(t *testing.T) {
	m := ready(t)
	m = press(t, m, "/")
	m = typeText(t, m, "firefox")
	m = press(t, m, "enter")

	visible := len(m.entries)
	if visible == 0 || visible == len(catalog.All()) {
		t.Fatalf("the filter showed %d entries, which is not a useful test", visible)
	}

	m = press(t, m, "a")
	if len(m.queue) != visible {
		t.Errorf("queued %d, want the %d visible", len(m.queue), visible)
	}
}

func typeText(t *testing.T, m Model, text string) Model {
	t.Helper()
	for _, r := range text {
		next, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{r}})
		m = next.(Model)
	}
	return m
}

func TestSlashOpensSearchAndFiltersAsYouType(t *testing.T) {
	m := ready(t)
	all := len(m.entries)

	m = press(t, m, "/")
	if !m.searching {
		t.Fatal("/ did not focus the search box")
	}

	m = typeText(t, m, "firefox")
	if len(m.entries) >= all {
		t.Errorf("filtering to firefox left %d of %d entries", len(m.entries), all)
	}
	if len(m.entries) == 0 {
		t.Error("firefox should match something")
	}
}

// While the search box has focus, letters have to go into it — otherwise typing
// "install" would queue things and start a batch.
func TestTypingInSearchDoesNotTriggerCommands(t *testing.T) {
	m := ready(t)
	m = press(t, m, "/")
	m = typeText(t, m, "icux")

	if m.search.Value() != "icux" {
		t.Errorf("search box holds %q, want icux", m.search.Value())
	}
	if len(m.queue) != 0 {
		t.Errorf("typing queued %d entries", len(m.queue))
	}
	if m.batch != nil {
		t.Error("typing started a batch")
	}
	if m.view == viewJobs {
		t.Error("typing switched to the jobs view")
	}
}

func TestEscapeLeavesSearchAndClearsIt(t *testing.T) {
	m := ready(t)
	m = press(t, m, "/")
	m = typeText(t, m, "firefox")
	m = press(t, m, "esc")

	if m.searching {
		t.Error("still searching")
	}
	if m.search.Value() != "" {
		t.Errorf("search box holds %q, want it cleared", m.search.Value())
	}
	if len(m.entries) != len(catalog.All()) {
		t.Errorf("showing %d entries, want the filter removed", len(m.entries))
	}
}

func TestEnterKeepsTheFilterButLeavesTheBox(t *testing.T) {
	m := ready(t)
	m = press(t, m, "/")
	m = typeText(t, m, "firefox")
	m = press(t, m, "enter")

	if m.searching {
		t.Error("enter should take focus out of the search box")
	}
	if m.search.Value() != "firefox" {
		t.Errorf("enter discarded the query: %q", m.search.Value())
	}
}

func TestNumberKeysSwitchViews(t *testing.T) {
	m := ready(t)

	for _, tc := range []struct {
		key  string
		want view
	}{
		{"3", viewInstalled},
		{"4", viewManagers},
		{"1", viewCatalogue},
	} {
		m = press(t, m, tc.key)
		if m.view != tc.want {
			t.Errorf("%s gave view %v, want %v", tc.key, m.view, tc.want)
		}
	}
}

func TestSToggleSidebarAndHMovesIntoIt(t *testing.T) {
	m := ready(t)
	if !m.showSidebar {
		t.Fatal("the sidebar starts visible")
	}

	m = press(t, m, "h")
	if m.focus != paneSidebar {
		t.Error("h did not move focus into the sidebar")
	}

	// Hiding the sidebar must not leave focus stranded on it.
	m = press(t, m, "s")
	if m.showSidebar {
		t.Error("s did not hide the sidebar")
	}
	if m.focus == paneSidebar {
		t.Error("focus is on a hidden pane")
	}
}

func TestSidebarSelectionFiltersByCategory(t *testing.T) {
	m := ready(t)
	m = press(t, m, "h")

	// Move to the first real category; index 0 is "All".
	m = press(t, m, "j")
	if m.catCursor != 1 {
		t.Fatalf("catCursor = %d, want 1", m.catCursor)
	}

	want := m.categories[0]
	if len(m.entries) != catalog.Count(want.ID) {
		t.Errorf("showing %d entries for %q, want %d",
			len(m.entries), want.ID, catalog.Count(want.ID))
	}
	for _, e := range m.entries {
		if e.Category != want.ID {
			t.Fatalf("%s is in %q, not the selected %q", e.ID, e.Category, want.ID)
		}
	}

	// Back to All.
	m = press(t, m, "k")
	if len(m.entries) != len(catalog.All()) {
		t.Errorf("All shows %d, want %d", len(m.entries), len(catalog.All()))
	}
}

// Narrowing the list under a cursor that was further down must not leave the
// cursor out of range.
func TestFilteringClampsTheCursor(t *testing.T) {
	m := ready(t)
	m = press(t, m, "G")

	m = press(t, m, "/")
	m = typeText(t, m, "firefox")

	if m.cursor >= len(m.entries) {
		t.Errorf("cursor %d is past the %d filtered entries", m.cursor, len(m.entries))
	}
	// And the view must render without panicking.
	_ = m.View()
}

func TestEnterOpensAndEscapeClosesDetail(t *testing.T) {
	m := ready(t)
	m = press(t, m, "j", "enter")

	if m.view != viewDetail {
		t.Fatalf("view = %v, want the detail", m.view)
	}
	if m.detail == nil || m.detail.ID != m.entries[1].ID {
		t.Errorf("detail = %v, want the highlighted entry", m.detail)
	}

	m = press(t, m, "esc")
	if m.view != viewCatalogue {
		t.Errorf("view = %v, want back to the catalogue", m.view)
	}
}

func TestQuestionMarkTogglesHelpAndAnyKeyClosesIt(t *testing.T) {
	m := press(t, ready(t), "?")
	if !m.showHelp {
		t.Fatal("? did not open the help")
	}
	if !strings.Contains(m.View(), "Keys") {
		t.Error("the help overlay does not render its title")
	}

	m = press(t, m, "j")
	if m.showHelp {
		t.Error("a keypress did not close the help")
	}
}

// A press of i with an empty queue acts on the highlighted entry, which is what
// a terminal user expects and saves a keystroke.
func TestInstallWithAnEmptyQueueUsesTheHighlightedEntry(t *testing.T) {
	m := ready(t)
	m.pending = actions.Install
	m.pendingEntries = []*catalog.Entry{m.entries[0]}

	batch := m.planPending()
	if len(batch.Jobs) != 1 {
		t.Fatalf("planned %d jobs, want 1", len(batch.Jobs))
	}
	if batch.Jobs[0].Label != m.entries[0].Name {
		t.Errorf("planned %q, want the highlighted %q",
			batch.Jobs[0].Label, m.entries[0].Name)
	}
}

func TestPlanPendingUsesTheQueue(t *testing.T) {
	m := ready(t)
	m = press(t, m, " ", "j", " ")
	if len(m.queue) != 2 {
		t.Fatalf("queued %d, want 2", len(m.queue))
	}

	m.pending = actions.Install
	m.pendingEntries = m.selected()
	if got := len(m.planPending().Jobs); got != 2 {
		t.Errorf("planned %d jobs, want 2", got)
	}
}

// The queue must come out in catalogue order whatever order it was built in,
// so the progress list reads the same way the catalogue does.
func TestSelectedIsInCatalogueOrder(t *testing.T) {
	m := ready(t)
	m = press(t, m, "G", " ")      // last
	m = press(t, m, "g", "g", " ") // first

	got := m.selected()
	if len(got) != 2 {
		t.Fatalf("got %d, want 2", len(got))
	}
	all := catalog.All()
	if got[0].ID != all[0].ID {
		t.Errorf("first selected = %q, want %q", got[0].ID, all[0].ID)
	}
}

func TestInstalledViewQueuesPackagesSeparately(t *testing.T) {
	m := ready(t)
	next, _ := m.Update(scanMsg([]actions.Package{
		{Manager: "apt", Name: "git"},
		{Manager: "flatpak", Name: "Firefox", Description: "org.mozilla.firefox"},
	}))
	m = next.(Model)

	m = press(t, m, "3")
	m = press(t, m, " ")
	if len(m.pkgQueue) != 1 {
		t.Fatalf("package queue holds %d, want 1", len(m.pkgQueue))
	}
	// The catalogue queue must be untouched; they are different lists.
	if len(m.queue) != 0 {
		t.Errorf("the catalogue queue was changed: %v", m.queue)
	}

	if got := m.selectedPackages(); len(got) != 1 || got[0].Name != "git" {
		t.Errorf("selected = %v, want git", got)
	}

	// c clears both, so one key gets you out of any selection state.
	m = press(t, m, "c")
	if len(m.pkgQueue) != 0 {
		t.Errorf("c left %d packages selected", len(m.pkgQueue))
	}
}

// Install makes no sense in the Installed view, and should say so rather than
// doing something surprising.
func TestInstallInTheInstalledViewIsRefused(t *testing.T) {
	m := ready(t)
	next, _ := m.Update(scanMsg([]actions.Package{{Manager: "apt", Name: "git"}}))
	m = next.(Model)

	m = press(t, m, "3", " ", "i")
	if m.view == viewJobs {
		t.Error("i started a batch in the Installed view")
	}
	if m.flash == "" {
		t.Error("the refusal was silent")
	}
}

func TestViewRendersEveryScreenWithoutPanicking(t *testing.T) {
	m := ready(t)

	for _, v := range []view{viewCatalogue, viewInstalled, viewManagers, viewDetail, viewJobs} {
		m.view = v
		if v == viewDetail {
			m.detail = m.entries[0]
		}
		if v == viewJobs {
			m.batch = NewBatch(actions.Install, entries(t, "firefox"), testContext())
		}
		out := m.View()
		if out == "" {
			t.Errorf("view %v rendered nothing", v)
		}
	}
}

// An 80x24 ssh session is the smallest size that has to work, and a very narrow
// terminal must degrade rather than crash or produce negative widths.
func TestViewSurvivesSmallTerminals(t *testing.T) {
	for _, size := range [][2]int{{80, 24}, {60, 20}, {40, 15}, {20, 10}, {10, 6}} {
		m := New()
		next, _ := m.Update(tea.WindowSizeMsg{Width: size[0], Height: size[1]})
		m = next.(Model)
		next, _ = m.Update(scanMsg(nil))
		m = next.(Model)

		if out := m.View(); out == "" {
			t.Errorf("%dx%d rendered nothing", size[0], size[1])
		}
		// And it must still be navigable.
		m = press(t, m, "j", " ", "?")
		_ = m.View()
	}
}

func TestPanesDropOutAsTheTerminalNarrows(t *testing.T) {
	m := ready(t)
	if !m.sidebarOn() || !m.detailOn() {
		t.Fatal("a 120-column terminal should show both the sidebar and the detail")
	}

	next, _ := m.Update(tea.WindowSizeMsg{Width: 70, Height: 30})
	m = next.(Model)
	if m.detailOn() {
		t.Error("the detail pane should give way first on a narrow terminal")
	}

	next, _ = m.Update(tea.WindowSizeMsg{Width: 40, Height: 30})
	m = next.(Model)
	if m.sidebarOn() {
		t.Error("the sidebar should give way too when there is no room")
	}
}

func TestQuitIsRefusedWhileABatchRuns(t *testing.T) {
	m := ready(t)
	m.batch = NewBatch(actions.Install, entries(t, "firefox"), testContext())
	m.view = viewJobs

	next, cmd := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune("q")})
	m = next.(Model)
	if cmd != nil {
		t.Error("q quit while a batch was running")
	}
	if m.flash == "" {
		t.Error("the refusal was silent")
	}

	// Once it has finished, q works.
	m.batch.Finished = true
	_, cmd = m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune("q")})
	if cmd == nil {
		t.Error("q did not quit after the batch finished")
	}
}

func TestEscapeIsRefusedWhileABatchRuns(t *testing.T) {
	m := ready(t)
	m.batch = NewBatch(actions.Install, entries(t, "firefox"), testContext())
	m.view = viewJobs
	m.returnTo = viewCatalogue

	m = press(t, m, "esc")
	if m.view != viewJobs {
		t.Error("escape left a running batch")
	}

	m.batch.Finished = true
	m = press(t, m, "esc")
	if m.view != viewCatalogue {
		t.Errorf("view = %v, want back to the catalogue", m.view)
	}
}

func TestEventsAreFoldedIntoTheBatch(t *testing.T) {
	m := ready(t)
	m.batch = NewBatch(actions.Install, entries(t, "firefox"), testContext())
	m.jobIndex = []int{0}
	m.view = viewJobs

	next, _ := m.Update(eventsMsg{
		{Job: 0, Status: "running", Percent: -1},
		{Job: 0, Line: "Unpacking firefox", Percent: 60},
	})
	m = next.(Model)

	if m.batch.Jobs[0].Percent != 60 {
		t.Errorf("percent = %v, want 60", m.batch.Jobs[0].Percent)
	}
	if got := m.batch.Jobs[0].Last(); got != "Unpacking firefox" {
		t.Errorf("last line = %q", got)
	}
	if !strings.Contains(m.View(), "Firefox") {
		t.Error("the jobs view does not name the package")
	}
}

func TestSudoRefusalRunsNothing(t *testing.T) {
	m := ready(t)
	m.pending = actions.Install
	m.pendingEntries = entries(t, "firefox")

	next, _ := m.Update(sudoMsg{err: errString("cancelled")})
	m = next.(Model)

	if m.batch != nil {
		t.Error("a batch was started despite the password being declined")
	}
	if m.view == viewJobs {
		t.Error("switched to the jobs view with nothing running")
	}
	if m.flash == "" {
		t.Error("the user was not told why nothing happened")
	}
	if m.pendingEntries != nil {
		t.Error("the pending work was not discarded")
	}
}

func TestTruncateAndWrap(t *testing.T) {
	if got := truncate("hello world", 8); len([]rune(got)) > 8 {
		t.Errorf("truncate = %q, which is wider than 8", got)
	}
	if got := truncate("hi", 10); got != "hi" {
		t.Errorf("truncate widened %q", got)
	}
	if got := truncate("hello", 0); got != "" {
		t.Errorf("truncate to 0 = %q", got)
	}
	// Multi-byte text must not be cut mid-rune.
	if got := truncate("héllo wörld ünicode", 10); !isValidUTF8(got) {
		t.Errorf("truncate produced invalid utf-8: %q", got)
	}

	wrapped := wrap("the quick brown fox jumps over the lazy dog", 12)
	for _, line := range strings.Split(wrapped, "\n") {
		if len(line) > 12 {
			t.Errorf("wrapped line %q is longer than 12", line)
		}
	}
	if wrap("", 10) != "" {
		t.Error("wrapping an empty string should give an empty string")
	}
}

func isValidUTF8(s string) bool {
	for _, r := range s {
		if r == '�' {
			return false
		}
	}
	return true
}

func TestScrollKeepsTheCursorInTheWindow(t *testing.T) {
	for _, tc := range []struct {
		offset, cursor, height, total, want int
	}{
		{0, 0, 10, 100, 0},
		{0, 5, 10, 100, 0},    // already visible, do not move
		{0, 15, 10, 100, 6},   // scrolled down just enough
		{20, 5, 10, 100, 5},   // scrolled back up to the cursor
		{95, 99, 10, 100, 90}, // clamped to the last full window
		{0, 0, 10, 3, 0},      // fewer items than the window
		{0, 0, 0, 10, 0},      // no height at all must not divide by zero
	} {
		got := scroll(tc.offset, tc.cursor, tc.height, tc.total)
		if got != tc.want {
			t.Errorf("scroll(%d,%d,%d,%d) = %d, want %d",
				tc.offset, tc.cursor, tc.height, tc.total, got, tc.want)
		}
	}
}
