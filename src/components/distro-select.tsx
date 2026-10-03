import { useAppState } from "@/lib/app-state"
import { DISTRO_FILTERS, familyFromDistro } from "@/lib/actions"
import type { DistroFilter } from "@/lib/types"

/** Filters the catalogue to apps available on a distribution. Lives in the sidebar. */
export function DistroSelect() {
  const { distroFilter, setDistroFilter, distroInfo } = useAppState()
  const detected = familyFromDistro(distroInfo)
  const detectedFilter = detected === "other" ? null : detected

  return (
    <label className="block px-1">
      <span className="mb-1 block px-1 text-[11px] font-medium text-muted-foreground">
        Distribution
      </span>
      <select
        value={distroFilter}
        onChange={(e) => setDistroFilter(e.target.value as DistroFilter)}
        aria-label="Filter by distribution"
        className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {DISTRO_FILTERS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
            {f.id === detectedFilter ? " (this system)" : ""}
          </option>
        ))}
      </select>
    </label>
  )
}
