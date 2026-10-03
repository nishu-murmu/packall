import * as React from "react"
import { useAppState, useNavigableSoftware } from "./app-state"

/**
 * Grid-aware keybindings for Packall.
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
 *   i/u/x   — Install / update / remove everything in the queue
 *   a       — Select / deselect everything visible
 *   1-5     — Navigate to views
 */

/** Used only when the layout cannot be measured (tests, hidden window). */
const FALLBACK_COLS = 4

/**
 * Find the card directly above/below `index` by measuring the rendered grid.
 * The grid is responsive (auto-fill) and split into category sections of
 * different lengths, so a fixed column count cannot work.
 */
function verticalNeighbor(index: number, dir: 1 | -1, max: number): number {
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-card-index]"))
  const current = cards.find((c) => Number(c.dataset.cardIndex) === index)
  const curRect = current?.getBoundingClientRect()
  if (!current || !curRect || (curRect.width === 0 && curRect.height === 0)) {
    return Math.min(Math.max(0, index + dir * FALLBACK_COLS), max)
  }

  const curX = curRect.left + curRect.width / 2
  const candidates = cards
    .map((el) => ({ el, rect: el.getBoundingClientRect(), idx: Number(el.dataset.cardIndex) }))
    .filter(({ rect }) => (dir === 1 ? rect.top > curRect.top + 4 : rect.top < curRect.top - 4))
  if (candidates.length === 0) return index

  // Nearest row first, then nearest column within that row.
  const rowTop =
    dir === 1
      ? Math.min(...candidates.map((c) => c.rect.top))
      : Math.max(...candidates.map((c) => c.rect.top))
  const row = candidates.filter((c) => Math.abs(c.rect.top - rowTop) < 4)
  row.sort(
    (a, b) =>
      Math.abs(a.rect.left + a.rect.width / 2 - curX) -
      Math.abs(b.rect.left + b.rect.width / 2 - curX)
  )
  return row[0].idx
}

function moveVertical(index: number, dir: 1 | -1, count: number, max: number): number {
  let idx = index
  for (let i = 0; i < count; i++) {
    const next = verticalNeighbor(idx, dir, max)
    if (next === idx) break
    idx = next
  }
  return idx
}

export function useKeybindings() {
  const state = useAppState()
  const filtered = useNavigableSoftware()

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
    selectAllVisible,
    requestBatch,
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
          setSelectedIndex(moveVertical(clampIndex(selectedIndex), 1, count, filtered.length - 1))
          flushBuffer()
          break

        case "k":
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(moveVertical(clampIndex(selectedIndex), -1, count, filtered.length - 1))
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

        case "a": // Select / deselect everything visible
          e.preventDefault()
          selectAllVisible(filtered.map((sw) => sw.id))
          flushBuffer()
          break

        case "i":
          e.preventDefault()
          void requestBatch("install")
          flushBuffer()
          break

        case "u":
          e.preventDefault()
          void requestBatch("update")
          flushBuffer()
          break

        case "x":
          e.preventDefault()
          void requestBatch("remove")
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
      selectAllVisible,
      requestBatch,
      flushBuffer,
    ]
  )

  React.useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  return { filtered }
}
