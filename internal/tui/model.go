// Package tui is Packall's terminal interface.
//
// The screen is modelled on the desktop app, because that shape is already
// known to work: a category sidebar, a filterable list, a detail pane, a queue
// and a progress area. The keys are the same ones the README documents.
//
// The Elm loop fits the job queue almost exactly: the runner sends events over
// a channel, a tea.Cmd turns each batch of them into a Msg, and Batch.Apply
// folds them into state. That is jobs-reducer.ts, one for one.
package tui

import (
	"context"
	"os/exec"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/help"
	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/distro"
	"github.com/nishu-murmu/packall/internal/repo"
	"github.com/nishu-murmu/packall/internal/runner"
)

type view int

const (
	viewCatalogue view = iota
	viewRepos
	viewInstalled
	viewManagers
	viewUpdates
	viewDetail
	viewJobs
)

type pane int

const (
	paneList pane = iota
	paneSidebar
)

// Model is the whole application state.
type Model struct {
	styles Styles
	keys   KeyMap
	help   help.Model

	width, height int
	ready         bool

	host     distro.Info
	packages []actions.Package
	// installed is packages keyed by manager/name, for marking repo rows.
	installed map[string]bool
	scanning  bool

	view        view
	returnTo    view
	focus       pane
	showSidebar bool
	showHelp    bool

	// Catalogue browsing.
	categories []catalog.Category
	catCursor  int // 0 is "All"
	entries    []*catalog.Entry
	cursor     int
	offset     int
	queue      map[string]bool

	search    textinput.Model
	searching bool

	// Installed view.
	pkgCursor int
	pkgOffset int
	pkgQueue  map[string]bool

	// Repositories view: every package the host's managers can install.
	repos repoState

	// Updates view: installed packages with a newer version waiting.
	updates updateState

	// Detail.
	detail *catalog.Entry

	// Jobs.
	batch    *Batch
	jobIndex []int
	events   <-chan runner.Event
	cancel   context.CancelFunc
	log      viewport.Model
	spin     int

	// pending is the action waiting on a sudo prompt.
	pending        actions.Action
	pendingEntries []*catalog.Entry
	pendingPkgs    []actions.Package
	// pendingPlan is a batch planned up front, for work that is not a plain
	// per-entry or per-package action (the Updates view).
	pendingPlan *Batch

	// self is the update of Packall itself.
	self selfState

	flash   string
	flashAt time.Time
	err     error

	gPressed bool
}

// New builds the initial model.
func New() Model {
	ti := textinput.New()
	ti.Placeholder = "search"
	ti.Prompt = "/ "
	ti.CharLimit = 64

	m := Model{
		styles:      NewStyles(),
		keys:        DefaultKeyMap(),
		help:        help.New(),
		view:        viewCatalogue,
		showSidebar: true,
		categories:  catalog.Categories(),
		queue:       map[string]bool{},
		pkgQueue:    map[string]bool{},
		repos:       repoState{loading: true, queue: map[string]repo.Pkg{}},
		updates:     updateState{checking: true, queue: map[string]bool{}},
		search:      ti,
		scanning:    true,
	}
	m.refilter()
	return m
}

// ---------------------------------------------------------------------- msgs

type hostMsg distro.Info

type scanMsg []actions.Package

// eventsMsg carries a drained batch of runner events, so a command printing
// thousands of lines does not cost one full update cycle per line.
type eventsMsg []runner.Event

type eventsClosedMsg struct{}

type sudoMsg struct{ err error }

type tickMsg time.Time

// Init starts host detection and the installed-package scan.
func (m Model) Init() tea.Cmd {
	return tea.Batch(detectCmd(), scanCmd(), loadReposCmd(), checkUpdatesCmd(), tickCmd(), selfCheckCmd())
}

func detectCmd() tea.Cmd {
	return func() tea.Msg { return hostMsg(distro.Detect()) }
}

func scanCmd() tea.Cmd {
	return func() tea.Msg {
		return scanMsg(distro.ScanInstalled(context.Background()))
	}
}

func tickCmd() tea.Cmd {
	return tea.Tick(120*time.Millisecond, func(t time.Time) tea.Msg { return tickMsg(t) })
}

