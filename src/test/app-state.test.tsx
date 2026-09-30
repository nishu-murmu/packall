import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  AppStateProvider,
  useAppState,
  useFilteredSoftware,
  useCategoryCount,
} from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import type { BatchAction } from "@/lib/types"

// ---------------------------------------------------------------------------
// Mocks: the Tauri bridge and toast notifications
// ---------------------------------------------------------------------------

const invokeMock = vi.fn()
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}))

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

/** Per-test controllable backend responses. */
const backend = {
  systemPackages: [] as unknown[],
  managers: [] as unknown[],
  distro: null as unknown,
  failing: false,
}

function wireInvokeMock() {
  invokeMock.mockImplementation((cmd: string) => {
    if (backend.failing) return Promise.reject(new Error("tauri unavailable"))
    switch (cmd) {
      case "get_system_packages":
        return Promise.resolve(backend.systemPackages)
      case "detect_package_managers":
        return Promise.resolve(backend.managers)
      case "get_distro_info":
        return Promise.resolve(backend.distro ?? { id: "arch", pretty_name: "Arch" })
      default:
        return Promise.reject(new Error(`unexpected invoke: ${cmd}`))
    }
  })
}

// ---------------------------------------------------------------------------
// Probe component exposing state through the DOM
// ---------------------------------------------------------------------------

function Probe() {
  const state = useAppState()
  const filtered = useFilteredSoftware()
  const browserCount = useCategoryCount("browsers")
  return (
    <div>
      <div data-testid="view">{state.view.kind}</div>
      <div data-testid="category">{state.selectedCategoryId}</div>
      <div data-testid="index">{state.selectedIndex}</div>
      <div data-testid="query">{state.searchQuery}</div>
      <div data-testid="inspect">{state.inspectSoftwareId ?? "none"}</div>
      <div data-testid="installed">{Array.from(state.installed).sort().join(",")}</div>
      <div data-testid="queue">{Array.from(state.selectedQueue).sort().join(",")}</div>
      <div data-testid="sidebar">{String(state.sidebarOpen)}</div>
      <div data-testid="help">{String(state.helpOpen)}</div>
      <div data-testid="filtered-count">{filtered.length}</div>
      <div data-testid="browser-count">{browserCount}</div>
      <div data-testid="modal">{String(state.batchModalOpen)}</div>
      <div data-testid="batch-action">{state.batchAction}</div>
      <div data-testid="distro">{state.distroInfo?.id ?? "none"}</div>
      <div data-testid="sys-pkgs">{state.systemPackages.length}</div>
      <div data-testid="loading">{String(state.isLoadingSystem)}</div>
      <button data-testid="cat-development" onClick={() => state.setSelectedCategory("development")}>cat</button>
      <button data-testid="set-index-3" onClick={() => state.setSelectedIndex(3)}>idx</button>
      <button data-testid="toggle-firefox" onClick={() => state.toggleInstalled("firefox")}>tgl</button>
      <button data-testid="queue-firefox" onClick={() => state.toggleQueueItem("firefox")}>q1</button>
      <button data-testid="queue-neovim" onClick={() => state.toggleQueueItem("neovim")}>q2</button>
      <button data-testid="select-visible" onClick={() => state.selectAllVisible(["firefox", "neovim", "btop"])}>sel</button>
      <button data-testid="select-visible-some" onClick={() => state.selectAllVisible(["firefox", "neovim"])}>sel2</button>
      <button data-testid="clear-queue" onClick={() => state.clearQueue()}>clr</button>
      <button data-testid="open-detail" onClick={() => state.setInspectSoftwareId("firefox")}>detail</button>
      <button data-testid="go-back" onClick={() => state.goBack()}>back</button>
      <button data-testid="goto-settings" onClick={() => state.setView({ kind: "settings" })}>settings</button>
      <button data-testid="open-batch" onClick={() => state.openBatchAction("remove" as BatchAction)}>batch</button>
      <button data-testid="set-query" onClick={() => state.setSearchQuery("browser")}>query</button>
      <button data-testid="goto-installed" onClick={() => state.setView({ kind: "installed" })}>installed-view</button>
      <button data-testid="refresh" onClick={() => void state.refreshSystemPackages()}>refresh</button>
      <button
        data-testid="run-install"
        onClick={() => void state.runPackageAction("install", ["firefox"])}
      >
        run-install
      </button>
      <button
        data-testid="run-remove"
        onClick={() => void state.runPackageAction("remove", ["firefox"])}
      >
        run-remove
      </button>
      <button
        data-testid="run-steps"
        onClick={() =>
          void state.runMultiStepAction([{ title: "s1", command: "echo hi" }])
        }
      >
        run-steps
      </button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AppStateProvider>
      <Probe />
    </AppStateProvider>
  )
}

async function flushPromises(times = 3) {
  for (let i = 0; i < times; i++) {
    await act(async () => {})
  }
}

// ---------------------------------------------------------------------------

