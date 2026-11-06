package selfupdate

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestNewer(t *testing.T) {
	cases := []struct {
		a, b string
		want bool
	}{
		{"0.3.0", "0.2.1", true},
		{"v0.3.0", "0.3.0", false},
		{"0.10.0", "0.9.9", true},
		{"1.0", "0.9.9", true},
		{"0.2.1", "0.3.0", false},
		{"0.3.0", "dev", true},
		{"dev", "0.3.0", false},
		{"0.4.0-rc1", "0.3.0", true},
	}
	for _, c := range cases {
		if got := Newer(c.a, c.b); got != c.want {
			t.Errorf("Newer(%q, %q) = %v, want %v", c.a, c.b, got, c.want)
		}
	}
}

func tarball(t *testing.T, name, content string) []byte {
	t.Helper()
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gz)
	if err := tw.WriteHeader(&tar.Header{Name: name, Mode: 0o755, Size: int64(len(content)), Typeflag: tar.TypeReg}); err != nil {
		t.Fatal(err)
	}
	tw.Write([]byte(content))
	tw.Close()
	gz.Close()
	return buf.Bytes()
}

func TestLatestAndApply(t *testing.T) {
	archive := tarball(t, "packall-tui", "new-binary")
	var srv *httptest.Server
	srv = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/latest":
			json.NewEncoder(w).Encode(map[string]any{
				"tag_name": "v9.9.9",
				"html_url": "https://example/rel",
				"assets": []map[string]string{
					{"name": "other.deb", "browser_download_url": srv.URL + "/other"},
					{"name": AssetName, "browser_download_url": srv.URL + "/tui.tgz"},
				},
			})
		case "/tui.tgz":
			w.Write(archive)
		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()
	apiURL = srv.URL + "/latest"

	rel, err := Latest(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if rel.Version != "9.9.9" || rel.AssetURL != srv.URL+"/tui.tgz" {
		t.Fatalf("unexpected release %+v", rel)
	}

	target := filepath.Join(t.TempDir(), "packall-tui")
	os.WriteFile(target, []byte("old"), 0o755)
	if err := Apply(context.Background(), rel, target); err != nil {
		t.Fatal(err)
	}
	got, _ := os.ReadFile(target)
	if string(got) != "new-binary" {
		t.Fatalf("target holds %q", got)
	}
	info, _ := os.Stat(target)
	if info.Mode().Perm()&0o111 == 0 {
		t.Fatal("new binary is not executable")
	}
	left, _ := filepath.Glob(filepath.Join(filepath.Dir(target), ".packall-tui-update-*"))
	if len(left) != 0 {
		t.Fatalf("temp files left behind: %v", left)
	}
}

func TestApplyMissingAssetKeepsBinary(t *testing.T) {
	target := filepath.Join(t.TempDir(), "packall-tui")
	os.WriteFile(target, []byte("old"), 0o755)
	if err := Apply(context.Background(), Release{Tag: "v1.0.0"}, target); err == nil {
		t.Fatal("expected an error")
	}
	got, _ := os.ReadFile(target)
	if string(got) != "old" {
		t.Fatal("binary was touched")
	}
}
