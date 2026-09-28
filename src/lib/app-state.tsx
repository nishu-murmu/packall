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
} from "@/lib/types"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

interface AppState {
  view: View
  selectedCategoryId: CategoryId
  searchQuery: string
  selectedIndex: number
  favorites: Set<string>
  installed: Set<string>
  selectedQueue: Set<string>
  sidebarOpen: boolean
  helpOpen: boolean
  searchFocused: boolean
  systemPackages: SystemPackage[]
  packageManagers: PackageManagerInfo[]
  isLoadingSystem: boolean
  batchModalOpen: boolean
  batchAction: BatchAction

  setView: (view: View) => void
  setSelectedCategory: (id: CategoryId) => void
  setSearchQuery: (q: string) => void
  setSelectedIndex: (i: number) => void
  toggleFavorite: (id: string) => void
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
  goBack: () => void
}

const AppStateContext = React.createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = React.useState<View>({ kind: "grid" })
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<CategoryId>("browsers")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [favorites, setFavorites] = React.useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("almanac_favorites")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
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
  const [isLoadingSystem, setIsLoadingSystem] = React.useState(false)
  const [, setViewStack] = React.useState<View[]>([{ kind: "grid" }])

  // Sync favorites & installed to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("almanac_favorites", JSON.stringify(Array.from(favorites)))
    } catch {
      // ignore
    }
  }, [favorites])

  React.useEffect(() => {
    try {
      localStorage.setItem("almanac_installed", JSON.stringify(Array.from(installed)))
    } catch {
      // ignore
    }
  }, [installed])

  // Refresh system packages from Tauri backend
  const refreshSystemPackages = React.useCallback(async () => {
    setIsLoadingSystem(true)
    try {
      const [sysPkgs, managers] = await Promise.all([
        invoke<SystemPackage[]>("get_system_packages").catch(() => []),
        invoke<PackageManagerInfo[]>("detect_package_managers").catch(() => []),
      ])

      setSystemPackages(sysPkgs)
      setPackageManagers(managers)

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
    setViewStack((prev) => {
      if (prev.length <= 1) {
        setView({ kind: "grid" })
        return [{ kind: "grid" }]
      }
      const newStack = prev.slice(0, -1)
      setView(newStack[newStack.length - 1])
      return newStack
    })
  }, [])

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

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
    favorites,
    installed,
    selectedQueue,
    sidebarOpen,
    helpOpen,
    searchFocused,
    systemPackages,
    packageManagers,
    isLoadingSystem,
    batchModalOpen,
    batchAction,
    setView: setViewWrapper,
    setSelectedCategory,
    setSearchQuery,
    setSelectedIndex,
    toggleFavorite,
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
  const { view, selectedCategoryId, searchQuery, favorites, installed } =
    useAppState()

  return React.useMemo(() => {
    let list = SOFTWARE

    // If search query is active, search across the ENTIRE catalogue (Global Search!)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      let searchList = SOFTWARE

      // If user was viewing favorites or installed, respect that sub-filter
      if (view.kind === "favorites") {
        searchList = searchList.filter((s) => favorites.has(s.id))
      } else if (view.kind === "installed") {
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

    // Standard view filtering (no search query active)
    if (view.kind === "favorites") {
      list = list.filter((s) => favorites.has(s.id))
    } else if (view.kind === "installed") {
      list = list.filter((s) => installed.has(s.id))
    } else {
      list = list.filter((s) => s.category === selectedCategoryId)
    }

    return list
  }, [view, selectedCategoryId, searchQuery, favorites, installed])
}

export function useCategoryCount(id: CategoryId) {
  return React.useMemo(
    () => SOFTWARE.filter((s) => s.category === id).length,
    [id]
  )
}

export { CATEGORIES }