describe("AppStateProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    backend.systemPackages = []
    backend.managers = []
    backend.distro = null
    backend.failing = false
    wireInvokeMock()
  })

  afterEach(() => {
    cleanup()
  })

  it("boots with the documented initial state", async () => {
    renderProbe()
    await flushPromises()
    expect(screen.getByTestId("view").textContent).toBe("grid")
    expect(screen.getByTestId("category").textContent).toBe("browsers")
    expect(screen.getByTestId("index").textContent).toBe("0")
    expect(screen.getByTestId("queue").textContent).toBe("")
    expect(screen.getByTestId("sidebar").textContent).toBe("true")
    expect(screen.getByTestId("modal").textContent).toBe("false")
    expect(screen.getByTestId("batch-action").textContent).toBe("install")
    expect(screen.getByTestId("distro").textContent).toBe("arch")
    expect(screen.getByTestId("loading").textContent).toBe("false")
  })

  it("useAppState throws outside the provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const Orphan = () => {
      useAppState()
      return null
    }
    expect(() => render(<Orphan />)).toThrow("useAppState must be used within AppStateProvider")
    consoleSpy.mockRestore()
  })

  it("setSelectedCategory switches category and resets the view to the grid", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("goto-settings"))
    expect(screen.getByTestId("view").textContent).toBe("settings")
    fireEvent.click(screen.getByTestId("cat-development"))
    expect(screen.getByTestId("category").textContent).toBe("development")
    expect(screen.getByTestId("view").textContent).toBe("grid")
    expect(screen.getByTestId("index").textContent).toBe("0")
  })

  it("toggleInstalled flips membership and persists to localStorage", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("toggle-firefox"))
    expect(screen.getByTestId("installed").textContent).toBe("firefox")
    expect(localStorage.getItem("almanac_installed")).toBe('["firefox"]')
    fireEvent.click(screen.getByTestId("toggle-firefox"))
    expect(screen.getByTestId("installed").textContent).toBe("")
    expect(localStorage.getItem("almanac_installed")).toBe("[]")
  })

  it("restores the installed set from localStorage on boot", () => {
    localStorage.setItem("almanac_installed", JSON.stringify(["firefox", "btop"]))
    renderProbe()
    expect(screen.getByTestId("installed").textContent).toBe("btop,firefox")
  })

  it("ignores corrupted localStorage payloads", () => {
    localStorage.setItem("almanac_installed", "{not json")
    renderProbe()
    expect(screen.getByTestId("installed").textContent).toBe("")
  })

  it("toggleQueueItem adds and removes queue entries", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("queue-firefox"))
    fireEvent.click(screen.getByTestId("queue-neovim"))
    expect(screen.getByTestId("queue").textContent).toBe("firefox,neovim")
    fireEvent.click(screen.getByTestId("queue-firefox"))
    expect(screen.getByTestId("queue").textContent).toBe("neovim")
  })

  it("selectAllVisible selects everything when partially selected, deselects when all selected", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("queue-firefox"))
    fireEvent.click(screen.getByTestId("select-visible-some"))
    expect(screen.getByTestId("queue").textContent).toBe("firefox,neovim")
    fireEvent.click(screen.getByTestId("select-visible-some"))
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("selectAllVisible merges with pre-existing selections", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("queue-neovim"))
    fireEvent.click(screen.getByTestId("select-visible"))
    expect(screen.getByTestId("queue").textContent).toBe("btop,firefox,neovim")
  })

  it("clearQueue empties the selection queue", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("queue-firefox"))
    fireEvent.click(screen.getByTestId("clear-queue"))
    expect(screen.getByTestId("queue").textContent).toBe("")
  })

  it("goBack closes the inspect drawer first, then unwinds views", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("open-detail"))
    expect(screen.getByTestId("inspect").textContent).toBe("firefox")
    fireEvent.click(screen.getByTestId("go-back"))
    expect(screen.getByTestId("inspect").textContent).toBe("none")
    expect(screen.getByTestId("view").textContent).toBe("grid")
    fireEvent.click(screen.getByTestId("goto-settings"))
    fireEvent.click(screen.getByTestId("go-back"))
    expect(screen.getByTestId("view").textContent).toBe("grid")
  })

  it("openBatchAction arms the modal with the requested action", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("open-batch"))
    expect(screen.getByTestId("modal").textContent).toBe("true")
    expect(screen.getByTestId("batch-action").textContent).toBe("remove")
  })

  it("auto-marks catalogue entries installed when system scan reports them", async () => {
    const target = SOFTWARE.find((s) => s.id === "firefox")!
    backend.systemPackages = [
      { name: target.name.toUpperCase(), version: "1", manager: "flatpak", installed: true },
    ]
    renderProbe()
    await flushPromises()
    expect(screen.getByTestId("installed").textContent).toBe("firefox")
  })

  it("survives a fully unavailable backend (pure web mode)", async () => {
    backend.failing = true
    renderProbe()
    await flushPromises()
    expect(screen.getByTestId("sys-pkgs").textContent).toBe("0")
    expect(screen.getByTestId("distro").textContent).toBe("arch")
    expect(screen.getByTestId("loading").textContent).toBe("false")
  })

  describe("runPackageAction", () => {
    it("install success marks packages installed and toasts success", async () => {
      invokeMock.mockImplementation((cmd: string) => {
        if (cmd === "execute_package_action") {
          return Promise.resolve({ success: true, command: "c", output: "ok", error: null })
        }
        return Promise.resolve([])
      })
      renderProbe()
      fireEvent.click(screen.getByTestId("run-install"))
      await flushPromises()
      expect(toastSuccess).toHaveBeenCalledWith(expect.stringContaining("install"))
      expect(screen.getByTestId("installed").textContent).toBe("firefox")
    })

    it("remove success unmarks packages", async () => {
      localStorage.setItem("almanac_installed", JSON.stringify(["firefox"]))
      invokeMock.mockImplementation((cmd: string) => {
        if (cmd === "execute_package_action") {
          return Promise.resolve({ success: true, command: "c", output: "ok", error: null })
        }
        return Promise.resolve([])
      })
      renderProbe()
      fireEvent.click(screen.getByTestId("run-remove"))
      await flushPromises()
      expect(screen.getByTestId("installed").textContent).toBe("")
    })

    it("failure result toasts the error and leaves state untouched", async () => {
      invokeMock.mockImplementation((cmd: string) => {
        if (cmd === "execute_package_action") {
          return Promise.resolve({ success: false, command: "c", output: "", error: "boom" })
        }
        return Promise.resolve([])
      })
      renderProbe()
      fireEvent.click(screen.getByTestId("run-install"))
      await flushPromises()
      expect(toastError).toHaveBeenCalledWith(expect.stringContaining("boom"))
      expect(screen.getByTestId("installed").textContent).toBe("")
    })

    it("rejected invoke surfaces an error toast and leaves state untouched", async () => {
      backend.failing = true
      renderProbe()
      fireEvent.click(screen.getByTestId("run-install"))
      await flushPromises()
      expect(toastError).toHaveBeenCalled()
      expect(screen.getByTestId("installed").textContent).toBe("")
    })
  })

  describe("runMultiStepAction", () => {
    it("success toasts the completed step count", async () => {
      invokeMock.mockImplementation((cmd: string) => {
        if (cmd === "execute_multi_step_action") {
          return Promise.resolve({
            success: true,
            completed_steps: 1,
            total_steps: 1,
            step_results: [],
            error: null,
          })
        }
        return Promise.resolve([])
      })
      renderProbe()
      fireEvent.click(screen.getByTestId("run-steps"))
      await flushPromises()
      expect(toastSuccess).toHaveBeenCalledWith(expect.stringContaining("1/1"))
    })

    it("failure toasts the halted step", async () => {
      invokeMock.mockImplementation((cmd: string) => {
        if (cmd === "execute_multi_step_action") {
          return Promise.resolve({
            success: false,
            completed_steps: 0,
            total_steps: 2,
            step_results: [],
            error: "kaboom",
          })
        }
        return Promise.resolve([])
      })
      renderProbe()
      fireEvent.click(screen.getByTestId("run-steps"))
      await flushPromises()
      expect(toastError).toHaveBeenCalledWith(expect.stringContaining("step 1"))
    })
  })
})

