package tui

import (
	"strings"
	"testing"

	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/repo"
)

// withRepos gives the model an index as if the host's lists had been read.
func withRepos(t *testing.T, m Model, pkgs ...repo.Pkg) Model {
	t.Helper()
	next, _ := m.Update(repoMsg{index: repo.NewIndex(pkgs)})
	return next.(Model)
}

func TestTwoOpensTheRepositoriesWithSearchFocused(t *testing.T) {
	m := withRepos(t, ready(t),
		repo.Pkg{Manager: "apt", Name: "htop", Repo: "noble/universe"},
		repo.Pkg{Manager: "apt", Name: "btop", Repo: "noble/universe"},
	)
	m = press(t, m, "2")
	if m.view != viewRepos || !m.searching {
		t.Fatalf("view = %v, searching = %v; want repositories with the box focused", m.view, m.searching)
	}

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
	m = press(t, m, "2")
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
	m = press(t, m, "2")
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
