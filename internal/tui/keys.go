package tui

import "github.com/charmbracelet/bubbles/key"

// KeyMap is the whole keyboard surface. The bindings are the ones the desktop
// app already documents in the README, so muscle memory carries over; `q` and
// `ctrl+c` are the additions a terminal app needs.
type KeyMap struct {
	Down     key.Binding
	Up       key.Binding
	Left     key.Binding
	Right    key.Binding
	Top      key.Binding
	Bottom   key.Binding
	PageDown key.Binding
	PageUp   key.Binding

	Search  key.Binding
	Toggle  key.Binding
	All     key.Binding
	Clear   key.Binding
	Install key.Binding
	Update  key.Binding
	Remove  key.Binding
	Enter   key.Binding

	Catalogue key.Binding
	Installed key.Binding
	Managers  key.Binding

	Sidebar key.Binding
	Help    key.Binding
	Escape  key.Binding
	Cancel  key.Binding
	Quit    key.Binding
}

// DefaultKeyMap matches the desktop app's keybindings.
func DefaultKeyMap() KeyMap {
	return KeyMap{
		Down:     key.NewBinding(key.WithKeys("j", "down"), key.WithHelp("j/↓", "down")),
		Up:       key.NewBinding(key.WithKeys("k", "up"), key.WithHelp("k/↑", "up")),
		Left:     key.NewBinding(key.WithKeys("h", "left"), key.WithHelp("h/←", "categories")),
		Right:    key.NewBinding(key.WithKeys("l", "right"), key.WithHelp("l/→", "details")),
		Top:      key.NewBinding(key.WithKeys("g"), key.WithHelp("gg", "first")),
		Bottom:   key.NewBinding(key.WithKeys("G"), key.WithHelp("G", "last")),
		PageDown: key.NewBinding(key.WithKeys("ctrl+d", "pgdown"), key.WithHelp("ctrl+d", "page down")),
		PageUp:   key.NewBinding(key.WithKeys("ctrl+u", "pgup"), key.WithHelp("ctrl+u", "page up")),

		Search:  key.NewBinding(key.WithKeys("/"), key.WithHelp("/", "search")),
		Toggle:  key.NewBinding(key.WithKeys(" "), key.WithHelp("space", "queue")),
		All:     key.NewBinding(key.WithKeys("a"), key.WithHelp("a", "select all")),
		Clear:   key.NewBinding(key.WithKeys("c"), key.WithHelp("c", "clear queue")),
		Install: key.NewBinding(key.WithKeys("i"), key.WithHelp("i", "install")),
		Update:  key.NewBinding(key.WithKeys("u"), key.WithHelp("u", "update")),
		Remove:  key.NewBinding(key.WithKeys("x"), key.WithHelp("x", "remove")),
		Enter:   key.NewBinding(key.WithKeys("enter"), key.WithHelp("enter", "open")),

		Catalogue: key.NewBinding(key.WithKeys("1"), key.WithHelp("1", "catalogue")),
		Installed: key.NewBinding(key.WithKeys("3"), key.WithHelp("3", "installed")),
		Managers:  key.NewBinding(key.WithKeys("4"), key.WithHelp("4", "managers")),

		Sidebar: key.NewBinding(key.WithKeys("s"), key.WithHelp("s", "sidebar")),
		Help:    key.NewBinding(key.WithKeys("?"), key.WithHelp("?", "help")),
		Escape:  key.NewBinding(key.WithKeys("esc"), key.WithHelp("esc", "back")),
		Cancel:  key.NewBinding(key.WithKeys("ctrl+c"), key.WithHelp("ctrl+c", "cancel")),
		Quit:    key.NewBinding(key.WithKeys("q"), key.WithHelp("q", "quit")),
	}
}

// ShortHelp is the hint strip along the bottom.
func (k KeyMap) ShortHelp() []key.Binding {
	return []key.Binding{k.Search, k.Toggle, k.Install, k.Remove, k.Help, k.Quit}
}

// FullHelp is the `?` overlay, in columns.
func (k KeyMap) FullHelp() [][]key.Binding {
	return [][]key.Binding{
		{k.Down, k.Up, k.Left, k.Right, k.Top, k.Bottom},
		{k.Search, k.Toggle, k.All, k.Clear, k.Enter},
		{k.Install, k.Update, k.Remove},
		{k.Catalogue, k.Installed, k.Managers, k.Sidebar},
		{k.Help, k.Escape, k.Quit},
	}
}
