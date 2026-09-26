# Configuration & Local State

Almanac preserves your favorites and installed software state across sessions, allowing you to maintain an inventory of software installed on your Linux workstations.

## State Management Architecture

State is managed reactively via `AppStateProvider` in `src/lib/app-state.tsx`.

```
                ┌───────────────────────────────────┐
                │          AppStateProvider         │
                └─────────────────┬─────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      │                           │                           │
┌─────▼───────┐           ┌───────▼───────┐           ┌───────▼───────┐
│  View Stack │           │   Favorites   │           │   Installed   │
│ (grid/detail│           │    (Set<id>)  │           │    (Set<id>)  │
│  /settings) │           │               │           │               │
└─────────────┘           └───────────────┘           └───────────────┘
```

### Stored State Properties

- **`favorites` (`Set<string>`)**: The list of software IDs you have starred.
- **`installed` (`Set<string>`)**: The list of software IDs flagged as installed on your current workstation.
- **`selectedCategoryId` (`CategoryId`)**: Active category filter (defaults to `browsers`).
- **`selectedIndex` (`number`)**: Active keyboard selection cursor index.
- **`sidebarOpen` (`boolean`)**: Sidebar visibility toggle.

---

## Native Package Manager Detection (Tauri Bridge)

When running within the Tauri desktop application, Almanac invokes a Rust command to scan system binaries via `which`:

```rust
#[tauri::command]
pub fn detect_package_managers() -> Vec<String> {
    let mut managers = Vec::new();
    for (cmd, _) in &[
        ("apt", "apt"),
        ("dnf", "dnf"),
        ("pacman", "pacman"),
        ("zypper", "zypper"),
        ("flatpak", "flatpak"),
        ("snap", "snap"),
        ("brew", "brew"),
    ] {
        if Command::new("which").arg(cmd).output().map(|o| o.status.success()).unwrap_or(false) {
            managers.push(cmd.to_string());
        }
    }
    managers
}
```

This ensures commands relevant to your host distro are automatically prioritized.
