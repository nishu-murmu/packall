// Package repo searches everything the host's package managers can install,
// not just the curated catalogue.
//
// No package manager library is linked. Every manager already keeps its whole
// index on disk so it can work offline, and those files are simple formats:
// pacman's sync databases are tarballs of small text files, apt's lists are
// RFC 822 stanzas. Reading them directly keeps Packall a single pure-Go binary
// that runs on any distro, where binding libalpm or libapt-pkg would tie each
// build to one library version.
package repo

import (
	"sort"
	"strings"
)

// Pkg is one package a repository offers.
type Pkg struct {
	// Manager is the method that installs it: "pacman", "apt" or "aur". It is
	// the same id the host scan reports, so the command builder needs no
	// translation.
	Manager string
	Name    string
	Version string
	Summary string
	// Repo is where it comes from, such as "extra" or "bookworm/main".
	Repo string
}

// Key identifies a package across managers.
func (p Pkg) Key() string { return p.Manager + "/" + p.Name }

// Index is every package the host's repositories offer, ready to search.
type Index struct {
	pkgs []Pkg
	// lower holds each package's lowercased name and summary, built once so a
	// search per keystroke does not allocate tens of thousands of strings.
	lowerName    []string
	lowerSummary []string
}

// NewIndex builds an index over pkgs, sorted by name.
func NewIndex(pkgs []Pkg) *Index {
	sort.SliceStable(pkgs, func(i, j int) bool { return pkgs[i].Name < pkgs[j].Name })
	ix := &Index{
		pkgs:         pkgs,
		lowerName:    make([]string, len(pkgs)),
		lowerSummary: make([]string, len(pkgs)),
	}
	for i, p := range pkgs {
		ix.lowerName[i] = strings.ToLower(p.Name)
		ix.lowerSummary[i] = strings.ToLower(p.Summary)
	}
	return ix
}

// Len is how many packages the index holds.
func (ix *Index) Len() int {
	if ix == nil {
		return 0
	}
	return len(ix.pkgs)
}

// Search ranks packages against a query: an exact name first, then names that
// start with it, then names that contain it, then summaries that mention it.
// Within a rank shorter names come first, since "vim" is likelier wanted than
// "vim-airline-themes". It returns at most limit results and the total number
// of matches.
func (ix *Index) Search(query string, limit int) ([]Pkg, int) {
	q := strings.ToLower(strings.TrimSpace(query))
	if ix == nil || q == "" {
		return nil, 0
	}

	type hit struct{ i, rank int }
	var hits []hit
	for i, name := range ix.lowerName {
		rank := -1
		switch {
		case name == q:
			rank = 0
		case strings.HasPrefix(name, q):
			rank = 1
		case strings.Contains(name, q):
			rank = 2
		case strings.Contains(ix.lowerSummary[i], q):
			rank = 3
		}
		if rank >= 0 {
			hits = append(hits, hit{i, rank})
		}
	}

	sort.SliceStable(hits, func(a, b int) bool {
		if hits[a].rank != hits[b].rank {
			return hits[a].rank < hits[b].rank
		}
		return len(ix.pkgs[hits[a].i].Name) < len(ix.pkgs[hits[b].i].Name)
	})

	total := len(hits)
	if limit > 0 && len(hits) > limit {
		hits = hits[:limit]
	}
	out := make([]Pkg, len(hits))
	for n, h := range hits {
		out[n] = ix.pkgs[h.i]
	}
	return out, total
}

// Default locations of the managers' on-disk indexes.
const (
	PacmanSyncDir = "/var/lib/pacman/sync"
	AptListsDir   = "/var/lib/apt/lists"
)

// Load reads every index the host has. A manager that is absent contributes
// nothing; errors are only returned when nothing at all could be read, so one
// unreadable file does not hide the rest.
func Load() (*Index, error) {
	var all []Pkg
	var firstErr error

	for _, load := range []func() ([]Pkg, error){
		func() ([]Pkg, error) { return LoadPacman(PacmanSyncDir) },
		func() ([]Pkg, error) { return LoadApt(AptListsDir) },
	} {
		pkgs, err := load()
		if err != nil && firstErr == nil {
			firstErr = err
		}
		all = append(all, pkgs...)
	}

	if len(all) == 0 && firstErr != nil {
		return NewIndex(nil), firstErr
	}
	return NewIndex(all), nil
}
