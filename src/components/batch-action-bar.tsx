import { useAppState } from "@/lib/app-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw, Trash2, X, CheckSquare } from "lucide-react"

export function BatchActionBar() {
  const { selectedQueue, clearQueue, openBatchAction } = useAppState()

  if (selectedQueue.size === 0) return null

  const count = selectedQueue.size

  return (
    <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-3 rounded-full border border-border/80 bg-background/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 pr-2 border-r">
          <CheckSquare className="size-4 text-primary" />
          <span className="text-xs font-semibold">
            {count} {count === 1 ? "package" : "packages"} selected
          </span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono">
            Queue
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="default"
            onClick={() => openBatchAction("install")}
            className="h-8 gap-1.5 rounded-full px-3 text-xs shadow-xs"
          >
            <Download className="size-3.5" />
            Install All Selected
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => openBatchAction("update")}
            className="h-8 gap-1.5 rounded-full px-3 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Update All Selected
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => openBatchAction("remove")}
            className="h-8 gap-1.5 rounded-full px-3 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <Trash2 className="size-3.5" />
            Remove Selected
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            onClick={clearQueue}
            title="Clear Selection"
            className="size-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
