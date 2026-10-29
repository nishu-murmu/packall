package tui

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/repo"
)

// repoLimit caps the rows a search shows. Past a few hundred nobody scrolls;
// they type another letter.
const repoLimit = 500

// aurDelay is how long typing must pause before the AUR is asked, so a word
// costs one request rather than one per keystroke.
const aurDelay = 350 * time.Millisecond

// repoState is the Repositories view: the host's whole package index, searched
// by the same box as the catalogue.
type repoState struct {
	index   *repo.Index
	loading bool
	err     error

	hits   []repo.Pkg
	total  int // local matches before repoLimit, AUR not included
	cursor int
	offset int
	queue  map[string]repo.Pkg

	// aurHits belong to aurQuery; they are only shown while it is still the
	// query in the box.
	aurQuery string
	aurHits  []repo.Pkg
	aurErr   error
}

type repoMsg struct {
	index *repo.Index
	err   error
}

// aurTickMsg fires once typing has paused, carrying the query typed then.
type aurTickMsg string

type aurMsg struct {
	query string
	pkgs  []repo.Pkg
	err   error
}

func loadReposCmd() tea.Cmd {
	return func() tea.Msg {
		ix, err := repo.Load()
		return repoMsg{index: ix, err: err}
	}
}

func aurCmd(query string) tea.Cmd {
	return func() tea.Msg {
		pkgs, err := repo.SearchAUR(context.Background(), query)
		return aurMsg{query: query, pkgs: pkgs, err: err}
	}
}

func (m Model) repoQuery() string { return strings.TrimSpace(m.search.Value()) }

// aurAvailable reports whether AUR results could be installed here at all.
func (m Model) aurAvailable() bool { return m.host.Has("paru") || m.host.Has("yay") }

// aurDebounce schedules an AUR search for the current query, if one is due.
func (m Model) aurDebounce() tea.Cmd {
	q := m.repoQuery()
	if m.view != viewRepos || !m.aurAvailable() || len([]rune(q)) < 2 || q == m.repos.aurQuery {
		return nil
	}
	return tea.Tick(aurDelay, func(time.Time) tea.Msg { return aurTickMsg(q) })
}

// refilterRepos recomputes the Repositories rows from the search box.
func (m *Model) refilterRepos() {
	q := m.repoQuery()
	m.repos.hits, m.repos.total = m.repos.index.Search(q, repoLimit)
	if q != "" && q == m.repos.aurQuery {
		m.repos.hits = append(m.repos.hits, m.repos.aurHits...)
	}
	m.clampRepoCursor()
}

func (m *Model) clampRepoCursor() {
	m.repos.cursor = clamp(m.repos.cursor, len(m.repos.hits))
	m.repos.offset = scroll(m.repos.offset, m.repos.cursor, m.repoListHeight(), len(m.repos.hits))
}

// repoListHeight is the list's room once the view's header line is taken.
func (m Model) repoListHeight() int { return max(1, m.listHeight()-1) }

// selectedRepoPackages returns the queued repo packages, or the highlighted one
// when nothing is queued, as packages the command builder understands.
func (m Model) selectedRepoPackages() []actions.Package {
	var picked []repo.Pkg
	for _, p := range m.repos.queue {
		picked = append(picked, p)
	}
	sort.Slice(picked, func(i, j int) bool { return picked[i].Key() < picked[j].Key() })
	if len(picked) == 0 && len(m.repos.hits) > 0 {
		picked = []repo.Pkg{m.repos.hits[m.repos.cursor]}
	}

	out := make([]actions.Package, 0, len(picked))
	for _, p := range picked {
		out = append(out, actions.Package{Manager: p.Manager, Name: p.Name})
	}
	return out
}

// ---------------------------------------------------------------------- view

func (m Model) viewRepos() string {
	r := m.repos
	q := m.repoQuery()
	width := m.width - 4

	var header string
	switch {
	case r.loading:
		header = "Repositories — reading package indexes…"
	case q == "":
		header = fmt.Sprintf("Repositories — %d packages", r.index.Len())
	default:
		header = fmt.Sprintf("Repositories — %d matches for %s", r.total, quote(q))
		if r.total > repoLimit {
			header += fmt.Sprintf(", showing the best %d", repoLimit)
		}
		if len(r.aurHits) > 0 && q == r.aurQuery {
			header += fmt.Sprintf(" · %d from the AUR", len(r.aurHits))
		}
	}
	top := m.styles.Label.Render(header) + "\n"

	var content string
	switch {
	case r.loading:
	case r.index.Len() == 0:
		msg := "no package index found on this machine"
		if r.err != nil {
			msg += " — " + r.err.Error()
		}
		content = m.styles.Empty.Render(msg + "\n\nrun your manager's refresh (apt update, or pacman -Syu) and reopen Packall")
	case q == "":
		content = m.styles.Empty.Render("/ to search everything your package managers offer")
	case len(r.hits) == 0:
		content = m.styles.Empty.Render("nothing matches " + quote(q))
	default:
		height := m.repoListHeight()
		end := min(r.offset+height, len(r.hits))
		rows := make([]string, 0, end-r.offset)
		for i := r.offset; i < end; i++ {
			rows = append(rows, m.repoRow(r.hits[i], i == r.cursor, width))
		}
		content = strings.Join(rows, "\n")
	}

	// The AUR is user-submitted; say so whenever its packages are on screen.
	if q != "" && q == r.aurQuery && len(r.aurHits) > 0 {
		top += m.styles.Error.Render("AUR packages are user-submitted and unreviewed — read the PKGBUILD before installing") + "\n"
	}
	return m.pane(top+content, m.width, m.contentHeight(), true)
}

// repoRow is one package: marker, name, version, summary, and where it is from.
func (m Model) repoRow(p repo.Pkg, cursor bool, width int) string {
	_, queued := m.repos.queue[p.Key()]
	marker := "  "
	if queued {
		marker = m.styles.ItemQueued.Render("● ")
	}
	if cursor {
		marker = m.styles.ItemSelected.Render("▸ ")
	}
	if cursor && queued {
		marker = m.styles.ItemSelected.Render("▸") + m.styles.ItemQueued.Render("●")
	}

	badge := m.styles.Method.Render(p.Repo)
	if m.installed[p.Key()] {
		badge = m.styles.Installed.Render("installed")
	}

	style := m.styles.Item
	if cursor {
		style = m.styles.ItemSelected
	}

	room := width - lipgloss.Width(marker) - lipgloss.Width(badge) - 2
	if room < 8 {
		return marker + style.Render(truncate(p.Name, max(1, width-3)))
	}
	name := truncate(p.Name, room)
	text := style.Render(name)
	rest := room - lipgloss.Width(name)
	if rest > len(p.Version)+2 && p.Version != "" {
		text += " " + m.styles.Count.Render(p.Version)
		rest -= len(p.Version) + 1
	}
	if rest > 12 && p.Summary != "" {
		text += "  " + m.styles.Subtitle.Render(truncate(p.Summary, rest-2))
	}

	gap := width - lipgloss.Width(marker) - lipgloss.Width(text) - lipgloss.Width(badge)
	if gap < 1 {
		gap = 1
	}
	return marker + text + strings.Repeat(" ", gap) + badge
}
