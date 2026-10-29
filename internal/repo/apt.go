package repo

import (
	"bufio"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// LoadApt reads apt's downloaded package lists in dir.
//
// apt keeps one Packages file per suite, component and architecture, written by
// `apt update`. Each is a series of blank-line-separated stanzas. Container
// images that set Acquire::GzipIndexes keep them gzipped, so .gz is read too.
func LoadApt(dir string) ([]Pkg, error) {
	plain, err := filepath.Glob(filepath.Join(dir, "*_Packages"))
	if err != nil {
		return nil, err
	}
	gz, _ := filepath.Glob(filepath.Join(dir, "*_Packages.gz"))
	files := append(plain, gz...)
	if len(files) == 0 {
		return nil, nil
	}

	// The same package appears once per architecture and once per suite that
	// carries it (bookworm, bookworm-updates, …). One row per name is what a
	// search wants; apt picks the version when it installs.
	seen := map[string]bool{}
	var out []Pkg
	var firstErr error
	for _, f := range files {
		pkgs, err := readAptList(f)
		if err != nil {
			if firstErr == nil {
				firstErr = fmt.Errorf("repo: %s: %w", f, err)
			}
			continue
		}
		for _, p := range pkgs {
			if seen[p.Name] {
				continue
			}
			seen[p.Name] = true
			out = append(out, p)
		}
	}
	if len(out) == 0 {
		return nil, firstErr
	}
	return out, nil
}

func readAptList(path string) ([]Pkg, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var r io.Reader = f
	if strings.HasSuffix(path, ".gz") {
		gz, err := gzip.NewReader(f)
		if err != nil {
			return nil, err
		}
		defer gz.Close()
		r = gz
	}
	return parseAptList(r, aptRepoName(filepath.Base(path))), nil
}

// parseAptList reads Package, Version and the first line of Description from
// each stanza. Continuation lines start with a space and are skipped.
func parseAptList(r io.Reader, repoName string) []Pkg {
	var out []Pkg
	var p Pkg
	flush := func() {
		if p.Name != "" {
			p.Manager, p.Repo = "apt", repoName
			out = append(out, p)
		}
		p = Pkg{}
	}

	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		line := sc.Text()
		if line == "" {
			flush()
			continue
		}
		if line[0] == ' ' || line[0] == '\t' {
			continue
		}
		k, v, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		v = strings.TrimSpace(v)
		switch k {
		case "Package":
			p.Name = v
		case "Version":
			p.Version = v
		case "Description":
			p.Summary = v
		}
	}
	flush()
	return out
}

// aptRepoName turns a list's file name into "suite/component":
// deb.debian.org_debian_dists_bookworm_main_binary-amd64_Packages becomes
// bookworm/main. Lists laid out some other way keep their file name.
func aptRepoName(file string) string {
	_, rest, ok := strings.Cut(file, "_dists_")
	if !ok {
		return strings.TrimSuffix(strings.TrimSuffix(file, ".gz"), "_Packages")
	}
	if i := strings.Index(rest, "_binary-"); i >= 0 {
		rest = rest[:i]
	}
	return strings.ReplaceAll(rest, "_", "/")
}
