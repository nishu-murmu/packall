import * as React from "react"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import type {
  CategoryId,
  View,
  SystemPackage,
  PackageManagerInfo,
  ActionExecutionResult,
  BatchAction,
  DistroInfo,
  InstallStep,
  MultiStepActionResult,
} from "@/lib/types"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

interface AppState {
  view: View
  selectedCategoryId: CategoryId
  searchQuery: string
  selectedIndex: number
  installed: Set<string>
  selectedQueue: Set<string>
  sidebarOpen: boolean
  helpOpen: boolean
  searchFocused: boolean
  systemPackages: SystemPackage[]
  packageManagers: PackageManagerInfo[]
  distroInfo: DistroInfo | null
  inspectSoftwareId: string | null
  isLoadingSystem: boolean
  batchModalOpen: boolean
  batchAction: BatchAction

  setView: (view: View) => void
  setSelectedCategory: (id: CategoryId) => void
  setSearchQuery: (q: string) => void
  setSelectedIndex: (i: number) => void
  setInspectSoftwareId: (id: string | null) => void
  toggleInstalled: (id: string) => void
  toggleQueueItem: (id: string) => void
  clearQueue: () => void
  selectAllVisible: (ids: string[]) => void
  setSidebarOpen: (open: boolean) => void
  setHelpOpen: (open: boolean) => void
  setSearchFocused: (f: boolean) => void
  setBatchModalOpen: (open: boolean) => void
  openBatchAction: (action: BatchAction) => void
  refreshSystemPackages: () => Promise<void>
  runPackageAction: (
    action: BatchAction,
    pkgNames: string[],
    manager?: string
  ) => Promise<ActionExecutionResult>
  runMultiStepAction: (steps: InstallStep[]) => Promise<MultiStepActionResult>
  goBack: () => void
}

