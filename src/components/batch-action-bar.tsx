import { useAppState } from "@/lib/app-state"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Kbd } from "@/components/ui/kbd"
import { Download, RefreshCw, Trash2, X, CheckSquare } from "lucide-react"

/**
 * Floating action bar. One click starts the job in the background; progress
 * shows up in the jobs dock. Removal asks for confirmation first.
 */
export function BatchActionBar() {
  const {
    selectedQueue,
    clearQueue,
    requestBatch,
    runBatch,
    removeConfirmOpen,
    setRemoveConfirmOpen,
  } = useAppState()

  const count = selectedQueue.size

  return (
    <>
      {count > 0 && (
        <div
          role="toolbar"
          aria-label="Actions for selected software"
          className="fixed bottom-10 left-1/2 z-40 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
            <div className="flex items-center gap-2.5 border-r border-border pr-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                <CheckSquare className="size-4 text-primary" />
              </div>
              <div className="leading-tight">
                <span className="block text-sm font-bold">{count} selected</span>
                <button
                  onClick={clearQueue}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Clear <Kbd>c</Kbd>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => void requestBatch("install")} className="h-9 gap-1.5 rounded-xl px-4 font-semibold">
                <Download className="size-4" />
                Install
              </Button>
              <Button
                variant="secondary"
                onClick={() => void requestBatch("update")}
                className="h-9 gap-1.5 rounded-xl px-4 font-semibold"
              >
                <RefreshCw className="size-4" />
                Update
              </Button>
              <Button
                variant="outline"
                onClick={() => void requestBatch("remove")}
                className="h-9 gap-1.5 rounded-xl px-4 font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={clearQueue}
                aria-label="Clear selection"
                className="ml-1 size-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {count} {count === 1 ? "package" : "packages"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The selected software will be uninstalled in the background. You may be asked for your
              password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void runBatch("remove")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
