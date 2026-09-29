import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { SOFTWARE_MAP } from "@/lib/software"
import { CATEGORY_MAP } from "@/lib/categories"
import { METHOD_LABELS, METHOD_COLORS, METHOD_DESCRIPTIONS } from "@/lib/install-methods"
import { openExternalUrl } from "@/lib/open-url"
import { AppIcon } from "@/components/software-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { InstallMethod, InstallOption, StepExecutionResult } from "@/lib/types"
import {
  Star,
  Check,
  ExternalLink,
  X,
  Plus,
  Trash2,
  Play,
  Copy,
  Terminal,
  Globe,
  Loader2,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SoftwareDrawer() {
  const {
    inspectSoftwareId,
    setInspectSoftwareId,
    favorites,
    installed,
    selectedQueue,
    toggleFavorite,
    toggleQueueItem,
    runPackageAction,
    runMultiStepAction,
    distroInfo,
    packageManagers,
  } = useAppState()

  const software = inspectSoftwareId ? SOFTWARE_MAP[inspectSoftwareId] : null

  // Track selected installation method
  const [selectedMethod, setSelectedMethod] = React.useState<InstallMethod | null>(null)
  // Track multi-step running state
  const [isRunningMultiStep, setIsRunningMultiStep] = React.useState(false)
  const [activeStepIndex, setActiveStepIndex] = React.useState<number | null>(null)
  const [stepResults, setStepResults] = React.useState<StepExecutionResult[]>([])
  const [expandedLogStep, setExpandedLogStep] = React.useState<number | null>(null)

  // Determine intuitive default installation method based on detected distro & installed managers
  React.useEffect(() => {
    if (!software) return

    setStepResults([])
    setActiveStepIndex(null)
    setExpandedLogStep(null)

    const availableMethods = software.install.map((i) => i.method)

    if (distroInfo) {
      const pref = distroInfo.preferred_manager.toLowerCase()
      // If distro has preferred manager, check if software has exact match
      const exactMatch = availableMethods.find((m) => m === pref)
      if (exactMatch) {
        setSelectedMethod(exactMatch)
        return
      }

      // If Arch family and software offers 'aur', match with paru or yay
      if (
        (distroInfo.id.includes("arch") || pref === "paru" || pref === "yay") &&
        availableMethods.includes("aur")
      ) {
        setSelectedMethod("aur")
        return
      }

      // If Debian/Ubuntu and software offers 'deb' or 'apt'
      if (
        (distroInfo.id.includes("ubuntu") || distroInfo.id.includes("debian")) &&
        availableMethods.includes("apt")
      ) {
        setSelectedMethod("apt")
        return
      }

      // Check against any installed package manager on the host
      const hostInstalledManagerIds = packageManagers
        .filter((pm) => pm.available)
        .map((pm) => pm.id.toLowerCase())

      const matchInstalled = availableMethods.find((m) =>
        hostInstalledManagerIds.includes(m)
      )
      if (matchInstalled) {
        setSelectedMethod(matchInstalled)
        return
      }
    }

    // Fallback: Pick first available installation option
    if (software.install.length > 0) {
      setSelectedMethod(software.install[0].method)
    }
  }, [software, distroInfo, packageManagers])

  if (!software) return null

  const category = CATEGORY_MAP[software.category]
  const isFav = favorites.has(software.id)
  const isInst = installed.has(software.id)
  const isQueued = selectedQueue.has(software.id)

  const currentOption: InstallOption | undefined =
    software.install.find((i) => i.method === selectedMethod) || software.install[0]

  const hasMultiSteps = Boolean(currentOption?.steps && currentOption.steps.length > 0)

  const copyCommand = (cmd: string, label = "Command") => {
    navigator.clipboard?.writeText(cmd)
    toast.success(`${label} copied to clipboard`, { description: cmd })
  }

  const copyAllSteps = () => {
    if (!currentOption?.steps) return
    const joined = currentOption.steps.map((s) => s.command).join(" &&\n")
    navigator.clipboard?.writeText(joined)
    toast.success("All steps copied as combined shell script")
  }

  const handleOpenHomepage = (e: React.MouseEvent) => {
    e.preventDefault()
    openExternalUrl(software.homepage)
  }

  const handleQuickInstall = async () => {
    toast.info(`Starting installation for ${software.name}...`)
    await runPackageAction("install", [software.id], selectedMethod || undefined)
  }

  const handleQuickRemove = async () => {
    toast.info(`Removing ${software.name}...`)
    await runPackageAction("remove", [software.id], selectedMethod || undefined)
  }

  const handleRunMultiStep = async () => {
    if (!currentOption?.steps || currentOption.steps.length === 0) return

    setIsRunningMultiStep(true)
    setStepResults([])
    setActiveStepIndex(0)

    try {
      const res = await runMultiStepAction(currentOption.steps)
      setStepResults(res.step_results)
      if (!res.success) {
        setExpandedLogStep(res.completed_steps)
      }
    } finally {
      setIsRunningMultiStep(false)
      setActiveStepIndex(null)
    }
  }

  // Count available managers on user's system
  const availableSystemManagers = packageManagers.filter((m) => m.available)

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setInspectSoftwareId(null)}
      />

      {/* Slide-over Sheet / Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${software.name} Details`}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl sm:max-w-2xl flex-col bg-card/95 backdrop-blur-xl border-l border-border/60 shadow-2xl transition-transform duration-300 ease-out",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* Top Header / Navigation */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-5 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInspectSoftwareId(null)}
              className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
              Close
              <kbd className="ml-1 text-[10px] text-muted-foreground/60 font-mono bg-muted/50 px-1 py-0.5 rounded">
                Esc
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isFav ? "default" : "outline"}
              size="icon-sm"
              title={isFav ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggleFavorite(software.id)}
              className="rounded-xl cursor-pointer"
            >
              <Star className={cn("size-4", isFav && "fill-current text-amber-400")} />
            </Button>

            <Button
              variant={isQueued ? "secondary" : "outline"}
              size="sm"
              onClick={() => toggleQueueItem(software.id)}
              className="gap-1.5 rounded-xl cursor-pointer text-xs"
            >
              {isQueued ? (
                <>
                  <Check className="size-3.5 text-primary" />
                  In Queue
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Queue
                </>
              )}
            </Button>

            {isInst ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleQuickRemove}
                className="gap-1.5 rounded-xl cursor-pointer text-xs"
              >
                <Trash2 className="size-3.5" />
                Uninstall
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleQuickInstall}
                className="gap-1.5 rounded-xl shadow-md shadow-primary/20 cursor-pointer text-xs"
              >
                <Play className="size-3.5" />
                Install Now
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* App Header & Identity */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <AppIcon
                id={software.id}
                name={software.name}
                className="size-16 rounded-2xl shadow-lg shadow-black/20"
              />
              {isInst && (
                <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30 ring-2 ring-card">
                  <Check className="size-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {software.name}
                </h2>
                {isInst && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-medium"
                  >
                    <Check className="size-3" /> Installed
                  </Badge>
                )}
                {software.featured && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]"
                  >
                    <Sparkles className="size-2.5" /> Featured
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {software.tagline}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {category && (
                  <Badge variant="outline" className="gap-1.5 rounded-full text-[11px] border-border/50">
                    <span className={cn("size-2 rounded-full", `cat-dot-${software.category}`)} />
                    {category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="rounded-full text-[11px] border-border/50 font-mono">
                  {software.license}
                </Badge>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleOpenHomepage}
                  className="gap-1 text-muted-foreground hover:text-foreground text-[11px] h-6 px-2"
                >
                  <Globe className="size-3" />
                  Website
                  <ExternalLink className="size-2.5 opacity-60" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Distro & Package Manager Intelligence Banner */}
          {distroInfo && (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Cpu className="size-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {distroInfo.pretty_name || distroInfo.name}
                      </span>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4">
                        Auto-detected
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Distro family: <span className="capitalize font-medium">{distroInfo.id}</span>
                      {" · "}
                      Recommended tool:{" "}
                      <span className="font-semibold text-primary uppercase">
                        {distroInfo.preferred_manager}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">
                    {availableSystemManagers.length} package manager(s) detected
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {availableSystemManagers.map((m) => (
                      <span
                        key={m.id}
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-mono border",
                          m.id === distroInfo.preferred_manager
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground border-border/50"
                        )}
                        title={`${m.name} (${m.available ? "Installed" : "Missing"})`}
                      >
                        {m.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Package Manager Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                Select Package Manager / Format
              </label>
              <span className="text-[11px] text-muted-foreground">
                {software.install.length} method{software.install.length > 1 ? "s" : ""} available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {software.install.map((opt) => {
                const isSelected = opt.method === selectedMethod
                const isRecommended =
                  distroInfo &&
                  (opt.method === distroInfo.preferred_manager ||
                    (distroInfo.preferred_manager === "paru" && opt.method === "aur") ||
                    (distroInfo.preferred_manager === "yay" && opt.method === "aur"))
                const isMulti = Boolean(opt.steps && opt.steps.length > 0)

                return (
                  <button
                    key={opt.method}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(opt.method)
                      setStepResults([])
                    }}
                    className={cn(
                      "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer relative",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                        : "border-border/50 bg-card hover:bg-muted/40 hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          METHOD_COLORS[opt.method] || "bg-muted text-foreground"
                        )}
                      >
                        {METHOD_LABELS[opt.method] || opt.method}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] bg-primary/20 text-primary px-1 rounded font-semibold">
                          Best
                        </span>
                      )}
                    </div>
                    <span className="mt-1.5 text-[11px] text-muted-foreground font-medium line-clamp-1">
                      {isMulti ? `${opt.steps?.length} Setup Steps` : METHOD_DESCRIPTIONS[opt.method]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Installation Details & Multi-Step Runner */}
          {currentOption && (
            <div className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {hasMultiSteps
                      ? `Multi-Step Setup (${currentOption.steps?.length} steps)`
                      : "Installation Command"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {hasMultiSteps ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={copyAllSteps}
                      className="gap-1 text-muted-foreground hover:text-foreground text-[11px]"
                    >
                      <Copy className="size-3" />
                      Copy All Steps
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => copyCommand(currentOption.command)}
                      className="gap-1 text-muted-foreground hover:text-foreground text-[11px]"
                    >
                      <Copy className="size-3" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              {/* Multi-Step Timeline View */}
              {hasMultiSteps && currentOption.steps && (
                <div className="space-y-3">
                  <p className="text-[11px] text-muted-foreground">
                    This package requires a multi-step sequence (adding repository keys, sources, and installing dependencies).
                  </p>

                  <div className="space-y-2.5">
                    {currentOption.steps.map((step, idx) => {
                      const res = stepResults.find((r) => r.step_index === idx)
                      const isRunning = isRunningMultiStep && activeStepIndex === idx
                      const isSuccess = res ? res.success : false
                      const isFailed = res ? !res.success : false
                      const isLogOpen = expandedLogStep === idx

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "rounded-lg border p-3 transition-colors",
                            isRunning
                              ? "border-primary/60 bg-primary/5"
                              : isSuccess
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : isFailed
                              ? "border-destructive/50 bg-destructive/5"
                              : "border-border/40 bg-muted/20"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5",
                                  isRunning
                                    ? "bg-primary text-primary-foreground animate-pulse"
                                    : isSuccess
                                    ? "bg-emerald-500 text-white"
                                    : isFailed
                                    ? "bg-destructive text-destructive-foreground"
                                    : "bg-muted text-muted-foreground border border-border"
                                )}
                              >
                                {isRunning ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : isSuccess ? (
                                  <Check className="size-3" />
                                ) : isFailed ? (
                                  <X className="size-3" />
                                ) : (
                                  idx + 1
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">
                                    {step.title}
                                  </span>
                                  {isSuccess && (
                                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[9px] h-4">
                                      Done
                                    </Badge>
                                  )}
                                  {isFailed && (
                                    <Badge variant="destructive" className="text-[9px] h-4">
                                      Failed
                                    </Badge>
                                  )}
                                </div>
                                {step.description && (
                                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    {step.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => copyCommand(step.command, step.title)}
                              title="Copy this command"
                              className="text-muted-foreground hover:text-foreground shrink-0"
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>

                          <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-950 dark:bg-zinc-950 px-3 py-1.5 text-[11px] font-mono text-zinc-200 border border-zinc-800/60 selection:bg-primary selection:text-primary-foreground">
                            {step.command}
                          </pre>

                          {/* Output log toggle if step executed */}
                          {res && (
                            <div className="mt-2 pt-2 border-t border-border/30">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedLogStep(isLogOpen ? null : idx)
                                }
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                {isLogOpen ? (
                                  <ChevronUp className="size-3" />
                                ) : (
                                  <ChevronDown className="size-3" />
                                )}
                                {isSuccess ? "View Command Output" : "View Error Details"}
                              </button>

                              {isLogOpen && (
                                <pre className="mt-1.5 overflow-x-auto rounded bg-black/60 p-2 text-[10px] font-mono text-muted-foreground max-h-36 overflow-y-auto border border-border/40 whitespace-pre-wrap">
                                  {res.stdout || res.stderr || "Process completed with no output."}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Multi-step execution button */}
                  <div className="pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleRunMultiStep}
                      disabled={isRunningMultiStep}
                      className="w-full gap-2 rounded-xl shadow-md shadow-primary/20 cursor-pointer font-semibold"
                    >
                      {isRunningMultiStep ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Executing Step {((activeStepIndex ?? 0) + 1)} of {currentOption.steps.length}...
                        </>
                      ) : (
                        <>
                          <Play className="size-4" />
                          Run Multi-Step Installation ({currentOption.steps.length} steps)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Single Step Command Box */}
              {!hasMultiSteps && (
                <div className="space-y-3">
                  <pre className="overflow-x-auto rounded-lg bg-zinc-950 dark:bg-zinc-950 px-3.5 py-2.5 text-xs font-mono text-zinc-200 border border-zinc-800/60 selection:bg-primary selection:text-primary-foreground">
                    {currentOption.command}
                  </pre>

                  {currentOption.notes && (
                    <p className="text-[11px] text-muted-foreground/75">
                      💡 {currentOption.notes}
                    </p>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleQuickInstall}
                    className="w-full gap-2 rounded-xl shadow-md shadow-primary/20 cursor-pointer font-semibold"
                  >
                    <Play className="size-4" />
                    Install via {METHOD_LABELS[currentOption.method]}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* About / Description */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              About {software.name}
            </h3>
            <p className="text-xs leading-relaxed text-foreground/80">
              {software.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1">
              {software.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex h-11 shrink-0 items-center justify-between border-t border-border/50 px-5 text-[11px] text-muted-foreground/60 bg-background/50">
          <span>
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to close drawer
          </span>
          <span>
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">f</kbd> to favorite
          </span>
        </div>
      </aside>
    </>
  )
}
