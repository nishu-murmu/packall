export type CategoryId =
  | "browsers"
  | "communications"
  | "development"
  | "documents"
  | "games"
  | "multimedia"
  | "self-hosted"
  | "utilities"
  | "terminal"
  | "system"
  | "security"
  | "virtualization"
  | "education"
  | "graphics"

export type InstallMethod =
  | "apt"
  | "snap"
  | "flatpak"
  | "appimage"
  | "deb"
  | "aur"
  | "paru"
  | "yay"
  | "pacman"
  | "manual"
  | "dnf"
  | "zypper"
  | "brew"

export interface InstallStep {
  title: string
  command: string
  description?: string
}

export interface InstallOption {
  method: InstallMethod
  command: string
  steps?: InstallStep[]
  notes?: string
}

export interface SoftwareEntry {
  id: string
  name: string
  tagline: string
  description: string
  category: CategoryId
  homepage: string
  license: string
  tags: string[]
  install: InstallOption[]
  icon?: string
  featured?: boolean
}

export interface Category {
  id: CategoryId
  name: string
  description: string
  icon: string
}

export interface SystemPackage {
  name: string
  version: string
  manager: string // "pacman" | "aur" | "flatpak" | "snap" | "apt" | "dnf" | "brew" | "winget"
  description?: string
  installed: boolean
  icon?: string
  matchedSoftwareId?: string
  category?: CategoryId
}

export type DistroFamily = "arch" | "debian" | "fedora" | "suse" | "other"

export interface PackageManagerInfo {
  id: string
  name: string
  available: boolean
  is_aur: boolean
  install_cmd: string
  update_cmd: string
  remove_cmd: string
}

export interface DistroInfo {
  id: string
  name: string
  pretty_name: string
  preferred_manager: string
  family?: DistroFamily
  managers: PackageManagerInfo[]
}

export interface StepExecutionResult {
  step_index: number
  title: string
  command: string
  success: boolean
  stdout: string
  stderr: string
}

export interface MultiStepActionResult {
  success: boolean
  completed_steps: number
  total_steps: number
  step_results: StepExecutionResult[]
  error?: string
}

export interface ActionExecutionResult {
  success: boolean
  command: string
  output: string
  error?: string
}

export type BatchAction = "install" | "update" | "remove"

export type View =
  | { kind: "grid" }
  | { kind: "detail"; id: string }
  | { kind: "installed" }
  | { kind: "system" }
  | { kind: "about" }
  | { kind: "help" }

export type DistroFilter = "all" | "debian" | "fedora" | "arch" | "suse" | "flatpak" | "snap"

export type JobStatus = "queued" | "running" | "success" | "failed" | "cancelled" | "skipped"

export interface Job {
  id: string
  name: string
  action: BatchAction
  status: JobStatus
  /** 0-100, only meaningful while running */
  percent: number | null
  /** Package manager / method used, e.g. "apt" */
  method?: string
  log: string[]
  error?: string
}

export interface Batch {
  id: string
  action: BatchAction
  jobs: Job[]
  done: boolean
  startedAt: number
}

/** Mirrors the `packall-job` event emitted by the Rust worker. */
export interface JobEvent {
  batch_id: string
  job_id: string
  kind: "started" | "output" | "finished" | "batch_done"
  line?: string | null
  percent?: number | null
  success?: boolean | null
  cancelled?: boolean
}
