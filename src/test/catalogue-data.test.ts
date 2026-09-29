import { describe, expect, it } from "vitest"
import { CATEGORIES, CATEGORY_MAP } from "@/lib/categories"
import { METHOD_COLORS, METHOD_DESCRIPTIONS, METHOD_LABELS } from "@/lib/install-methods"
import { SOFTWARE, SOFTWARE_MAP } from "@/lib/software"
import type { CategoryId, InstallMethod } from "@/lib/types"

// Mirrors the CategoryId union in types.ts. Duplicated as a runtime array
// because the union evaporates at compile time.
const ALL_CATEGORY_IDS: CategoryId[] = [
  "browsers",
  "communications",
  "development",
  "documents",
  "games",
  "multimedia",
  "self-hosted",
  "utilities",
  "terminal",
  "system",
  "security",
  "virtualization",
  "education",
  "graphics",
]

const ALL_METHODS: InstallMethod[] = [
  "apt",
  "snap",
  "flatpak",
  "appimage",
  "deb",
  "aur",
  "paru",
  "yay",
  "pacman",
  "manual",
  "dnf",
  "zypper",
  "brew",
]

describe("CATEGORIES", () => {
  it("is non-empty", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0)
  })

  it("covers every CategoryId declared in types.ts", () => {
    const declared = new Set(ALL_CATEGORY_IDS)
    const present = new Set(CATEGORIES.map((c) => c.id))
    for (const id of declared) {
      expect(present.has(id), `missing category '${id}'`).toBe(true)
    }
    for (const id of present) {
      expect(declared.has(id as CategoryId), `category '${id}' not in CategoryId union`).toBe(true)
    }
  })

  it("has unique ids, names, and icons", () => {
    const ids = CATEGORIES.map((c) => c.id)
    const names = CATEGORIES.map((c) => c.name)
    const icons = CATEGORIES.map((c) => c.icon)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(icons).size).toBe(icons.length)
  })

  it("has a name and description for every category (rendered in the sidebar)", () => {
    for (const cat of CATEGORIES) {
      expect(cat.name.trim()).not.toBe("")
      expect(cat.description.trim()).not.toBe("")
      expect(cat.icon.trim()).not.toBe("")
    }
  })

  it("CATEGORY_MAP resolves every category by id", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_MAP[cat.id]).toBe(cat)
    }
  })
})

describe("install method metadata", () => {
  it("labels, descriptions, and colors exist for every InstallMethod", () => {
    for (const method of ALL_METHODS) {
      expect(METHOD_LABELS[method], `label missing for '${method}'`).toBeTruthy()
      expect(METHOD_DESCRIPTIONS[method], `description missing for '${method}'`).toBeTruthy()
      expect(METHOD_COLORS[method], `colors missing for '${method}'`).toBeTruthy()
    }
  })

  it("metadata maps have no extra keys beyond the InstallMethod union", () => {
    expect(Object.keys(METHOD_LABELS).sort()).toEqual([...ALL_METHODS].sort())
    expect(Object.keys(METHOD_DESCRIPTIONS).sort()).toEqual([...ALL_METHODS].sort())
    expect(Object.keys(METHOD_COLORS).sort()).toEqual([...ALL_METHODS].sort())
  })

  it("every color bundle carries all three tailwind directives", () => {
    for (const method of ALL_METHODS) {
      const colors = METHOD_COLORS[method]
      for (const token of ["bg-", "text-", "border-"]) {
        expect(colors, `'${method}' missing '${token}' directive`).toContain(token)
      }
    }
  })
})

describe("SOFTWARE catalogue", () => {
  it("is non-empty and every category has at least one entry", () => {
    expect(SOFTWARE.length).toBeGreaterThan(0)
    for (const id of ALL_CATEGORY_IDS) {
      const count = SOFTWARE.filter((s) => s.category === id).length
      expect(count, `category '${id}' has no software`).toBeGreaterThan(0)
    }
  })

  it("has unique ids", () => {
    const ids = SOFTWARE.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("ids are lowercase kebab-case (they double as React keys and map keys)", () => {
    for (const entry of SOFTWARE) {
      expect(entry.id).toBe(entry.id.toLowerCase())
      expect(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id), `bad id '${entry.id}'`).toBe(true)
    }
  })

  it("SOFTWARE_MAP indexes every entry by id", () => {
    expect(Object.keys(SOFTWARE_MAP)).toHaveLength(SOFTWARE.length)
    for (const entry of SOFTWARE) {
      expect(SOFTWARE_MAP[entry.id]).toBe(entry)
    }
  })

  it("every entry references a category that exists in CATEGORIES", () => {
    for (const entry of SOFTWARE) {
      expect(
        CATEGORY_MAP[entry.category],
        `'${entry.id}' has unknown category '${entry.category}'`
      ).toBeTruthy()
    }
  })

  it("every entry has populated display fields", () => {
    for (const entry of SOFTWARE) {
      const ctx = `entry '${entry.id}'`
      expect(entry.name.trim(), `${ctx} name`).not.toBe("")
      expect(entry.tagline.trim(), `${ctx} tagline`).not.toBe("")
      expect(entry.description.trim(), `${ctx} description`).not.toBe("")
      expect(entry.license.trim(), `${ctx} license`).not.toBe("")
      expect(Array.isArray(entry.tags), `${ctx} tags`).toBe(true)
      expect(entry.tags.length, `${ctx} must have tags`).toBeGreaterThan(0)
    }
  })

  it("every homepage is an absolute http(s) URL", () => {
    for (const entry of SOFTWARE) {
      expect(
        /^https?:\/\//.test(entry.homepage),
        `'${entry.id}' homepage '${entry.homepage}'`
      ).toBe(true)
    }
  })

  it("tags have no duplicates within an entry", () => {
    for (const entry of SOFTWARE) {
      const lower = entry.tags.map((t) => t.toLowerCase())
      expect(new Set(lower).size, `'${entry.id}' has duplicate tags`).toBe(lower.length)
    }
  })

  it("every entry has at least one install option with a non-empty command", () => {
    for (const entry of SOFTWARE) {
      expect(entry.install.length, `'${entry.id}' has no install options`).toBeGreaterThan(0)
      for (const opt of entry.install) {
        expect(opt.command.trim(), `'${entry.id}' via ${opt.method} blank command`).not.toBe("")
        expect(
          METHOD_LABELS[opt.method] !== undefined,
          `'${entry.id}' uses unknown method '${opt.method}'`
        ).toBe(true)
      }
    }
  })

  it("multi-step install options carry well-formed steps", () => {
    const withSteps = SOFTWARE.filter((s) => s.install.some((o) => o.steps))
    expect(withSteps.length).toBeGreaterThan(0)
    for (const entry of withSteps) {
      for (const opt of entry.install) {
        for (const step of opt.steps ?? []) {
          expect(step.title.trim(), `'${entry.id}' step title`).not.toBe("")
          expect(step.command.trim(), `'${entry.id}' step command`).not.toBe("")
        }
      }
    }
  })

  it("featured entries exist but stay a minority of the catalogue", () => {
    const featured = SOFTWARE.filter((s) => s.featured).length
    expect(featured).toBeGreaterThan(0)
    expect(featured * 2).toBeLessThan(SOFTWARE.length)
  })
})
