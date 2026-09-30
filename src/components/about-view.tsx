import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import { Star, Terminal, Package, Cpu, Search, ExternalLink, Code, Zap } from "lucide-react"

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
  const { installed, systemPackages } = useAppState()

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

        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground shadow-xl shadow-primary/25 ring-1 ring-white/20">
          <Package className="size-8" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Almanac
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed mx-auto">
            A fast, beautiful graphical directory and package manager for Linux software.
            <br />
            Created by <strong className="text-foreground">Nishu Murmu</strong>.
          </p>
        </div>
        <div className="relative flex flex-wrap items-center justify-center gap-2 mt-2">
          <a
            href="https://github.com/nishu-murmu/almanac"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:bg-accent hover:border-primary/40 hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
          <a
            href="https://github.com/nishu-murmu/almanac/stargazers"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 px-4 py-2 text-xs font-semibold transition-all hover:bg-amber-500/20"
          >
            <Star className="size-4 fill-current" />
            Star on GitHub
          </a>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-7 max-w-3xl mx-auto pt-8">
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

        {/* Open Source */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Open Source</h2>
          <div className="rounded-xl border border-border/60 bg-card/70 p-4 space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Almanac is free, open-source software licensed under GPLv3. Built for the Linux community with ❤️.
              Contributions, bug reports, and feature requests are welcome on GitHub.
            </p>
            <a
              href="https://github.com/nishu-murmu/almanac"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              <ExternalLink className="size-3" />
              View source code →
            </a>
          </div>
        </section>

        {/* Built With */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Built With</h2>
          <div className="flex flex-wrap gap-2">
            {["Tauri 2", "Rust", "React 19", "TypeScript", "Tailwind CSS v4", "Lucide Icons", "Radix UI"].map((tech) => (
              <span key={tech} className="rounded-lg bg-muted/40 border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80">
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
