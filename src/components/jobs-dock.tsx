import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { batchCounts, batchProgress } from "@/lib/jobs-reducer"
import type { Batch, Job } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, ChevronDown, ChevronUp, MinusCircle, X } from "lucide-react"

const VERB = { install: "Installing", update: "Updating", remove: "Removing" } as const
const DONE = { install: "Installed", update: "Updated", remove: "Removed" } as const

/**
 * Compact progress card, bottom right. One line of text, one progress bar.
 * Expand for per-package status and logs. Sits above the details drawer.
 */
export function JobsDock() {
  const { batches, cancelBatch, dismissBatch } = useAppState()
  if (batches.length === 0) return null

  return (
    <div className="fixed bottom-10 right-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {batches.slice(0, 3).map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          onCancel={() => void cancelBatch(batch.id)}
          onDismiss={() => dismissBatch(batch.id)}
        />
      ))}
    </div>
  )
}

function BatchCard({ batch, onCancel, onDismiss }: { batch: Batch; onCancel: () => void; onDismiss: () => void }) {
  const [open, setOpen] = React.useState(false)
  const percent = batchProgress(batch)
  const c = batchCounts(batch)
  const active = !batch.done && c.running + c.queued > 0

  // Auto-dismiss a clean run so there is nothing to click away. Runs with a
  // failure or cancellation stay until dismissed so the reason stays readable.
  React.useEffect(() => {
    if (!batch.done || open) return
    if (c.failed > 0 || c.cancelled > 0) return
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [batch.done, open, c.failed, c.cancelled, onDismiss])
  const work = c.total - c.skipped
  const current = batch.jobs.find((j) => j.status === "running")

  let title: string
  if (active) title = `${VERB[batch.action]} ${current?.name ?? "…"}${work > 1 ? ` · ${c.success + c.failed + c.cancelled + 1}/${work}` : ""}`
  else if (c.failed > 0) title = `${c.failed} failed${c.success ? `, ${c.success} done` : ""}`
  else if (c.cancelled > 0) title = "Cancelled"
  else if (work === 0) title = "Nothing to do"
  else title = `${DONE[batch.action]} ${work > 1 ? `${c.success} apps` : (batch.jobs.find((j) => j.status === "success")?.name ?? "")}`

  const failed = !active && c.failed > 0

  return (
    <section
      aria-label={`${batch.action} progress`}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <div className="flex items-center gap-2 px-3 pt-2.5">
        {!active && (failed ? <AlertCircle className="size-4 shrink-0 text-destructive" /> : <Check className="size-4 shrink-0 text-success" strokeWidth={3} />)}
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        {active && <span className="text-xs tabular-nums text-muted-foreground">{percent}%</span>}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Hide details" : "Show details"}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
        {active ? (
          <button onClick={onCancel} className="text-xs font-medium text-muted-foreground hover:text-destructive">
            Cancel
          </button>
        ) : (
          <button onClick={onDismiss} aria-label="Dismiss" className="rounded p-0.5 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="px-3 pb-2.5 pt-2">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", active && percent === 0 && "progress-indeterminate")}
        >
          {!(active && percent === 0) && (
            <div
              className={cn("h-full rounded-full transition-all duration-300", failed ? "bg-destructive" : "bg-primary")}
              style={{ width: `${active ? percent : failed ? 100 : 100}%` }}
            />
          )}
        </div>
      </div>

      {open && (
        <ul className="max-h-56 divide-y divide-border overflow-y-auto border-t border-border text-sm">
          {batch.jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </ul>
      )}
    </section>
  )
}

function JobRow({ job }: { job: Job }) {
  const [log, setLog] = React.useState(false)
  const last = [...job.log].reverse().find((l) => l.trim() && !l.startsWith("$ "))
  const note =
    job.status === "failed" || job.status === "skipped"
      ? job.error
      : job.status === "running"
        ? last
        : job.status === "success"
          ? job.method && `via ${job.method}`
          : undefined
  return (
    <li className="px-3 py-1.5">
      <button
        type="button"
        disabled={job.log.length === 0}
        onClick={() => setLog((o) => !o)}
        className="flex w-full items-center gap-2 text-left disabled:cursor-default"
      >
        <span className="w-4 shrink-0">
          {job.status === "success" && <Check className="size-3.5 text-success" strokeWidth={3} />}
          {job.status === "failed" && <AlertCircle className="size-3.5 text-destructive" />}
          {(job.status === "skipped" || job.status === "cancelled") && <MinusCircle className="size-3.5 text-muted-foreground" />}
          {job.status === "running" && <span className="block size-2 animate-pulse rounded-full bg-primary" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{job.name}</span>
          {note && (
            <span className={cn("block truncate text-xs", job.status === "failed" ? "text-destructive" : "text-muted-foreground")}>
              {note}
            </span>
          )}
        </span>
      </button>
      {log && (
        <pre className="mt-1.5 max-h-32 overflow-auto rounded-md bg-zinc-950 p-2 font-mono text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap break-all">
          {job.log.join("\n")}
        </pre>
      )}
    </li>
  )
}
