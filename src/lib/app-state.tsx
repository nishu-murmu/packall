import * as React from "react"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import type { CategoryId, View } from "@/lib/types"

interface AppState {
  view: View
  selectedCategoryId: CategoryId
  searchQuery: string
  selectedIndex: number
  favorites: Set<string>
  installed: Set<string>
  sidebarOpen: boolean
  helpOpen: boolean
  searchFocused: boolean

  setView: (view: View) => void
  setSelectedCategory: (id: CategoryId) => void
  setSearchQuery: (q: string) => void
  setSelectedIndex: (i: number) => void
  toggleFavorite: (id: string) => void
  toggleInstalled: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  setHelpOpen: (open: boolean) => void
  setSearchFocused: (f: boolean) => void
  goBack: () => void
}

const AppStateContext = React.createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = React.useState<View>({ kind: "grid" })
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<CategoryId>("browsers")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set())
  const [installed, setInstalled] = React.useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [viewStack, setViewStack] = React.useState<View[]>([{ kind: "grid" }])

  const setViewWrapper = React.useCallback((v: View) => {
    setViewStack((prev) => [...prev, v])
    setView(v)
    setSelectedIndex(0)
  }, [])

  const goBack = React.useCallback(() => {
    setViewStack((prev) => {
      if (prev.length <= 1) {
        setView({ kind: "grid" })
        return [{ kind: "grid" }]
      }
      const newStack = prev.slice(0, -1)
      setView(newStack[newStack.length - 1])
      return newStack
    })
  }, [])

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleInstalled = React.useCallback((id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const setSelectedCategory = React.useCallback((id: CategoryId) => {
    setSelectedCategoryId(id)
    setViewWrapper({ kind: "grid" })
  }, [setViewWrapper])

  const value: AppState = {
    view,
    selectedCategoryId,
    searchQuery,
    selectedIndex,
    favorites,
    installed,
    sidebarOpen,
    helpOpen,
    searchFocused,
    setView: setViewWrapper,
    setSelectedCategory,
    setSearchQuery,
    setSelectedIndex,
    toggleFavorite,
    toggleInstalled,
    setSidebarOpen,
    setHelpOpen,
    setSearchFocused,
    goBack,
  }

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext)
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider")
  return ctx
}

export function useFilteredSoftware() {
  const { view, selectedCategoryId, searchQuery, favorites, installed } =
    useAppState()

  return React.useMemo(() => {
    let list = SOFTWARE

    if (view.kind === "favorites") {
      list = list.filter((s) => favorites.has(s.id))
    } else if (view.kind === "installed") {
      list = list.filter((s) => installed.has(s.id))
    } else {
      list = list.filter((s) => s.category === selectedCategoryId)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return list
  }, [view, selectedCategoryId, searchQuery, favorites, installed])
}

export function useCategoryCount(id: CategoryId) {
  return React.useMemo(
    () => SOFTWARE.filter((s) => s.category === id).length,
    [id]
  )
}

export { CATEGORIES }
