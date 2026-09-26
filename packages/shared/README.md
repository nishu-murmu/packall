# Shared Package

Shared types, data, and utilities used across the LinuxDir monorepo.

## Contents

- `types.ts` — TypeScript interfaces for software entries, categories, and views
- `categories.ts` — Category definitions
- `software.ts` — Software directory data
- `install-methods.ts` — Install method metadata and styling

## Usage

```ts
import { SOFTWARE, CATEGORIES } from "@linuxdir/shared"
import type { SoftwareEntry, Category } from "@linuxdir/shared"
```
