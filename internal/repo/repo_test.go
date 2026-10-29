package repo

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// writePacmanDB builds a sync database the way repo-add does: a gzipped tar
// of name-version/desc files.
func writePacmanDB(t *testing.T, path string, descs map[string]string) {
	t.Helper()
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gz)
	for dir, desc := range descs {
		if err := tw.WriteHeader(&tar.Header{Name: dir + "/", Typeflag: tar.TypeDir, Mode: 0o755}); err != nil {
			t.Fatal(err)
		}
		if err := tw.WriteHeader(&tar.Header{Name: dir + "/desc", Typeflag: tar.TypeReg, Mode: 0o644, Size: int64(len(desc))}); err != nil {
			t.Fatal(err)
		}
		if _, err := tw.Write([]byte(desc)); err != nil {
			t.Fatal(err)
		}
	}
	if err := tw.Close(); err != nil {
		t.Fatal(err)
	}
	if err := gz.Close(); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, buf.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestLoadPacmanReadsEverySyncDatabase(t *testing.T) {
	dir := t.TempDir()
	writePacmanDB(t, filepath.Join(dir, "extra.db"), map[string]string{
		"firefox-131.0-1": "%FILENAME%\nfirefox-131.0-1-x86_64.pkg.tar.zst\n\n%NAME%\nfirefox\n\n%VERSION%\n131.0-1\n\n%DESC%\nStandalone web browser from mozilla.org\n\n%DEPENDS%\ngtk3\nlibxt\n",
	})
	writePacmanDB(t, filepath.Join(dir, "core.db"), map[string]string{
		"bash-5.2-1": "%NAME%\nbash\n\n%VERSION%\n5.2-1\n\n%DESC%\nThe GNU Bourne Again shell\n",
	})
	// Not a database; must be ignored.
	os.WriteFile(filepath.Join(dir, "extra.files"), []byte("junk"), 0o644)

	pkgs, err := LoadPacman(dir)
	if err != nil {
		t.Fatal(err)
	}
	got := map[string]Pkg{}
	for _, p := range pkgs {
		got[p.Name] = p
	}
	want := map[string]Pkg{
		"firefox": {Manager: "pacman", Name: "firefox", Version: "131.0-1", Summary: "Standalone web browser from mozilla.org", Repo: "extra"},
		"bash":    {Manager: "pacman", Name: "bash", Version: "5.2-1", Summary: "The GNU Bourne Again shell", Repo: "core"},
	}
	if len(got) != len(want) {
		t.Fatalf("got %d packages, want %d: %+v", len(got), len(want), pkgs)
	}
	for name, w := range want {
		if got[name] != w {
			t.Errorf("%s = %+v, want %+v", name, got[name], w)
		}
	}
}

func TestLoadPacmanWithNoDatabasesIsEmptyNotAnError(t *testing.T) {
	pkgs, err := LoadPacman(filepath.Join(t.TempDir(), "missing"))
	if err != nil || len(pkgs) != 0 {
		t.Errorf("got %v, %v; want nothing and no error", pkgs, err)
	}
}

const aptList = `Package: vim
Version: 2:9.0.1378-2
Architecture: amd64
Description: Vi IMproved - enhanced vi editor
 Vim is an almost compatible version of the UNIX editor Vi.
 .
 Many new features have been added.

Package: curl
Version: 7.88.1-10
Description: command line tool for transferring data with URL syntax
`

