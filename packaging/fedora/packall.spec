Name:           packall
Version:        0.1.0
Release:        1%{?dist}
Summary:        Keyboard-driven graphical directory of essential Linux software
License:        AGPL-3.0-only
URL:            https://github.com/nishu-murmu/packall
Source0:        %{url}/archive/v%{version}/%{name}-%{version}.tar.gz

BuildRequires:  nodejs
BuildRequires:  npm
BuildRequires:  cargo
BuildRequires:  rust
BuildRequires:  gcc
BuildRequires:  pkgconfig(webkit2gtk-4.1)
BuildRequires:  pkgconfig(gtk+-3.0)
BuildRequires:  pkgconfig(librsvg-2.0)
BuildRequires:  pkgconfig(openssl)
BuildRequires:  desktop-file-utils
BuildRequires:  libappstream-glib
Requires:       webkit2gtk4.1
Requires:       gtk3
Recommends:     flatpak

%description
Packall is an open source software directory for Linux. Browse a curated catalogue,
filter by distribution, select what you want and install, update or remove it in one
click with live progress. Fully navigable with Neovim-style keybindings.

%prep
%autosetup -n %{name}-%{version}

%build
# COPR/mock must have network enabled for npm and cargo downloads.
npm ci --no-audit --no-fund
npm run web:build
cargo build --release --locked --features custom-protocol \
  --manifest-path src-tauri/Cargo.toml

%install
install -Dm755 src-tauri/target/release/packall %{buildroot}%{_bindir}/packall
install -Dm644 packaging/common/packall.desktop \
  %{buildroot}%{_datadir}/applications/packall.desktop
install -Dm644 packaging/common/app.packall.desktop.metainfo.xml \
  %{buildroot}%{_metainfodir}/app.packall.desktop.metainfo.xml
install -Dm644 src-tauri/icons/128x128.png \
  %{buildroot}%{_datadir}/icons/hicolor/128x128/apps/packall.png
install -Dm644 src-tauri/icons/32x32.png \
  %{buildroot}%{_datadir}/icons/hicolor/32x32/apps/packall.png

%check
desktop-file-validate %{buildroot}%{_datadir}/applications/packall.desktop

%files
%license LICENSE
%{_bindir}/packall
%{_datadir}/applications/packall.desktop
%{_metainfodir}/app.packall.desktop.metainfo.xml
%{_datadir}/icons/hicolor/*/apps/packall.png

%changelog
* Sat Oct 03 2026 nishu-murmu - 0.1.0-1
- Initial package
