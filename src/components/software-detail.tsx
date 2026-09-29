import { useAppState } from "@/lib/app-state"
import { SOFTWARE_MAP } from "@/lib/software"
import { CATEGORY_MAP } from "@/lib/categories"
import { METHOD_LABELS, METHOD_COLORS, METHOD_DESCRIPTIONS } from "@/lib/install-methods"
import { openExternalUrl } from "@/lib/open-url"
import { AppIcon } from "@/components/software-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  Check,
  ExternalLink,
  ArrowLeft,
  Heart,
  Download,
  Plus,
  Trash2,
  Play,
  Copy,
  Terminal,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SoftwareDetail() {
  const {
    view,
    goBack,
    favorites,
    installed,
    selectedQueue,
    toggleFavorite,
    toggleInstalled,
    toggleQueueItem,
    runPackageAction,
  } = useAppState()

  if (view.kind !== "detail") return null

  const software = SOFTWARE_MAP[view.id]
  if (!software) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">App not found.</p>
      </div>
    )
  }

  const category = CATEGORY_MAP[software.category]
  const isFav = favorites.has(software.id)
  const isInst = installed.has(software.id)
  const isQueued = selectedQueue.has(software.id)

  const copyCommand = (cmd: string) => {
    navigator.clipboard?.writeText(cmd)
    toast.success("Copied to clipboard", { description: cmd })
  }

  const handleOpenHomepage = (e: React.MouseEvent) => {
    e.preventDefault()
    openExternalUrl(software.homepage)
  }

  const handleQuickInstall = async () => {
    toast.info(`Starting installation for ${software.name}...`)
    await runPackageAction("install", [software.id])
  }

  const handleQuickRemove = async () => {
    toast.info(`Removing ${software.name}...`)
    await runPackageAction("remove", [software.id])
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-3 bg-background/40 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5 rounded-xl">
          <ArrowLeft className="size-4" />
          Back
          <kbd className="ml-1 text-[10px] text-muted-foreground/50 font-mono">Esc</kbd>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant={isQueued ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleQueueItem(software.id)}
            className="gap-1.5 rounded-xl"
          >
            {isQueued ? (
              <>
                <Check className="size-3.5 text-primary" />
                In Queue
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                Add to Queue
              </>
            )}
          </Button>

          {isInst ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleQuickRemove}
              className="gap-1.5 rounded-xl"
            >
              <Trash2 className="size-3.5" />
              Uninstall
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickInstall}
              className="gap-1.5 rounded-xl shadow-lg shadow-primary/20"
            >
              <Play className="size-3.5" />
              Install Now
            </Button>
          )}
        </div>
      </div>

      <div className="px-8 py-8 max-w-3xl">
        {/* Hero section */}
        <div className="flex items-start gap-5">
          <div className="relative">
            <AppIcon
              id={software.id}
              name={software.name}
              className="size-20 rounded-2xl shadow-xl shadow-black/10"
            />
            {isInst && (
              <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-3 ring-background">
                <Check className="size-3 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {software.name}
              </h1>
              {isInst && (
                <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-500 rounded-full px-3 font-semibold">
                  <Check className="size-3" /> Installed
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {software.tagline}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {category && (
                <Badge variant="outline" className="gap-1.5 rounded-full px-3 border-border/50">
                  <span className={cn("size-2 rounded-full", `cat-dot-${software.category}`)} />
                  {category.name}
                </Badge>
              )}
              <Badge variant="outline" className="rounded-full px-3 border-border/50 font-mono text-xs">
                {software.license}
              </Badge>
              {software.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-muted-foreground/60 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isFav ? "default" : "outline"}
              size="icon"
              title={isFav ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggleFavorite(software.id)}
              className="rounded-xl"
            >
              <Star
                className={cn("size-4", isFav && "fill-current text-amber-400")}
              />
            </Button>
            <Button
              variant={isInst ? "default" : "outline"}
              size="icon"
              title={isInst ? "Mark as not installed" : "Mark as installed"}
              onClick={() => toggleInstalled(software.id)}
              className="rounded-xl"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-8 bg-border/40" />

        {/* About section */}
        <div>
          <h3 className="mb-2.5 text-sm font-bold flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            About
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {software.description}
          </p>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenHomepage}
              className="gap-2 rounded-xl border-border/50"
            >
              <ExternalLink className="size-4" />
              Visit Homepage
            </Button>
          </div>
        </div>

        <Separator className="my-8 bg-border/40" />

        {/* Installation Methods */}
        <div>
          <h3 className="mb-4 text-sm font-bold flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            Installation Methods
          </h3>
          <div className="space-y-3">
            {software.install.map((opt) => (
              <div
                key={opt.method}
                className="rounded-xl border border-border/40 bg-card/50 p-4 shadow-xs transition-all duration-200 hover:border-border/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                        METHOD_COLORS[opt.method]
                      )}
                    >
                      {METHOD_LABELS[opt.method]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {METHOD_DESCRIPTIONS[opt.method]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => copyCommand(opt.command)}
                    className="gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="size-3" />
                    Copy
                  </Button>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 dark:bg-zinc-900/80 px-4 py-2.5 text-xs font-mono text-zinc-100 border border-zinc-800/50 selection:bg-primary selection:text-primary-foreground">
                  {opt.command}
                </pre>
                {opt.notes && (
                  <p className="mt-2 text-[11px] text-muted-foreground/60">
                    {opt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-border/40" />

        {/* Keyboard hints */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground/50 pb-4">
          <Heart className="size-3.5" />
          <span>
            Press <kbd className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">f</kbd> to{" "}
            {isFav ? "remove from" : "add to"} favorites ·{" "}
            <kbd className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">i</kbd> to toggle installed ·{" "}
            <kbd className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to go back
          </span>
        </div>
      </div>
    </div>
  )
}
