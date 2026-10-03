import * as React from "react"
import { SOFTWARE, SOFTWARE_MAP } from "@/lib/software"
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
  DistroFilter,
  Batch,
  Job,
  JobEvent,
} from "@/lib/types"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { applyJobEvent, batchCounts } from "@/lib/jobs-reducer"
import {
  buildCommands,
  buildSystemPackageCommands,
  matchesDistroFilter,
  optionInstalled,
  pickOption,
  type PickContext,
} from "@/lib/actions"
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
  distroFilter: DistroFilter
  collapsedCategories: Set<string>
  batches: Batch[]
  jobsPanelOpen: boolean
  removeConfirmOpen: boolean
  passwordPromptOpen: boolean
  busyIds: Set<string>
  /** Navigable ids in the System Packages view (set by that view). */
  systemNavIds: string[]

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
  setDistroFilter: (f: DistroFilter) => void
  toggleCategoryCollapsed: (id: string) => void
  setJobsPanelOpen: (open: boolean) => void
  setRemoveConfirmOpen: (open: boolean) => void
  finishPasswordPrompt: (ok: boolean) => void
  setSystemNavIds: (ids: string[]) => void
  /** One-click entry point: starts at once, except removals which ask first. */
  requestBatch: (action: BatchAction) => Promise<void>
  /** Start `action` for every queued item (or `ids` when given) in the background. */
  runBatch: (action: BatchAction, ids?: string[]) => Promise<void>
  cancelBatch: (batchId: string) => Promise<void>
  dismissBatch: (batchId: string) => void
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
      const saved = localStorage.getItem("packall_installed") ?? localStorage.getItem("almanac_installed")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [selectedQueue, setSelectedQueue] = React.useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [distroFilter, setDistroFilterState] = React.useState<DistroFilter>(() => {
    try {
      return (localStorage.getItem("packall_distro_filter") as DistroFilter) || "all"
    } catch {
      return "all"
    }
  })
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set())
  const [batches, setBatches] = React.useState<Batch[]>([])
  const [jobsPanelOpen, setJobsPanelOpen] = React.useState(false)
  const [removeConfirmOpen, setRemoveConfirmOpen] = React.useState(false)
  const [passwordPromptOpen, setPasswordPromptOpen] = React.useState(false)
  const [systemNavIds, setSystemNavIds] = React.useState<string[]>([])
  const passwordResolver = React.useRef<((ok: boolean) => void) | null>(null)
  const startingIds = React.useRef<Set<string>>(new Set())
  const [systemPackages, setSystemPackages] = React.useState<SystemPackage[]>([])
  const [packageManagers, setPackageManagers] = React.useState<PackageManagerInfo[]>([])
  const [distroInfo, setDistroInfo] = React.useState<DistroInfo | null>(null)
  const [isLoadingSystem, setIsLoadingSystem] = React.useState(false)
  const [, setViewStack] = React.useState<View[]>([{ kind: "grid" }])

  React.useEffect(() => {
    try {
      localStorage.setItem("packall_installed", JSON.stringify(Array.from(installed)))
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

      // Auto-mark packages as installed in Packall if detected on host system
      if (sysPkgs && sysPkgs.length > 0) {
        const sysNames = new Set(sysPkgs.map((p) => p.name.toLowerCase()))
        setInstalled((prev) => {
          const next = new Set(prev)
          for (const s of SOFTWARE) {
            if (
              sysNames.has(s.id.toLowerCase()) ||
              sysNames.has(s.name.toLowerCase()) ||
              s.install.some((o) => optionInstalled(o, sysPkgs))
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

  const setDistroFilter = React.useCallback((f: DistroFilter) => {
    setDistroFilterState(f)
    setSelectedIndex(0)
    try {
      localStorage.setItem("packall_distro_filter", f)
    } catch {
      // ignore
    }
  }, [])

  const toggleCategoryCollapsed = React.useCallback((id: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSelectedIndex(0)
  }, [])

  // ---- Background batch jobs -------------------------------------------------

  const batchesRef = React.useRef<Batch[]>([])
  React.useEffect(() => {
    batchesRef.current = batches
  }, [batches])

  const handleJobEvent = React.useCallback(
    (ev: JobEvent) => {
      const batch = batchesRef.current.find((b) => b.id === ev.batch_id)
      if (!batch) return
      const updated = applyJobEvent(batch, ev)
      batchesRef.current = batchesRef.current.map((b) => (b.id === batch.id ? updated : b))
      setBatches(batchesRef.current)

      if (ev.kind === "finished" && ev.success) {
        if (batch.action === "install") {
          setInstalled((prev) => new Set(prev).add(ev.job_id))
        } else if (batch.action === "remove") {
          setInstalled((prev) => {
            const next = new Set(prev)
            next.delete(ev.job_id)
            return next
          })
        }
      }

      if (ev.kind === "batch_done") {
        const c = batchCounts(updated)
        const verb =
          batch.action === "install" ? "installed" : batch.action === "update" ? "updated" : "removed"
        if (c.cancelled > 0) toast.message(`Cancelled — ${c.success} ${verb}`)
        else if (c.failed > 0) toast.error(`${c.success} ${verb}, ${c.failed} failed`)
        else toast.success(`${c.success} ${verb} successfully`)
        void refreshSystemPackages()
      }
    },
    [refreshSystemPackages]
  )

  React.useEffect(() => {
    let unlisten: (() => void) | undefined
    let cancelled = false
    try {
      Promise.resolve(listen<JobEvent>("packall-job", (e) => handleJobEvent(e.payload)))
        .then((fn) => {
          if (cancelled) fn?.()
          else unlisten = fn
        })
        .catch(() => {})
    } catch {
      // Not running inside Tauri.
    }
    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [handleJobEvent])

  const busyIds = React.useMemo(() => {
    const ids = new Set<string>()
    for (const b of batches) {
      for (const j of b.jobs) {
        if (j.status === "queued" || j.status === "running") ids.add(j.id)
      }
    }
    return ids
  }, [batches])

  const askForPassword = React.useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        passwordResolver.current = resolve
        setPasswordPromptOpen(true)
      }),
    []
  )

  const finishPasswordPrompt = React.useCallback((ok: boolean) => {
    passwordResolver.current?.(ok)
    passwordResolver.current = null
    setPasswordPromptOpen(false)
  }, [])

  const startBatch = React.useCallback(
    async (action: BatchAction, targets: string[]) => {

      const ctx: PickContext = { distro: distroInfo, managers: packageManagers, systemPackages }
      const jobs: Job[] = []
      const specs: { id: string; name: string; commands: string[] }[] = []

      for (const id of targets) {
        const sw = SOFTWARE_MAP[id]
        const base: Job = { id, name: sw?.name ?? id, action, status: "queued", percent: null, log: [] }
        if (!sw) {
          // Not in the catalogue: a raw package picked from the System view.
          const sysPkg = systemPackages.find((p) => p.name === id)
          const commands =
            sysPkg && action !== "install"
              ? buildSystemPackageCommands(action, sysPkg, packageManagers)
              : []
          if (!sysPkg || commands.length === 0) {
            jobs.push({ ...base, status: "skipped", error: "Cannot manage this package automatically" })
          } else {
            jobs.push({ ...base, method: sysPkg.manager })
            specs.push({ id, name: id, commands })
          }
          continue
        }
        if (action === "install" && installed.has(id)) {
          jobs.push({ ...base, status: "skipped", error: "Already installed" })
          continue
        }
        if (action !== "install" && !installed.has(id)) {
          jobs.push({ ...base, status: "skipped", error: "Not installed" })
          continue
        }
        const opt = pickOption(sw, action, ctx)
        const commands = opt ? buildCommands(action, opt, packageManagers) : []
        if (!opt || commands.length === 0) {
          jobs.push({
            ...base,
            status: "skipped",
            error: "No automatic method for this system — open Details for manual steps",
          })
          continue
        }
        jobs.push({ ...base, method: opt.method })
        specs.push({ id, name: sw.name, commands })
      }

      if (specs.length > 0 && specs.some((sp) => sp.commands.some((c) => /\bsudo\b/.test(c)))) {
        let state = "ready"
        try {
          state = await invoke<string>("sudo_state")
        } catch {
          state = "ready" // not running inside Tauri; the start call reports it
        }
        if (state === "unavailable") {
          toast.error("sudo is required to install system packages, but it was not found")
          return
        }
        if (state === "needs_password" && !(await askForPassword())) {
          return
        }
      }

      const batch: Batch = {
        id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action,
        jobs,
        done: specs.length === 0,
        startedAt: Date.now(),
      }
      batchesRef.current = [batch, ...batchesRef.current].slice(0, 5)
      setBatches(batchesRef.current)
      setJobsPanelOpen(true)
      setSelectedQueue(new Set())

      if (specs.length === 0) {
        toast.error("Nothing to do for the selected items")
        return
      }

      try {
        await invoke("start_batch", { batchId: batch.id, jobs: specs })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const failed: Batch = {
          ...batch,
          done: true,
          jobs: batch.jobs.map((j) =>
            j.status === "queued"
              ? { ...j, status: "failed", error: "Package actions need the Packall desktop app" }
              : j
          ),
        }
        batchesRef.current = batchesRef.current.map((b) => (b.id === batch.id ? failed : b))
        setBatches(batchesRef.current)
        toast.error(`Could not start background job: ${message}`)
      }
    },
    [distroInfo, packageManagers, systemPackages, installed, askForPassword]
  )

  const runBatch = React.useCallback(
    async (action: BatchAction, ids?: string[]) => {
      const requested = ids ?? Array.from(selectedQueue)
      // Ignore anything that is already running or being started: repeated
      // clicks must not start the same job twice.
      const busyNow = new Set<string>()
      for (const b of batchesRef.current) {
        for (const j of b.jobs) if (j.status === "queued" || j.status === "running") busyNow.add(j.id)
      }
      const targets = requested.filter((id) => !busyNow.has(id) && !startingIds.current.has(id))
      if (targets.length === 0) {
        if (requested.length > 0) toast.info("Already in progress")
        return
      }
      targets.forEach((id) => startingIds.current.add(id))
      try {
        await startBatch(action, targets)
      } finally {
        targets.forEach((id) => startingIds.current.delete(id))
      }
    },
    [selectedQueue, startBatch]
  )

  const requestBatch = React.useCallback(
    async (action: BatchAction) => {
      if (selectedQueue.size === 0) return
      if (action === "remove") {
        setRemoveConfirmOpen(true)
        return
      }
      await runBatch(action)
    },
    [selectedQueue, runBatch]
  )

  const cancelBatch = React.useCallback(async (batchId: string) => {
    try {
      await invoke("cancel_batch_job", { batchId })
    } catch {
      // ignore
    }
  }, [])

  const dismissBatch = React.useCallback((batchId: string) => {
    batchesRef.current = batchesRef.current.filter((b) => b.id !== batchId)
    setBatches(batchesRef.current)
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
    distroFilter,
    collapsedCategories,
    batches,
    jobsPanelOpen,
    removeConfirmOpen,
    passwordPromptOpen,
    busyIds,
    systemNavIds,
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
    setDistroFilter,
    toggleCategoryCollapsed,
    setJobsPanelOpen,
    setRemoveConfirmOpen,
    finishPasswordPrompt,
    setSystemNavIds,
    requestBatch,
    runBatch,
    cancelBatch,
    dismissBatch,
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
  const { view, searchQuery, installed, distroFilter } = useAppState()

  return React.useMemo(() => {
    let list = SOFTWARE

    if (view.kind === "installed") {
      list = list.filter((s) => installed.has(s.id))
    }

    if (distroFilter !== "all") {
      list = list.filter((s) => matchesDistroFilter(s, distroFilter))
    }

    // Global search covers every category regardless of the selected one.
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Order by category (matching the on-screen sections) so the keyboard
    // cursor index lines up with what is drawn.
    const order = new Map(CATEGORIES.map((c, i) => [c.id, i]))
    return [...list].sort((a, b) => (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99))
  }, [view, searchQuery, installed, distroFilter])
}

/** The filtered list minus collapsed categories: exactly what is on screen. */
export function useNavigableSoftware() {
  const filtered = useFilteredSoftware()
  const { collapsedCategories } = useAppState()
  return React.useMemo(
    () => filtered.filter((s) => !collapsedCategories.has(s.category)),
    [filtered, collapsedCategories]
  )
}

export function useCategoryCount(id: CategoryId) {
  return React.useMemo(
    () => SOFTWARE.filter((s) => s.category === id).length,
    [id]
  )
}

export { CATEGORIES }
