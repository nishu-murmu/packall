import { useAppState } from "@/lib/app-state"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Trash2, X, CheckSquare } from "lucide-react"

export function BatchActionBar() {
  const { selectedQueue, clearQueue, openBatchAction } = useAppState()

  if (selectedQueue.size === 0) return null

  const count = selectedQueue.size

  return (
    <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/90 px-5 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 pr-3 border-r border-border/40">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <CheckSquare className="size-3.5 text-primary" />
          </div>
          <div>
            <span className="text-xs font-bold block">
              {count} {count === 1 ? "package" : "packages"}
            </span>
            <span className="text-[10px] text-muted-foreground">selected</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="default"
            onClick={() => openBatchAction("install")}
            className="h-8 gap-1.5 rounded-xl px-3.5 text-xs shadow-lg shadow-primary/20 font-semibold"
          >
            <Download className="size-3.5" />
            Install All
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => openBatchAction("update")}
            className="h-8 gap-1.5 rounded-xl px-3 text-xs font-semibold"
          >
            <RefreshCw className="size-3.5" />
            Update
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => openBatchAction("remove")}
            className="h-8 gap-1.5 rounded-xl px-3 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            onClick={clearQueue}
            title="Clear Selection"
            className="size-7 rounded-full text-muted-foreground hover:text-foreground ml-1"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
