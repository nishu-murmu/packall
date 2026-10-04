import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Cpu,
  Package,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SystemPackagesView() {
  const {
    systemPackages,
    isLoadingSystem,
    refreshSystemPackages,
    selectedQueue,
    toggleQueueItem,
    selectAllVisible,
    runBatch,
    selectedIndex,
    setSelectedIndex,
    setSystemNavIds,
  } = useAppState()

  const [filterManager, setFilterManager] = React.useState<string>("all")
  const [filterSearch, setFilterSearch] = React.useState("")
  const [manualPkgInput, setManualPkgInput] = React.useState("")

  // Available managers from detected packages
  const managerCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    systemPackages.forEach((p) => {
      counts[p.manager] = (counts[p.manager] || 0) + 1
    })
    return counts
  }, [systemPackages])

  const filteredPackages = React.useMemo(() => {
    return systemPackages.filter((p) => {
      if (filterManager !== "all" && p.manager !== filterManager) {
        return false
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.version.toLowerCase().includes(q) ||
          p.manager.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [systemPackages, filterManager, filterSearch])

  // Let the keyboard handler move over exactly the rows on screen.
  React.useEffect(() => {
    setSystemNavIds(filteredPackages.map((p) => p.name))
    setSelectedIndex(0)
    return () => setSystemNavIds([])
  }, [filteredPackages, setSystemNavIds, setSelectedIndex])

  React.useEffect(() => {
    document
      .querySelector('[data-highlighted="true"]')
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  const allVisibleSelected =
    filteredPackages.length > 0 &&
    filteredPackages.every((p) => selectedQueue.has(p.name))

  const handleSelectAll = () => {
    selectAllVisible(filteredPackages.map((p) => p.name))
  }

  const handleAddManualPackage = (e: React.FormEvent) => {
    e.preventDefault()
    const pkg = manualPkgInput.trim()
    if (!pkg) return

    toggleQueueItem(pkg)
    toast.success(`Package '${pkg}' added to queue!`)
    setManualPkgInput("")
  }

  const handleSingleUpdate = (name: string) => void runBatch("update", [name])

  const handleSingleRemove = (name: string) => {
    if (confirm(`Are you sure you want to uninstall package '${name}'?`)) {
      void runBatch("remove", [name])
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <div className="border-b border-border/50 px-6 py-4 shrink-0 bg-background/40 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20 shadow-sm">
              <Cpu className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">System Package Manager</h1>
                <Badge variant="secondary" className="font-mono text-xs rounded-full px-2 py-0.2">
                  {systemPackages.length} detected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect and batch-manage installed packages across Pacman, AUR, Flatpak, Snap, APT, and DNF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshSystemPackages({ notify: true })}
              disabled={isLoadingSystem}
              className="gap-1.5 text-xs h-8 rounded-xl"
            >
              <RefreshCw className={cn("size-3.5", isLoadingSystem && "animate-spin")} />
              Scan Host
            </Button>

          </div>
        </div>

        {/* Manual Add Package Quick Input */}
        <form onSubmit={handleAddManualPackage} className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Add package name to queue (e.g. google-chrome, paru, zsh)..."
              value={manualPkgInput}
              onChange={(e) => setManualPkgInput(e.target.value)}
              className="h-8.5 text-xs bg-muted/30 rounded-xl"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-8.5 gap-1.5 text-xs rounded-xl">
            <Plus className="size-3.5" /> Add to Queue
          </Button>
        </form>

        {/* Manager Filter Tabs & Search */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterManager("all")}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all",
                filterManager === "all"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              All Sources ({systemPackages.length})
            </button>
            {Object.entries(managerCounts).map(([mgr, count]) => (
              <button
                key={mgr}
                onClick={() => setFilterManager(mgr)}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  filterManager === mgr
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {mgr.toUpperCase()} ({count})
              </button>
            ))}
          </div>

          <div className="relative flex items-center w-64">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Filter installed packages..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/30 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Package List / Table */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-inner">
              <Package className="size-7" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">No packages found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
              {systemPackages.length === 0
                ? "Click 'Scan Host' above to query installed pacman, paru, aur, flatpak, or apt packages on your machine."
                : "No installed packages match the selected source or search criteria."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshSystemPackages({ notify: true })}
              className="mt-4 gap-1.5 rounded-xl text-xs"
            >
              <RefreshCw className="size-3.5" /> Scan Host Now
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-3 py-1 border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="cursor-pointer flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                >
                  {allVisibleSelected ? (
                    <CheckSquare className="size-4 text-primary" />
                  ) : (
                    <Square className="size-4" />
                  )}
                  Select All ({filteredPackages.length})
                </button>
              </div>
              <div className="flex items-center gap-8 font-medium">
                <span className="w-24 text-right">Source</span>
                <span className="w-24 text-right">Actions</span>
              </div>
            </div>

            {filteredPackages.map((pkg, idx) => {
              const isQueued = selectedQueue.has(pkg.name)
              const mgrColor =
                pkg.manager === "aur"
                  ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                  : pkg.manager === "pacman"
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                  : pkg.manager === "flatpak"
                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                  : "bg-muted text-muted-foreground border-border/50"

              return (
                <div
                  key={`${pkg.manager}:${pkg.name}`}
                  data-card-index={idx}
                  data-highlighted={selectedIndex === idx ? "true" : undefined}
                  data-queued={isQueued ? "true" : undefined}
                  onClick={() => toggleQueueItem(pkg.name)}
                  className="sw-card cursor-pointer flex items-center justify-between rounded-xl border border-border bg-card p-3 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleQueueItem(pkg.name)
                      }}
                      className="cursor-pointer text-muted-foreground hover:text-primary focus:outline-none"
                    >
                      {isQueued ? (
                        <CheckSquare className="size-4.5 text-primary fill-primary/10" />
                      ) : (
                        <Square className="size-4.5 opacity-60 hover:opacity-100" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-foreground">{pkg.name}</span>
                        <span className="text-xs font-mono text-muted-foreground/70">
                          v{pkg.version}
                        </span>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", mgrColor)}
                    >
                      {pkg.manager}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        title="Update package"
                        onClick={() => handleSingleUpdate(pkg.name)}
                        className="size-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        <RefreshCw className="size-3" />
                      </Button>

                      <Button
                        size="icon-xs"
                        variant="ghost"
                        title="Remove package"
                        onClick={() => handleSingleRemove(pkg.name)}
                        className="size-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
