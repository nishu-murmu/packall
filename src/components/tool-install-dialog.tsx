import { useAppState } from "@/lib/app-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package } from "lucide-react"

const INFO = {
  flatpak: {
    name: "Flatpak",
    blurb:
      "Flatpak is a universal package system. Some of the apps you picked are only available through it, but it is not installed yet.",
  },
  snap: {
    name: "Snap",
    blurb:
      "Snap is a universal package system from Canonical. Some of the apps you picked are only available through it, but it is not installed yet.",
  },
} as const

/**
 * Shown when a selection can only be installed via a Flatpak/Snap runtime that
 * the system lacks. Offers to install the runtime first, then continue.
 */
export function ToolInstallDialog() {
  const { toolPrompt, finishToolPrompt } = useAppState()
  const info = toolPrompt ? INFO[toolPrompt.tool] : null

  return (
    <Dialog open={!!toolPrompt} onOpenChange={(open) => !open && finishToolPrompt(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-4 text-primary" /> Install {info?.name}?
          </DialogTitle>
          <DialogDescription>
            {info?.blurb}
            {toolPrompt && toolPrompt.count > 0 && (
              <>
                {" "}
                It is needed for {toolPrompt.count} selected app
                {toolPrompt.count === 1 ? "" : "s"}.
              </>
            )}{" "}
            Packall can install {info?.name} for you and then continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => finishToolPrompt(false)}>
            Skip these apps
          </Button>
          <Button onClick={() => finishToolPrompt(true)}>Install {info?.name}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
