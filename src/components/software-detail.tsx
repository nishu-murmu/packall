import { useAppState } from "@/lib/app-state"
import { SOFTWARE_MAP } from "@/lib/software"
import { CATEGORY_MAP } from "@/lib/categories"
import { METHOD_LABELS, METHOD_COLORS, METHOD_DESCRIPTIONS } from "@/lib/install-methods"
import { openExternalUrl } from "@/lib/open-url"
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
  Tag,
  Plus,
  Trash2,
  Play,
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
      <div className="flex items-center justify-between border-b px-6 py-3">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="size-4" />
          Back
          <kbd className="ml-1 text-[10px] text-muted-foreground">Esc</kbd>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant={isQueued ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleQueueItem(software.id)}
            className="gap-1.5"
          >
            {isQueued ? (
              <>
                <Check className="size-3.5 text-primary" />
                In Selection Queue
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
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Uninstall
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickInstall}
              className="gap-1.5"
            >
              <Play className="size-3.5" />
              Install Now
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary ring-1 ring-primary/20">
            {software.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {software.name}
              </h1>
              {isInst && (
                <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400">
                  <Check className="size-3" /> Installed
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {software.tagline}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Tag className="size-3" /> {category?.name ?? software.category}
              </Badge>
              <Badge variant="outline">{software.license}</Badge>
              {software.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-muted-foreground"
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
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="max-w-2xl">
          <h3 className="mb-2 text-sm font-semibold">About</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {software.description}
          </p>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenHomepage}
              className="gap-2"
            >
              <ExternalLink className="size-4" />
              Visit Homepage
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="max-w-2xl">
          <h3 className="mb-3 text-sm font-semibold">
            Installation Methods & Package Managers
          </h3>
          <div className="space-y-3">
            {software.install.map((opt) => (
              <div
                key={opt.method}
                className="rounded-lg border bg-card p-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-xs font-medium",
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
                  >
                    Copy
                  </Button>
                </div>
                <pre className="mt-2 overflow-x-auto rounded bg-muted/70 px-3 py-2 text-xs font-mono text-foreground">
                  {opt.command}
                </pre>
                {opt.notes && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {opt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Heart className="size-3.5" />
          <span>
            Press <kbd className="rounded bg-muted px-1">f</kbd> to{" "}
            {isFav ? "remove from" : "add to"} favorites ·{" "}
            <kbd className="rounded bg-muted px-1">i</kbd> to toggle installed status ·{" "}
            <kbd className="rounded bg-muted px-1">Esc</kbd> to go back
          </span>
        </div>
      </div>
    </div>
  )
}
