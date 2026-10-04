import { useAppState } from "@/lib/app-state"
import { DISTRO_FILTERS, familyFromDistro } from "@/lib/actions"
import type { DistroFilter } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Filters the catalogue to apps available on a distribution. Lives in the sidebar. */
export function DistroSelect() {
  const { distroFilter, setDistroFilter, distroInfo } = useAppState()
  const detected = familyFromDistro(distroInfo)
  const detectedFilter = detected === "other" ? null : detected

  return (
    <div className="px-1">
      <span className="mb-1 block px-1 text-[11px] font-medium text-muted-foreground">
        Distribution
      </span>
      <Select value={distroFilter} onValueChange={(v) => setDistroFilter(v as DistroFilter)}>
        <SelectTrigger
          size="sm"
          aria-label="Filter by distribution"
          className="h-9 w-full rounded-lg bg-card text-sm font-medium"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DISTRO_FILTERS.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.label}
              {f.id === detectedFilter ? " · this system" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
