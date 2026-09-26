import * as React from "react"
import { useAppState, useFilteredSoftware } from "@/lib/app-state"
import { SOFTWARE_MAP } from "@/lib/software"
import { Kbd } from "@/components/ui/kbd"

export function StatusBar() {
  const { view, selectedIndex, favorites, installed, sidebarOpen } =
    useAppState()
  const filtered = useFilteredSoftware()

  const currentApp = React.useMemo(() => {
    if (view.kind === "detail") return SOFTWARE_MAP[view.id]
    return filtered[selectedIndex]
  }, [view, selectedIndex, filtered])

  const mode = view.kind === "detail" ? "DETAIL" : view.kind.toUpperCase()

  return (
    <footer className="flex h-7 items-center justify-between border-t bg-muted/30 px-3 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="font-mono font-medium text-foreground">{mode}</span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          {filtered.length > 0 ? selectedIndex + 1 : 0} / {filtered.length}
        </span>
        {currentApp && (
          <>
            <span className="text-muted-foreground/50">|</span>
            <span className="truncate">{currentApp.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1">
          <Kbd>j</Kbd>
          <Kbd>k</Kbd> navigate
        </span>
        <span className="hidden md:flex items-center gap-1">
          <Kbd>/</Kbd> search
        </span>
        <span className="hidden md:flex items-center gap-1">
          <Kbd>?</Kbd> help
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span>
          {favorites.size} fav · {installed.size} inst
        </span>
      </div>
    </footer>
  )
}