// waitForEvents blocks for one event, then takes whatever else is already
// waiting, up to a cap. One Msg per line would make a noisy apt run crawl.
func waitForEvents(ch <-chan runner.Event) tea.Cmd {
	return func() tea.Msg {
		ev, ok := <-ch
		if !ok {
			return eventsClosedMsg{}
		}
		out := []runner.Event{ev}
		for len(out) < 128 {
			select {
			case next, ok := <-ch:
				if !ok {
					return eventsMsg(out)
				}
				out = append(out, next)
			default:
				return eventsMsg(out)
			}
		}
		return eventsMsg(out)
	}
}

// -------------------------------------------------------------------- update

// Update folds one message into the model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.width, m.height = msg.Width, msg.Height
		m.ready = true
		m.help.Width = msg.Width
		m.log.Width = msg.Width - 4
		m.log.Height = m.logHeight()
		m.clampCursor()
		return m, nil

	case hostMsg:
		m.host = distro.Info(msg)
		m.refilter()
		return m, nil

	case scanMsg:
		m.packages = []actions.Package(msg)
		m.installed = make(map[string]bool, len(m.packages))
		for _, p := range m.packages {
			m.installed[pkgKey(p)] = true
		}
		m.scanning = false
		return m, nil

	case updatesMsg:
		m.updates.set([]distro.Upgrade(msg))
		m.clampUpdateCursor()
		return m, nil

	case repoMsg:
		m.repos.index, m.repos.err, m.repos.loading = msg.index, msg.err, false
		m.refilterRepos()
		return m, nil

	case aurTickMsg:
		// Only the query still in the box is worth sending.
		if m.view != viewRepos || string(msg) != m.repoQuery() {
			return m, nil
		}
		return m, aurCmd(string(msg))

	case aurMsg:
		if msg.query != m.repoQuery() {
			return m, nil
		}
		m.repos.aurQuery, m.repos.aurHits, m.repos.aurErr = msg.query, msg.pkgs, msg.err
		m.refilterRepos()
		return m, nil

	case tickMsg:
		if m.view == viewJobs && m.batch != nil && !m.batch.Finished {
			m.spin++
			return m, tickCmd()
		}
		if m.flash != "" && time.Since(m.flashAt) > 4*time.Second {
			m.flash = ""
		}
		return m, tickCmd()

	case eventsMsg:
		if m.batch == nil {
			return m, nil
		}
		for _, ev := range msg {
			m.batch.Apply(ev, m.jobIndex)
		}
		m.syncLog()
		return m, waitForEvents(m.events)

	case eventsClosedMsg:
		if m.batch != nil {
			m.batch.Finished = true
			m.batch.Active = -1
			m.syncLog()
		}
		m.events = nil
		// A bootstrap batch installed a new tool; re-probe so the host picks it up.
		if m.batch != nil && m.batch.NeedsRefresh {
			m.host = distro.Refresh()
			m.refilter()
		}
		// What is installed has changed, so the Installed and Updates views
		// are stale.
		return m, tea.Batch(scanCmd(), m.refreshUpdates())

	case sudoMsg:
		if msg.err != nil {
			m.flash, m.flashAt = "administrator rights declined — nothing was run", time.Now()
			m.pendingEntries, m.pendingPkgs, m.pendingPlan = nil, nil, nil
			return m, nil
		}
		return m.startPending()

	case selfCheckMsg, selfUpdatedMsg:
		return m.handleSelfMsg(msg)

	case tea.KeyMsg:
		return m.handleKey(msg)
	}

	return m, nil
}

