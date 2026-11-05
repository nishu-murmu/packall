package tui

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/nishu-murmu/packall/catalog"
	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/repo"
)

// withRepos gives the model an index as if the host's lists had been read.
func withRepos(t *testing.T, m Model, pkgs ...repo.Pkg) Model {
	t.Helper()
	next, _ := m.Update(repoMsg{index: repo.NewIndex(pkgs)})
	return next.(Model)
}

func TestTwoOpensTheRepositoriesAndNumbersStillSwitchViews(t *testing.T) {
	m := withRepos(t, ready(t),
		repo.Pkg{Manager: "apt", Name: "htop", Repo: "noble/universe"},
		repo.Pkg{Manager: "apt", Name: "btop", Repo: "noble/universe"},
	)
	m = press(t, m, "2")
	if m.view != viewRepos || m.searching {
		t.Fatalf("view = %v, searching = %v; want repositories, box unfocused", m.view, m.searching)
	}

	// The number keys must still leave the view rather than land in the box.
	for k, want := range map[string]view{"1": viewCatalogue, "3": viewInstalled, "4": viewManagers} {
		if got := press(t, m, k); got.view != want || got.search.Value() != "" {
			t.Errorf("%s: view = %v, query = %q; want view %v and an empty box", k, got.view, got.search.Value(), want)
		}
	}

	m = press(t, m, "/")
	m = typeText(t, m, "htop")
	if len(m.repos.hits) != 1 || m.repos.hits[0].Name != "htop" {
		t.Errorf("hits = %+v, want htop", m.repos.hits)
	}
}

func TestRepoInstallQueuesAndPlansTheNativeCommand(t *testing.T) {
	m := withRepos(t, ready(t),
		repo.Pkg{Manager: "apt", Name: "htop"},
		repo.Pkg{Manager: "apt", Name: "htop-dbg"},
	)
	m = press(t, m, "2", "/")
	m = typeText(t, m, "htop")
	m = press(t, m, "enter", "j", " ")
	if len(m.repos.queue) != 1 {
		t.Fatalf("queue holds %d, want 1", len(m.repos.queue))
	}

	m.pending, m.pendingPkgs = actions.Install, m.selectedRepoPackages()
	b := m.planPending()
	if len(b.Jobs) != 1 || b.Jobs[0].Label != "htop-dbg" {
		t.Fatalf("jobs = %+v, want htop-dbg", b.Jobs)
	}
	if cmd := strings.Join(b.Jobs[0].Command, " "); !strings.Contains(cmd, "apt-get install -y htop-dbg") {
		t.Errorf("command = %q", cmd)
	}

	m = press(t, m, "c")
	if len(m.repos.queue) != 0 {
		t.Error("c did not clear the repository queue")
	}
}

func TestAURResultsOnlyShowForTheQueryTheyAnswer(t *testing.T) {
	m := withRepos(t, ready(t), repo.Pkg{Manager: "pacman", Name: "code", Repo: "extra"})
	m = press(t, m, "2", "/")
	m = typeText(t, m, "code")

	next, _ := m.Update(aurMsg{query: "code", pkgs: []repo.Pkg{{Manager: "aur", Name: "visual-studio-code-bin", Repo: "aur"}}})
	m = next.(Model)
	if len(m.repos.hits) != 2 {
		t.Fatalf("hits = %+v, want the local and the AUR one", m.repos.hits)
	}
	if !strings.Contains(m.View(), "user-submitted") {
		t.Error("AUR results are on screen without the warning")
	}

	// An answer to an older query must not land on the new one.
	next, _ = m.Update(aurMsg{query: "cod", pkgs: []repo.Pkg{{Manager: "aur", Name: "stale"}}})
	m = next.(Model)
	for _, p := range m.repos.hits {
		if p.Name == "stale" {
			t.Error("a stale AUR answer was shown")
		}
	}
}

