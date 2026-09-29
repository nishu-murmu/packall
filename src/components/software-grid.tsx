import * as React from "react"
import { useAppState, useFilteredSoftware } from "@/lib/app-state"
import { CATEGORIES } from "@/lib/categories"
import { SOFTWARE } from "@/lib/software"
import { SoftwareCard } from "@/components/software-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Package, Search, CheckSquare, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function SoftwareGrid() {
  const {
    favorites,
    installed,
    selectedQueue,
    toggleQueueItem,
    toggleFavorite,
    selectAllVisible,
    view,
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    setInspectSoftwareId,
  } = useAppState()

  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  const baseFiltered = useFilteredSoftware()

  // Apply category chip filter on top of the base filtered list
  const filtered = React.useMemo(() => {
    if (!activeCategory) return baseFiltered
    return baseFiltered.filter((s) => s.category === activeCategory)
  }, [baseFiltered, activeCategory])

  // Reset category filter when search query or view mode changes
  React.useEffect(() => {
    setActiveCategory(null)
    setSelectedIndex(0)
  }, [searchQuery, view.kind, setSelectedIndex])

  // Get categories that are actually present in the current base list
  const availableCategories = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of baseFiltered) {
      counts[s.category] = (counts[s.category] ?? 0) + 1
    }
    return CATEGORIES.filter((c) => (counts[c.id] ?? 0) > 0).map((c) => ({
      ...c,
      count: counts[c.id] ?? 0,
    }))
  }, [baseFiltered])

  const isGlobalSearch = Boolean(searchQuery.trim())

  const title = React.useMemo(() => {
    if (isGlobalSearch) return `Results for "${searchQuery}"`
    if (view.kind === "favorites") return "Favorites"
    if (view.kind === "installed") return "Installed Software"
    if (activeCategory) {
      const cat = CATEGORIES.find((c) => c.id === activeCategory)
      return cat ? cat.name : "All Software"
    }
    return "All Software"
  }, [isGlobalSearch, searchQuery, view, activeCategory])

  const subtitle = React.useMemo(() => {
    if (isGlobalSearch) {
      return `Searching across all ${SOFTWARE.length} apps (${filtered.length} found)`
    }
    if (view.kind === "favorites") return "Applications you've starred for quick access"
    if (view.kind === "installed") return "Applications detected or marked as installed on this system"
    if (activeCategory) {
      const cat = CATEGORIES.find((c) => c.id === activeCategory)
      return cat?.description ?? `${filtered.length} apps in ${cat?.name || "category"}`
    }
    return `${filtered.length} applications across ${availableCategories.length} categories`
  }, [isGlobalSearch, filtered.length, view, activeCategory, availableCategories.length])

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selectedQueue.has(s.id))

  const handleSelectAllVisible = () => {
    selectAllVisible(filtered.map((s) => s.id))
  }

  // Handle selecting a card — Enter key or click opens slide-over drawer
  const handleSelectCard = (softwareId: string) => {
    setInspectSoftwareId(softwareId)
  }

  if (filtered.length === 0 && !isGlobalSearch && availableCategories.length === 0) {
    const emptyMsg =
      view.kind === "favorites"
        ? "Press the star icon on any app to add it to your favorites."
        : view.kind === "installed"
        ? "No installed software detected or marked yet."
        : "No packages available."
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Empty>
          <EmptyMedia variant="icon">
            <Package className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No software found</EmptyTitle>
          <EmptyDescription>{emptyMsg}</EmptyDescription>
        </Empty>
      </div>
    )
  }

  if (filtered.length === 0 && isGlobalSearch) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary shrink-0" />
              <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="cursor-pointer h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" /> Clear
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <Empty>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No results</EmptyTitle>
            <EmptyDescription>
              No software matches "{searchQuery}" in any category.
            </EmptyDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer mt-4 gap-1.5"
            >
              <X className="size-3.5" /> Clear search
            </Button>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-3.5 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            {isGlobalSearch ? (
              <Search className="size-4 text-primary shrink-0" />
            ) : (
              <Sparkles className="size-4 text-primary shrink-0" />
            )}
            <h2 className="truncate text-base font-bold tracking-tight">
              {title}
            </h2>
            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold tabular-nums shrink-0">
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
            className="cursor-pointer h-8 gap-1.5 text-xs rounded-xl"
          >
            <CheckSquare className="size-3.5" />
            {allVisibleSelected ? "Deselect All" : "Select All"}
          </Button>

          {isGlobalSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category filter chips — only when not searching and in grid view */}
      {!isGlobalSearch && view.kind !== "favorites" && view.kind !== "installed" && availableCategories.length > 1 && (
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-border/50 overflow-x-auto scrollbar-thin shrink-0">
          <button
            onClick={() => {
              setActiveCategory(null)
              setSelectedIndex(0)
            }}
            className={cn(
              "cursor-pointer shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              !activeCategory
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
                setSelectedIndex(0)
              }}
              className={cn(
                "cursor-pointer shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className={cn("size-1.5 rounded-full shrink-0", `cat-dot-${cat.id}`)} />
              {cat.name}
              <span className={cn(
                "text-[10px] font-mono",
                activeCategory === cat.id ? "text-primary-foreground/70" : "text-muted-foreground/50"
              )}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-5 pb-28">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
          {filtered.map((sw, index) => (
            <SoftwareCard
              key={sw.id}
              software={sw}
              isFavorite={favorites.has(sw.id)}
              isInstalled={installed.has(sw.id)}
              isQueued={selectedQueue.has(sw.id)}
              isHighlighted={selectedIndex === index}
              onSelect={() => handleSelectCard(sw.id)}
              onToggleQueue={() => toggleQueueItem(sw.id)}
              onToggleFavorite={() => toggleFavorite(sw.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
