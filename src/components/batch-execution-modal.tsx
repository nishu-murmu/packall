import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { SOFTWARE_MAP } from "@/lib/software"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Terminal,
  Loader2,
  X,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"

export function BatchExecutionModal() {
  const {
    batchModalOpen,
    setBatchModalOpen,
    batchAction,
    selectedQueue,
    clearQueue,
    packageManagers,
    runPackageAction,
  } = useAppState()

  const [selectedManager, setSelectedManager] = React.useState<string>("paru")
  const [copied, setCopied] = React.useState(false)
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [outputLog, setOutputLog] = React.useState<string | null>(null)
  const [executionSuccess, setExecutionSuccess] = React.useState<boolean | null>(null)

  // Auto-select first available manager or fallback
  React.useEffect(() => {
    const available = packageManagers.find((m) => m.available)
    if (available) {
      setSelectedManager(available.id)
    } else {
      setSelectedManager("paru")
    }
  }, [packageManagers])

  if (!batchModalOpen) return null

  const queuedIds = Array.from(selectedQueue)
  const queuedItems = queuedIds.map((id) => {
    const software = SOFTWARE_MAP[id]
    return {
      id,
      name: software?.name || id,
      tagline: software?.tagline || "System package",
      category: software?.category || "system",
    }
  })

  // Build the generated command line string
  const generateCommandString = () => {
    const pkgs = queuedIds.join(" ")
    switch (batchAction) {
      case "install":
        switch (selectedManager) {
          case "paru":
            return `paru -S ${pkgs} --noconfirm`
          case "yay":
            return `yay -S ${pkgs} --noconfirm`
          case "pacman":
            return `sudo pacman -S ${pkgs} --noconfirm`
          case "flatpak":
            return `flatpak install -y ${pkgs}`
          case "snap":
            return `sudo snap install ${pkgs}`
          case "apt":
            return `sudo apt install -y ${pkgs}`
          case "dnf":
            return `sudo dnf install -y ${pkgs}`
          case "brew":
            return `brew install ${pkgs}`
          default:
            return `paru -S ${pkgs}`
        }
      case "update":
        switch (selectedManager) {
          case "paru":
            return `paru -S ${pkgs} --noconfirm`
          case "yay":
            return `yay -S ${pkgs} --noconfirm`
          case "pacman":
            return `sudo pacman -S ${pkgs} --noconfirm`
          case "flatpak":
            return `flatpak update -y ${pkgs}`
          default:
            return `paru -S ${pkgs}`
        }
      case "remove":
        switch (selectedManager) {
          case "paru":
            return `paru -Rns ${pkgs} --noconfirm`
          case "yay":
            return `yay -Rns ${pkgs} --noconfirm`
          case "pacman":
            return `sudo pacman -Rns ${pkgs} --noconfirm`
          case "flatpak":
            return `flatpak uninstall -y ${pkgs}`
          case "snap":
            return `sudo snap remove ${pkgs}`
          case "apt":
            return `sudo apt remove -y ${pkgs}`
          default:
            return `sudo pacman -Rns ${pkgs}`
        }
    }
  }

  const fullCmd = generateCommandString()

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullCmd)
    setCopied(true)
    toast.success("Command copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    setOutputLog(null)
    setExecutionSuccess(null)

    try {
      const res = await runPackageAction(batchAction, queuedIds, selectedManager)
      setOutputLog(res.output || res.error || "Execution completed.")
      setExecutionSuccess(res.success)
      if (res.success) {
        clearQueue()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setOutputLog(msg)
      setExecutionSuccess(false)
    } finally {
      setIsExecuting(false)
    }
  }

  const actionTitle =
    batchAction === "install"
      ? "Batch Installation"
      : batchAction === "update"
      ? "Batch Update"
      : "Batch Removal"

  const actionIcon =
    batchAction === "install" ? (
      <Download className="size-5 text-primary" />
    ) : batchAction === "update" ? (
      <RefreshCw className="size-5 text-blue-500" />
    ) : (
      <Trash2 className="size-5 text-destructive" />
    )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
              {actionIcon}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight leading-tight">{actionTitle}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Targeting {queuedItems.length} selected package{queuedItems.length === 1 ? "" : "s"} under the hood
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setBatchModalOpen(false)}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Target Package Manager Selection */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
              Select Package Manager
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "paru", label: "Paru (AUR)", desc: "Arch Linux" },
                { id: "yay", label: "Yay (AUR)", desc: "Arch Linux" },
                { id: "pacman", label: "Pacman", desc: "Native Arch" },
                { id: "flatpak", label: "Flatpak", desc: "Sandboxed" },
                { id: "apt", label: "APT", desc: "Debian/Ubuntu" },
                { id: "snap", label: "Snap", desc: "Canonical" },
              ].map((m) => {
                const isDetected = packageManagers.some(
                  (pm) => pm.id === m.id && pm.available
                )
                const isSelected = selectedManager === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedManager(m.id)}
                    className={`cursor-pointer flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/40 shadow-sm"
                        : "border-border/60 hover:border-border bg-background/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{m.label}</span>
                    {isDetected && (
                      <span className="size-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" title="Detected on host" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Queued Packages Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Packages in Queue ({queuedItems.length})
              </label>
              <button
                onClick={clearQueue}
                className="cursor-pointer text-[11px] text-muted-foreground hover:text-destructive underline font-medium"
              >
                Clear all
              </button>
            </div>
            <ScrollArea className="h-36 rounded-xl border border-border/50 bg-muted/20 p-2.5">
              <div className="space-y-1.5">
                {queuedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-card/80 px-3 py-2 text-xs border border-border/40 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground shrink-0">{item.name}</span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {item.tagline}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md shrink-0 border-border/60">
                      {item.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Generated Shell Command */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="size-3.5 text-primary" /> Generated Terminal Command
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 gap-1.5 text-xs rounded-lg"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-zinc-950 p-3.5 text-xs font-mono text-zinc-100 border border-zinc-800/80 shadow-inner">
              <pre className="overflow-x-auto whitespace-pre-wrap break-all">{fullCmd}</pre>
            </div>
          </div>

          {/* Execution Log / Status */}
          {outputLog && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {executionSuccess ? (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <Check className="size-4" /> Execution Successful
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <ShieldAlert className="size-4" /> Execution Error
                  </span>
                )}
              </div>
              <pre className="max-h-40 overflow-y-auto rounded-xl bg-zinc-950/90 p-3 text-[11px] font-mono text-zinc-300 border border-zinc-800 whitespace-pre-wrap">
                {outputLog}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBatchModalOpen(false)}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 rounded-xl text-xs"
            >
              <Copy className="size-3.5" />
              Copy Command
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleExecute}
              disabled={isExecuting || queuedItems.length === 0}
              className="gap-1.5 min-w-[130px] rounded-xl text-xs font-semibold shadow-md shadow-primary/25"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  {actionIcon}
                  Execute Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