describe("useFilteredSoftware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    backend.systemPackages = []
    backend.failing = false
    wireInvokeMock()
  })

  afterEach(() => {
    cleanup()
  })

  it("returns the full catalogue with an empty query", async () => {
    renderProbe()
    await flushPromises()
    expect(screen.getByTestId("filtered-count").textContent).toBe(String(SOFTWARE.length))
  })

  it("searches across ALL categories regardless of the selected category", () => {
    renderProbe()
    fireEvent.click(screen.getByTestId("cat-development"))
    fireEvent.click(screen.getByTestId("set-query"))
    const matches = SOFTWARE.filter(
      (s) =>
        s.name.toLowerCase().includes("browser") ||
        s.tagline.toLowerCase().includes("browser") ||
        s.description.toLowerCase().includes("browser") ||
        s.category.toLowerCase().includes("browser") ||
        s.tags.some((t) => t.toLowerCase().includes("browser"))
    )
    expect(matches.length).toBeGreaterThan(0)
    expect(screen.getByTestId("filtered-count").textContent).toBe(String(matches.length))
  })

  it("in the installed view, search is limited to installed entries", () => {
    localStorage.setItem("almanac_installed", JSON.stringify(["firefox"]))
    renderProbe()
    fireEvent.click(screen.getByTestId("goto-installed"))
    fireEvent.click(screen.getByTestId("set-query"))
    const matches = SOFTWARE.filter(
      (s) =>
        s.id === "firefox" &&
        (s.name.toLowerCase().includes("browser") ||
          s.tagline.toLowerCase().includes("browser") ||
          s.description.toLowerCase().includes("browser") ||
          s.category.toLowerCase().includes("browser") ||
          s.tags.some((t) => t.toLowerCase().includes("browser")))
    )
    expect(screen.getByTestId("filtered-count").textContent).toBe(String(matches.length))
  })

  it("useCategoryCount counts entries per category", async () => {
    renderProbe()
    await flushPromises()
    const expected = SOFTWARE.filter((s) => s.category === "browsers").length
    expect(screen.getByTestId("browser-count").textContent).toBe(String(expected))
  })
})
