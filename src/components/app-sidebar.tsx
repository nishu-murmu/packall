import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { cn } from "@/lib/utils"
import {
  Star,
  Download,
  HelpCircle,
  PanelLeftClose,
  Cpu,
  Info,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { DistroSelect } from "@/components/distro-select"

export function AppSidebar() {
  const {
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    installed,
    setHelpOpen,
    isLoadingSystem,
    refreshSystemPackages,
    systemPackages,
  } = useAppState()

  const isGrid = view.kind === "grid" || view.kind === "detail"
  const isInst = view.kind === "installed"
  const isSystem = view.kind === "system"
  const isAbout = view.kind === "about"

  return (
    <aside
      className={cn(
        "flex h-svh flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl text-sidebar-foreground transition-all duration-300 select-none",
        sidebarOpen ? "w-60" : "w-0 overflow-hidden"
      )}
    >
      {/* Brand + collapse */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 p-3">
        <div className="flex items-center gap-2.5">
          <Logo className="size-8" />
          <span className="text-base font-extrabold tracking-tight">Packall</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setSidebarOpen(false)}
          aria-label="Collapse sidebar"
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

        <NavLabel className="mt-4">Filter</NavLabel>
        <DistroSelect />

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

      </div>

      {/* Bottom: app links */}
      <div className="space-y-0.5 border-t border-border/50 p-2">
        <SidebarLink
          active={isAbout}
          onClick={() => setView({ kind: "about" })}
          icon={<Info className="size-4" />}
          label="About"
        />
        <SidebarLink
          onClick={() => setHelpOpen(true)}
          icon={<HelpCircle className="size-4" />}
          label="CLI & Keybindings"
          shortcut="?"
        />
        <a
          href="https://github.com/nishu-murmu/packall"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
        >
          <ExternalLink className="size-4 text-muted-foreground" />
          <span className="flex-1 text-left">Star on GitHub</span>
          <Star className="size-3 text-amber-500" />
        </a>
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