// handleKey routes a keypress, giving the search box and the overlays first
// refusal before the global bindings.
func (m Model) handleKey(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	// ctrl+c cancels a running batch, and otherwise quits.
	if key.Matches(msg, m.keys.Cancel) {
		if m.batch != nil && !m.batch.Finished && m.cancel != nil {
			m.cancel()
			m.batch.Cancelled = true
			m.flash, m.flashAt = "cancelling…", time.Now()
			return m, nil
		}
		return m, tea.Quit
	}

	// The search box swallows almost everything while it has focus.
	if m.searching {
		switch msg.String() {
		case "esc":
			m.clearSearch()
			return m, nil
		case "enter":
			m.searching = false
			m.search.Blur()
			return m, nil
		case "tab":
			return m.toggleScope()
		}
		var cmd tea.Cmd
		m.search, cmd = m.search.Update(msg)
		m.refilter()
		m.refilterRepos()
		m.clampUpdateCursor()
		return m, tea.Batch(cmd, m.aurDebounce())
	}

	if m.showHelp {
		// Any key closes the help overlay.
		m.showHelp = false
		return m, nil
	}

	// gg — only a second g counts, anything else cancels the pending one.
	if m.gPressed {
		m.gPressed = false
		if msg.String() == "g" {
			m.cursorTo(0)
			return m, nil
		}
	}

	switch {
	case key.Matches(msg, m.keys.SelfUpdate):
		return m.startSelfUpdate()
	case key.Matches(msg, m.keys.Quit):
		if m.batch != nil && !m.batch.Finished {
			m.flash, m.flashAt = "a batch is running — ctrl+c to cancel it first", time.Now()
			return m, nil
		}
		return m, tea.Quit

	case key.Matches(msg, m.keys.Help):
		m.showHelp = true
		return m, nil

	case key.Matches(msg, m.keys.Escape):
		return m.escape()

	case key.Matches(msg, m.keys.Search):
		if m.view == viewCatalogue || m.view == viewInstalled || m.view == viewRepos || m.view == viewUpdates {
			m.searching = true
			m.search.Focus()
			return m, textinput.Blink
		}
		return m, nil

	case key.Matches(msg, m.keys.Catalogue):
		m.leaveView(viewCatalogue)
		m.view, m.focus = viewCatalogue, paneList
		m.clampCursor()
		return m, nil

	case key.Matches(msg, m.keys.Repos):
		m.leaveView(viewRepos)
		return m.openRepos()

	case key.Matches(msg, m.keys.Scope):
		return m.toggleScope()

	case key.Matches(msg, m.keys.Installed):
		m.leaveView(viewInstalled)
		m.view, m.focus = viewInstalled, paneList
		m.clampCursor()
		return m, nil

	case key.Matches(msg, m.keys.Updates):
		m.leaveView(viewUpdates)
		m.view, m.focus = viewUpdates, paneList
		m.clampUpdateCursor()
		return m, nil

	case key.Matches(msg, m.keys.UpdateAll):
		return m.upgradeAll()

	case key.Matches(msg, m.keys.Refresh):
		if m.view != viewUpdates && m.view != viewInstalled {
			return m, nil
		}
		cmd := m.refreshUpdates()
		if cmd == nil {
			m.flash, m.flashAt = "already checking for updates…", time.Now()
		} else {
			m.flash, m.flashAt = "checking for updates…", time.Now()
		}
		return m, cmd

	case key.Matches(msg, m.keys.Managers):
		m.leaveView(viewManagers)
		m.view = viewManagers
		return m, nil

	case key.Matches(msg, m.keys.Sidebar):
		m.showSidebar = !m.showSidebar
		if !m.showSidebar && m.focus == paneSidebar {
			m.focus = paneList
		}
		return m, nil

	case key.Matches(msg, m.keys.Down):
		m.move(1)
		return m, nil

	case key.Matches(msg, m.keys.Up):
		m.move(-1)
		return m, nil

	case key.Matches(msg, m.keys.PageDown):
		m.move(m.listHeight())
		return m, nil

	case key.Matches(msg, m.keys.PageUp):
		m.move(-m.listHeight())
		return m, nil

	case key.Matches(msg, m.keys.Top):
		m.gPressed = true
		return m, nil

	case key.Matches(msg, m.keys.Bottom):
		m.cursorTo(m.count() - 1)
		return m, nil

	case key.Matches(msg, m.keys.Left):
		if m.view == viewDetail {
			return m.escape()
		}
		if m.showSidebar && m.view == viewCatalogue {
			m.focus = paneSidebar
		}
		return m, nil

	case key.Matches(msg, m.keys.Right):
		if m.focus == paneSidebar {
			m.focus = paneList
			return m, nil
		}
		return m.openDetail()

	case key.Matches(msg, m.keys.Enter):
		if m.focus == paneSidebar {
			m.focus = paneList
			return m, nil
		}
		return m.openDetail()

	case key.Matches(msg, m.keys.Toggle):
		m.toggle()
		return m, nil

	case key.Matches(msg, m.keys.All):
		m.selectAll()
		return m, nil

	case key.Matches(msg, m.keys.Clear):
		m.queue = map[string]bool{}
		m.pkgQueue = map[string]bool{}
		m.repos.queue = map[string]repo.Pkg{}
		m.updates.queue = map[string]bool{}
		return m, nil

	case key.Matches(msg, m.keys.Install):
		return m.run(actions.Install)

	case key.Matches(msg, m.keys.Update):
		return m.run(actions.Update)

	case key.Matches(msg, m.keys.Remove):
		return m.run(actions.Remove)
	}

	// The log scrolls with the same keys while a batch is on screen.
	if m.view == viewJobs {
		var cmd tea.Cmd
		m.log, cmd = m.log.Update(msg)
		return m, cmd
	}
	return m, nil
}

