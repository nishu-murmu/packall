package tui

import (
	"context"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/nishu-murmu/packall/internal/selfupdate"
)

// Version is the running build's version, set by main from its ldflags value.
var Version = "dev"

// selfState tracks whether a newer Packall release exists and the update of
// Packall itself (not the packages it manages).
type selfState struct {
	latest   selfupdate.Release
	newer    bool // latest is newer than Version
	updating bool
	updated  bool // the binary on disk was replaced; a restart picks it up
}

type selfCheckMsg struct {
	rel selfupdate.Release
	err error
}

type selfUpdatedMsg struct {
	rel selfupdate.Release
	err error
}

// selfCheckCmd asks GitHub for the latest release. Development builds skip it:
// "dev" is never comparable, and replacing a source build would surprise.
func selfCheckCmd() tea.Cmd {
	if Version == "dev" || Version == "" {
		return nil
	}
	return func() tea.Msg {
		rel, err := selfupdate.Latest(context.Background())
		return selfCheckMsg{rel, err}
	}
}

func selfApplyCmd(rel selfupdate.Release) tea.Cmd {
	return func() tea.Msg {
		target, err := selfupdate.Executable()
		if err == nil {
			err = selfupdate.Apply(context.Background(), rel, target)
		}
		return selfUpdatedMsg{rel, err}
	}
}

// startSelfUpdate handles the key that updates Packall itself.
func (m Model) startSelfUpdate() (tea.Model, tea.Cmd) {
	switch {
	case m.self.updating:
		m.flash, m.flashAt = "already updating Packall…", time.Now()
		return m, nil
	case m.self.updated:
		m.flash, m.flashAt = "Packall "+m.self.latest.Version+" is installed — quit and reopen to use it", time.Now()
		return m, nil
	case !m.self.newer:
		msg := "Packall " + Version + " is the latest version"
		if Version == "dev" {
			msg = "development build — self-update is off"
		}
		m.flash, m.flashAt = msg, time.Now()
		return m, nil
	}
	m.self.updating = true
	m.flash, m.flashAt = "downloading Packall "+m.self.latest.Version+"…", time.Now()
	return m, selfApplyCmd(m.self.latest)
}

func (m Model) handleSelfMsg(msg tea.Msg) (Model, tea.Cmd) {
	switch msg := msg.(type) {
	case selfCheckMsg:
		// A failed check (offline, rate limited) stays silent: it is a hint,
		// not something the user asked for.
		if msg.err == nil {
			m.self.latest = msg.rel
			m.self.newer = selfupdate.Newer(msg.rel.Version, Version)
		}
	case selfUpdatedMsg:
		m.self.updating = false
		if msg.err != nil {
			m.flash, m.flashAt = "Packall update failed: "+msg.err.Error(), time.Now()
			return m, nil
		}
		m.self.updated = true
		m.flash, m.flashAt = "updated to Packall "+msg.rel.Version+" — quit and reopen to use it", time.Now()
	}
	return m, nil
}

// selfBadge is the header note offering the update, empty when there is none.
func (m Model) selfBadge() string {
	switch {
	case m.self.updating:
		return m.styles.ItemQueued.Render("updating Packall…")
	case m.self.updated:
		return m.styles.ItemQueued.Render("Packall " + m.self.latest.Version + " installed · restart")
	case m.self.newer:
		return m.styles.ItemQueued.Render("Packall " + m.self.latest.Version + " available · P to update")
	}
	return ""
}
