//! The host's whole package index: every package pacman's sync databases and
//! apt's package lists offer, read straight from disk, plus an online AUR
//! search. A port of internal/repo, which the terminal UI uses.
//!
//! Search runs here rather than in the webview: a full index is tens of
//! thousands of rows and there is no reason to ship it across the bridge.

use flate2::read::GzDecoder;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};
use std::io::{BufRead, BufReader, Read};
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;

pub const PACMAN_SYNC_DIR: &str = "/var/lib/pacman/sync";
pub const APT_LISTS_DIR: &str = "/var/lib/apt/lists";

/// One package a repository offers.
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct RepoPackage {
    /// "pacman", "apt" or "aur" — the manager that would install it.
    pub manager: String,
    pub name: String,
    pub version: String,
    pub summary: String,
    /// The repository it comes from, e.g. "extra" or "noble/main".
    pub repo: String,
}

/// The index, with lowercased copies for case-insensitive search.
pub struct RepoIndex {
    pkgs: Vec<RepoPackage>,
    lower_name: Vec<String>,
    lower_summary: Vec<String>,
    pub error: Option<String>,
}

impl RepoIndex {
    pub fn new(mut pkgs: Vec<RepoPackage>, error: Option<String>) -> Self {
        pkgs.sort_by(|a, b| a.name.cmp(&b.name));
        let lower_name = pkgs.iter().map(|p| p.name.to_lowercase()).collect();
        let lower_summary = pkgs.iter().map(|p| p.summary.to_lowercase()).collect();
        RepoIndex { pkgs, lower_name, lower_summary, error }
    }

    pub fn len(&self) -> usize {
        self.pkgs.len()
    }

    pub fn counts(&self) -> BTreeMap<String, usize> {
        let mut out = BTreeMap::new();
        for p in &self.pkgs {
            *out.entry(p.manager.clone()).or_insert(0) += 1;
        }
        out
    }

    /// Ranks matches: exact name, name prefix, name substring, then summary.
    /// Shorter names win within a rank, so "git" comes before "git-lfs".
    /// Returns at most `limit` rows and the total number of matches.
    pub fn search(&self, query: &str, limit: usize) -> (Vec<RepoPackage>, usize) {
        let q = query.trim().to_lowercase();
        if q.is_empty() {
            return (Vec::new(), 0);
        }
        let mut hits: Vec<(usize, u8)> = Vec::new();
        for (i, name) in self.lower_name.iter().enumerate() {
            let rank = if *name == q {
                0
            } else if name.starts_with(&q) {
                1
            } else if name.contains(&q) {
                2
            } else if self.lower_summary[i].contains(&q) {
                3
            } else {
                continue;
            };
            hits.push((i, rank));
        }
        hits.sort_by(|a, b| {
            a.1.cmp(&b.1)
                .then(self.pkgs[a.0].name.len().cmp(&self.pkgs[b.0].name.len()))
        });
        let total = hits.len();
        let out = hits.into_iter().take(limit).map(|(i, _)| self.pkgs[i].clone()).collect();
        (out, total)
    }
}

static INDEX: Mutex<Option<std::sync::Arc<RepoIndex>>> = Mutex::new(None);

/// The index, read on first use and kept for the life of the app.
pub fn index() -> std::sync::Arc<RepoIndex> {
    let mut lock = INDEX.lock().unwrap_or_else(|e| e.into_inner());
    if let Some(ix) = lock.as_ref() {
        return ix.clone();
    }
    let ix = std::sync::Arc::new(load(Path::new(PACMAN_SYNC_DIR), Path::new(APT_LISTS_DIR)));
    *lock = Some(ix.clone());
    ix
}

/// Drop the cached index, so the next search re-reads the files.
pub fn invalidate_index() {
    if let Ok(mut lock) = INDEX.lock() {
        *lock = None;
    }
}

fn load(pacman_dir: &Path, apt_dir: &Path) -> RepoIndex {
    let mut all = Vec::new();
    let mut first_err = None;
    for result in [load_pacman(pacman_dir), load_apt(apt_dir)] {
        match result {
            Ok(pkgs) => all.extend(pkgs),
            Err(e) => {
                if first_err.is_none() {
                    first_err = Some(e)
                }
            }
        }
    }
    // An error only matters when nothing at all could be read.
    let error = if all.is_empty() { first_err } else { None };
    RepoIndex::new(all, error)
}