// clearSearch empties and closes the search box. Every view filters on the
// same box, so a query left behind would silently empty the next one.
func (m *Model) clearSearch() {
	m.searching = false
	m.search.Blur()
	m.search.SetValue("")
	m.refilter()
	m.refilterRepos()
	m.clampUpdateCursor()
}

// leaveView clears the search when a number key moves to a different view.
// Pressing the current view's own key keeps it; tab is the way to carry a
// query from the catalogue to the repositories.
func (m *Model) leaveView(to view) {
	if m.view != to {
		m.clearSearch()
	}
}

// openRepos switches to the Repositories view, keeping whatever is in the
// search box.
func (m Model) openRepos() (tea.Model, tea.Cmd) {
	// The search box is not focused here: a focused box swallows 1–4, which
	// would trap the user in this view. The intro screen asks for / instead.
	m.view, m.focus = viewRepos, paneList
	m.refilterRepos()
	return m, m.aurDebounce()
}

// toggleScope moves a search between the catalogue and the repositories with
// the query intact, so a catalogue search that comes up short is one key away
// from every package the host offers. It works while typing, too.
func (m Model) toggleScope() (tea.Model, tea.Cmd) {
	switch m.view {
	case viewCatalogue:
		return m.openRepos()
	case viewRepos:
		m.view, m.focus = viewCatalogue, paneList
		m.clampCursor()
	}
	return m, nil
}

// escape backs out of whatever is on top.
func (m Model) escape() (tea.Model, tea.Cmd) {
	switch {
	case m.showHelp:
		m.showHelp = false
	case m.view == viewDetail:
		m.view = m.returnTo
	case m.view == viewJobs:
		if m.batch != nil && !m.batch.Finished {
			m.flash, m.flashAt = "still running — ctrl+c to cancel", time.Now()
			return m, nil
		}
		m.view = m.returnTo
		m.batch = nil
	case m.view != viewCatalogue:
		m.view = viewCatalogue
	case m.search.Value() != "":
		m.search.SetValue("")
		m.refilter()
		m.refilterRepos()
	case len(m.queue) > 0 || len(m.pkgQueue) > 0 || len(m.repos.queue) > 0 || len(m.updates.queue) > 0:
		m.queue = map[string]bool{}
		m.pkgQueue = map[string]bool{}
		m.repos.queue = map[string]repo.Pkg{}
		m.updates.queue = map[string]bool{}
	}
	return m, nil
}

func (m Model) openDetail() (tea.Model, tea.Cmd) {
	if m.view != viewCatalogue || len(m.entries) == 0 {
		return m, nil
	}
	m.returnTo = m.view
	m.detail = m.entries[m.cursor]
	m.view = viewDetail
	return m, nil
}

// ------------------------------------------------------------------ the queue

// selected returns the queued catalogue entries, in catalogue order.
func (m Model) selected() []*catalog.Entry {
	if len(m.queue) == 0 {
		return nil
	}
	all := catalog.All()
	var out []*catalog.Entry
	for i := range all {
		if m.queue[all[i].ID] {
			out = append(out, &all[i])
		}
	}
	return out
}

// selectedPackages returns the queued installed packages.
func (m Model) selectedPackages() []actions.Package {
	if len(m.pkgQueue) == 0 {
		return nil
	}
	var out []actions.Package
	for _, p := range m.packages {
		if m.pkgQueue[pkgKey(p)] {
			out = append(out, p)
		}
	}
	return out
}

