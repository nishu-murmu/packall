import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchBar() {
  const { searchQuery, setSearchQuery, searchFocused, setSearchFocused } =
    useAppState()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (searchFocused) {
      inputRef.current?.focus()
    }
  }, [searchFocused])

  return (
    <div className="relative flex items-center gap-2">
      <div
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-xl border bg-surface-glass px-3 transition-all duration-200 md:w-72",
          searchFocused
            ? "border-primary/50 ring-[3px] ring-primary/15 shadow-lg shadow-primary/10"
            : "border-input/60 hover:border-input"
        )}
      >
        <Search className={cn(
          "size-4 shrink-0 transition-colors",
          searchFocused ? "text-primary" : "text-muted-foreground/60"
        )} />
        <Input
          ref={inputRef}
          id="search-input"
          type="text"
          placeholder="Search software... (press /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="h-7 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent placeholder:text-muted-foreground/40"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("")
              inputRef.current?.focus()
            }}
            className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