const AppStateContext = React.createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = React.useState<View>({ kind: "grid" })
  const [inspectSoftwareId, setInspectSoftwareId] = React.useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<CategoryId>("browsers")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [installed, setInstalled] = React.useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("almanac_installed")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [selectedQueue, setSelectedQueue] = React.useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [batchModalOpen, setBatchModalOpen] = React.useState(false)
  const [batchAction, setBatchAction] = React.useState<BatchAction>("install")
  const [systemPackages, setSystemPackages] = React.useState<SystemPackage[]>([])
  const [packageManagers, setPackageManagers] = React.useState<PackageManagerInfo[]>([])
  const [distroInfo, setDistroInfo] = React.useState<DistroInfo | null>(null)
  const [isLoadingSystem, setIsLoadingSystem] = React.useState(false)
  const [, setViewStack] = React.useState<View[]>([{ kind: "grid" }])

  React.useEffect(() => {
    try {
      localStorage.setItem("almanac_installed", JSON.stringify(Array.from(installed)))
    } catch {
      // ignore
    }
  }, [installed])

  // Refresh system packages and distro info from Tauri backend
  const refreshSystemPackages = React.useCallback(async () => {
    setIsLoadingSystem(true)
    try {
      const [sysPkgs, managers, distro] = await Promise.all([
        invoke<SystemPackage[]>("get_system_packages").catch(() => []),
        invoke<PackageManagerInfo[]>("detect_package_managers").catch(() => []),
        invoke<DistroInfo>("get_distro_info").catch(() => ({
          id: "arch",
          name: "Arch Linux",
          pretty_name: "Arch Linux (Rolling)",
          preferred_manager: "paru",
          managers: [
            {
              id: "paru",
              name: "Paru (AUR)",
              available: true,
              is_aur: true,
              install_cmd: "paru -S --noconfirm",
              update_cmd: "paru -Syu --noconfirm",
              remove_cmd: "paru -Rns --noconfirm",
            },
            {
              id: "yay",
              name: "Yay (AUR)",
              available: true,
              is_aur: true,
              install_cmd: "yay -S --noconfirm",
              update_cmd: "yay -Syu --noconfirm",
              remove_cmd: "yay -Rns --noconfirm",
            },
            {
              id: "pacman",
              name: "Pacman",
              available: true,
              is_aur: false,
              install_cmd: "sudo pacman -S --noconfirm",
              update_cmd: "sudo pacman -Syu --noconfirm",
              remove_cmd: "sudo pacman -Rns --noconfirm",
            },
            {
              id: "flatpak",
              name: "Flatpak",
              available: true,
              is_aur: false,
              install_cmd: "flatpak install -y flathub",
              update_cmd: "flatpak update -y",
              remove_cmd: "flatpak uninstall -y",
            },
          ],
        })),
      ])

      setSystemPackages(sysPkgs)
      setPackageManagers(managers)
      setDistroInfo(distro)

      // Auto-mark packages as installed in Almanac if detected on host system
      if (sysPkgs && sysPkgs.length > 0) {
        const sysNames = new Set(sysPkgs.map((p) => p.name.toLowerCase()))
        setInstalled((prev) => {
          const next = new Set(prev)
          for (const s of SOFTWARE) {
            if (
              sysNames.has(s.id.toLowerCase()) ||
              sysNames.has(s.name.toLowerCase())
            ) {
              next.add(s.id)
            }
          }
          return next
        })
      }
    } catch (err) {
      console.warn("Could not query system packages (running in web mode?):", err)
    } finally {
      setIsLoadingSystem(false)
    }
  }, [])

  // Initial load of system packages
  React.useEffect(() => {
    refreshSystemPackages()
  }, [refreshSystemPackages])

  const setViewWrapper = React.useCallback((v: View) => {
    setViewStack((prev) => [...prev, v])
    setView(v)
    setSelectedIndex(0)
  }, [])

  const goBack = React.useCallback(() => {
    if (inspectSoftwareId) {
      setInspectSoftwareId(null)
      return
    }
    setViewStack((prev) => {
      if (prev.length <= 1) {
        setView({ kind: "grid" })
        return [{ kind: "grid" }]
      }
      const newStack = prev.slice(0, -1)
      setView(newStack[newStack.length - 1])
      return newStack
    })
  }, [inspectSoftwareId])

  const toggleInstalled = React.useCallback((id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleQueueItem = React.useCallback((id: string) => {
    setSelectedQueue((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearQueue = React.useCallback(() => {
    setSelectedQueue(new Set())
  }, [])

  const selectAllVisible = React.useCallback((ids: string[]) => {
    setSelectedQueue((prev) => {
      const next = new Set(prev)
      const allSelected = ids.every((id) => next.has(id))
      if (allSelected) {
        // Deselect all visible
        ids.forEach((id) => next.delete(id))
      } else {
        // Select all visible
        ids.forEach((id) => next.add(id))
      }
      return next
    })
  }, [])

  const openBatchAction = React.useCallback((action: BatchAction) => {
    setBatchAction(action)
    setBatchModalOpen(true)
  }, [])

  const runPackageAction = React.useCallback(
    async (
      action: BatchAction,
      pkgNames: string[],
      manager?: string
    ): Promise<ActionExecutionResult> => {
      try {
        const result = await invoke<ActionExecutionResult>("execute_package_action", {
          action,
          packages: pkgNames,
          manager: manager || null,
        })

        if (result.success) {
          toast.success(`Action '${action}' completed successfully!`)
          // Update installed status in UI
          if (action === "install") {
            setInstalled((prev) => {
              const next = new Set(prev)
              pkgNames.forEach((name) => next.add(name))
              return next
            })
          } else if (action === "remove") {
            setInstalled((prev) => {
              const next = new Set(prev)
              pkgNames.forEach((name) => next.delete(name))
              return next
            })
          }
          // Refresh background system status
          refreshSystemPackages()
        } else {
          toast.error(`Action '${action}' failed: ${result.error || "Unknown error"}`)
        }
        return result
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(`Execution error: ${message}`)
        return {
          success: false,
          command: `${action} ${pkgNames.join(" ")}`,
          output: "",
          error: message,
        }
      }
    },
    [refreshSystemPackages]
  )

  const runMultiStepAction = React.useCallback(
    async (steps: InstallStep[]): Promise<MultiStepActionResult> => {
      try {
        const result = await invoke<MultiStepActionResult>("execute_multi_step_action", {
          steps: steps.map((s) => ({
            title: s.title,
            command: s.command,
            description: s.description || null,
          })),
        })

        if (result.success) {
          toast.success(
            `Multi-step installation completed successfully (${result.completed_steps}/${result.total_steps} steps)`
          )
          refreshSystemPackages()
        } else {
          toast.error(
            `Multi-step execution halted at step ${result.completed_steps + 1}: ${result.error || "Command error"}`
          )
        }
        return result
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        toast.error(`Execution error: ${message}`)
        return {
          success: false,
          completed_steps: 0,
          total_steps: steps.length,
          step_results: [],
          error: message,
        }
      }
    },
    [refreshSystemPackages]
  )

  const setSelectedCategory = React.useCallback(
    (id: CategoryId) => {
      setSelectedCategoryId(id)
      setViewWrapper({ kind: "grid" })
    },
    [setViewWrapper]
  )

  const value: AppState = {
    view,
    selectedCategoryId,
    searchQuery,
    selectedIndex,
    installed,
    selectedQueue,
    sidebarOpen,
    helpOpen,
    searchFocused,
    systemPackages,
    packageManagers,
    distroInfo,
    inspectSoftwareId,
    isLoadingSystem,
    batchModalOpen,
    batchAction,
    setView: setViewWrapper,
    setSelectedCategory,
    setSearchQuery,
    setSelectedIndex,
    setInspectSoftwareId,
    toggleInstalled,
    toggleQueueItem,
    clearQueue,
    selectAllVisible,
    setSidebarOpen,
    setHelpOpen,
    setSearchFocused,
    setBatchModalOpen,
    openBatchAction,
    refreshSystemPackages,
    runPackageAction,
    runMultiStepAction,
    goBack,
  }

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext)
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider")
  return ctx
}

/**
 * Filtered software hook.
 * CRITICAL FEATURE: Global search searches across ALL categories regardless
 * of which category is currently selected!
 */
export function useFilteredSoftware() {
  const { view, searchQuery, installed } =
    useAppState()

  return React.useMemo(() => {
    let list = SOFTWARE

    // If search query is active, search across the ENTIRE catalogue (Global Search!)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      let searchList = SOFTWARE

      if (view.kind === "installed") {
        searchList = searchList.filter((s) => installed.has(s.id))
      }

      return searchList.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (view.kind === "installed") {
      list = list.filter((s) => installed.has(s.id))
    }
    // For "grid" and all other views: show all software

    return list
  }, [view, searchQuery, installed])
}


export function useCategoryCount(id: CategoryId) {
  return React.useMemo(
    () => SOFTWARE.filter((s) => s.category === id).length,
    [id]
  )
}

export { CATEGORIES }