func pkgKey(p actions.Package) string { return p.Manager + "/" + p.Name }

func (m *Model) toggle() {
	switch m.view {
	case viewCatalogue, viewDetail:
		if len(m.entries) == 0 {
			return
		}
		id := m.entries[m.cursor].ID
		if m.queue[id] {
			delete(m.queue, id)
		} else {
			m.queue[id] = true
		}
	case viewInstalled:
		list := m.installedList()
		if len(list) == 0 {
			return
		}
		k := pkgKey(list[m.pkgCursor])
		if m.pkgQueue[k] {
			delete(m.pkgQueue, k)
		} else {
			m.pkgQueue[k] = true
		}
	case viewRepos:
		if len(m.repos.hits) == 0 {
			return
		}
		p := m.repos.hits[m.repos.cursor]
		if _, ok := m.repos.queue[p.Key()]; ok {
			delete(m.repos.queue, p.Key())
		} else {
			m.repos.queue[p.Key()] = p
		}
	case viewUpdates:
		list := m.updatesList()
		if len(list) == 0 {
			return
		}
		k := list[m.updates.cursor].Key()
		if m.updates.queue[k] {
			delete(m.updates.queue, k)
		} else {
			m.updates.queue[k] = true
		}
	}
}

func (m *Model) selectAll() {
	switch m.view {
	case viewCatalogue:
		for _, e := range m.entries {
			m.queue[e.ID] = true
		}
	case viewInstalled:
		for _, p := range m.installedList() {
			m.pkgQueue[pkgKey(p)] = true
		}
	case viewRepos:
		for _, p := range m.repos.hits {
			m.repos.queue[p.Key()] = p
		}
	case viewUpdates:
		for _, u := range m.updatesList() {
			m.updates.queue[u.Key()] = true
		}
	}
}

// ------------------------------------------------------------------- running

// run starts a batch for the current queue, priming sudo first when the
// commands need it.
func (m Model) run(action actions.Action) (tea.Model, tea.Cmd) {
	if m.batch != nil && !m.batch.Finished {
		m.flash, m.flashAt = "a batch is already running", time.Now()
		return m, nil
	}

	if m.view == viewUpdates {
		if action != actions.Update {
			m.flash, m.flashAt = "u updates the selection, U updates everything", time.Now()
			return m, nil
		}
		sel := m.selectedUpgrades()
		if len(sel) == 0 {
			// Like the catalogue: an empty selection acts on the highlighted row.
			list := m.updatesList()
			if len(list) == 0 {
				m.flash, m.flashAt = "nothing to update", time.Now()
				return m, nil
			}
			sel = list[m.updates.cursor : m.updates.cursor+1]
		}
		m.pending = action
		m.pendingPlan = NewUpgradeBatch(sel, m.host.Managers)
		return m.launch()
	}

	if m.view == viewRepos {
		pkgs := m.selectedRepoPackages()
		if len(pkgs) == 0 {
			m.flash, m.flashAt = "nothing to "+string(action)+" — / to search the repositories", time.Now()
			return m, nil
		}
		m.pending, m.pendingPkgs, m.pendingEntries = action, pkgs, nil
	} else if m.view == viewInstalled {
		pkgs := m.selectedPackages()
		if len(pkgs) == 0 {
			m.flash, m.flashAt = "nothing selected — space to add a package", time.Now()
			return m, nil
		}
		if action == actions.Install {
			m.flash, m.flashAt = "these are installed already — u to update, x to remove", time.Now()
			return m, nil
		}
		m.pending, m.pendingPkgs, m.pendingEntries = action, pkgs, nil
	} else {
		entries := m.selected()
		if len(entries) == 0 {
			// Acting on the highlighted entry with an empty queue is what a
			// terminal user expects, and saves a keystroke.
			if len(m.entries) == 0 {
				m.flash, m.flashAt = "nothing to "+string(action), time.Now()
				return m, nil
			}
			entries = []*catalog.Entry{m.entries[m.cursor]}
		}
		m.pending, m.pendingEntries, m.pendingPkgs = action, entries, nil
	}
	return m.launch()
}

