import * as React from "react"
import { useAppState, useFilteredSoftware } from "@/lib/app-state"
import { CATEGORY_MAP } from "@/lib/categories"
import { SoftwareCard } from "@/components/software-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Package, Search, CheckSquare, X } from "lucide-react"

export function SoftwareGrid() {
  const {
    selectedIndex,
    setView,
    favorites,
    installed,
    selectedQueue,
    toggleQueueItem,
    selectAllVisible,
    view,
    selectedCategoryId,
    searchQuery,
    setSearchQuery,
  } = useAppState()

  const filtered = useFilteredSoftware()

  const gridRef = React.useRef<HTMLDivElement>(null)
  const selectedRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  const isGlobalSearch = Boolean(searchQuery.trim())

  const title = React.useMemo(() => {
    if (isGlobalSearch) return `Search results for "${searchQuery}"`
    if (view.kind === "favorites") return "Favorites"
    if (view.kind === "installed") return "Installed Software"
    return CATEGORY_MAP[selectedCategoryId]?.name ?? "All Software"
  }, [isGlobalSearch, searchQuery, view, selectedCategoryId])

  const subtitle = React.useMemo(() => {
    if (isGlobalSearch) {
      return `Searching across all categories (${filtered.length} found)`
    }
    if (view.kind === "favorites") return "Applications you've starred for quick access"
    if (view.kind === "installed") return "Applications detected or marked as installed on this system"
    return CATEGORY_MAP[selectedCategoryId]?.description ?? ""
  }, [isGlobalSearch, filtered.length, view, selectedCategoryId])

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selectedQueue.has(s.id))

  const handleSelectAllVisible = () => {
    selectAllVisible(filtered.map((s) => s.id))
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Empty>
          <EmptyMedia variant="icon">
            <Package className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No software found</EmptyTitle>
          <EmptyDescription>
            {isGlobalSearch
              ? `No software matches "${searchQuery}" in any category.`
              : view.kind === "favorites"
              ? "Press f on any app to add it to your favorites."
              : view.kind === "installed"
              ? "No installed software detected or marked yet."
              : "No packages available in this category."}
          </EmptyDescription>
          {isGlobalSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-4 gap-1.5"
            >
              <X className="size-3.5" /> Clear search
            </Button>
          )}
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-3.5 shrink-0 bg-background/50">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isGlobalSearch && <Search className="size-4 text-primary shrink-0" />}
            <h2 className="truncate text-base font-semibold tracking-tight">
              {title}
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {filtered.length}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllVisible}
            className="h-8 gap-1.5 text-xs"
          >
            <CheckSquare className="size-3.5" />
            {allVisibleSelected ? "Deselect All" : "Select All Visible"}
          </Button>

          {isGlobalSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div ref={gridRef} className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((sw, idx) => (
            <div
              key={sw.id}
              ref={idx === selectedIndex ? selectedRef : undefined}
            >
              <SoftwareCard
                software={sw}
                selected={idx === selectedIndex}
                isFavorite={favorites.has(sw.id)}
                isInstalled={installed.has(sw.id)}
                isQueued={selectedQueue.has(sw.id)}
                showCategory={isGlobalSearch}
                onClick={() => setView({ kind: "detail", id: sw.id })}
                onToggleQueue={() => toggleQueueItem(sw.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