func TestLoadAptReadsListsAndDropsDuplicates(t *testing.T) {
	dir := t.TempDir()
	main := "deb.debian.org_debian_dists_bookworm_main_binary-amd64_Packages"
	os.WriteFile(filepath.Join(dir, main), []byte(aptList), 0o644)

	// The i386 list repeats vim, gzipped as some images keep it.
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	gz.Write([]byte("Package: vim\nVersion: 2:9.0.1378-2\nDescription: Vi IMproved\n"))
	gz.Close()
	os.WriteFile(filepath.Join(dir, "deb.debian.org_debian_dists_bookworm_main_binary-i386_Packages.gz"), buf.Bytes(), 0o644)

	pkgs, err := LoadApt(dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(pkgs) != 2 {
		t.Fatalf("got %d packages, want 2 (vim once, curl): %+v", len(pkgs), pkgs)
	}
	vim := pkgs[0]
	if vim.Name != "vim" || vim.Version != "2:9.0.1378-2" ||
		vim.Summary != "Vi IMproved - enhanced vi editor" || vim.Repo != "bookworm/main" || vim.Manager != "apt" {
		t.Errorf("vim = %+v", vim)
	}
}

func TestAptRepoName(t *testing.T) {
	cases := map[string]string{
		"deb.debian.org_debian_dists_bookworm_main_binary-amd64_Packages":                 "bookworm/main",
		"archive.ubuntu.com_ubuntu_dists_noble-updates_universe_binary-amd64_Packages.gz": "noble-updates/universe",
		"ppa.example.org_flat_Packages":                                                   "ppa.example.org_flat",
	}
	for in, want := range cases {
		if got := aptRepoName(in); got != want {
			t.Errorf("aptRepoName(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestSearchRanksExactThenPrefixThenContainsThenSummary(t *testing.T) {
	ix := NewIndex([]Pkg{
		{Name: "neovim-qt", Summary: "Qt GUI for Neovim"},
		{Name: "gvim", Summary: "graphical vim"},
		{Name: "vim-airline", Summary: "status line"},
		{Name: "vim", Summary: "Vi IMproved"},
		{Name: "vi", Summary: "the original"},
		{Name: "editor", Summary: "a VIM-like editor"},
		{Name: "emacs", Summary: "the other one"},
	})
	got, total := ix.Search("vim", 0)
	var names []string
	for _, p := range got {
		names = append(names, p.Name)
	}
	want := "vim vim-airline gvim neovim-qt editor"
	if strings.Join(names, " ") != want || total != 5 {
		t.Errorf("Search(vim) = %v (total %d), want %s", names, total, want)
	}

	limited, total := ix.Search("vim", 2)
	if len(limited) != 2 || total != 5 {
		t.Errorf("limit 2 returned %d of total %d", len(limited), total)
	}
}

func TestSearchOnANilIndexIsEmpty(t *testing.T) {
	var ix *Index
	if got, total := ix.Search("vim", 10); got != nil || total != 0 || ix.Len() != 0 {
		t.Error("a nil index must behave as an empty one")
	}
}

func TestSearchAURKeepsTheMostPopular(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/visual%20studio") && !strings.HasSuffix(r.URL.EscapedPath(), "/visual%20studio") {
			t.Errorf("path = %s", r.URL.EscapedPath())
		}
		w.Write([]byte(`{"type":"search","resultcount":2,"results":[
			{"Name":"vscodium-bin","Version":"1.94-1","Description":"Free/Libre VS Code","Popularity":5},
			{"Name":"visual-studio-code-bin","Version":"1.94-1","Description":"Microsoft's editor","Popularity":20}]}`))
	}))
	defer srv.Close()
	old := AURSearchURL
	AURSearchURL = srv.URL + "/rpc/v5/search/"
	defer func() { AURSearchURL = old }()

	pkgs, err := SearchAUR(context.Background(), "visual studio")
	if err != nil {
		t.Fatal(err)
	}
	if len(pkgs) != 2 || pkgs[0].Name != "visual-studio-code-bin" || pkgs[0].Manager != "aur" {
		t.Errorf("got %+v", pkgs)
	}
}

func TestSearchAURReportsItsErrors(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"type":"error","error":"Too many package results."}`))
	}))
	defer srv.Close()
	old := AURSearchURL
	AURSearchURL = srv.URL + "/"
	defer func() { AURSearchURL = old }()

	if _, err := SearchAUR(context.Background(), "li"); err == nil || !strings.Contains(err.Error(), "Too many") {
		t.Errorf("err = %v", err)
	}
	if pkgs, err := SearchAUR(context.Background(), "x"); pkgs != nil || err != nil {
		t.Error("a one-letter query must not be sent")
	}
}
