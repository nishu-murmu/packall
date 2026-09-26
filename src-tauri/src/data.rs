#![allow(dead_code)]
use serde::Serialize;

#[derive(Serialize, Clone)]
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
    pub featured: bool,
}

#[derive(Serialize, Clone)]
pub struct InstallOption {
    pub method: String,
    pub command: String,
    pub notes: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
}

pub fn get_categories() -> Vec<Category> {
    vec![
        Category {
            id: "browsers".into(),
            name: "Browsers".into(),
            description: "Web browsers".into(),
            icon: "Globe".into(),
        },
        Category {
            id: "communications".into(),
            name: "Communications".into(),
            description: "Chat and communication tools".into(),
            icon: "MessageSquare".into(),
        },
        Category {
            id: "development".into(),
            name: "Development".into(),
            description: "Code editors and dev tools".into(),
            icon: "Code2".into(),
        },
        Category {
            id: "documents".into(),
            name: "Documents".into(),
            description: "Office and document tools".into(),
            icon: "FileText".into(),
        },
        Category {
            id: "games".into(),
            name: "Games".into(),
            description: "Gaming clients and emulators".into(),
            icon: "Gamepad2".into(),
        },
        Category {
            id: "multimedia".into(),
            name: "Multimedia".into(),
            description: "Audio and video tools".into(),
            icon: "Play".into(),
        },
        Category {
            id: "self-hosted".into(),
            name: "Self-Hosted".into(),
            description: "Self-hosted services".into(),
            icon: "Server".into(),
        },
        Category {
            id: "utilities".into(),
            name: "Utilities".into(),
            description: "Everyday utilities".into(),
            icon: "Wrench".into(),
        },
        Category {
            id: "terminal".into(),
            name: "Terminal".into(),
            description: "Terminal emulators".into(),
            icon: "Terminal".into(),
        },
        Category {
            id: "system".into(),
            name: "System".into(),
            description: "System management tools".into(),
            icon: "Settings2".into(),
        },
        Category {
            id: "security".into(),
            name: "Security".into(),
            description: "Security and privacy tools".into(),
            icon: "ShieldCheck".into(),
        },
        Category {
            id: "virtualization".into(),
            name: "Virtualization".into(),
            description: "VMs and containers".into(),
            icon: "Box".into(),
        },
        Category {
            id: "education".into(),
            name: "Education".into(),
            description: "Learning applications".into(),
            icon: "GraduationCap".into(),
        },
        Category {
            id: "graphics".into(),
            name: "Graphics".into(),
            description: "Image and design tools".into(),
            icon: "Palette".into(),
        },
    ]
}
