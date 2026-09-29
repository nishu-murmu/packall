import * as React from "react"
import { useAppState, useFilteredSoftware } from "./app-state"
import type { View } from "./types"

export function useKeybindings() {
  const state = useAppState()
  const filtered = useFilteredSoftware()

  const {
    view,
    selectedIndex,
    searchFocused,
    helpOpen,
    inspectSoftwareId,
    setInspectSoftwareId,
    setView,
    setSelectedIndex,
    setSidebarOpen,
    setHelpOpen,
    setSearchFocused,
    setSearchQuery,
    goBack,
    toggleFavorite,
    toggleInstalled,
  } = state

  const keyBuffer = React.useRef<string>("")
  const bufferTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushBuffer = React.useCallback(() => {
    keyBuffer.current = ""
    if (bufferTimeout.current) {
      clearTimeout(bufferTimeout.current)
      bufferTimeout.current = null
    }
  }, [])

  const moveSelection = React.useCallback(
    (delta: number) => {
      const max = filtered.length - 1
      if (max < 0) return
      setSelectedIndex(Math.min(Math.max(0, selectedIndex + delta), max))
    },
    [filtered.length, selectedIndex, setSelectedIndex]
  )



  const handleKey = React.useCallback(
    (e: KeyboardEvent) => {
      if (searchFocused) {
        if (e.key === "Escape") {
          setSearchFocused(false)
          ;(document.getElementById("search-input") as HTMLInputElement)?.blur()
        }
        return
      }

      if (helpOpen) {
        if (e.key === "Escape" || e.key === "?") {
          e.preventDefault()
          setHelpOpen(false)
        }
        return
      }



      const key = e.key

      if (bufferTimeout.current) {
        clearTimeout(bufferTimeout.current)
      }
      bufferTimeout.current = setTimeout(flushBuffer, 800)

      if (/^[0-9]$/.test(key)) {
        keyBuffer.current += key
        e.preventDefault()
        return
      }

      const count = parseInt(keyBuffer.current || "1", 10)
      keyBuffer.current += key

      switch (key) {
        case "j":
          e.preventDefault()
          moveSelection(count)
          flushBuffer()
          break
        case "k":
          e.preventDefault()
          moveSelection(-count)
          flushBuffer()
          break

        case "g":
          if (keyBuffer.current.endsWith("gg")) {
            e.preventDefault()
            setSelectedIndex(0)
            flushBuffer()
          }
          break
        case "G":
          e.preventDefault()
          setSelectedIndex(filtered.length - 1)
          flushBuffer()
          break
        case "Enter":
          e.preventDefault()
          if (filtered[selectedIndex]) {
            // Enter opens the slide-over drawer for the highlighted app
            setInspectSoftwareId(filtered[selectedIndex].id)
          }
          flushBuffer()
          break
        case "Escape":
        case "Backspace":
          e.preventDefault()
          if (inspectSoftwareId) {
            setInspectSoftwareId(null)
          } else if (view.kind === "detail") {
            goBack()
          } else {
            setSearchQuery("")
          }
          flushBuffer()
          break
        case "/":
          e.preventDefault()
          setSearchFocused(true)
          flushBuffer()
          break
        case "f":
          e.preventDefault()
          if (filtered[selectedIndex]) {
            toggleFavorite(filtered[selectedIndex].id)
          }
          flushBuffer()
          break
        case "i":
          e.preventDefault()
          if (filtered[selectedIndex]) {
            toggleInstalled(filtered[selectedIndex].id)
          }
          flushBuffer()
          break
        case "?":
          e.preventDefault()
          setHelpOpen(true)
          flushBuffer()
          break
        case "s":
          e.preventDefault()
          setSidebarOpen(!state.sidebarOpen)
          flushBuffer()
          break
        case "Tab":
          e.preventDefault()
          {
            const views: View[] = [
              { kind: "grid" },
              { kind: "favorites" },
              { kind: "installed" },
              { kind: "settings" },
            ]
            const currentIdx = views.findIndex(
              (v) => v.kind === view.kind
            )
            const nextIdx = (currentIdx + 1) % views.length
            setView(views[nextIdx])
          }
          flushBuffer()
          break
        case "x":
        case " ":
          e.preventDefault()
          if (filtered[selectedIndex]) {
            state.toggleQueueItem(filtered[selectedIndex].id)
          }
          flushBuffer()
          break
        case "1":
          e.preventDefault()
          setView({ kind: "grid" })
          flushBuffer()
          break
        case "2":
          e.preventDefault()
          setView({ kind: "favorites" })
          flushBuffer()
          break
        case "3":
          e.preventDefault()
          setView({ kind: "installed" })
          flushBuffer()
          break
        case "4":
          e.preventDefault()
          setView({ kind: "system" })
          flushBuffer()
          break
        case "5":
          e.preventDefault()
          setView({ kind: "settings" })
          flushBuffer()
          break
        default:
          flushBuffer()
          break
      }
    },
    [
      searchFocused,
      helpOpen,
      view,
      filtered,
      selectedIndex,
      state.sidebarOpen,
      moveSelection,
      setSelectedIndex,
      setView,
      setSearchQuery,
      setSearchFocused,
      setHelpOpen,
      setSidebarOpen,
      goBack,
      toggleFavorite,
      toggleInstalled,
      flushBuffer,
    ]
  )

  React.useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  return { filtered }
}
