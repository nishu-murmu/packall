use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

/// The shared catalogue (catalog/packall.json) — the same file the desktop
/// frontend and the TUI are built from, so all three agree on package names.
const CATALOGUE_JSON: &str = include_str!("../../catalog/packall.json");

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SoftwareEntry {
    pub id: String,
    pub name: String,
    pub tagline: String,
    pub description: String,
    pub category: String,
    pub homepage: String,
    pub license: String,
    pub tags: Vec<String>,
    pub install: Vec<InstallOption>,
    #[serde(default)]
    pub featured: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstallStep {
    pub title: String,
    pub command: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstallOption {
    pub method: String,
    pub command: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub steps: Option<Vec<InstallStep>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
}

#[derive(Deserialize)]
struct Catalogue {
    categories: Vec<Category>,
    software: Vec<SoftwareEntry>,
}

fn catalogue() -> &'static Catalogue {
    static CATALOGUE: OnceLock<Catalogue> = OnceLock::new();
    CATALOGUE.get_or_init(|| {
        serde_json::from_str(CATALOGUE_JSON).expect("catalog/packall.json is malformed")
    })
}

pub fn get_categories() -> Vec<Category> {
    catalogue().categories.clone()
}

pub fn get_software_catalogue() -> Vec<SoftwareEntry> {
    catalogue().software.clone()
}

/// Find a catalogue entry by id or display name, case-insensitively.
pub fn find_software(token: &str) -> Option<SoftwareEntry> {
    let needle = token.to_lowercase();
    catalogue()
        .software
        .iter()
        .find(|s| s.id == needle || s.name.to_lowercase() == needle)
        .cloned()
}
