import type { SoftwareEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { METHOD_LABELS, METHOD_COLORS } from "@/lib/install-methods"
import { Star, Check, CheckSquare, Square, Tag } from "lucide-react"

export function SoftwareCard({
  software,
  selected,
  isFavorite,
  isInstalled,
  isQueued,
  showCategory,
  onClick,
  onToggleQueue,
}: {
  software: SoftwareEntry
  selected: boolean
  isFavorite: boolean
  isInstalled: boolean
  isQueued?: boolean
  showCategory?: boolean
  onClick: () => void
  onToggleQueue?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-card p-4 transition-all duration-150 select-none",
        isQueued
          ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
          : selected
          ? "border-primary ring-2 ring-ring/50"
          : "border-border hover:border-primary/50 hover:shadow-sm hover:translate-y-[-1px]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Quick select checkbox button */}
          {onToggleQueue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleQueue()
              }}
              title={isQueued ? "Remove from selection queue" : "Add to selection queue"}
              className="mt-0.5 text-muted-foreground transition-colors hover:text-primary focus:outline-none"
            >
              {isQueued ? (
                <CheckSquare className="size-4.5 text-primary fill-primary/10" />
              ) : (
                <Square className="size-4.5 opacity-60 group-hover:opacity-100" />
              )}
            </button>
          )}

          {/* Logo / App Avatar */}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary ring-1 ring-primary/20">
            {software.name.charAt(0)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold">{software.name}</h3>
              {isInstalled && (
                <Check className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
              )}
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {software.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showCategory && (
            <span className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border">
              <Tag className="size-2.5" />
              {software.category}
            </span>
          )}
          {isFavorite && (
            <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {software.install.slice(0, 4).map((opt) => (
          <span
            key={opt.method}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-medium",
              METHOD_COLORS[opt.method] || "bg-muted text-muted-foreground"
            )}
          >
            {METHOD_LABELS[opt.method] || opt.method}
          </span>
        ))}
        {software.install.length > 4 && (
          <span className="text-[10px] text-muted-foreground">
            +{software.install.length - 4}
          </span>
        )}
      </div>
    </div>
  )
}
