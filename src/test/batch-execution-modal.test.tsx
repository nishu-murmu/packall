import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AppStateProvider, useAppState } from "@/lib/app-state"
import { BatchExecutionModal } from "@/components/batch-execution-modal"
import type { BatchAction } from "@/lib/types"

const invokeMock = vi.fn()
const toastSuccess = vi.fn()
const toastError = vi.fn()
const writeTextMock = vi.fn().mockResolvedValue(undefined)

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}))

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

const backend = {
  managers: [] as unknown[],
}

function wireInvokeMock() {
  invokeMock.mockImplementation((cmd: string) => {
    switch (cmd) {
      case "get_system_packages":
        return Promise.resolve([])
      case "detect_package_managers":
        return Promise.resolve(backend.managers)
      case "get_distro_info":
        return Promise.resolve({ id: "arch", pretty_name: "Arch" })
      default:
        return Promise.reject(new Error(`unexpected invoke: ${cmd}`))
    }
  })
}

function Harness({ action }: { action: BatchAction }) {
  const state = useAppState()
  return (
    <div>
      <button data-testid="open" onClick={() => state.openBatchAction(action)}>open</button>
      <button data-testid="queue-firefox" onClick={() => state.toggleQueueItem("firefox")}>q1</button>
      <button data-testid="queue-neovim" onClick={() => state.toggleQueueItem("neovim")}>q2</button>
      <button data-testid="clear-queue" onClick={() => state.clearQueue()}>clr</button>
      <BatchExecutionModal />
    </div>
  )
}

async function flushPromises(times = 3) {
  for (let i = 0; i < times; i++) {
    await act(async () => {})
  }
}

async function openModal(action: BatchAction = "install", queue = true) {
  render(
    <AppStateProvider>
      <Harness action={action} />
    </AppStateProvider>
  )
  await flushPromises()
  if (queue) {
    fireEvent.click(screen.getByTestId("queue-firefox"))
    fireEvent.click(screen.getByTestId("queue-neovim"))
  }
  fireEvent.click(screen.getByTestId("open"))
}

describe("BatchExecutionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    backend.managers = []
    wireInvokeMock()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it("renders nothing while the modal is closed", () => {
    render(
      <AppStateProvider>
        <Harness action="install" />
      </AppStateProvider>
    )
    expect(screen.queryByText("Generated Terminal Command")).toBeNull()
  })

  it("lists queued packages and defaults to paru when nothing is detected", async () => {
    await openModal()
    expect(screen.getByText("Packages in Queue (2)")).toBeTruthy()
    expect(screen.getByText("paru -S firefox neovim --noconfirm")).toBeTruthy()
  })

  it.each([
    ["Paru (AUR)", "paru -S firefox --noconfirm"],
    ["Yay (AUR)", "yay -S firefox --noconfirm"],
    ["Pacman", "sudo pacman -S firefox --noconfirm"],
    ["Flatpak", "flatpak install -y firefox"],
    ["APT", "sudo apt install -y firefox"],
    ["Snap", "sudo snap install firefox"],
  ])("switching to %s regenerates the command as %s", async (label, cmd) => {
    await openModal()
    fireEvent.click(screen.getByTestId("queue-neovim")) // dequeue, leave only firefox
    fireEvent.click(screen.getByRole("button", { name: label }))
    expect(screen.getByText(cmd)).toBeTruthy()
  })

  it("auto-selects the first detected package manager", async () => {
    backend.managers = [
      { id: "flatpak", available: true, name: "Flatpak", version: "1.0" },
    ]
    await openModal()
    expect(screen.getByText("flatpak install -y firefox neovim")).toBeTruthy()
  })

  it("generates update and removal command variants", async () => {
    await openModal("update")
    expect(screen.getByText("Batch Update")).toBeTruthy()
    expect(screen.getByText("paru -S firefox neovim --noconfirm")).toBeTruthy()
    cleanup()
    await openModal("remove")
    expect(screen.getByText("Batch Removal")).toBeTruthy()
    expect(screen.getByText("paru -Rns firefox neovim --noconfirm")).toBeTruthy()
  })

  it("copying writes the generated command to the clipboard", async () => {
    await openModal()
    fireEvent.click(screen.getByRole("button", { name: "Copy" }))
    expect(writeTextMock).toHaveBeenCalledWith("paru -S firefox neovim --noconfirm")
    expect(toastSuccess).toHaveBeenCalledWith("Command copied to clipboard!")
  })

  it("executes through the backend, reports success and clears the queue", async () => {
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "execute_package_action") {
        return Promise.resolve({ success: true, command: "c", output: "installed ok", error: null })
      }
      return Promise.resolve([])
    })
    await openModal()
    fireEvent.click(screen.getByRole("button", { name: /execute now/i }))
    await flushPromises()
    expect(invokeMock).toHaveBeenCalledWith(
      "execute_package_action",
      expect.objectContaining({ action: "install", packages: ["firefox", "neovim"] })
    )
    expect(screen.getByText("Execution Successful")).toBeTruthy()
    expect(screen.getByText("installed ok")).toBeTruthy()
    expect(screen.getByText("Packages in Queue (0)")).toBeTruthy()
  })

  it("surfaces backend failures in the log without clearing the queue", async () => {
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "execute_package_action") {
        return Promise.resolve({ success: false, command: "c", output: "", error: "conflict detected" })
      }
      return Promise.resolve([])
    })
    await openModal()
    fireEvent.click(screen.getByRole("button", { name: /execute now/i }))
    await flushPromises()
    expect(screen.getByText("Execution Error")).toBeTruthy()
    expect(screen.getByText("conflict detected")).toBeTruthy()
    expect(screen.getByText("Packages in Queue (2)")).toBeTruthy()
  })

  it("keeps the queue when the backend invoke itself rejects", async () => {
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "execute_package_action") {
        return Promise.reject(new Error("bridge down"))
      }
      return Promise.resolve([])
    })
    await openModal()
    fireEvent.click(screen.getByRole("button", { name: /execute now/i }))
    await flushPromises()
    expect(screen.getByText("Execution Error")).toBeTruthy()
    expect(screen.getByText("bridge down")).toBeTruthy()
    expect(screen.getByText("Packages in Queue (2)")).toBeTruthy()
  })

  it("disables execution while the queue is empty", async () => {
    await openModal("install", false)
    const execute = screen.getByRole("button", { name: /execute now/i }) as HTMLButtonElement
    expect(execute.disabled).toBe(true)
  })

  it("clear-all empties the queue preview", async () => {
    await openModal()
    fireEvent.click(screen.getByText("Clear all"))
    expect(screen.getByText("Packages in Queue (0)")).toBeTruthy()
  })

  it("the X button closes the modal", async () => {
    await openModal()
    const closeButtons = screen.getAllByRole("button").filter((b) => b.querySelector("svg.lucide-x"))
    fireEvent.click(closeButtons[0])
    expect(screen.queryByText("Generated Terminal Command")).toBeNull()
  })
})