fn files_with(dir: &Path, pred: impl Fn(&str) -> bool) -> Vec<std::path::PathBuf> {
    let mut out: Vec<_> = std::fs::read_dir(dir)
        .into_iter()
        .flatten()
        .flatten()
        .map(|e| e.path())
        .filter(|p| p.file_name().and_then(|n| n.to_str()).map(&pred).unwrap_or(false))
        .collect();
    out.sort();
    out
}

// ---------------------------------------------------------------- pacman

/// Reads every `*.db` in pacman's sync directory. Each is a tar archive,
/// normally gzipped, holding one `<name>-<version>/desc` file per package.
pub fn load_pacman(dir: &Path) -> Result<Vec<RepoPackage>, String> {
    let mut out = Vec::new();
    let mut first_err = None;
    for path in files_with(dir, |n| n.ends_with(".db")) {
        let repo = path.file_stem().and_then(|s| s.to_str()).unwrap_or("").to_string();
        match std::fs::read(&path).map_err(|e| e.to_string()).and_then(|b| read_pacman_db(&b, &repo)) {
            Ok(pkgs) => out.extend(pkgs),
            Err(e) => {
                if first_err.is_none() {
                    first_err = Some(format!("{}: {}", path.display(), e))
                }
            }
        }
    }
    if out.is_empty() {
        if let Some(e) = first_err {
            return Err(e);
        }
    }
    Ok(out)
}

fn read_pacman_db(bytes: &[u8], repo: &str) -> Result<Vec<RepoPackage>, String> {
    let data = match bytes {
        [0x1f, 0x8b, ..] => {
            let mut out = Vec::new();
            GzDecoder::new(bytes).read_to_end(&mut out).map_err(|e| e.to_string())?;
            out
        }
        [0x28, 0xb5, 0x2f, 0xfd, ..] => return Err("zstd-compressed database is not supported".into()),
        _ => bytes.to_vec(),
    };

    let mut out = Vec::new();
    for (name, body) in tar_entries(&data) {
        if name != "desc" && !name.ends_with("/desc") {
            continue;
        }
        if let Some(mut p) = parse_desc(&String::from_utf8_lossy(body)) {
            p.manager = "pacman".into();
            p.repo = repo.into();
            out.push(p);
        }
    }
    Ok(out)
}

/// The regular files in a ustar archive. Only what pacman databases use is
/// handled: plain and ustar-prefixed names; pax and GNU extension headers are
/// skipped, which at worst drops a package with a very long name.
fn tar_entries(data: &[u8]) -> Vec<(String, &[u8])> {
    let mut out = Vec::new();
    let mut off = 0;
    while off + 512 <= data.len() {
        let hdr = &data[off..off + 512];
        if hdr.iter().all(|&b| b == 0) {
            break;
        }
        let field = |a: usize, b: usize| {
            let raw = &hdr[a..b];
            let end = raw.iter().position(|&c| c == 0).unwrap_or(raw.len());
            String::from_utf8_lossy(&raw[..end]).to_string()
        };
        let size = usize::from_str_radix(field(124, 136).trim(), 8).unwrap_or(0);
        let kind = hdr[156];
        let mut name = field(0, 100);
        if &hdr[257..262] == b"ustar" {
            let prefix = field(345, 500);
            if !prefix.is_empty() {
                name = format!("{}/{}", prefix, name);
            }
        }
        let start = off + 512;
        let end = (start + size).min(data.len());
        if kind == b'0' || kind == 0 {
            out.push((name, &data[start..end]));
        }
        off = start + size.div_ceil(512) * 512;
    }
    out
}

/// A pacman `desc` file: `%FIELD%` headers, each followed by value lines.
fn parse_desc(text: &str) -> Option<RepoPackage> {
    let mut p = RepoPackage { manager: String::new(), name: String::new(), version: String::new(), summary: String::new(), repo: String::new() };
    let mut field = "";
    for line in text.lines() {
        if line.len() > 2 && line.starts_with('%') && line.ends_with('%') {
            field = line;
            continue;
        }
        if line.is_empty() {
            field = "";
            continue;
        }
        match field {
            "%NAME%" => p.name = line.to_string(),
            "%VERSION%" => p.version = line.to_string(),
            "%DESC%" => p.summary = line.to_string(),
            _ => {}
        }
        field = "";
    }
    (!p.name.is_empty()).then_some(p)
}

// ------------------------------------------------------------------- apt

