import * as React from "react"
import { useAppState, useFilteredSoftware } from "@/lib/app-state"
import { CATEGORIES } from "@/lib/categories"
import { SOFTWARE } from "@/lib/software"
import { SoftwareCard } from "@/components/software-card"
import { CategoryIcon } from "@/components/category-icon"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Package, Search, X, Sparkles, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function SoftwareGrid() {
  const {
    installed,
    selectedQueue,
    toggleQueueItem,
    view,
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    setInspectSoftwareId,
  } = useAppState()

  const filtered = useFilteredSoftware()

  // Track collapsed categories
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set())

  const toggleCategory = React.useCallback((categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }, [])

  // Reset selected index when search query or view mode changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery, view.kind, setSelectedIndex])

  // Group filtered software by category
  const groupedByCategory = React.useMemo(() => {
    const groups: { category: typeof CATEGORIES[number]; items: typeof filtered }[] = []
    const itemsByCategory: Record<string, typeof filtered> = {}

    for (const sw of filtered) {
      if (!itemsByCategory[sw.category]) {
        itemsByCategory[sw.category] = []
      }
      itemsByCategory[sw.category].push(sw)
    }

    // Maintain the order from CATEGORIES
    for (const cat of CATEGORIES) {
      const items = itemsByCategory[cat.id]
      if (items && items.length > 0) {
        groups.push({ category: cat, items })
      }
    }

    return groups
  }, [filtered])


  const isGlobalSearch = Boolean(searchQuery.trim())

  const title = React.useMemo(() => {
    if (isGlobalSearch) return `Results for "${searchQuery}"`
    if (view.kind === "installed") return "Installed Software"
    return "All Software"
  }, [isGlobalSearch, searchQuery, view])

  const subtitle = React.useMemo(() => {
    if (isGlobalSearch) {
      return `Searching across all ${SOFTWARE.length} apps (${filtered.length} found)`
    }
    if (view.kind === "installed") return "Applications detected or marked as installed on this system"
    return `${filtered.length} applications across ${groupedByCategory.length} categories`
  }, [isGlobalSearch, filtered.length, view, groupedByCategory.length])

  // Handle selecting a card — Enter key or click opens slide-over drawer
  const handleSelectCard = (softwareId: string) => {
    setInspectSoftwareId(softwareId)
  }

  // Auto-scroll highlighted item into view
  React.useEffect(() => {
    const el = document.querySelector('[data-highlighted="true"]')
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedIndex])

  if (filtered.length === 0 && !isGlobalSearch && groupedByCategory.length === 0) {
    const emptyMsg =
        view.kind === "installed"
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

  // Track the running flat index across categories for highlighting
  let runningFlatIdx = 0

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

      {/* Collapsible category groups */}
      <div className="flex-1 overflow-y-auto pb-28">
        {groupedByCategory.map((group) => {
          const isCollapsed = collapsedCategories.has(group.category.id)
          const startIdx = runningFlatIdx

          if (!isCollapsed) {
            runningFlatIdx += group.items.length
          }

          return (
            <div key={group.category.id} className="border-b border-border/30 last:border-b-0">
              {/* Category Header — clickable to toggle collapse */}
              <button
                onClick={() => toggleCategory(group.category.id)}
                className={cn(
                  "cursor-pointer flex w-full items-center gap-3 px-6 py-3 text-left transition-colors duration-150",
                  "hover:bg-muted/30 group select-none",
                  isCollapsed && "bg-muted/10"
                )}
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {isCollapsed ? (
                    <ChevronRight className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </span>
                <CategoryIcon categoryId={group.category.id} className="size-4 text-primary/70" />
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  {group.category.name}
                </span>
                <span className="rounded-md bg-muted/60 text-muted-foreground px-1.5 py-0.5 text-[10px] font-mono tabular-nums">
                  {group.items.length}
                </span>
                {group.category.description && (
                  <span className="hidden md:inline text-[11px] text-muted-foreground/60 truncate ml-1">
                    — {group.category.description}
                  </span>
                )}
              </button>

              {/* Items grid — 4 columns of compact cards */}
              {!isCollapsed && (
                <div className="px-6 pb-4 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {group.items.map((sw, localIdx) => {
                      const globalIdx = startIdx + localIdx
                      return (
                        <SoftwareCard
                          key={sw.id}
                          software={sw}
                          isInstalled={installed.has(sw.id)}
                          isQueued={selectedQueue.has(sw.id)}
                          isHighlighted={selectedIndex === globalIdx}
                          onSelect={() => handleSelectCard(sw.id)}
                          onToggleQueue={() => toggleQueueItem(sw.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
