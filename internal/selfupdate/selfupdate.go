// Package selfupdate keeps the packall-tui binary current without a trip to the
// website: it asks GitHub for the latest release, compares versions, and swaps
// the running binary for the new one in place.
package selfupdate

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// Repo is the GitHub repository releases are published to.
const Repo = "nishu-murmu/packall"

// AssetName is the TUI tarball attached to every release.
const AssetName = "packall-tui-linux-amd64.tar.gz"

// binaryName is the file inside AssetName.
const binaryName = "packall-tui"

// apiURL is a variable so tests can point it at a local server.
var apiURL = "https://api.github.com/repos/" + Repo + "/releases/latest"

// Release is the part of a GitHub release this package needs.
type Release struct {
	Version  string // without the leading "v"
	Tag      string
	URL      string // release page
	AssetURL string // download URL of AssetName, empty if missing
}

// Latest fetches the newest published release.
func Latest(ctx context.Context) (Release, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	if err != nil {
		return Release{}, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "packall-selfupdate")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return Release{}, fmt.Errorf("could not reach GitHub: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return Release{}, fmt.Errorf("GitHub answered %s", resp.Status)
	}

	var body struct {
		TagName string `json:"tag_name"`
		HTMLURL string `json:"html_url"`
		Assets  []struct {
			Name string `json:"name"`
			URL  string `json:"browser_download_url"`
		} `json:"assets"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return Release{}, fmt.Errorf("unreadable release data: %w", err)
	}
	if body.TagName == "" {
		return Release{}, errors.New("the latest release has no tag")
	}

	rel := Release{
		Version: strings.TrimPrefix(body.TagName, "v"),
		Tag:     body.TagName,
		URL:     body.HTMLURL,
	}
	for _, a := range body.Assets {
		if a.Name == AssetName {
			rel.AssetURL = a.URL
		}
	}
	return rel, nil
}

// Newer reports whether version a is strictly newer than b. Both may carry a
// leading "v"; pre-release suffixes ("-rc1") are ignored. A version that does
// not parse (such as "dev") is never newer and is always older.
func Newer(a, b string) bool {
	pa, okA := parse(a)
	pb, okB := parse(b)
	if !okA {
		return false
	}
	if !okB {
		return true
	}
	for i := 0; i < 3; i++ {
		if pa[i] != pb[i] {
			return pa[i] > pb[i]
		}
	}
	return false
}

func parse(v string) ([3]int, bool) {
	var out [3]int
	v = strings.TrimPrefix(strings.TrimSpace(v), "v")
	if i := strings.IndexAny(v, "-+"); i >= 0 {
		v = v[:i]
	}
	parts := strings.Split(v, ".")
	if len(parts) == 0 || len(parts) > 3 || parts[0] == "" {
		return out, false
	}
	for i, p := range parts {
		n, err := strconv.Atoi(p)
		if err != nil || n < 0 {
			return out, false
		}
		out[i] = n
	}
	return out, true
}

// Executable is the path of the running binary with symlinks resolved, which
// is the file an update must replace.
func Executable() (string, error) {
	exe, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.EvalSymlinks(exe)
}

// Apply downloads rel's tarball and replaces the binary at target with the one
// inside it. The new file is written next to target and renamed over it, so a
// failed download never leaves a broken binary behind, and the running process
// keeps its old inode until it exits.
func Apply(ctx context.Context, rel Release, target string) error {
	if rel.AssetURL == "" {
		return fmt.Errorf("release %s has no %s — download it from %s", rel.Tag, AssetName, rel.URL)
	}

	dir := filepath.Dir(target)
	tmp, err := os.CreateTemp(dir, ".packall-tui-update-*")
	if err != nil {
		if errors.Is(err, os.ErrPermission) {
			return fmt.Errorf("%s is not writable — re-run the installer, or update with sudo", dir)
		}
		return err
	}
	tmpName := tmp.Name()
	defer os.Remove(tmpName) // no-op once renamed

	if err := download(ctx, rel.AssetURL, tmp); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}

	mode := os.FileMode(0o755)
	if info, err := os.Stat(target); err == nil {
		mode = info.Mode().Perm() | 0o111
	}
	if err := os.Chmod(tmpName, mode); err != nil {
		return err
	}
	return os.Rename(tmpName, target)
}

// download fetches the tarball and writes the packall-tui file inside it to w.
func download(ctx context.Context, url string, w io.Writer) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "packall-selfupdate")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("download failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed: %s", resp.Status)
	}
	return extract(resp.Body, w)
}

func extract(r io.Reader, w io.Writer) error {
	gz, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("not a gzip archive: %w", err)
	}
	defer gz.Close()

	tr := tar.NewReader(gz)
	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			return fmt.Errorf("%s not found in the archive", binaryName)
		}
		if err != nil {
			return fmt.Errorf("broken archive: %w", err)
		}
		if hdr.Typeflag == tar.TypeReg && filepath.Base(hdr.Name) == binaryName {
			if _, err := io.Copy(w, tr); err != nil {
				return fmt.Errorf("could not write the new binary: %w", err)
			}
			return nil
		}
	}
}