/// Reads apt's `*_Packages` lists (plain or gzipped). A package in several
/// suites is listed once, from whichever file sorts first.
pub fn load_apt(dir: &Path) -> Result<Vec<RepoPackage>, String> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();
    let mut first_err = None;
    for path in files_with(dir, |n| n.ends_with("_Packages") || n.ends_with("_Packages.gz")) {
        let file = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
        let reader: Box<dyn Read> = match std::fs::File::open(&path) {
            Ok(f) if file.ends_with(".gz") => Box::new(GzDecoder::new(f)),
            Ok(f) => Box::new(f),
            Err(e) => {
                if first_err.is_none() {
                    first_err = Some(format!("{}: {}", path.display(), e))
                }
                continue;
            }
        };
        for p in parse_apt_list(BufReader::new(reader), &apt_repo_name(&file)) {
            if seen.insert(p.name.clone()) {
                out.push(p);
            }
        }
    }
    if out.is_empty() {
        if let Some(e) = first_err {
            return Err(e);
        }
    }
    Ok(out)
}

fn parse_apt_list(r: impl BufRead, repo: &str) -> Vec<RepoPackage> {
    let mut out = Vec::new();
    let mut p = RepoPackage { manager: "apt".into(), name: String::new(), version: String::new(), summary: String::new(), repo: repo.into() };
    let flush = |p: &mut RepoPackage, out: &mut Vec<RepoPackage>| {
        if !p.name.is_empty() {
            out.push(p.clone());
        }
        p.name.clear();
        p.version.clear();
        p.summary.clear();
    };
    for line in r.lines().map_while(Result::ok) {
        if line.is_empty() {
            flush(&mut p, &mut out);
            continue;
        }
        if line.starts_with(' ') || line.starts_with('\t') {
            continue;
        }
        if let Some((k, v)) = line.split_once(':') {
            let v = v.trim().to_string();
            match k {
                "Package" => p.name = v,
                "Version" => p.version = v,
                "Description" => p.summary = v,
                _ => {}
            }
        }
    }
    flush(&mut p, &mut out);
    out
}

/// "deb.debian.org_debian_dists_bookworm_main_binary-amd64_Packages" →
/// "bookworm/main".
fn apt_repo_name(file: &str) -> String {
    let base = file.trim_end_matches(".gz").trim_end_matches("_Packages");
    match base.split_once("_dists_") {
        Some((_, rest)) => {
            let rest = rest.split("_binary-").next().unwrap_or(rest);
            rest.replace('_', "/")
        }
        None => base.to_string(),
    }
}

// ------------------------------------------------------------------- AUR

pub const AUR_SEARCH_URL: &str = "https://aur.archlinux.org/rpc/v5/search/";
const AUR_LIMIT: usize = 100;

#[derive(Deserialize)]
struct AurResponse {
    #[serde(rename = "type")]
    kind: String,
    #[serde(default)]
    error: Option<String>,
    #[serde(default)]
    results: Vec<AurResult>,
}

#[derive(Deserialize)]
struct AurResult {
    #[serde(rename = "Name")]
    name: String,
    #[serde(rename = "Version", default)]
    version: String,
    #[serde(rename = "Description", default)]
    description: Option<String>,
    #[serde(rename = "Popularity", default)]
    popularity: f64,
}

/// Percent-encodes a path segment.
fn encode(s: &str) -> String {
    s.bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            _ => format!("%{:02X}", b),
        })
        .collect()
}

/// Searches the AUR by name and description, most popular first. curl is
/// used rather than an HTTP crate: it is on every desktop, and the request is
/// one GET.
pub fn search_aur(query: &str) -> Result<Vec<RepoPackage>, String> {
    let query = query.trim();
    if query.chars().count() < 2 {
        return Ok(Vec::new());
    }
    let url = format!("{}{}?by=name-desc", AUR_SEARCH_URL, encode(query));
    let output = Command::new("curl")
        .args(["-fsSL", "--max-time", "8", &url])
        .output()
        .map_err(|e| format!("could not run curl: {}", e))?;
    if !output.status.success() {
        return Err("the AUR could not be reached".into());
    }
    parse_aur(&output.stdout)
}

