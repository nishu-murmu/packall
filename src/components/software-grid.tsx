import * as React from "react"
import { useAppState, useFilteredSoftware } from "@/lib/app-state"
import { CATEGORY_MAP } from "@/lib/categories"
import { SoftwareCard } from "@/components/software-card"
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Package } from "lucide-react"

export function SoftwareGrid() {
  const { selectedIndex, setView, favorites, installed, view, selectedCategoryId } =
    useAppState()
  const filtered = useFilteredSoftware()

  const gridRef = React.useRef<HTMLDivElement>(null)
  const selectedRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  const title = React.useMemo(() => {
    if (view.kind === "favorites") return "Favorites"
    if (view.kind === "installed") return "Installed"
    return CATEGORY_MAP[selectedCategoryId]?.name ?? "All Software"
  }, [view, selectedCategoryId])

  const subtitle = React.useMemo(() => {
    if (view.kind === "favorites") return "Apps you've starred"
    if (view.kind === "installed") return "Apps you've installed"
    return CATEGORY_MAP[selectedCategoryId]?.description ?? ""
  }, [view, selectedCategoryId])

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Empty>
          <EmptyMedia variant="icon">
            <Package className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No apps found</EmptyTitle>
          <EmptyDescription>
            {view.kind === "favorites"
              ? "Press f on any app to add it to your favorites."
              : view.kind === "installed"
                ? "Press i on any app to mark it as installed."
                : "Try a different search term."}
          </EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div
        ref={gridRef}
        className="flex-1 overflow-y-auto p-4"
      >
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
                onClick={() => setView({ kind: "detail", id: sw.id })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
