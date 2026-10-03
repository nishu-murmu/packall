import type { Batch, Job, JobEvent } from "./types"

const MAX_LOG_LINES = 400

function updateJob(batch: Batch, jobId: string, fn: (job: Job) => Job): Batch {
  return { ...batch, jobs: batch.jobs.map((j) => (j.id === jobId ? fn(j) : j)) }
}

/** Fold one worker event into a batch. Pure so it can be unit tested. */
export function applyJobEvent(batch: Batch, ev: JobEvent): Batch {
  switch (ev.kind) {
    case "started":
      return updateJob(batch, ev.job_id, (j) => ({ ...j, status: "running", percent: null }))

    case "output": {
      if (!ev.line) return batch
      const line = ev.line
      return updateJob(batch, ev.job_id, (j) => ({
        ...j,
        log: [...j.log, line].slice(-MAX_LOG_LINES),
        percent: typeof ev.percent === "number" ? ev.percent : j.percent,
      }))
    }

    case "finished":
      return updateJob(batch, ev.job_id, (j) => {
        if (ev.success) return { ...j, status: "success", percent: 100 }
        if (ev.cancelled) return { ...j, status: "cancelled", percent: null }
        const lastLine = [...j.log].reverse().find((l) => l.trim() && !l.startsWith("$ "))
        return { ...j, status: "failed", percent: null, error: lastLine ?? "Command failed" }
      })

    case "batch_done":
      return { ...batch, done: true }

    default:
      return batch
  }
}

/** 0-100 overall progress: finished jobs plus the running job's fraction. */
export function batchProgress(batch: Batch): number {
  const runnable = batch.jobs.filter((j) => j.status !== "skipped")
  if (runnable.length === 0) return 100
  let done = 0
  for (const j of runnable) {
    if (j.status === "success" || j.status === "failed" || j.status === "cancelled") done += 1
    else if (j.status === "running") done += (j.percent ?? 0) / 100 * 0.9
  }
  return Math.min(100, Math.round((done / runnable.length) * 100))
}

export function batchCounts(batch: Batch) {
  const count = (s: Job["status"]) => batch.jobs.filter((j) => j.status === s).length
  return {
    total: batch.jobs.length,
    success: count("success"),
    failed: count("failed"),
    cancelled: count("cancelled"),
    skipped: count("skipped"),
    running: count("running"),
    queued: count("queued"),
  }
}
