import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sliders, Sparkles, Terminal, Layers, Info, Code, Box, Zap } from "lucide-react"

export function SettingsView() {
  const { installed } = useAppState()

  const stats = React.useMemo(() => {
    const totalApps = SOFTWARE.length
    const totalCategories = CATEGORIES.length
    const methodCounts: Record<string, number> = {}
    for (const s of SOFTWARE) {
      for (const opt of s.install) {
        methodCounts[opt.method] = (methodCounts[opt.method] ?? 0) + 1
      }
    }
    return { totalApps, totalCategories, methodCounts }
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-border/50 px-6 py-4 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <Sliders className="size-4 text-primary" />
          <h2 className="text-base font-bold tracking-tight">Settings & Statistics</h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Software catalog analytics, package manager coverage, and keyboard controls
        </p>
      </div>

      <div className="p-6 space-y-5 max-w-4xl">
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Directory Statistics
            </CardTitle>
            <CardDescription className="text-xs">
              Overview of the curated software catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total Apps" value={stats.totalApps} />
            <Stat label="Categories" value={stats.totalCategories} />
            <Stat label="Installed" value={installed.size} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Install Method Coverage
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of supported installation providers across packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.methodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([method, count]) => (
                  <Badge
                    key={method}
                    variant="secondary"
                    className="gap-2 rounded-lg px-2.5 py-1 text-xs border border-border/50 bg-muted/60"
                  >
                    <span className="font-semibold text-foreground">{method}</span>
                    <span className="rounded-md bg-background/80 px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                      {count}
                    </span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="size-4 text-primary" /> Navigation & Shortcuts
            </CardTitle>
            <CardDescription className="text-xs">
              Quick keyboard actions available anywhere in the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              Navigate effortlessly using <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">j</kbd> / <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">k</kbd> or arrow keys to move between app cards.
            </p>
            <p>
              Press <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">Enter</kbd> to inspect the selected app for direct installation or queue actions, <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">/</kbd> to search globally, and <kbd className="rounded-md border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">?</kbd> to view the full cheat sheet.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Info className="size-4 text-primary" /> What is Packall?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Packall is a high-performance desktop software manager built with Tauri (Rust + React). It acts
            as your central hub for exploring and managing Linux software across {CATEGORIES.length} categories.
            Instead of memorizing commands across apt, pacman, yay, flatpak, snap, or dnf, Packall provides
            an interactive, keyboard-friendly visual interface to browse, inspect, and trigger package operations
            under the hood.
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="size-4 text-primary" /> Key Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
            <div className="p-3 rounded-xl border border-border/40 bg-muted/20 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><strong>Interactive Cards</strong> with instant hover metadata & keyboard navigation.</span>
            </div>
            <div className="p-3 rounded-xl border border-border/40 bg-muted/20 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><strong>Batch Queue</strong> to install, update, or remove multiple packages simultaneously.</span>
            </div>
            <div className="p-3 rounded-xl border border-border/40 bg-muted/20 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><strong>Global Search</strong> spanning all apps, package names, descriptions, and tags.</span>
            </div>
            <div className="p-3 rounded-xl border border-border/40 bg-muted/20 flex items-start gap-2.5">
              <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><strong>Multi-Manager Support</strong> for apt, pacman, yay, paru, flatpak, snap, dnf, zypper, brew.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code className="size-4 text-primary" /> CLI Commands Under the Hood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-muted/40 border border-border/50 p-4 space-y-1.5 font-mono text-xs">
              <div><span className="text-muted-foreground"># List all installed packages</span></div>
              <div className="text-primary">packall ls --installed</div>
              <div className="pt-1.5"><span className="text-muted-foreground"># Search for a package across repos</span></div>
              <div className="text-primary">packall search firefox</div>
              <div className="pt-1.5"><span className="text-muted-foreground"># Show detailed package metadata</span></div>
              <div className="text-primary">packall info neovim</div>
              <div className="pt-1.5"><span className="text-muted-foreground"># Scan system packages</span></div>
              <div className="text-primary">packall scan</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Box className="size-4 text-primary" /> Built With
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Tauri 2", "Rust", "React 19", "TypeScript", "Tailwind CSS v4", "Lucide Icons", "Radix UI"].map((tech) => (
              <span key={tech} className="rounded-lg bg-muted/40 border border-border/60 px-3 py-1 text-xs font-medium text-foreground/80">
                {tech}
              </span>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 flex flex-col gap-1">
      <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  )
}
