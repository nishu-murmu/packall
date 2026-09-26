import type { SoftwareEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { METHOD_LABELS, METHOD_COLORS } from "@/lib/install-methods"
import { Star, Check } from "lucide-react"

export function SoftwareCard({
  software,
  selected,
  isFavorite,
  isInstalled,
  onClick,
}: {
  software: SoftwareEntry
  selected: boolean
  isFavorite: boolean
  isInstalled: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-lg border bg-card p-4 transition-all duration-150",
        selected
          ? "border-primary ring-2 ring-ring/50"
          : "border-border hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-bold text-muted-foreground">
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
        {isFavorite && (
          <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {software.install.slice(0, 4).map((opt) => (
          <span
            key={opt.method}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-medium",
              METHOD_COLORS[opt.method]
            )}
          >
            {METHOD_LABELS[opt.method]}
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
