import * as React from "react"
import type { SoftwareEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { METHOD_LABELS, METHOD_COLORS } from "@/lib/install-methods"
import { Star, Check, CheckSquare, Square, ExternalLink, Download, ArrowRight } from "lucide-react"
import { CATEGORY_MAP } from "@/lib/categories"

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
  isFavorite,
  isInstalled,
  isQueued,
  isHighlighted,
  onSelect,
  onToggleQueue,
  onToggleFavorite,
}: {
  software: SoftwareEntry
  isFavorite: boolean
  isInstalled: boolean
  isQueued?: boolean
  isHighlighted?: boolean
  onSelect?: () => void
  onToggleQueue?: () => void
  onToggleFavorite?: () => void
}) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const [tooltipPos, setTooltipPos] = React.useState<"above" | "below">("below")
  const cardRef = React.useRef<HTMLDivElement>(null)
  const category = CATEGORY_MAP[software.category]
  const tooltipTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        setTooltipPos(spaceBelow < 280 ? "above" : "below")
      }
      setShowTooltip(true)
    }, 400) // slight delay for intentional hover
  }

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
    setShowTooltip(false)
  }

  React.useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect?.()
    }
  }

  return (
    <div
      ref={cardRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main card */}
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        data-highlighted={isHighlighted ? "true" : undefined}
        className={cn(
          "card-glow relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 transition-all duration-300 select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
          isQueued
            ? "card-selected border-primary/50 bg-primary/8"
            : "border-border/60 bg-card hover:-translate-y-1",
          isHighlighted && !isQueued && "ring-1 ring-primary/30 bg-primary/5"
        )}
      >
        {/* Checkbox top-left (reveal on hover) */}
        {onToggleQueue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleQueue()
            }}
            title={isQueued ? "Remove from queue" : "Add to queue"}
            className={cn(
              "cursor-pointer absolute top-2.5 left-2.5 z-10 transition-all duration-200",
              isQueued
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "hover:scale-110"
            )}
          >
            {isQueued ? (
              <CheckSquare className="size-4 text-primary fill-primary/20" />
            ) : (
              <Square className="size-4 text-muted-foreground/60 hover:text-primary" />
            )}
          </button>
        )}

        {/* Favorite top-right */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={cn(
              "cursor-pointer absolute top-2.5 right-2.5 z-10 transition-all duration-200",
              isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              "hover:scale-125"
            )}
          >
            <Star
              className={cn(
                "size-3.5 transition-colors duration-200",
                isFavorite ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_oklch(0.8_0.15_85/40%)]" : "text-muted-foreground/50 hover:text-amber-400"
              )}
            />
          </button>
        )}

        {/* App icon */}
        <div className="relative">
          <AppIcon
            id={software.id}
            name={software.name}
            className="size-14 transition-transform duration-300 group-hover:scale-105"
          />
          {/* Installed indicator as a green ring on the icon */}
          {isInstalled && (
            <div className="absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-2 ring-card">
              <Check className="size-2.5 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* App name */}
        <span className="text-xs font-semibold text-center leading-tight line-clamp-2 text-foreground w-full px-1">
          {software.name}
        </span>

        {/* Category pill */}
        {category && (
          <span className="text-[10px] text-muted-foreground/70 font-medium">
            {category.name}
          </span>
        )}
      </div>

      {/* Hover Info Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            "absolute z-50 w-80 rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/20 p-5 tooltip-reveal",
            tooltipPos === "below" ? "top-full mt-2 left-1/2 -translate-x-1/2" : "bottom-full mb-2 left-1/2 -translate-x-1/2"
          )}
          onMouseEnter={() => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
            setShowTooltip(true)
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Tooltip header */}
          <div className="flex items-start gap-3 mb-3">
            <AppIcon id={software.id} name={software.name} className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm text-popover-foreground">{software.name}</h3>
                {isInstalled && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <Check className="size-2.5" /> Installed
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{software.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 mb-3">
            {software.description}
          </p>

          {/* Tags */}
          {software.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {software.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[10px] rounded-full bg-muted/80 px-2.5 py-0.5 text-muted-foreground font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Install methods */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {software.install.slice(0, 5).map((opt) => (
              <span
                key={opt.method}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                  METHOD_COLORS[opt.method] || "bg-muted text-muted-foreground"
                )}
              >
                {METHOD_LABELS[opt.method] || opt.method}
              </span>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 pt-3 border-t border-border/40">
            {onToggleQueue && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleQueue()
                }}
                className={cn(
                  "cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 flex-1 justify-center",
                  isQueued
                    ? "bg-primary/15 text-primary hover:bg-primary/25"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                )}
              >
                <Download className="size-3.5" />
                {isQueued ? "In queue" : "Add to queue"}
              </button>
            )}
            {software.homepage && (
              <a
                href={software.homepage}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
              >
                <ExternalLink className="size-3" />
                Website
              </a>
            )}
          </div>

          {/* License footer */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/50">
            <span>License: {software.license}</span>
            <span className="flex items-center gap-0.5">
              <ArrowRight className="size-2.5" /> Click card to select
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
