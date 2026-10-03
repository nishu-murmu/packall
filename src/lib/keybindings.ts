export const KEYBINDINGS: {
  key: string
  action: string
  description: string
  mode?: string
}[] = [
  { key: "/", action: "focusSearch", description: "Focus global search" },
  { key: "Space", action: "toggleQueue", description: "Toggle item in selection queue" },
  { key: "j", action: "moveDown", description: "Move selection down" },
  { key: "k", action: "moveUp", description: "Move selection up" },
  { key: "h", action: "moveLeft", description: "Move selection left" },
  { key: "l", action: "moveRight", description: "Move selection right" },
  { key: "a", action: "selectAll", description: "Select / deselect everything visible" },
  { key: "i", action: "installQueue", description: "Install selected items" },
  { key: "u", action: "updateQueue", description: "Update selected items" },
  { key: "x", action: "removeQueue", description: "Remove selected items" },
  { key: "c", action: "clearQueue", description: "Clear all selected items" },
  { key: "Esc", action: "goBack", description: "Close highlight / go back" },
  { key: "?", action: "toggleHelp", description: "Open keybindings help" },
  { key: "Enter", action: "openDetail", description: "Open selected app details" },
  { key: "g g", action: "jumpTop", description: "Jump to first item" },
  { key: "G", action: "jumpBottom", description: "Jump to last item" },
  { key: "s", action: "toggleSidebar", description: "Toggle sidebar collapse" },
  { key: "1", action: "gotoGrid", description: "Go to category grid" },
  { key: "3", action: "gotoInstalled", description: "Go to installed" },
  { key: "4", action: "gotoSystem", description: "Go to system package manager" },
]
