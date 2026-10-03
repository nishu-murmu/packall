import { describe, expect, it } from "vitest"
import { applyJobEvent, batchCounts, batchProgress } from "@/lib/jobs-reducer"
import type { Batch, JobEvent } from "@/lib/types"

const batch = (): Batch => ({
  id: "b",
  action: "install",
  done: false,
  startedAt: 0,
  jobs: [
    { id: "a", name: "A", action: "install", status: "queued", percent: null, log: [] },
    { id: "b", name: "B", action: "install", status: "queued", percent: null, log: [] },
    { id: "c", name: "C", action: "install", status: "skipped", percent: null, log: [] },
  ],
})

const ev = (e: Partial<JobEvent>): JobEvent => ({ batch_id: "b", job_id: "a", kind: "output", ...e })

describe("applyJobEvent", () => {
  it("tracks started, output and finished", () => {
    let b = applyJobEvent(batch(), ev({ kind: "started" }))
    expect(b.jobs[0].status).toBe("running")
    b = applyJobEvent(b, ev({ line: "downloading", percent: 40 }))
    expect(b.jobs[0].percent).toBe(40)
    expect(b.jobs[0].log).toEqual(["downloading"])
    b = applyJobEvent(b, ev({ kind: "finished", success: true }))
    expect(b.jobs[0]).toMatchObject({ status: "success", percent: 100 })
  })

  it("uses the last output line as the failure reason", () => {
    let b = applyJobEvent(batch(), ev({ kind: "started" }))
    b = applyJobEvent(b, ev({ line: "$ sudo apt install x" }))
    b = applyJobEvent(b, ev({ line: "E: Unable to locate package x" }))
    b = applyJobEvent(b, ev({ kind: "finished", success: false }))
    expect(b.jobs[0]).toMatchObject({ status: "failed", error: "E: Unable to locate package x" })
  })

  it("marks cancelled jobs", () => {
    const b = applyJobEvent(batch(), ev({ kind: "finished", success: false, cancelled: true }))
    expect(b.jobs[0].status).toBe("cancelled")
  })

  it("caps the log", () => {
    let b = batch()
    for (let i = 0; i < 600; i++) b = applyJobEvent(b, ev({ line: `l${i}` }))
    expect(b.jobs[0].log).toHaveLength(400)
  })
})

describe("progress", () => {
  it("ignores skipped jobs and blends in the running job", () => {
    let b = batch()
    expect(batchProgress(b)).toBe(0)
    b = applyJobEvent(b, ev({ kind: "finished", success: true }))
    expect(batchProgress(b)).toBe(50)
    b = applyJobEvent(b, ev({ job_id: "b", kind: "started" }))
    b = applyJobEvent(b, ev({ job_id: "b", line: "x", percent: 100 }))
    expect(batchProgress(b)).toBeGreaterThan(50)
    b = applyJobEvent(b, ev({ job_id: "b", kind: "finished", success: true }))
    expect(batchProgress(b)).toBe(100)
    expect(batchCounts(b)).toMatchObject({ success: 2, skipped: 1, total: 3 })
  })
})
