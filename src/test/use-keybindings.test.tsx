import * as React from "react"
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AppStateProvider, useAppState } from "@/lib/app-state"
import { useKeybindings } from "@/lib/use-keybindings"
import { SOFTWARE } from "@/lib/software"

const invokeMock = vi.fn()

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}))

function wireInvokeMock() {
  invokeMock.mockImplementation((cmd: string) => {
    switch (cmd) {
      case "get_system_packages":
        return Promise.resolve([])
      case "detect_package_managers":
        return Promise.resolve([])
      case "get_distro_info":
        return Promise.resolve({ id: "arch", pretty_name: "Arch" })
      default:
        return Promise.reject(new Error(`unexpected invoke: ${cmd}`))
    }
  })
}

function Probe() {
  const state = useAppState()
  useKeybindings()
  return (
    <div>
      <div data-testid="view">{state.view.kind}</div>
      <div data-testid="index">{state.selectedIndex}</div>
      <div data-testid="search-focused">{String(state.searchFocused)}</div>
      <div data-testid="help">{String(state.helpOpen)}</div>
      <div data-testid="sidebar">{String(state.sidebarOpen)}</div>
      <div data-testid="inspect">{state.inspectSoftwareId ?? "none"}</div>
      <div data-testid="query">{state.searchQuery}</div>
      <div data-testid="queue">{Array.from(state.selectedQueue).sort().join(",")}</div>
      <div data-testid="installed">{Array.from(state.installed).sort().join(",")}</div>
      <button data-testid="set-query" onClick={() => state.setSearchQuery("media")}>query</button>
      <button data-testid="focus-search" onClick={() => state.setSearchFocused(true)}>focus</button>
      <button data-testid="open-help" onClick={() => state.setHelpOpen(true)}>help</button>
    </div>
  )
}

async function pressKey(key: string) {
  await act(async () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }))
  })
}

describe("useKeybindings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    wireInvokeMock()
  })

  afterEach(() => {
    cleanup()
  })

  it("j and k move the selection with clamping at both ends", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("1")
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("2")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("1")
    await pressKey("k")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("0")
  })

  it("a digit prefix repeats the next motion by that count", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("3")
    // buffer alone is inert until a motion key arrives
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("3")
    await pressKey("2")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("1")
  })

  it("a count larger than the list clamps instead of overflowing", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("9")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("0")
  })

  it("gg jumps to the first entry, G jumps to the last", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("3")
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("3")
    await pressKey("g")
    // a single g is a pending prefix, not yet a motion
    expect(screen.getByTestId("index").textContent).toBe("3")
    await pressKey("g")
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("G")
    expect(screen.getByTestId("index").textContent).toBe(String(SOFTWARE.length - 1))
  })

  it("Enter opens the drawer for the highlighted entry", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("Enter")
    expect(screen.getByTestId("inspect").textContent).toBe(SOFTWARE[0].id)
  })

  it("Escape closes the drawer before touching anything else", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("Enter")
    expect(screen.getByTestId("inspect").textContent).toBe(SOFTWARE[0].id)
    await pressKey("Escape")
    expect(screen.getByTestId("inspect").textContent).toBe("none")
  })

  it("Escape clears the search query when nothing else is open", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await act(async () => {
      screen.getByTestId("set-query").click()
    })
    expect(screen.getByTestId("query").textContent).toBe("media")
    await pressKey("Escape")
    expect(screen.getByTestId("query").textContent).toBe("")
  })

  it("/ focuses search and Escape only blurs it, leaving the query intact", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("/")
    expect(screen.getByTestId("search-focused").textContent).toBe("true")
    // every other key is swallowed while search is focused
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("0")
    await act(async () => {
      screen.getByTestId("set-query").click()
    })
    await pressKey("Escape")
    expect(screen.getByTestId("search-focused").textContent).toBe("false")
    expect(screen.getByTestId("query").textContent).toBe("media")
  })

  it("? toggles the help overlay open and closed", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("?")
    expect(screen.getByTestId("help").textContent).toBe("true")
    // keys are swallowed while help is open
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("?")
    expect(screen.getByTestId("help").textContent).toBe("false")
  })

  it("Escape closes the help overlay", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await act(async () => {
      screen.getByTestId("open-help").click()
    })
    expect(screen.getByTestId("help").textContent).toBe("true")
    await pressKey("Escape")
    expect(screen.getByTestId("help").textContent).toBe("false")
  })

  it("s toggles the sidebar", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    expect(screen.getByTestId("sidebar").textContent).toBe("true")
    await pressKey("s")
    expect(screen.getByTestId("sidebar").textContent).toBe("false")
    await pressKey("s")
    expect(screen.getByTestId("sidebar").textContent).toBe("true")
  })

  it("Tab cycles through the main views and wraps around", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    expect(screen.getByTestId("view").textContent).toBe("grid")
    await pressKey("Tab")
    expect(screen.getByTestId("view").textContent).toBe("favorites")
    await pressKey("Tab")
    expect(screen.getByTestId("view").textContent).toBe("installed")
    await pressKey("Tab")
    expect(screen.getByTestId("view").textContent).toBe("settings")
    await pressKey("Tab")
    expect(screen.getByTestId("view").textContent).toBe("grid")
  })

  it("x and Space queue and dequeue the highlighted entry", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("x")
    expect(screen.getByTestId("queue").textContent).toBe(SOFTWARE[0].id)
    await pressKey(" ")
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("i toggles the install flag of the highlighted entry", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("i")
    expect(screen.getByTestId("installed").textContent).toBe(SOFTWARE[0].id)
    await pressKey("i")
    expect(screen.getByTestId("installed").textContent).toBe("")
  })

  it("unbound keys are ignored without side effects", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("z")
    await pressKey("q")
    expect(screen.getByTestId("index").textContent).toBe("0")
    expect(screen.getByTestId("view").textContent).toBe("grid")
    expect(screen.getByTestId("queue").textContent).toBe("")
  })
})
