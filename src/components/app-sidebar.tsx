import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { CATEGORIES } from "@/lib/categories"
import { SOFTWARE } from "@/lib/software"
import { CategoryIcon } from "@/components/category-icon"
import { cn } from "@/lib/utils"
import {
  Star,
  Download,
  Settings,
  HelpCircle,
  PanelLeftClose,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const {
    selectedCategoryId,
    setSelectedCategory,
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    favorites,
    installed,
    setHelpOpen,
  } = useAppState()

  const isGrid = view.kind === "grid"
  const isFav = view.kind === "favorites"
  const isInst = view.kind === "installed"
  const isSettings = view.kind === "settings"

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of SOFTWARE) {
      counts[s.category] = (counts[s.category] ?? 0) + 1
    }
    return counts
  }, [])

  return (
    <aside
      className={cn(
        "flex h-svh flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="flex items-center justify-between gap-2 p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">LinuxDir</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Software Directory
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setSidebarOpen(false)}
          className="text-muted-foreground"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Views
        </div>
        <SidebarLink
          active={isGrid}
          onClick={() => setView({ kind: "grid" })}
          icon={<Package className="size-4" />}
          label="All Software"
          shortcut="1"
        />
        <SidebarLink
          active={isFav}
          onClick={() => setView({ kind: "favorites" })}
          icon={<Star className="size-4" />}
          label="Favorites"
          badge={favorites.size > 0 ? favorites.size : undefined}
          shortcut="2"
        />
        <SidebarLink
          active={isInst}
          onClick={() => setView({ kind: "installed" })}
          icon={<Download className="size-4" />}
          label="Installed"
          badge={installed.size > 0 ? installed.size : undefined}
          shortcut="3"
        />
        <SidebarLink
          active={isSettings}
          onClick={() => setView({ kind: "settings" })}
          icon={<Settings className="size-4" />}
          label="Settings"
          shortcut="4"
        />

        <div className="mt-4 mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </div>
        {CATEGORIES.map((cat) => {
          const active = isGrid && selectedCategoryId === cat.id
          return (
            <SidebarLink
              key={cat.id}
              active={active}
              onClick={() => setSelectedCategory(cat.id)}
              icon={<CategoryIcon name={cat.icon} className="size-4" />}
              label={cat.name}
              badge={categoryCounts[cat.id]}
            />
          )
        })}
      </div>

      <div className="border-t p-2">
        <SidebarLink
          onClick={() => setHelpOpen(true)}
          icon={<HelpCircle className="size-4" />}
          label="Keyboard Shortcuts"
          shortcut="?"
        />
      </div>
    </aside>
  )
}

function SidebarLink({
  active,
  onClick,
  icon,
  label,
  badge,
  shortcut,
}: {
  active?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
  shortcut?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group/sidebar-link flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      {badge !== undefined && (
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {badge}
        </span>
      )}
      {shortcut && (
        <kbd className="hidden text-[9px] text-muted-foreground/60 group-hover/sidebar-link:inline">
          {shortcut}
        </kbd>
      )}
    </button>
  )
}
