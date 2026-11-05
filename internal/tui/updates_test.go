package tui

import (
	"strings"
	"testing"

	"github.com/nishu-murmu/packall/internal/actions"
	"github.com/nishu-murmu/packall/internal/distro"
	"github.com/nishu-murmu/packall/internal/runner"
)

var sampleUpdates = []distro.Upgrade{
	{Manager: "apt", Name: "firefox", Current: "119.0", Latest: "120.0"},
	{Manager: "apt", Name: "git", Current: "2.40", Latest: "2.43"},
	{Manager: "flatpak", Name: "Blender", ID: "org.blender.Blender", Latest: "4.2"},
}

func withUpdates(t *testing.T) Model {
	t.Helper()
	m := ready(t)
	next, _ := m.Update(scanMsg([]actions.Package{
		{Manager: "apt", Name: "curl"},
		{Manager: "apt", Name: "firefox"},
	}))
	m = next.(Model)
	next, _ = m.Update(updatesMsg(sampleUpdates))
	return next.(Model)
}

func TestUpdatesViewListsEveryUpgrade(t *testing.T) {
	m := press(t, withUpdates(t), "5")
	if m.view != viewUpdates {
		t.Fatalf("view = %v, want updates", m.view)
	}
	out := m.View()
	for _, want := range []string{"Updates — 3 available", "firefox", "119.0 → 120.0", "Blender", "→ 4.2"} {
		if !strings.Contains(out, want) {
			t.Errorf("view is missing %q", want)
		}
	}
	if !strings.Contains(out, "↑3") {
		t.Error("tab bar does not show the update count")
	}
}

func TestInstalledViewMarksOutdatedPackages(t *testing.T) {
	m := press(t, withUpdates(t), "3")
	out := m.View()
	if !strings.Contains(out, "119.0 → 120.0") {
		t.Error("installed firefox row has no version badge")
	}
	if !strings.Contains(out, "3 updates") {
		t.Error("installed header does not mention the updates")
	}
}

func TestSelectingUpdates(t *testing.T) {
	m := press(t, withUpdates(t), "5", " ", "j", "j", " ")
	sel := m.selectedUpgrades()
	if len(sel) != 2 || sel[0].Name != "firefox" || sel[1].Name != "Blender" {
		t.Fatalf("selected = %+v", sel)
	}
	m = press(t, m, "a")
	if len(m.selectedUpgrades()) != 3 {
		t.Errorf("a selected %d, want 3", len(m.selectedUpgrades()))
	}
	m = press(t, m, "c")
	if len(m.updates.queue) != 0 {
		t.Error("c did not clear the update selection")
	}
}

func TestUpdateAllNeedsASecondPress(t *testing.T) {
	m := press(t, withUpdates(t), "5", "U")
	if m.view != viewUpdates || m.batch != nil {
		t.Fatal("a single U started a batch")
	}
	if !strings.Contains(m.flash, "press U again") {
		t.Errorf("flash = %q", m.flash)
	}
}

func TestUpgradeAllBatchIsOneJobPerManager(t *testing.T) {
	list := append([]distro.Upgrade{
		{Manager: "aur", Name: "yay-bin"},
		{Manager: "pacman", Name: "linux"},
		{Manager: "pacman", Name: "mesa"},
	}, sampleUpdates...)
	b := NewUpgradeAllBatch(list, []actions.Manager{{ID: "paru", Available: true}})

	var ids []string
	for _, j := range b.Jobs {
		ids = append(ids, j.ID)
	}
	want := "upgrade:pacman upgrade:aur upgrade:apt upgrade:flatpak"
	if got := strings.Join(ids, " "); got != want {
		t.Fatalf("jobs = %s, want %s", got, want)
	}
	if b.Jobs[0].Command[0] != "sudo pacman -Syu --noconfirm" {
		t.Errorf("pacman command = %q", b.Jobs[0].Command)
	}
	if b.Jobs[1].Command[0] != "paru -Sua --noconfirm" {
		t.Errorf("aur command = %q", b.Jobs[1].Command)
	}
	if !strings.Contains(b.Jobs[0].Label, "2 packages") {
		t.Errorf("label = %q", b.Jobs[0].Label)
	}
}

func TestUpgradeBatchSkipsPartialArchUpgrades(t *testing.T) {
	b := NewUpgradeBatch([]distro.Upgrade{
		{Manager: "pacman", Name: "linux"},
		{Manager: "flatpak", Name: "Blender", ID: "org.blender.Blender"},
	}, nil)
	if b.Jobs[0].Status != runner.Skipped || b.Jobs[0].Err == nil {
		t.Errorf("pacman job = %+v, want skipped", b.Jobs[0])
	}
	if b.Jobs[1].Status != runner.Queued || !strings.Contains(b.Jobs[1].Command[0], "org.blender.Blender") {
		t.Errorf("flatpak job = %+v", b.Jobs[1])
	}
}

func TestUpdatesSearchFilters(t *testing.T) {
	m := press(t, withUpdates(t), "5", "/", "g", "i", "t", "enter")
	if list := m.updatesList(); len(list) != 1 || list[0].Name != "git" {
		t.Errorf("filtered = %+v", list)
	}
}
