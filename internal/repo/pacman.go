package repo

import (
	"archive/tar"
	"bufio"
	"bytes"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// LoadPacman reads every sync database in dir (core.db, extra.db, …).
//
// Each database is a tarball holding one "name-version/desc" file per package,
// in a %FIELD%-headed text format. These are the same files `pacman -Ss`
// searches, so the results match what pacman itself can install right now.
func LoadPacman(dir string) ([]Pkg, error) {
	files, err := filepath.Glob(filepath.Join(dir, "*.db"))
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, nil
	}

	var out []Pkg
	var firstErr error
	for _, f := range files {
		repoName := strings.TrimSuffix(filepath.Base(f), ".db")
		pkgs, err := readPacmanDB(f, repoName)
		if err != nil {
			if firstErr == nil {
				firstErr = fmt.Errorf("repo: %s: %w", f, err)
			}
			continue
		}
		out = append(out, pkgs...)
	}
	if len(out) == 0 {
		return nil, firstErr
	}
	return out, nil
}

func readPacmanDB(path, repoName string) ([]Pkg, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	r, err := decompress(f)
	if err != nil {
		return nil, err
	}

	var out []Pkg
	tr := tar.NewReader(r)
	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			return out, nil
		}
		if err != nil {
			return out, err
		}
		if hdr.Typeflag != tar.TypeReg || filepath.Base(hdr.Name) != "desc" {
			continue
		}
		p, ok := parseDesc(tr)
		if !ok {
			continue
		}
		p.Manager, p.Repo = "pacman", repoName
		out = append(out, p)
	}
}

// decompress sniffs the database's compression. Arch ships gzip; a plain tar
// is accepted too, since repo-add can write one. zstd databases are rare and
// would need a dependency, so they are reported rather than guessed at.
func decompress(f io.Reader) (io.Reader, error) {
	br := bufio.NewReader(f)
	magic, err := br.Peek(4)
	if err != nil && len(magic) < 2 {
		return nil, err
	}
	switch {
	case bytes.HasPrefix(magic, []byte{0x1f, 0x8b}):
		return gzip.NewReader(br)
	case bytes.HasPrefix(magic, []byte{0x28, 0xb5, 0x2f, 0xfd}):
		return nil, errors.New("zstd-compressed database is not supported")
	default:
		return br, nil
	}
}

// parseDesc reads the fields Packall shows from one desc file:
//
//	%NAME%
//	firefox
//
//	%VERSION%
//	131.0-1
func parseDesc(r io.Reader) (Pkg, bool) {
	var p Pkg
	field := ""
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		line := sc.Text()
		if strings.HasPrefix(line, "%") && strings.HasSuffix(line, "%") && len(line) > 2 {
			field = line
			continue
		}
		if line == "" {
			field = ""
			continue
		}
		switch field {
		case "%NAME%":
			p.Name = line
		case "%VERSION%":
			p.Version = line
		case "%DESC%":
			p.Summary = line
		}
		// Only the first line of a field matters for these three.
		field = ""
	}
	return p, p.Name != ""
}
