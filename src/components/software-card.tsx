import * as React from "react"
import type { SoftwareEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, CheckSquare, Square } from "lucide-react"
import { isSupportedOnHost } from "@/lib/actions"
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
  index,
  isInstalled,
  isQueued,
  isHighlighted,
  onSelect,
  onToggleQueue,
}: {
  software: SoftwareEntry
  index?: number
  isInstalled: boolean
  isQueued?: boolean
  isHighlighted?: boolean
  onSelect?: () => void
  onToggleQueue?: () => void
}) {
  const { distroInfo, packageManagers } = useAppState()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect?.()
    }
  }

  const isSupported = React.useMemo(
    () =>
      isSupportedOnHost(software, {
        distro: distroInfo,
        managers: packageManagers,
        systemPackages: [],
      }),
    [distroInfo, packageManagers, software]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      data-card-index={index}
      data-highlighted={isHighlighted ? "true" : undefined}
      data-queued={isQueued ? "true" : undefined}
      aria-label={software.name}
      className={cn(
        "sw-card group flex min-h-[4.25rem] items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-xs",
        "cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {onToggleQueue && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleQueue()
          }}
          aria-label={isQueued ? `Remove ${software.name} from selection` : `Select ${software.name}`}
          aria-pressed={isQueued}
          className="shrink-0 rounded-md p-0.5 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isQueued ? (
            <CheckSquare className="size-5 text-primary" />
          ) : (
            <Square className="size-5 text-muted-foreground/60 group-hover:text-primary" />
          )}
        </button>
      )}

      <AppIcon id={software.id} name={software.name} className="size-10 shrink-0" />

      <div className="min-w-0 flex-1">
        <span className="line-clamp-2 break-words text-sm font-semibold leading-snug text-foreground">
          {software.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {software.tagline}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        {isInstalled && (
          <span
            title="Installed"
            className="flex size-5 items-center justify-center rounded-full bg-success/15 text-success"
          >
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
        {!isSupported && (
          <span
            title="No automatic install method for your distribution"
            className="flex size-5 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
            <AlertCircle className="size-3" />
          </span>
        )}
      </div>
    </div>
  )
}
