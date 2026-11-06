import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import { Terminal, Package, Cpu, Search, RefreshCw, ArrowUpCircle } from "lucide-react"
import { Logo } from "@/components/logo"

function GithubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export function AboutView() {
  const { installed, systemPackages, appUpdate, appUpdateState, checkAppUpdate, updatePackall } = useAppState()
  const [checking, setChecking] = React.useState(false)
  const recheck = async () => {
    setChecking(true)
    try {
      await checkAppUpdate({ notify: true })
    } finally {
      setChecking(false)
    }
  }

  const stats = [
    { label: "Apps in Catalog", value: SOFTWARE.length, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Categories", value: CATEGORIES.length, icon: Terminal, color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Installed (Curated)", value: installed.size, icon: Cpu, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "System Packages", value: systemPackages.length, icon: Search, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Hero */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center gap-4 border-b border-border/50 bg-gradient-to-b from-primary/10 via-background/60 to-background px-6 py-14 text-center">
        {/* Subtle decorative glow circle */}
        <div className="pointer-events-none absolute -top-12 size-72 rounded-full bg-primary/15 blur-3xl" />

        <Logo size="xl" className="relative drop-shadow-xl" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Packall
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed mx-auto">
            A fast, beautiful graphical directory and package manager for Linux software.
            <br />
            Created by <strong className="text-foreground">Nishu Murmu</strong>.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center justify-center gap-2 mt-2">
          <a
            href="https://github.com/nishu-murmu/packall"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:bg-accent hover:border-primary/40 hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-7 max-w-3xl mx-auto pt-8">
        {/* Version & self-update */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Version</h2>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="text-sm">
              <p className="font-semibold">
                Packall {appUpdate?.current ?? "—"}
                {appUpdate && !appUpdate.available && (
                  <span className="ml-2 text-xs font-normal text-emerald-500">up to date</span>
                )}
              </p>
              {appUpdate?.available && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {appUpdateState === "updated"
                    ? `Packall ${appUpdate.latest} is installed — restart Packall to use it.`
                    : `Packall ${appUpdate.latest} is available.`}
                </p>
              )}
              {!appUpdate && <p className="mt-0.5 text-xs text-muted-foreground">Could not reach GitHub yet.</p>}
            </div>
            <div className="flex items-center gap-2">
              {appUpdate?.available && appUpdateState !== "updated" && (
                <button
                  type="button"
                  onClick={() => void updatePackall()}
                  disabled={appUpdateState === "updating"}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <ArrowUpCircle className="size-4" />
                  {appUpdateState === "updating"
                    ? "Updating…"
                    : appUpdate.method === "manual"
                      ? `Download ${appUpdate.latest}`
                      : `Update to ${appUpdate.latest}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => void recheck()}
                disabled={checking}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-xs font-semibold transition-all hover:bg-accent disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
                Check for updates
              </button>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Statistics</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-xl border p-3.5 flex flex-col gap-1 ${s.bg}`}>
                <s.icon className={`size-4 ${s.color}`} />
                <div className="text-2xl font-bold tabular-nums text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Built With */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Built with</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Packall is a native desktop app. Its core is written in Rust and runs on Tauri 2, so it starts
            quickly and uses little memory. The interface is built with React 19 and TypeScript,
            styled with Tailwind CSS, and uses Radix UI components and Lucide icons.
          </p>
        </section>
      </div>
    </div>
  )
}
