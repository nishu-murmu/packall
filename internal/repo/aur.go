package repo

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"sort"
	"time"
)

// AURSearchURL is the AUR's RPC endpoint. A variable so tests can point it at
// a local server.
var AURSearchURL = "https://aur.archlinux.org/rpc/v5/search/"

// aurLimit caps how many AUR hits are kept. The RPC returns everything that
// matches, which for a common word is thousands; the most popular are the ones
// worth showing.
const aurLimit = 100

type aurResponse struct {
	Type    string `json:"type"`
	Error   string `json:"error"`
	Results []struct {
		Name        string  `json:"Name"`
		Version     string  `json:"Version"`
		Description string  `json:"Description"`
		Popularity  float64 `json:"Popularity"`
	} `json:"results"`
}

// SearchAUR asks the AUR for packages whose name or description matches. The
// AUR has no local index, so unlike the other sources this needs the network.
// The AUR refuses queries shorter than two characters.
func SearchAUR(ctx context.Context, query string) ([]Pkg, error) {
	if len([]rune(query)) < 2 {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()

	u := AURSearchURL + url.PathEscape(query) + "?by=name-desc"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var body aurResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, err
	}
	if body.Type == "error" {
		return nil, errors.New("aur: " + body.Error)
	}

	sort.SliceStable(body.Results, func(i, j int) bool {
		return body.Results[i].Popularity > body.Results[j].Popularity
	})
	if len(body.Results) > aurLimit {
		body.Results = body.Results[:aurLimit]
	}

	out := make([]Pkg, 0, len(body.Results))
	for _, r := range body.Results {
		out = append(out, Pkg{
			Manager: "aur",
			Name:    r.Name,
			Version: r.Version,
			Summary: r.Description,
			Repo:    "aur",
		})
	}
	return out, nil
}
