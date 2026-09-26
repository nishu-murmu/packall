import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { KEYBINDINGS } from "@/lib/keybindings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"

export function HelpOverlay() {
  const { helpOpen, setHelpOpen } = useAppState()

  const groups = React.useMemo(() => {
    const nav = KEYBINDINGS.filter((k) =>
      ["j", "k", "h", "l", "g g", "G", "Enter", "Tab"].includes(k.key)
    )
    const actions = KEYBINDINGS.filter((k) =>
      ["f", "i", "/", "Esc", "s"].includes(k.key)
    )
    const views = KEYBINDINGS.filter((k) =>
      ["1", "2", "3", "4", "?"].includes(k.key)
    )
    return { nav, actions, views }
  }, [])

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate the entire app without touching your mouse. These bindings
            are inspired by Neovim and Vim.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <ShortcutGroup title="Navigation" bindings={groups.nav} />
          <ShortcutGroup title="Actions" bindings={groups.actions} />
          <ShortcutGroup title="Views" bindings={groups.views} />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Number Prefix</h4>
            <p className="text-xs text-muted-foreground">
              Type a number before a motion to repeat it. For example{" "}
              <Kbd>5</Kbd> <Kbd>j</Kbd> moves down 5 items.
            </p>
          </div>
        </div>

        <Separator />

        <p className="text-xs text-muted-foreground">
          Press <Kbd>?</Kbd> or <Kbd>Esc</Kbd> to close this dialog.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutGroup({
  title,
  bindings,
}: {
  title: string
  bindings: typeof KEYBINDINGS
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="space-y-1.5">
        {bindings.map((b) => (
          <div key={b.key} className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {b.description}
            </span>
            <div className="flex items-center gap-1">
              {b.key.split(" ").map((part, i) => (
                <Kbd key={i}>{part}</Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
