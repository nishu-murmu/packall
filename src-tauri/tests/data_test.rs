//! Data integrity tests for the Packall catalogue and category definitions.
//!
//! These tests treat the hard-coded catalogue in `data.rs` as a contract:
//! the frontend relies on every category referenced by a software entry
//! existing, on ids being unique (they double as React keys), and on every
//! entry carrying enough information to render its card and detail views.

use packall_lib::data::{get_categories, get_software_catalogue};
use std::collections::HashSet;

const KNOWN_METHODS: [&str; 13] = [
    "apt", "snap", "flatpak", "appimage", "deb", "aur", "paru", "yay", "pacman", "manual", "dnf",
    "zypper", "brew",
];

#[test]
fn categories_list_is_non_empty() {
    let categories = get_categories();
    assert!(!categories.is_empty(), "category list must not be empty");
}

#[test]
fn category_ids_are_unique() {
    let categories = get_categories();
    let ids: HashSet<&str> = categories.iter().map(|c| c.id.as_str()).collect();
    assert_eq!(
        ids.len(),
        categories.len(),
        "duplicate category ids detected: {:?}",
        categories.iter().map(|c| &c.id).collect::<Vec<_>>()
    );
}

#[test]
fn category_fields_are_populated() {
    for cat in get_categories() {
        assert!(!cat.id.trim().is_empty(), "category id must not be blank");
        assert!(!cat.name.trim().is_empty(), "category '{}' name must not be blank", cat.id);
        assert!(
            !cat.description.trim().is_empty(),
            "category '{}' description must not be blank",
            cat.id
        );
        assert!(
            !cat.icon.trim().is_empty(),
            "category '{}' icon must not be blank (frontend maps it to a Lucide component)",
            cat.id
        );
    }
}

#[test]
fn category_ids_are_lowercase_kebab_case() {
    for cat in get_categories() {
        assert_eq!(
            cat.id,
            cat.id.to_lowercase(),
            "category id '{}' must be lowercase (frontend CategoryId union depends on it)",
            cat.id
        );
        assert!(
            cat.id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-'),
            "category id '{}' must be kebab-case ascii",
            cat.id
        );
    }
}

#[test]
fn catalogue_is_non_empty_and_covers_every_category() {
    let catalogue = get_software_catalogue();
    assert!(!catalogue.is_empty(), "software catalogue must not be empty");

    let cats = get_categories();
    let category_ids: HashSet<&str> = cats.iter().map(|c| c.id.as_str()).collect();
    let mut uncovered: Vec<&str> = Vec::new();
    for id in &category_ids {
        if !catalogue.iter().any(|s| s.category == *id) {
            uncovered.push(id);
        }
    }
    assert!(
        uncovered.is_empty(),
        "categories with no software entries: {:?}",
        uncovered
    );
}

#[test]
fn catalogue_ids_are_unique() {
    let catalogue = get_software_catalogue();
    let ids: HashSet<&str> = catalogue.iter().map(|s| s.id.as_str()).collect();
    assert_eq!(
        ids.len(),
        catalogue.len(),
        "duplicate software ids would break React keys and SOFTWARE_MAP lookups"
    );
}

#[test]
fn every_entry_references_a_known_category() {
    let cats = get_categories();
    let category_ids: HashSet<&str> = cats.iter().map(|c| c.id.as_str()).collect();
    for entry in get_software_catalogue() {
        assert!(
            category_ids.contains(entry.category.as_str()),
            "entry '{}' references unknown category '{}'",
            entry.id,
            entry.category
        );
    }
}

#[test]
fn every_entry_has_populated_display_fields() {
    for entry in get_software_catalogue() {
        let ctx = format!("entry '{}'", entry.id);
        assert!(!entry.name.trim().is_empty(), "{ctx}: name blank");
        assert!(!entry.tagline.trim().is_empty(), "{ctx}: tagline blank");
        assert!(!entry.description.trim().is_empty(), "{ctx}: description blank");
        assert!(!entry.homepage.trim().is_empty(), "{ctx}: homepage blank");
        assert!(!entry.license.trim().is_empty(), "{ctx}: license blank");
    }
}

#[test]
fn every_entry_homepage_is_an_http_url() {
    for entry in get_software_catalogue() {
        assert!(
            entry.homepage.starts_with("https://") || entry.homepage.starts_with("http://"),
            "entry '{}' homepage '{}' must be an absolute http(s) URL",
            entry.id,
            entry.homepage
        );
    }
}

#[test]
fn every_entry_has_tags_and_install_options() {
    for entry in get_software_catalogue() {
        assert!(
            !entry.tags.is_empty(),
            "entry '{}' must declare at least one searchable tag",
            entry.id
        );
        assert!(
            !entry.install.is_empty(),
            "entry '{}' must declare at least one install option",
            entry.id
        );
    }
}

#[test]
fn entry_tags_have_no_duplicates() {
    for entry in get_software_catalogue() {
        let mut seen = HashSet::new();
        for tag in &entry.tags {
            assert!(
                seen.insert(tag.to_lowercase()),
                "entry '{}' has duplicate tag '{}'",
                entry.id,
                tag
            );
        }
    }
}

#[test]
fn install_options_use_known_methods_and_nonempty_commands() {
    for entry in get_software_catalogue() {
        for opt in &entry.install {
            assert!(
                KNOWN_METHODS.contains(&opt.method.as_str()),
                "entry '{}' uses unknown install method '{}'",
                entry.id,
                opt.method
            );
            assert!(
                !opt.command.trim().is_empty(),
                "entry '{}' install method '{}' has a blank command",
                entry.id,
                opt.method
            );
        }
    }
}

#[test]
fn featured_entries_exist_but_not_everything_is_featured() {
    let catalogue = get_software_catalogue();
    let featured = catalogue.iter().filter(|s| s.featured).count();
    assert!(featured > 0, "at least one entry should be featured");
    assert!(
        featured < catalogue.len(),
        "if every entry were featured the flag would be meaningless ({}/{})",
        featured,
        catalogue.len()
    );
}

#[test]
fn software_entry_serializes_to_json_with_expected_shape() {
    let catalogue = get_software_catalogue();
    let json = serde_json::to_value(&catalogue[0]).expect("serialization must not fail");
    for key in ["id", "name", "tagline", "description", "category", "homepage", "license", "tags", "install", "featured"] {
        assert!(json.get(key).is_some(), "serialized entry missing key '{key}'");
    }
}

#[test]
fn software_entry_round_trips_through_json() {
    let catalogue = get_software_catalogue();
    let json = serde_json::to_string(&catalogue).expect("serialization must not fail");
    let restored: Vec<packall_lib::data::SoftwareEntry> =
        serde_json::from_str(&json).expect("deserialization must not fail");
    assert_eq!(restored.len(), catalogue.len());
    assert_eq!(restored[0].id, catalogue[0].id);
}
