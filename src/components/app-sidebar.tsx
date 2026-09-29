import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { cn } from "@/lib/utils"
import {
  Star,
  Download,
  Settings,
  HelpCircle,
  PanelLeftClose,
  Package,
  Cpu,
  CheckSquare,
  Heart,
  Info,
  ExternalLink,
  RefreshCw,
  Trash2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const {
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    installed,
    selectedQueue,
    openBatchAction,
    setHelpOpen,
    clearQueue,
    isLoadingSystem,
    refreshSystemPackages,
    systemPackages,
  } = useAppState()

  const isGrid = view.kind === "grid" || view.kind === "detail"
  const isInst = view.kind === "installed"
  const isSystem = view.kind === "system"
  const isSettings = view.kind === "settings"
  const isAbout = view.kind === "about"

  return (
    <aside
      className={cn(
        "flex h-svh flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl text-sidebar-foreground transition-all duration-300 select-none",
        sidebarOpen ? "w-60" : "w-0 overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 p-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20">
            <Package className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight gradient-text">Almanac</span>
            <span className="text-[10px] text-muted-foreground">Software Manager</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setSidebarOpen(false)}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <NavLabel>Browse</NavLabel>
        <SidebarLink
          active={isGrid}
          onClick={() => setView({ kind: "grid" })}
          icon={<Sparkles className="size-4" />}
          label="All Software"
          badge={SOFTWARE.length}
          shortcut="1"
        />

        <SidebarLink
          active={isInst}
          onClick={() => setView({ kind: "installed" })}
          icon={<Download className="size-4 text-emerald-400" />}
          label="Installed"
          badge={installed.size > 0 ? installed.size : undefined}
          shortcut="3"
        />
        <SidebarLink
          active={isSystem}
          onClick={() => setView({ kind: "system" })}
          icon={<Cpu className="size-4 text-purple-400" />}
          label="System Packages"
          badge={systemPackages.length > 0 ? systemPackages.length : undefined}
          shortcut="4"
        />

        {/* Selected queue section */}
        {selectedQueue.size > 0 && (
          <>
            <NavLabel className="mt-4">Selection Queue</NavLabel>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CheckSquare className="size-3.5" />
                  {selectedQueue.size} selected
                </span>
                <button
                  onClick={clearQueue}
                  className="cursor-pointer text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <QueueBtn
                  onClick={() => openBatchAction("install")}
                  icon={<Download className="size-3" />}
                  label="Install"
                  color="primary"
                />
                <QueueBtn
                  onClick={() => openBatchAction("update")}
                  icon={<RefreshCw className="size-3" />}
                  label="Update"
                  color="secondary"
                />
                <QueueBtn
                  onClick={() => openBatchAction("remove")}
                  icon={<Trash2 className="size-3" />}
                  label="Remove"
                  color="danger"
                />
              </div>
            </div>
          </>
        )}

        {/* System actions */}
        <NavLabel className="mt-4">Actions</NavLabel>
        <button
          onClick={refreshSystemPackages}
          disabled={isLoadingSystem}
          className={cn(
            "cursor-pointer flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("size-4", isLoadingSystem && "animate-spin")} />
          <span className="flex-1 text-left">
            {isLoadingSystem ? "Scanning..." : "Scan System"}
          </span>
        </button>

        {/* Settings & About */}
        <NavLabel className="mt-4">App</NavLabel>
        <SidebarLink
          active={isSettings}
          onClick={() => setView({ kind: "settings" })}
          icon={<Settings className="size-4" />}
          label="Settings"
          shortcut="5"
        />
        <SidebarLink
          active={isAbout}
          onClick={() => setView({ kind: "about" })}
          icon={<Info className="size-4" />}
          label="About & Donate"
        />
        <SidebarLink
          onClick={() => setHelpOpen(true)}
          icon={<HelpCircle className="size-4" />}
          label="CLI & Keybindings"
          shortcut="?"
        />
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-3 space-y-1">
        <a
          href="https://github.com/nishu-murmu/almanac"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground transition-all duration-200"
        >
          <ExternalLink className="size-3.5" />
          <span className="flex-1 text-left">Star on GitHub</span>
          <Star className="size-3 text-amber-400" />
        </a>
        <button
          onClick={() => setView({ kind: "about" })}
          className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-rose-400 transition-all duration-200"
        >
          <Heart className="size-3.5 text-rose-400" />
          <span className="flex-1 text-left">Sponsor / Donate</span>
        </button>
      </div>
    </aside>
  )
}

function NavLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50", className)}>
      {children}
    </div>
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
        "cursor-pointer group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200",
        active
          ? "bg-primary/10 text-primary shadow-xs"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
      )}
    >
      <span className={cn("shrink-0 transition-transform duration-200 group-hover:scale-110", active ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="flex-1 truncate text-left">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-mono tabular-nums",
            active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
      {shortcut && (
        <kbd className="hidden sm:inline-block rounded border border-border/40 bg-muted/60 px-1 text-[10px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </button>
  )
}

function QueueBtn({
  onClick,
  icon,
  label,
  color,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  color: "primary" | "secondary" | "danger"
}) {
  const colorClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
    danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer flex items-center justify-center gap-1 rounded-lg py-1 px-1.5 text-[10px] font-semibold transition-all",
        colorClasses[color]
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
