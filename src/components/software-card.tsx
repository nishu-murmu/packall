import * as React from "react"
import type { SoftwareEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, CheckSquare, Square } from "lucide-react"
import { CATEGORY_MAP } from "@/lib/categories"
import { useAppState } from "@/lib/app-state"

// Detect which icon format is available for a given software id
// Try svg first, then png, webp, avif, jpg
const ICON_EXTENSIONS = ["svg", "png", "webp", "avif", "jpg"]

function AppIcon({ id, name, className }: { id: string; name: string; className?: string }) {
  const [iconSrc, setIconSrc] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    // Reset state when id changes
    setIconSrc(null)
    setFailed(false)

    // Try extensions in order
    let cancelled = false
    let extIndex = 0

    function tryNext() {
      if (cancelled) return
      if (extIndex >= ICON_EXTENSIONS.length) {
        setFailed(true)
        return
      }
      const src = `/icons/${id}.${ICON_EXTENSIONS[extIndex]}`
      const img = new Image()
      img.onload = () => {
        if (!cancelled) setIconSrc(src)
      }
      img.onerror = () => {
        extIndex++
        tryNext()
      }
      img.src = src
    }

    tryNext()
    return () => { cancelled = true }
  }, [id])

  if (iconSrc && !failed) {
    return (
      <img
        src={iconSrc}
        alt={name}
        className={cn("object-contain", className)}
      />
    )
  }

  // Fallback avatar with gradient background and first letter
  const gradients = [
    "from-violet-500/30 to-blue-500/30 text-violet-400",
    "from-blue-500/30 to-cyan-500/30 text-blue-400",
    "from-emerald-500/30 to-teal-500/30 text-emerald-400",
    "from-amber-500/30 to-orange-500/30 text-amber-400",
    "from-rose-500/30 to-pink-500/30 text-rose-400",
    "from-cyan-500/30 to-sky-500/30 text-cyan-400",
    "from-indigo-500/30 to-purple-500/30 text-indigo-400",
    "from-teal-500/30 to-emerald-500/30 text-teal-400",
  ]
  const gradientClass = gradients[name.charCodeAt(0) % gradients.length]

  return (
    <div className={cn(
      "flex items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-xl select-none",
      gradientClass,
      className
    )}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export { AppIcon }

export function SoftwareCard({
  software,
  isInstalled,
  isQueued,
  isHighlighted,
  onSelect,
  onToggleQueue,
}: {
  software: SoftwareEntry
  isInstalled: boolean
  isQueued?: boolean
  isHighlighted?: boolean
  onSelect?: () => void
  onToggleQueue?: () => void
}) {
  const { distroInfo, packageManagers } = useAppState()
  const category = CATEGORY_MAP[software.category]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect?.()
    }
  }

  const isSupported = React.useMemo(() => {
    if (!distroInfo) return true;
    const availableSystemManagers = packageManagers.filter((m) => m.available).map(m => m.id.toLowerCase());
    return software.install.some(opt => 
      availableSystemManagers.includes(opt.method) || 
      (distroInfo.id.includes('ubuntu') && opt.method === 'deb') || 
      (distroInfo.id.includes('debian') && opt.method === 'deb') || 
      (distroInfo.id.includes('arch') && opt.method === 'aur') ||
      (distroInfo.id.includes('fedora') && opt.method === 'dnf')
    );
  }, [distroInfo, packageManagers, software.install])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      data-highlighted={isHighlighted ? "true" : undefined}
      className={cn(
        "group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-200 select-none cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        isQueued
          ? "border-primary/50 bg-primary/10 shadow-sm"
          : "border-border/60 bg-card hover:bg-muted/40 hover:border-border",
        isHighlighted && !isQueued && "ring-1 ring-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onToggleQueue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleQueue()
            }}
            title={isQueued ? "Remove from queue" : "Add to queue"}
            className="shrink-0 transition-transform duration-200 hover:scale-110 cursor-pointer p-0.5"
          >
            {isQueued ? (
              <CheckSquare className="size-5 text-primary" />
            ) : (
              <Square className="size-5 text-muted-foreground/30 group-hover:text-primary/70" />
            )}
          </button>
        )}

        <AppIcon
          id={software.id}
          name={software.name}
          className="size-9 shrink-0 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold truncate text-foreground leading-tight">
            {software.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            {category?.name || "App"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        {!isSupported && (
          <div title="Not natively supported on your current distribution" className="flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive/80 group-hover:bg-destructive/20">
            <AlertCircle className="size-3.5" />
          </div>
        )}
        {isInstalled && (
          <div title="Installed" className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20">
            <Check className="size-3.5" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  )
}
