# Neovim Keyboard Navigation

Almanac is designed with a **keyboard-first philosophy**. Every element, modal, view, and action can be controlled without leaving your home row.

## Core Navigation

| Keybinding | Action | Description |
|---|---|---|
| <kbd>j</kbd> | Down | Move software card selection downward |
| <kbd>k</kbd> | Up | Move software card selection upward |
| <kbd>h</kbd> | Previous Category | Switch to previous category in the sidebar |
| <kbd>l</kbd> | Next Category | Switch to next category in the sidebar |
| <kbd>g</kbd><kbd>g</kbd> | Top | Jump to the very first software item |
| <kbd>G</kbd> | Bottom | Jump to the very last software item |
| <kbd>Enter</kbd> | Open App Details | Inspect installation commands and package notes |
| <kbd>Esc</kbd> / <kbd>Backspace</kbd> | Back / Dismiss | Return to the grid or clear the search input |

---

## Number Multipliers

Just like Neovim, Almanac supports number prefixes before movement keys:

- `5j`: Move down 5 software cards immediately
- `10k`: Move up 10 software cards immediately
- `3l`: Advance 3 categories forward

---

## Actions & Quick Toggles

| Keybinding | Action | Details |
|---|---|---|
| <kbd>/</kbd> | Focus Search | Instant search by name, category, or tags (`Esc` to exit) |
| <kbd>f</kbd> | Toggle Favorite | Add or remove currently selected software from Favorites |
| <kbd>i</kbd> | Toggle Installed | Mark currently selected software as installed on this machine |
| <kbd>s</kbd> | Toggle Sidebar | Collapse or expand category sidebar |
| <kbd>?</kbd> | Help Cheat Sheet | Toggle modal overlay displaying all keybindings |

---

## View Switching

Switch between views quickly with top-row numbers or Tab:

| Keybinding | Destination View |
|---|---|
| <kbd>1</kbd> | **Catalog Grid**: Browse all software by selected category |
| <kbd>2</kbd> | **Favorites**: Filter to starred software |
| <kbd>3</kbd> | **Installed**: View items marked as installed |
| <kbd>4</kbd> | **Settings & Stats**: View system coverage and catalog totals |
| <kbd>Tab</kbd> | Cycle through all 4 views consecutively |

---

## Customizing Keybindings

Keybindings are managed centrally in `src/lib/use-keybindings.ts`. If you are customizing Almanac for personal workflows or Emacs/Helix bindings, see the architecture guide.