// launch starts whatever is pending, priming sudo first when it needs it.
func (m Model) launch() (tea.Model, tea.Cmd) {
	if m.batch != nil && !m.batch.Finished {
		m.flash, m.flashAt = "a batch is already running", time.Now()
		m.pendingPlan = nil
		return m, nil
	}

	// Plan it now, so sudo is only asked for when something actually needs it.
	batch := m.planPending()
	if len(batch.Jobs) == 0 {
		m.flash, m.flashAt = "nothing to "+string(m.pending), time.Now()
		m.pendingPlan = nil
		return m, nil
	}
	if batch.NeedsRoot() {
		// A TUI has a tty, so sudo can do its own prompting: suspend the UI,
		// let sudo cache the credential, and resume. No password ever passes
		// through Packall.
		return m, tea.ExecProcess(sudoPrimeCmd(), func(err error) tea.Msg {
			return sudoMsg{err: err}
		})
	}
	return m.startPending()
}

// planPending builds the batch for whatever is pending, without starting it.
func (m Model) planPending() *Batch {
	if m.pendingPlan != nil {
		return m.pendingPlan
	}
	ctx := m.host.Context(m.packages)
	if len(m.pendingPkgs) > 0 {
		return NewPackageBatch(m.pending, m.pendingPkgs, m.host.Managers)
	}
	return NewBatch(m.pending, m.pendingEntries, ctx)
}

// startPending runs the planned batch.
func (m Model) startPending() (tea.Model, tea.Cmd) {
	batch := m.planPending()
	m.pendingEntries, m.pendingPkgs, m.pendingPlan = nil, nil, nil

	jobs, index := batch.Runnable()
	m.batch, m.jobIndex = batch, index
	m.returnTo = m.view
	m.view = viewJobs
	m.log = viewport.New(max(10, m.width-4), m.logHeight())
	// The search that found these is done with; left in the box it would hide
	// everything else when the user goes back to browsing.
	m.clearSearch()

	if len(jobs) == 0 {
		batch.Finished = true
		m.syncLog()
		return m, nil
	}

	ctx, cancel := context.WithCancel(context.Background())
	m.cancel = cancel
	m.events = runner.Runner{Env: runnerEnv()}.Run(ctx, jobs)

	// The queue has been acted on; clear it so a second i does not repeat it.
	m.queue = map[string]bool{}
	m.pkgQueue = map[string]bool{}
	m.repos.queue = map[string]repo.Pkg{}
	m.updates.queue = map[string]bool{}

	return m, tea.Batch(waitForEvents(m.events), tickCmd(), sudoKeepaliveCmd(ctx))
}

// runnerEnv keeps managers non-interactive and their output parseable.
func runnerEnv() []string {
	return []string{
		"DEBIAN_FRONTEND=noninteractive",
		// A pager would block forever with no one to press q.
		"PAGER=cat",
		"SYSTEMD_PAGER=",
		"GIT_PAGER=cat",
		// Managers that colour their output make the log unreadable once the
		// escapes are mixed with lipgloss's own.
		"NO_COLOR=1",
	}
}

func sudoPrimeCmd() *exec.Cmd {
	// -v validates and caches; with the credential already cached it prints
	// nothing and returns at once.
	return exec.Command("sudo", "-v")
}

// --------------------------------------------------------------- list helpers

// refilter recomputes the visible entries from the category and the search box.
func (m *Model) refilter() {
	query := strings.TrimSpace(m.search.Value())

	var pool []catalog.Entry
	if query != "" {
		pool = catalog.Search(query)
	} else {
		pool = catalog.All()
	}

	var category string
	if m.catCursor > 0 && m.catCursor-1 < len(m.categories) {
		category = m.categories[m.catCursor-1].ID
	}

	all := catalog.All()
	index := map[string]int{}
	for i := range all {
		index[all[i].ID] = i
	}

	m.entries = nil
	for i := range pool {
		if category != "" && pool[i].Category != category {
			continue
		}
		m.entries = append(m.entries, &all[index[pool[i].ID]])
	}
	m.clampEntryCursor()
}

// installedList is the Installed view's rows, filtered by the search box.
func (m Model) installedList() []actions.Package {
	query := strings.ToLower(strings.TrimSpace(m.search.Value()))
	if query == "" {
		return m.packages
	}
	var out []actions.Package
	for _, p := range m.packages {
		if strings.Contains(strings.ToLower(p.Name), query) ||
			strings.Contains(strings.ToLower(p.Manager), query) {
			out = append(out, p)
		}
	}
	return out
}

