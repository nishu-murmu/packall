package distro

import (
	"reflect"
	"testing"
)

func TestParseUpdateOutputs(t *testing.T) {
	cases := []struct {
		name  string
		parse func(string) []Upgrade
		in    string
		want  []Upgrade
	}{
		{
			"pacman", arrowLines("pacman"),
			"linux 6.18.1-1 -> 6.18.2-1\nmesa 1:25.0-1 -> 1:25.1-1 [ignored]\n:: garbage\n",
			[]Upgrade{
				{Manager: "pacman", Name: "linux", Current: "6.18.1-1", Latest: "6.18.2-1"},
				{Manager: "pacman", Name: "mesa", Current: "1:25.0-1", Latest: "1:25.1-1"},
			},
		},
		{
			"apt", parseApt,
			"Listing... Done\nfirefox/jammy-updates 120.0+b2 amd64 [upgradable from: 119.0+b1]\n" +
				"libc6/jammy-security,now 2.35-0ubuntu3.6 amd64 [upgradable from: 2.35-0ubuntu3.5]\n",
			[]Upgrade{
				{Manager: "apt", Name: "firefox", Current: "119.0+b1", Latest: "120.0+b2"},
				{Manager: "apt", Name: "libc6", Current: "2.35-0ubuntu3.5", Latest: "2.35-0ubuntu3.6"},
			},
		},
		{
			"dnf", parseDnf,
			"Last metadata expiration check: 0:01:00 ago.\n\n" +
				"firefox.x86_64            120.0-1.fc39        updates\n" +
				"glibc.i686                2.38-14.fc39        updates\n" +
				"glibc.x86_64              2.38-14.fc39        updates\n" +
				"Obsoleting Packages\n" +
				"grub2-tools.x86_64        1:2.06-100.fc39     updates\n",
			[]Upgrade{
				{Manager: "dnf", Name: "firefox", Latest: "120.0-1.fc39"},
				{Manager: "dnf", Name: "glibc", Latest: "2.38-14.fc39"},
			},
		},
		{
			"zypper", parseZypper,
			"S | Repository | Name | Current Version | Available Version | Arch\n" +
				"--+------------+------+-----------------+-------------------+-------\n" +
				"v | repo-oss   | bash | 5.1-1.1         | 5.2-1.1           | x86_64\n",
			[]Upgrade{{Manager: "zypper", Name: "bash", Current: "5.1-1.1", Latest: "5.2-1.1"}},
		},
		{
			"flatpak", parseFlatpak,
			"org.mozilla.firefox\tFirefox\t120.0\ncom.example.NoName\t\t\n",
			[]Upgrade{
				{Manager: "flatpak", Name: "Firefox", ID: "org.mozilla.firefox", Latest: "120.0"},
				{Manager: "flatpak", Name: "com.example.NoName", ID: "com.example.NoName"},
			},
		},
		{
			"snap", parseSnap,
			"Name     Version  Rev   Size   Publisher  Notes\ncore22   2024.1   1234  77MB   canonical  base\n",
			[]Upgrade{{Manager: "snap", Name: "core22", Latest: "2024.1"}},
		},
		{
			"brew", parseBrew,
			"wget (1.21.3) < 1.21.4\npython@3.12 (3.12.0, 3.12.1) < 3.12.2\nfirefox (119.0) != 120.0\n",
			[]Upgrade{
				{Manager: "brew", Name: "wget", Current: "1.21.3", Latest: "1.21.4"},
				{Manager: "brew", Name: "python@3.12", Current: "3.12.1", Latest: "3.12.2"},
				{Manager: "brew", Name: "firefox", Current: "119.0", Latest: "120.0"},
			},
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := c.parse(c.in); !reflect.DeepEqual(got, c.want) {
				t.Errorf("got  %+v\nwant %+v", got, c.want)
			}
		})
	}
}

func TestUpgradePackageCarriesTheFlatpakID(t *testing.T) {
	u := Upgrade{Manager: "flatpak", Name: "Firefox", ID: "org.mozilla.firefox"}
	p := u.Package()
	if p.Name != "Firefox" || p.Description != "org.mozilla.firefox" || u.Key() != "flatpak/Firefox" {
		t.Errorf("package = %+v key = %q", p, u.Key())
	}
}
