import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn (class name composer)", () => {
  it("joins plain class strings", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("flattens arrays and nested arrays", () => {
    expect(cn(["a", ["b", "c"]])).toBe("a b c")
  })

  it("drops falsy values (false, undefined, null, empty string)", () => {
    expect(cn("a", false, undefined, null, "", "b")).toBe("a b")
  })

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active")
  })

  it("merges conflicting tailwind utilities and keeps the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("keeps unrelated tailwind classes when merging", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("returns an empty string when nothing is passed", () => {
    expect(cn()).toBe("")
  })
})
