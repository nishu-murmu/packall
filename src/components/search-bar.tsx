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
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 transition-[color,box-shadow] md:w-64",
          searchFocused && "border-ring ring-[3px] ring-ring/50"
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="search-input"
          type="text"
          placeholder="Search... (press /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="h-7 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("")
              inputRef.current?.focus()
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
