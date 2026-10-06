// Package catalog is the curated list of software Packall knows how to install.
//
// packall.json in this directory is the single source of truth. The TypeScript
// frontend is generated from it (npm run catalog) and this package embeds it, so
// there is exactly one copy of the data in the repository.
package catalog

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
)

//go:embed packall.json
var raw []byte

// Method is a way of installing something: a package manager, or a format.
type Method string

const (
	Apt      Method = "apt"
	Dnf      Method = "dnf"
	Zypper   Method = "zypper"
	Pacman   Method = "pacman"
	AUR      Method = "aur"
	Paru     Method = "paru"
	Yay      Method = "yay"
	Flatpak  Method = "flatpak"
	Snap     Method = "snap"
	Brew     Method = "brew"
	Deb      Method = "deb"
	AppImage Method = "appimage"
	Manual   Method = "manual"
)

// Step is one command in a multi-step install.
type Step struct {
	Title       string `json:"title"`
	Command     string `json:"command"`
	Description string `json:"description,omitempty"`
}

// Option is one way to install a particular entry.
type Option struct {
	Method  Method `json:"method"`
	Command string `json:"command"`
	Steps   []Step `json:"steps,omitempty"`
	Notes   string `json:"notes,omitempty"`
}

// Entry is one piece of software in the catalogue.
type Entry struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Tagline     string   `json:"tagline"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Homepage    string   `json:"homepage"`
	License     string   `json:"license"`
	Tags        []string `json:"tags"`
	Featured    bool     `json:"featured,omitempty"`
	Icon        string   `json:"icon,omitempty"`
	Install     []Option `json:"install"`
}

// Category groups entries for browsing.
type Category struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon,omitempty"`
}

type document struct {
	Version    int        `json:"version"`
	Categories []Category `json:"categories"`
	Software   []Entry    `json:"software"`
}

var (
	once   sync.Once
	loaded document
	byID   map[string]*Entry
	loadErr error
)

func load() {
	once.Do(func() {
		if err := json.Unmarshal(raw, &loaded); err != nil {
			loadErr = fmt.Errorf("catalog: %w", err)
			return
		}
		if loaded.Version != 1 {
			loadErr = fmt.Errorf("catalog: unsupported version %d", loaded.Version)
			return
		}
		byID = make(map[string]*Entry, len(loaded.Software))
		for i := range loaded.Software {
			byID[loaded.Software[i].ID] = &loaded.Software[i]
		}
	})
}

// Err reports a malformed embedded catalogue. It is always nil in a build whose
// tests pass, but callers that want to fail gracefully can check it.
func Err() error {
	load()
	return loadErr
}

// All returns every entry, in catalogue order.
func All() []Entry {
	load()
	return loaded.Software
}

// Categories returns every category, in catalogue order.
func Categories() []Category {
	load()
	return loaded.Categories
}

// ByID looks an entry up by its catalogue id.
func ByID(id string) (*Entry, bool) {
	load()
	e, ok := byID[strings.ToLower(id)]
	return e, ok
}

// Lookup finds an entry by id or by name, case-insensitively. It is what the
// CLI uses to turn an argument into an entry.
func Lookup(token string) (*Entry, bool) {
	if e, ok := ByID(token); ok {
		return e, true
	}
	needle := strings.ToLower(token)
	for i := range loaded.Software {
		if strings.ToLower(loaded.Software[i].Name) == needle {
			return &loaded.Software[i], true
		}
	}
	return nil, false
}

// InCategory returns the entries of one category, in catalogue order.
func InCategory(id string) []Entry {
	load()
	var out []Entry
	for _, e := range loaded.Software {
		if e.Category == id {
			out = append(out, e)
		}
	}
	return out
}

// Count returns how many entries each category holds.
func Count(categoryID string) int {
	load()
	n := 0
	for _, e := range loaded.Software {
		if e.Category == categoryID {
			n++
		}
	}
	return n
}

// Search matches name, id, tagline, description, tags and category. An empty
// query returns everything, so it can back a filter box directly.
func Search(query string) []Entry {
	load()
	q := strings.ToLower(strings.TrimSpace(query))
	if q == "" {
		return loaded.Software
	}
	var out []Entry
	for _, e := range loaded.Software {
		if matches(e, q) {
			out = append(out, e)
		}
	}
	return out
}

func matches(e Entry, q string) bool {
	if strings.Contains(strings.ToLower(e.ID), q) ||
		strings.Contains(strings.ToLower(e.Name), q) ||
		strings.Contains(strings.ToLower(e.Tagline), q) ||
		strings.Contains(strings.ToLower(e.Description), q) ||
		strings.Contains(strings.ToLower(e.Category), q) {
		return true
	}
	for _, tag := range e.Tags {
		if strings.Contains(strings.ToLower(tag), q) {
			return true
		}
	}
	return false
}

// Option returns the entry's option for a given method, if it has one.
func (e *Entry) Option(m Method) (Option, bool) {
	for _, o := range e.Install {
		if o.Method == m {
			return o, true
		}
	}
	return Option{}, false
}

// Label is the human name for a method, as shown in listings.
func (m Method) Label() string {
	switch m {
	case Flatpak:
		return "Flatpak"
	case Snap:
		return "Snap"
	case AUR:
		return "AUR"
	case Paru:
		return "paru (AUR)"
	case Yay:
		return "yay (AUR)"
	case Deb:
		return ".deb"
	case AppImage:
		return "AppImage"
	case Brew:
		return "Homebrew"
	case Manual:
		return "manual"
	default:
		return string(m)
	}
}
