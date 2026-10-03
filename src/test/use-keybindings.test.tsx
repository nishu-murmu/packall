import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AppStateProvider, useAppState } from "@/lib/app-state"
import { useKeybindings } from "@/lib/use-keybindings"
import { SOFTWARE } from "@/lib/software"

const invokeMock = vi.fn()

vi.mock("@tauri-apps/api/event", () => ({
  listen: () => Promise.resolve(() => {}),
}))

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
      case "start_batch":
        return Promise.resolve()
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

  it("j and k move vertically down and up across grid rows (GRID_COLS=4)", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("4")
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("8")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("4")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("k")
    expect(screen.getByTestId("index").textContent).toBe("0")
  })

  it("h and l move horizontally left and right across items", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("l")
    expect(screen.getByTestId("index").textContent).toBe("1")
    await pressKey("l")
    expect(screen.getByTestId("index").textContent).toBe("2")
    await pressKey("h")
    expect(screen.getByTestId("index").textContent).toBe("1")
    await pressKey("h")
    expect(screen.getByTestId("index").textContent).toBe("0")
    await pressKey("h")
    expect(screen.getByTestId("index").textContent).toBe("0")
  })

  it("gg jumps to the first entry, G jumps to the last", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("j")
    expect(screen.getByTestId("index").textContent).toBe("4")
    await pressKey("g")
    // a single g is a pending prefix, not yet a motion
    expect(screen.getByTestId("index").textContent).toBe("4")
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

  it("Escape clears the search query and resets selection when nothing else is open", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await act(async () => {
      screen.getByTestId("set-query").click()
    })
    expect(screen.getByTestId("query").textContent).toBe("media")
    await pressKey("Escape")
    expect(screen.getByTestId("query").textContent).toBe("")
    expect(screen.getByTestId("index").textContent).toBe("0")
  })

  it("/ focuses search", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("/")
    expect(screen.getByTestId("search-focused").textContent).toBe("true")
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

  it("Space toggles queue for the highlighted entry", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey(" ")
    expect(screen.getByTestId("queue").textContent).toBe(SOFTWARE[0].id)
    await pressKey(" ")
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("c clears all items from the selection queue", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey(" ")
    expect(screen.getByTestId("queue").textContent).toBe(SOFTWARE[0].id)
    await pressKey("c")
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("a selects everything visible and c clears it", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey("a")
    expect(screen.getByTestId("queue").textContent?.split(",").length).toBe(SOFTWARE.length)
    await pressKey("c")
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("i starts a background install for the queue and clears it", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    await pressKey(" ")
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }))
    })
    expect(invokeMock).toHaveBeenCalledWith("start_batch", expect.anything())
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("numeric keys 1, 3, 4 switch views", async () => {
    render(<AppStateProvider><Probe /></AppStateProvider>)
    expect(screen.getByTestId("view").textContent).toBe("grid")
    await pressKey("3")
    expect(screen.getByTestId("view").textContent).toBe("installed")
    await pressKey("4")
    expect(screen.getByTestId("view").textContent).toBe("system")
    await pressKey("1")
    expect(screen.getByTestId("view").textContent).toBe("grid")
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
