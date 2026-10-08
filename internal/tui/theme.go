package tui

import "github.com/charmbracelet/lipgloss"

// The palette carries over from the desktop app: violet for Packall itself,
// a per-status set for job state. Adaptive colours so the UI is readable on a
// light terminal as well as a dark one, and every colour is also distinguished
// by a glyph or by position, so a terminal with no colour at all still works.
var (
	violet = lipgloss.AdaptiveColor{Light: "#6E56CF", Dark: "#8B5CF6"}
	cyan   = lipgloss.AdaptiveColor{Light: "#0E7490", Dark: "#0EA5E9"}
	green  = lipgloss.AdaptiveColor{Light: "#15803D", Dark: "#22C55E"}
	red    = lipgloss.AdaptiveColor{Light: "#B91C1C", Dark: "#EF4444"}
	amber  = lipgloss.AdaptiveColor{Light: "#B45309", Dark: "#F59E0B"}

	fg      = lipgloss.AdaptiveColor{Light: "#1F2937", Dark: "#E5E7EB"}
	dim     = lipgloss.AdaptiveColor{Light: "#6B7280", Dark: "#9CA3AF"}
	fainter = lipgloss.AdaptiveColor{Light: "#9CA3AF", Dark: "#6B7280"}
	border  = lipgloss.AdaptiveColor{Light: "#D1D5DB", Dark: "#374151"}
)

// Styles holds every style the views use, built once.
type Styles struct {
	Title    lipgloss.Style
	Subtitle lipgloss.Style
	Host     lipgloss.Style

	Pane       lipgloss.Style
	PaneActive lipgloss.Style

	Item         lipgloss.Style
	ItemSelected lipgloss.Style
	ItemQueued   lipgloss.Style
	ItemDisabled lipgloss.Style

	Category         lipgloss.Style
	CategorySelected lipgloss.Style
	Count            lipgloss.Style

	Name    lipgloss.Style
	Tagline lipgloss.Style
	Label   lipgloss.Style
	Value   lipgloss.Style
	Tag     lipgloss.Style
	Command lipgloss.Style

	Method    lipgloss.Style
	Installed lipgloss.Style

	StatusBar lipgloss.Style
	Key       lipgloss.Style
	KeyDesc   lipgloss.Style

	Done    lipgloss.Style
	Failed  lipgloss.Style
	Running lipgloss.Style
	Queued  lipgloss.Style
	Skipped lipgloss.Style

	Log     lipgloss.Style
	Overlay lipgloss.Style
	Prompt  lipgloss.Style
	Error   lipgloss.Style
	Empty   lipgloss.Style
}

// NewStyles builds the style set.
func NewStyles() Styles {
	pane := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(border).
		Padding(0, 1)

	return Styles{
		Title:    lipgloss.NewStyle().Foreground(violet).Bold(true),
		Subtitle: lipgloss.NewStyle().Foreground(dim),
		Host:     lipgloss.NewStyle().Foreground(cyan),

		Pane:       pane,
		PaneActive: pane.BorderForeground(violet),

		Item:         lipgloss.NewStyle().Foreground(fg),
		ItemSelected: lipgloss.NewStyle().Foreground(violet).Bold(true),
		ItemQueued:   lipgloss.NewStyle().Foreground(cyan),
		ItemDisabled: lipgloss.NewStyle().Foreground(fainter).Strikethrough(true),

		Category:         lipgloss.NewStyle().Foreground(fg),
		CategorySelected: lipgloss.NewStyle().Foreground(violet).Bold(true),
		Count:            lipgloss.NewStyle().Foreground(fainter),

		Name:    lipgloss.NewStyle().Foreground(violet).Bold(true),
		Tagline: lipgloss.NewStyle().Foreground(fg).Italic(true),
		Label:   lipgloss.NewStyle().Foreground(dim),
		Value:   lipgloss.NewStyle().Foreground(fg),
		Tag:     lipgloss.NewStyle().Foreground(cyan),
		Command: lipgloss.NewStyle().Foreground(amber),

		Method:    lipgloss.NewStyle().Foreground(cyan),
		Installed: lipgloss.NewStyle().Foreground(green),

		StatusBar: lipgloss.NewStyle().Foreground(dim),
		Key:       lipgloss.NewStyle().Foreground(violet).Bold(true),
		KeyDesc:   lipgloss.NewStyle().Foreground(dim),

		Done:    lipgloss.NewStyle().Foreground(green),
		Failed:  lipgloss.NewStyle().Foreground(red),
		Running: lipgloss.NewStyle().Foreground(cyan),
		Queued:  lipgloss.NewStyle().Foreground(dim),
		Skipped: lipgloss.NewStyle().Foreground(fainter),

		Log:     lipgloss.NewStyle().Foreground(dim),
		Overlay: pane.BorderForeground(violet).Padding(1, 2),
		Prompt:  lipgloss.NewStyle().Foreground(violet),
		Error:   lipgloss.NewStyle().Foreground(red),
		Empty:   lipgloss.NewStyle().Foreground(dim).Italic(true),
	}
}
