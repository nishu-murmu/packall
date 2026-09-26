# Data Schema Reference

Software entries in Almanac adhere to the `SoftwareEntry` TypeScript interface defined in `@almanac/shared`.

## SoftwareEntry Schema

```ts
export interface SoftwareEntry {
  /** Unique lowercase kebab-case slug */
  id: string
  /** Display name of the application */
  name: string
  /** Concise one-sentence summary for cards */
  tagline: string
  /** Detailed multi-sentence description for the detail view */
  description: string
  /** Categorization key corresponding to one of the 14 valid categories */
  category: CategoryId
  /** Official project or repository URL */
  homepage: string
  /** License identifier (e.g., 'GPL-3.0', 'MIT', 'Proprietary') */
  license: string
  /** Array of searchable lowercase keyword tags */
  tags: string[]
  /** List of installation options */
  install: InstallOption[]
  /** Optional icon identifier or URI */
  icon?: string
  /** Highlight app in featured displays */
  featured?: boolean
}
```

---

## InstallOption Schema

```ts
export interface InstallOption {
  /** Method identifier: apt | snap | flatpak | appimage | deb | aur | manual | dnf | pacman | zypper | brew */
  method: InstallMethod
  /** Terminal command to install or run the application */
  command: string
  /** Optional clarification or repository setup note */
  notes?: string
}
```
