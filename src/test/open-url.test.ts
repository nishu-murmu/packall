import { beforeEach, describe, expect, it, vi } from "vitest"

const invokeMock = vi.fn()
const shellOpenMock = vi.fn()

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}))

vi.mock("@tauri-apps/plugin-shell", () => ({
  open: (...args: unknown[]) => shellOpenMock(...args),
}))

import { openExternalUrl } from "@/lib/open-url"

describe("openExternalUrl fallback chain", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does nothing for empty URLs without touching any opener", async () => {
    await openExternalUrl("")
    expect(invokeMock).not.toHaveBeenCalled()
    expect(shellOpenMock).not.toHaveBeenCalled()
  })

  it("uses the Tauri invoke command first and stops when it succeeds", async () => {
    invokeMock.mockResolvedValueOnce(undefined)
    await openExternalUrl("https://example.com")
    expect(invokeMock).toHaveBeenCalledWith("open_external_url", {
      url: "https://example.com",
    })
    expect(shellOpenMock).not.toHaveBeenCalled()
  })

  it("falls back to the shell plugin when invoke rejects", async () => {
    invokeMock.mockRejectedValueOnce(new Error("no such command"))
    shellOpenMock.mockResolvedValueOnce(undefined)
    await openExternalUrl("https://example.com")
    expect(shellOpenMock).toHaveBeenCalledWith("https://example.com")
  })

  it("falls back to window.open when both native openers fail", async () => {
    invokeMock.mockRejectedValueOnce(new Error("no such command"))
    shellOpenMock.mockRejectedValueOnce(new Error("permission denied"))
    const windowOpen = vi
      .spyOn(window, "open")
      .mockImplementation(() => null)

    await openExternalUrl("https://example.com")
    expect(windowOpen).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer")
    windowOpen.mockRestore()
  })

  it("never throws even when every opener fails", async () => {
    invokeMock.mockRejectedValueOnce(new Error("x"))
    shellOpenMock.mockRejectedValueOnce(new Error("y"))
    const windowOpen = vi.spyOn(window, "open").mockImplementation(() => {
      throw new Error("z")
    })
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(openExternalUrl("https://example.com")).resolves.toBeUndefined()

    windowOpen.mockRestore()
    errorSpy.mockRestore()
  })
})
