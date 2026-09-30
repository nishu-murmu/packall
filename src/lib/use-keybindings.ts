import * as React from "react"
import { useAppState, useFilteredSoftware } from "./app-state"

/**
 * Grid-aware keybindings for Almanac.
 *
 * Supported keys:
 *   /       — Focus global search
 *   Space   — Toggle selected item in queue
 *   j / k   — Move selection down / up (1 row = COLS items)
 *   h / l   — Move selection left / right
 *   c       — Clear all selected items
 *   Esc     — Close highlight / drawer / go back
 *   ?       — Open keybindings help overlay
 *   Enter   — Open selected app detail drawer
 *   g g     — Jump to first item
 *   G       — Jump to last item
 *   s       — Toggle sidebar
 *   1-5     — Navigate to views
 */

/** The number of columns in the grid — must match the CSS grid-cols-* on md breakpoint */
const GRID_COLS = 4

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
    clearQueue,
    toggleQueueItem,
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

  const clampIndex = React.useCallback(
    (idx: number) => {
      const max = filtered.length - 1
      if (max < 0) return 0
      return Math.min(Math.max(0, idx), max)
    },
    [filtered.length]
  )

  const handleKey = React.useCallback(
    (e: KeyboardEvent) => {
      // Don't hijack typing in inputs / textareas
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable

      // When search is focused, only handle Escape to blur
      if (searchFocused) {
        if (e.key === "Escape") {
          e.preventDefault()
          setSearchFocused(false)
          ;(document.getElementById("search-input") as HTMLInputElement)?.blur()
        }
        return
      }

      // When help overlay is open, only handle Escape and ? to close
      if (helpOpen) {
        if (e.key === "Escape" || e.key === "?") {
          e.preventDefault()
          setHelpOpen(false)
        }
        return
      }

      // Don't handle keys when typing in other inputs
      if (isInput) return

      const key = e.key

      // Buffer management for multi-key sequences (like gg)
      if (bufferTimeout.current) {
        clearTimeout(bufferTimeout.current)
      }
      bufferTimeout.current = setTimeout(flushBuffer, 600)

      // Handle number prefix for repeated motions
      if (/^[0-9]$/.test(key) && key !== "1" && key !== "3" && key !== "4" && key !== "5") {
        keyBuffer.current += key
        e.preventDefault()
        return
      }

      const count = parseInt(keyBuffer.current || "1", 10)
      keyBuffer.current += key

      switch (key) {
        // === Navigation ===
        case "j":
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(clampIndex(selectedIndex + GRID_COLS * count))
          flushBuffer()
          break

        case "k":
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(clampIndex(selectedIndex - GRID_COLS * count))
          flushBuffer()
          break

        case "l":
        case "ArrowRight":
          e.preventDefault()
          setSelectedIndex(clampIndex(selectedIndex + count))
          flushBuffer()
          break

        case "h":
        case "ArrowLeft":
          e.preventDefault()
          setSelectedIndex(clampIndex(selectedIndex - count))
          flushBuffer()
          break

        // === Jump ===
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

        // === Actions ===
        case " ": // Space — toggle queue
          e.preventDefault()
          if (filtered[selectedIndex]) {
            toggleQueueItem(filtered[selectedIndex].id)
          }
          flushBuffer()
          break

        case "c": // Clear all selected
          e.preventDefault()
          clearQueue()
          flushBuffer()
          break

        case "Enter":
          e.preventDefault()
          if (filtered[selectedIndex]) {
            setInspectSoftwareId(filtered[selectedIndex].id)
          }
          flushBuffer()
          break

        case "Escape":
          e.preventDefault()
          if (inspectSoftwareId) {
            setInspectSoftwareId(null)
          } else if (view.kind === "detail") {
            goBack()
          } else {
            // Clear search if active, otherwise just deselect
            setSearchQuery("")
            setSelectedIndex(0)
          }
          flushBuffer()
          break

        case "/":
          e.preventDefault()
          setSearchFocused(true)
          setTimeout(() => {
            ;(document.getElementById("search-input") as HTMLInputElement)?.focus()
          }, 0)
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

        // === View shortcuts ===
        case "1":
          e.preventDefault()
          setView({ kind: "grid" })
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
      inspectSoftwareId,
      state.sidebarOpen,
      clampIndex,
      setSelectedIndex,
      setView,
      setSearchQuery,
      setSearchFocused,
      setHelpOpen,
      setSidebarOpen,
      setInspectSoftwareId,
      goBack,
      clearQueue,
      toggleQueueItem,
      flushBuffer,
    ]
  )

  React.useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  return { filtered }
}