// count is how many rows the focused list has.
func (m Model) count() int {
	switch {
	case m.focus == paneSidebar:
		return len(m.categories) + 1
	case m.view == viewInstalled:
		return len(m.installedList())
	case m.view == viewRepos:
		return len(m.repos.hits)
	case m.view == viewUpdates:
		return len(m.updatesList())
	default:
		return len(m.entries)
	}
}

func (m *Model) move(delta int) {
	m.cursorTo(m.current() + delta)
}

func (m Model) current() int {
	switch {
	case m.focus == paneSidebar:
		return m.catCursor
	case m.view == viewInstalled:
		return m.pkgCursor
	case m.view == viewRepos:
		return m.repos.cursor
	case m.view == viewUpdates:
		return m.updates.cursor
	default:
		return m.cursor
	}
}

// clamp confines an index to a list of n rows.
func clamp(i, n int) int {
	if n <= 0 || i < 0 {
		return 0
	}
	if i >= n {
		return n - 1
	}
	return i
}

// cursorTo moves the focused list's cursor, clamped, and scrolls to keep it on
// screen.
//
// The sidebar branch changes which entries are visible, so it has to refilter —
// and refilter must therefore clamp the list cursor directly rather than
// calling back in here, or the two recurse until the stack runs out.
func (m *Model) cursorTo(i int) {
	i = clamp(i, m.count())

	switch {
	case m.focus == paneSidebar:
		m.catCursor = i
		m.refilter()
	case m.view == viewInstalled:
		m.pkgCursor = i
		m.pkgOffset = scroll(m.pkgOffset, i, m.listHeight(), len(m.installedList()))
	case m.view == viewRepos:
		m.repos.cursor = i
		m.repos.offset = scroll(m.repos.offset, i, m.repoListHeight(), len(m.repos.hits))
	case m.view == viewUpdates:
		m.updates.cursor = i
		m.updates.offset = scroll(m.updates.offset, i, m.updatesListHeight(), len(m.updatesList()))
	default:
		m.cursor = i
		m.offset = scroll(m.offset, i, m.listHeight(), len(m.entries))
	}
}

// clampEntryCursor keeps the app list's cursor and scroll valid after the
// visible set has changed. It touches only that list, so it cannot recurse.
func (m *Model) clampEntryCursor() {
	m.cursor = clamp(m.cursor, len(m.entries))
	m.offset = scroll(m.offset, m.cursor, m.listHeight(), len(m.entries))
}

// scroll keeps the cursor inside the window, moving the window as little as
// possible.
func scroll(offset, cursor, height, total int) int {
	if height <= 0 {
		return 0
	}
	if cursor < offset {
		offset = cursor
	}
	if cursor >= offset+height {
		offset = cursor - height + 1
	}
	if max := total - height; offset > max {
		offset = max
	}
	if offset < 0 {
		offset = 0
	}
	return offset
}

// clampCursor revalidates every cursor, after a resize or a view switch.
func (m *Model) clampCursor() {
	m.catCursor = clamp(m.catCursor, len(m.categories)+1)
	m.clampEntryCursor()

	n := len(m.installedList())
	m.pkgCursor = clamp(m.pkgCursor, n)
	m.pkgOffset = scroll(m.pkgOffset, m.pkgCursor, m.listHeight(), n)

	m.clampRepoCursor()
	m.clampUpdateCursor()
}

// syncLog rebuilds the log viewport from the active or last-interesting job.
func (m *Model) syncLog() {
	if m.batch == nil {
		return
	}

	job := m.batch.Active
	if job < 0 {
		// Finished: show the first failure if there is one, else the last job.
		job = len(m.batch.Jobs) - 1
		for i, j := range m.batch.Jobs {
			if j.Status == runner.Failed {
				job = i
				break
			}
		}
	}
	if job < 0 || job >= len(m.batch.Jobs) {
		return
	}

	atBottom := m.log.AtBottom()
	m.log.Width = max(10, m.width-4)
	m.log.Height = m.logHeight()
	m.log.SetContent(strings.Join(m.batch.Jobs[job].Lines, "\n"))
	if atBottom {
		m.log.GotoBottom()
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
