import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { batchCounts, batchProgress } from "@/lib/jobs-reducer"
import type { Batch, Job } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Download,
  Loader2,
  MinusCircle,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react"

const ACTION_LABEL = { install: "Installing", update: "Updating", remove: "Removing" } as const
const ACTION_DONE = { install: "Installed", update: "Updated", remove: "Removed" } as const

/**
 * Bottom-right dock showing background jobs with an overall progress bar and a
 * per-package status list. Stays visible while you keep browsing.
 */
export function JobsDock() {
  const { batches, jobsPanelOpen, setJobsPanelOpen, cancelBatch, dismissBatch } = useAppState()

  if (batches.length === 0) return null

  return (
    <div className="fixed bottom-10 right-4 z-50 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {batches.map((batch, i) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          expanded={jobsPanelOpen && i === 0}
          onToggle={() => setJobsPanelOpen(!(jobsPanelOpen && i === 0))}
          onCancel={() => void cancelBatch(batch.id)}
          onDismiss={() => dismissBatch(batch.id)}
        />
      ))}
    </div>
  )
}

function BatchCard({
  batch,
  expanded,
  onToggle,
  onCancel,
  onDismiss,
}: {
  batch: Batch
  expanded: boolean
  onToggle: () => void
  onCancel: () => void
  onDismiss: () => void
}) {
  const percent = batchProgress(batch)
  const counts = batchCounts(batch)
  const hasRunning = counts.running > 0 || counts.queued > 0
  const active = !batch.done && hasRunning
  const Icon = batch.action === "install" ? Download : batch.action === "update" ? RefreshCw : Trash2

  const title = active
    ? `${ACTION_LABEL[batch.action]} ${counts.total - counts.skipped} package${counts.total - counts.skipped === 1 ? "" : "s"}`
    : counts.failed > 0
      ? `${counts.failed} failed`
      : counts.cancelled > 0
        ? "Cancelled"
        : `${ACTION_DONE[batch.action]} ${counts.success}`

  return (
    <section
      aria-label={`${batch.action} progress`}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
    >
      <header className="flex items-center gap-2.5 px-3.5 pt-3">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            active ? "bg-primary/15 text-primary" : counts.failed ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
          )}
        >
          {active ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {active ? currentLabel(batch) : summary(counts)}
          </p>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onToggle} aria-label={expanded ? "Collapse details" : "Expand details"}>
          {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </Button>
        {active ? (
          <Button variant="ghost" size="xs" onClick={onCancel} className="text-xs text-muted-foreground hover:text-destructive">
            Cancel
          </Button>
        ) : (
          <Button variant="ghost" size="icon-xs" onClick={onDismiss} aria-label="Dismiss">
            <X className="size-4" />
          </Button>
        )}
      </header>

      <div className="px-3.5 pb-3 pt-2.5">
        <ProgressBar percent={percent} indeterminate={active && percent === 0} failed={!active && counts.failed > 0} />
        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>
            {counts.success + counts.failed + counts.cancelled} / {counts.total - counts.skipped}
          </span>
          <span>{percent}%</span>
        </div>
      </div>

      {expanded && (
        <ul className="max-h-64 divide-y divide-border overflow-y-auto border-t border-border">
          {batch.jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ProgressBar({ percent, indeterminate, failed }: { percent: number; indeterminate: boolean; failed: boolean }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : percent}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        indeterminate && "progress-indeterminate"
      )}
    >
      {!indeterminate && (
        <div
          className={cn("h-full rounded-full transition-all duration-300", failed ? "bg-destructive" : "bg-primary")}
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  )
}

function JobRow({ job }: { job: Job }) {
  const [open, setOpen] = React.useState(false)
  const lastLine = [...job.log].reverse().find((l) => l.trim() && !l.startsWith("$ "))
  const expandable = job.log.length > 0
  return (
    <li className="px-3.5 py-2">
      <button
        type="button"
        disabled={!expandable}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left disabled:cursor-default"
      >
        <StatusIcon status={job.status} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{job.name}</span>
          <span
            className={cn(
              "block truncate text-xs",
              job.status === "failed" ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {job.status === "running"
              ? (lastLine ?? "Starting…")
              : (job.error ?? (job.method ? `via ${job.method}` : statusText(job.status)))}
          </span>
        </span>
        {job.status === "running" && job.percent !== null && (
          <span className="text-xs tabular-nums text-muted-foreground">{Math.round(job.percent)}%</span>
        )}
      </button>
      {open && (
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap break-all">
          {job.log.join("\n")}
        </pre>
      )}
    </li>
  )
}

function StatusIcon({ status }: { status: Job["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
    case "success":
      return <Check className="size-4 shrink-0 text-success" strokeWidth={3} />
    case "failed":
      return <AlertCircle className="size-4 shrink-0 text-destructive" />
    case "skipped":
    case "cancelled":
      return <MinusCircle className="size-4 shrink-0 text-muted-foreground" />
    default:
      return <Circle className="size-4 shrink-0 text-muted-foreground/50" />
  }
}

function statusText(status: Job["status"]) {
  return { queued: "Waiting", running: "Running", success: "Done", failed: "Failed", cancelled: "Cancelled", skipped: "Skipped" }[status]
}

function currentLabel(batch: Batch) {
  const running = batch.jobs.find((j) => j.status === "running")
  if (running) return running.name
  const next = batch.jobs.find((j) => j.status === "queued")
  return next ? `Next: ${next.name}` : "Finishing…"
}

function summary(c: ReturnType<typeof batchCounts>) {
  const parts = []
  if (c.success) parts.push(`${c.success} done`)
  if (c.failed) parts.push(`${c.failed} failed`)
  if (c.skipped) parts.push(`${c.skipped} skipped`)
  if (c.cancelled) parts.push(`${c.cancelled} cancelled`)
  return parts.join(" · ") || "Nothing to do"
}