func TestRepositoriesViewRendersEveryState(t *testing.T) {
	m := ready(t)
	m.view = viewRepos
	_ = m.View() // still loading

	m = withRepos(t, m)
	if !strings.Contains(m.View(), "no package index") {
		t.Error("an empty index is not explained")
	}

	m = withRepos(t, m, repo.Pkg{Manager: "apt", Name: "git", Version: "1:2.43.0-1", Summary: "fast, scalable, distributed revision control system", Repo: "noble/main"})
	next, _ := m.Update(scanMsg([]actions.Package{{Manager: "apt", Name: "git"}}))
	m = next.(Model)
	m = press(t, m, "/")
	m = typeText(t, m, "git")
	if !strings.Contains(m.View(), "installed") {
		t.Error("an installed repo package is not marked")
	}
}

func TestTabWidensACatalogueSearchToTheRepositories(t *testing.T) {
	m := withRepos(t, ready(t),
		repo.Pkg{Manager: "apt", Name: "zzqlib", Repo: "noble/universe"},
	)
	m = press(t, m, "/")
	m = typeText(t, m, "zzq")
	if !strings.Contains(m.View(), "tab → 1 match in your repositories") {
		t.Errorf("catalogue search does not point at the repositories:\n%s", m.View())
	}

	// tab works while the box still has focus, and keeps the query.
	next, _ := m.Update(tea.KeyMsg{Type: tea.KeyTab})
	m = next.(Model)
	if m.view != viewRepos || m.repoQuery() != "zzq" || !m.searching {
		t.Fatalf("view = %v, query = %q, searching = %v", m.view, m.repoQuery(), m.searching)
	}
	if len(m.repos.hits) != 1 {
		t.Errorf("hits = %+v, want zzqlib", m.repos.hits)
	}

	next, _ = m.Update(tea.KeyMsg{Type: tea.KeyTab})
	if next.(Model).view != viewCatalogue {
		t.Error("a second tab did not return to the catalogue")
	}
}

func TestHeaderNamesTheRepositoriesView(t *testing.T) {
	m := withRepos(t, ready(t), repo.Pkg{Manager: "apt", Name: "htop"})
	if v := m.View(); !strings.Contains(v, "2 Repositories") {
		t.Errorf("header does not offer the Repositories view:\n%s", v)
	}

	m = press(t, m, "2")
	if v := m.View(); !strings.Contains(v, "apt     1 package") {
		t.Errorf("empty Repositories view does not say what it searches:\n%s", v)
	}
}

func TestSwitchingViewsClearsTheSearch(t *testing.T) {
	m := withRepos(t, ready(t), repo.Pkg{Manager: "apt", Name: "zzqlib"})
	all := len(m.entries)

	m = press(t, m, "2", "/")
	m = typeText(t, m, "zzq")
	m = press(t, m, "enter", "1")
	if m.view != viewCatalogue || m.search.Value() != "" || len(m.entries) != all {
		t.Fatalf("view = %v, query = %q, %d of %d apps shown; want the whole catalogue",
			m.view, m.search.Value(), len(m.entries), all)
	}

	// Pressing the view you are already in keeps the query.
	m = press(t, m, "/")
	m = typeText(t, m, "fire")
	m = press(t, m, "enter", "1")
	if m.search.Value() != "fire" {
		t.Errorf("1 in the catalogue cleared its own search")
	}
}

func TestStartingABatchClearsTheSearch(t *testing.T) {
	m := withRepos(t, ready(t), repo.Pkg{Manager: "apt", Name: "zzqlib"})
	m = press(t, m, "2", "/")
	m = typeText(t, m, "zzq")
	m = press(t, m, "enter")

	// Nothing pending plans an empty batch, so no command is run.
	next, _ := m.startPending()
	m = next.(Model)
	if m.search.Value() != "" || m.searching {
		t.Fatalf("query = %q after starting a batch, want it cleared", m.search.Value())
	}

	m = press(t, m, "esc", "1")
	if len(m.entries) != len(catalog.All()) {
		t.Errorf("catalogue shows %d apps after the batch, want all %d", len(m.entries), len(catalog.All()))
	}
}
