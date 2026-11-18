import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { UPGRADE_ORDER, updateQueueId } from "@/lib/actions"
import type { PackageUpdate } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowUpCircle, ArrowRight, CheckSquare, Square, RefreshCw, CircleCheck, Info } from "lucide-react"
import { cn } from "@/lib/utils"

/** Installed packages with a newer version waiting, across every manager. */
export function UpdatesView() {
  const {
    updates,
    updatesChecking,
    updatesChecked,
    checkUpdates,
    searchQuery,
    selectedQueue,
    toggleQueueItem,
    selectAllVisible,
    runBatch,
    busyIds,
    selectedIndex,
    setSelectedIndex,
    setSystemNavIds,
    setUpgradeAllConfirmOpen,
  } = useAppState()

  const rows = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return updates
    return updates.filter((u) => u.name.toLowerCase().includes(q) || u.manager.toLowerCase().includes(q))
  }, [updates, searchQuery])

  React.useEffect(() => {
    setSystemNavIds(rows.map(updateQueueId))
    setSelectedIndex(0)
  }, [rows, setSystemNavIds, setSelectedIndex])
  React.useEffect(() => () => setSystemNavIds([]), [setSystemNavIds])

  React.useEffect(() => {
    document.querySelector('[data-highlighted="true"]')?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  const ids = rows.map(updateQueueId)
  const selected = ids.filter((id) => selectedQueue.has(id))
  const allSelected = ids.length > 0 && selected.length === ids.length
  const managers = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const u of updates) counts.set(u.manager, (counts.get(u.manager) ?? 0) + 1)
    return [...counts]
  }, [updates])
  const hasPacman = updates.some((u) => u.manager === "pacman")

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border/50 px-6 py-4 shrink-0 bg-background/40 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-sm">
              <ArrowUpCircle className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">Updates</h1>
                {updatesChecked && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-mono text-xs rounded-full px-2",
                      updates.length > 0 && "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {updates.length} available
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {managers.length > 0
                  ? managers.map(([m, n]) => `${n} ${m}`).join(" · ")
                  : "Installed packages with a newer version waiting"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void checkUpdates()}
              disabled={updatesChecking}
              className="gap-1.5 text-xs h-8 rounded-xl"
            >
              <RefreshCw className={cn("size-3.5", updatesChecking && "animate-spin")} />
              {updatesChecking ? "Checking…" : "Check again"}
            </Button>
            {selected.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void runBatch("update", selected)}
                className="gap-1.5 text-xs h-8 rounded-xl"
              >
                Update {selected.length} selected
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setUpgradeAllConfirmOpen(true)}
              disabled={updates.length === 0}
              className="gap-1.5 text-xs h-8 rounded-xl"
            >
              <ArrowUpCircle className="size-3.5" />
              Update all <Kbd className="ml-0.5">U</Kbd>
            </Button>
          </div>
        </div>
        {hasPacman && (
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            Arch does not support partial upgrades, so Pacman packages are only updated through Update all
            (pacman -Syu). AUR, Flatpak and the other managers can be updated one by one.
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {!updatesChecked ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-sm text-muted-foreground">
            <Spinner className="size-5" />
            Asking your package managers for newer versions…
          </div>
        ) : updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <CircleCheck className="size-8 text-success" />
            Everything is up to date.
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No update matches “{searchQuery}”.</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-3 pb-2 border-b border-border/40">
              <button
                onClick={() => selectAllVisible(ids)}
                className="cursor-pointer flex items-center gap-1.5 font-medium hover:text-foreground"
              >
                {allSelected ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4" />}
                Select All ({rows.length})
              </button>
              <span className="font-medium">Space to select · u to update</span>
            </div>
            {rows.map((u, idx) => (
              <UpdateRow
                key={updateQueueId(u)}
                update={u}
                index={idx}
                highlighted={selectedIndex === idx}
                queued={selectedQueue.has(updateQueueId(u))}
                busy={busyIds.has(updateQueueId(u))}
                onToggle={() => toggleQueueItem(updateQueueId(u))}
                onUpdate={() => void runBatch("update", [updateQueueId(u)])}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

/** "Update all?" — rendered at app level so the U key works from any view. */
export function UpgradeAllDialog() {
  const { updates, upgradeAllConfirmOpen, setUpgradeAllConfirmOpen, upgradeAll } = useAppState()
  // Listed in the order the upgrades run.
  const rank = (m: string) => (UPGRADE_ORDER.indexOf(m) + 1 || 99)
  const managers = [...new Set(updates.map((u) => u.manager))].sort((a, b) => rank(a) - rank(b)).join(", ")
  return (
    <AlertDialog open={upgradeAllConfirmOpen} onOpenChange={setUpgradeAllConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Update all {updates.length} package{updates.length === 1 ? "" : "s"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Each package manager runs its own full upgrade:{" "}
            {managers}. This can take a while and may also update dependencies
            that are not listed here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => void upgradeAll()}>Update all</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** "1.2 → 1.3", or "→ 1.3" when the manager does not report the installed version. */
export function VersionChange({ update, className }: { update: PackageUpdate; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs", className)}>
      {update.current && <span className="text-muted-foreground/80 truncate max-w-[10rem]">{update.current}</span>}
      <ArrowRight className="size-3 shrink-0 text-amber-500" />
      <span className="font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[10rem]">
        {update.latest || "newer"}
      </span>
    </span>
  )
}

function UpdateRow({
  update,
  index,
  highlighted,
  queued,
  busy,
  onToggle,
  onUpdate,
}: {
  update: PackageUpdate
  index: number
  highlighted: boolean
  queued: boolean
  busy: boolean
  onToggle: () => void
  onUpdate: () => void
}) {
  const pacman = update.manager === "pacman"
  return (
    <div
      data-card-index={index}
      data-highlighted={highlighted ? "true" : undefined}
      data-queued={queued ? "true" : undefined}
      onClick={onToggle}
      className="sw-card cursor-pointer flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 select-none"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {queued ? (
          <CheckSquare className="size-4.5 shrink-0 text-primary fill-primary/10" />
        ) : (
          <Square className="size-4.5 shrink-0 text-muted-foreground opacity-60" />
        )}
        <ArrowUpCircle className="size-4 shrink-0 text-amber-500" />
        <span className="font-semibold text-sm truncate">{update.name}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
        <VersionChange update={update} />
        <span className="w-16 text-center rounded-md border border-border/50 bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {update.manager}
        </span>
        <Button
          size="sm"
          variant="ghost"
          disabled={pacman || busy}
          title={pacman ? "Arch only supports full upgrades — use Update all" : `Update ${update.name}`}
          onClick={onUpdate}
          className="h-7 rounded-lg px-2 text-xs hover:bg-primary/10 hover:text-primary"
        >
          {busy ? <Spinner className="size-3" /> : "Update"}
        </Button>
      </div>
    </div>
  )
}
