export const KEYBINDINGS: {
  key: string
  action: string
  description: string
  mode?: string
}[] = [
  { key: "j", action: "moveDown", description: "Move selection down" },
  { key: "k", action: "moveUp", description: "Move selection up" },
  { key: "h", action: "prevCategory", description: "Previous category" },
  { key: "l", action: "nextCategory", description: "Next category" },
  { key: "g g", action: "jumpTop", description: "Jump to first item" },
  { key: "G", action: "jumpBottom", description: "Jump to last item" },
  { key: "Enter", action: "openDetail", description: "Open selected app details" },
  { key: "Esc", action: "goBack", description: "Go back / close panel" },
  { key: "/", action: "focusSearch", description: "Focus search bar" },
  { key: "f", action: "toggleFavorite", description: "Toggle favorite on selected" },
  { key: "i", action: "install", description: "Install selected app" },
  { key: "?", action: "toggleHelp", description: "Toggle this help overlay" },
  { key: "s", action: "toggleSidebar", description: "Toggle sidebar collapse" },
  { key: "n", action: "countPrefix", description: "Number prefix (e.g. 5j = down 5)", mode: "count" },
  { key: "Tab", action: "nextView", description: "Cycle to next view" },
  { key: "1", action: "gotoGrid", description: "Go to category grid" },
  { key: "2", action: "gotoFavorites", description: "Go to favorites" },
  { key: "3", action: "gotoInstalled", description: "Go to installed" },
  { key: "4", action: "gotoSettings", description: "Go to settings" },
]
