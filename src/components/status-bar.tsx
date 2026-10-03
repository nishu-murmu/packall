import * as React from "react"
import { useAppState, useNavigableSoftware } from "@/lib/app-state"
import { SOFTWARE_MAP } from "@/lib/software"
import { Kbd } from "@/components/ui/kbd"

export function StatusBar() {
  const { view, selectedIndex, installed, inspectSoftwareId } =
    useAppState()
  const filtered = useNavigableSoftware()

  const currentApp = React.useMemo(() => {
    if (inspectSoftwareId) return SOFTWARE_MAP[inspectSoftwareId]
    if (view.kind === "detail") return SOFTWARE_MAP[view.id]
    return filtered[selectedIndex]
  }, [inspectSoftwareId, view, selectedIndex, filtered])

  const mode = inspectSoftwareId
    ? "INSPECT"
    : view.kind === "detail"
      ? "DETAIL"
      : view.kind.toUpperCase()

  return (
    <footer className="flex h-7 items-center justify-between border-t border-border/50 bg-background/60 backdrop-blur-sm px-3 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="font-mono font-semibold text-primary text-[10px]">{mode}</span>
        <span className="text-border">│</span>
        <span className="tabular-nums">
          {filtered.length > 0 ? selectedIndex + 1 : 0} / {filtered.length}
        </span>
        {currentApp && (
          <>
            <span className="text-border">│</span>
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
          <Kbd>Enter</Kbd> details
        </span>
        <span className="hidden lg:flex items-center gap-1">
          <Kbd>Space</Kbd> select
        </span>
        <span className="hidden lg:flex items-center gap-1">
          <Kbd>i</Kbd> install
        </span>
        <span className="hidden md:flex items-center gap-1">
          <Kbd>/</Kbd> search
        </span>
        <span className="hidden md:flex items-center gap-1">
          <Kbd>?</Kbd> help
        </span>
        <span className="text-border">│</span>
        <span className="tabular-nums">
          {installed.size} inst
        </span>
      </div>
    </footer>
  )
}