fn parse_aur(body: &[u8]) -> Result<Vec<RepoPackage>, String> {
    let mut resp: AurResponse = serde_json::from_slice(body).map_err(|e| e.to_string())?;
    if resp.kind == "error" {
        return Err(format!("aur: {}", resp.error.unwrap_or_default()));
    }
    resp.results.sort_by(|a, b| b.popularity.partial_cmp(&a.popularity).unwrap_or(std::cmp::Ordering::Equal));
    Ok(resp
        .results
        .into_iter()
        .take(AUR_LIMIT)
        .map(|r| RepoPackage {
            manager: "aur".into(),
            name: r.name,
            version: r.version,
            summary: r.description.unwrap_or_default(),
            repo: "aur".into(),
        })
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tar_file(name: &str, body: &str) -> Vec<u8> {
        let mut hdr = vec![0u8; 512];
        hdr[..name.len()].copy_from_slice(name.as_bytes());
        let size = format!("{:011o}\0", body.len());
        hdr[124..136].copy_from_slice(size.as_bytes());
        hdr[156] = b'0';
        hdr[257..263].copy_from_slice(b"ustar\0");
        let mut out = hdr;
        out.extend_from_slice(body.as_bytes());
        out.resize(out.len().div_ceil(512) * 512, 0);
        out
    }

    #[test]
    fn reads_a_pacman_database() {
        let mut tar = tar_file("git-2.47.0-1/desc", "%NAME%\ngit\n\n%VERSION%\n2.47.0-1\n\n%DESC%\nthe fast distributed version control system\n");
        tar.extend(tar_file("git-2.47.0-1/files", "%FILES%\nusr/bin/git\n"));
        tar.extend(tar_file("vim-9.1-1/desc", "%NAME%\nvim\n\n%VERSION%\n9.1-1\n"));
        tar.extend(vec![0u8; 1024]);

        let mut gz = Vec::new();
        {
            use flate2::{write::GzEncoder, Compression};
            use std::io::Write;
            let mut enc = GzEncoder::new(&mut gz, Compression::fast());
            enc.write_all(&tar).unwrap();
            enc.finish().unwrap();
        }

        let pkgs = read_pacman_db(&gz, "extra").unwrap();
        assert_eq!(pkgs.len(), 2);
        assert_eq!(pkgs[0].name, "git");
        assert_eq!(pkgs[0].version, "2.47.0-1");
        assert_eq!(pkgs[0].summary, "the fast distributed version control system");
        assert_eq!(pkgs[0].repo, "extra");
        assert_eq!(pkgs[1].name, "vim");
    }

    #[test]
    fn reads_an_apt_list() {
        let text = "Package: git\nVersion: 1:2.43.0-1\nDescription: fast, scalable, distributed revision control system\n multi-line body\n\nPackage: vim\nVersion: 2:9.1\n";
        let pkgs = parse_apt_list(text.as_bytes(), "noble/main");
        assert_eq!(pkgs.len(), 2);
        assert_eq!(pkgs[0].summary, "fast, scalable, distributed revision control system");
        assert_eq!(pkgs[1].name, "vim");
        assert_eq!(pkgs[1].repo, "noble/main");
    }

    #[test]
    fn names_apt_repos() {
        assert_eq!(apt_repo_name("deb.debian.org_debian_dists_bookworm_main_binary-amd64_Packages"), "bookworm/main");
        assert_eq!(apt_repo_name("archive.ubuntu.com_ubuntu_dists_noble-updates_universe_binary-amd64_Packages.gz"), "noble-updates/universe");
    }

    #[test]
    fn ranks_search_results() {
        let p = |name: &str, summary: &str| RepoPackage { manager: "pacman".into(), name: name.into(), version: "1".into(), summary: summary.into(), repo: "extra".into() };
        let ix = RepoIndex::new(vec![p("git-lfs", ""), p("tig", "text interface for git"), p("git", ""), p("legit", "")], None);
        let (hits, total) = ix.search("GIT", 10);
        let names: Vec<_> = hits.iter().map(|h| h.name.as_str()).collect();
        assert_eq!(names, ["git", "git-lfs", "legit", "tig"]);
        assert_eq!(total, 4);
        assert_eq!(ix.search("git", 2).0.len(), 2);
        assert_eq!(ix.search("  ", 10).1, 0);
    }

    #[test]
    fn parses_aur_responses() {
        let body = br#"{"type":"search","results":[{"Name":"a","Version":"1","Description":null,"Popularity":0.1},{"Name":"b","Version":"2","Description":"bee","Popularity":5}]}"#;
        let pkgs = parse_aur(body).unwrap();
        assert_eq!(pkgs[0].name, "b");
        assert_eq!(pkgs[1].summary, "");
        assert!(parse_aur(br#"{"type":"error","error":"Too many package results."}"#).is_err());
    }

    #[test]
    fn encodes_queries() {
        assert_eq!(encode("c++ lib"), "c%2B%2B%20lib");
    }
}
