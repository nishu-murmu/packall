import * as React from "react"
import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SettingsView() {
  const { favorites, installed } = useAppState()

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
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          App information and preferences
        </p>
      </div>

      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Directory Statistics</CardTitle>
            <CardDescription>
              Overview of the software catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <Stat label="Total Apps" value={stats.totalApps} />
            <Stat label="Categories" value={stats.totalCategories} />
            <Stat label="Your Favorites" value={favorites.size} />
            <Stat label="Installed" value={installed.size} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Install Method Coverage</CardTitle>
            <CardDescription>
              How many apps support each installation method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.methodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([method, count]) => (
                  <Badge key={method} variant="secondary" className="gap-1.5">
                    {method}
                    <span className="text-muted-foreground">{count}</span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Almanac</CardTitle>
            <CardDescription>
              A graphical directory of essential Linux software
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Almanac catalogs the best software available on Linux, organized
              into categories and searchable by name, tag, or category. Every
              entry includes multiple installation methods so it works regardless
              of your distribution.
            </p>
            <p>
              The entire interface is navigable with Neovim-style keyboard
              shortcuts. Press <kbd className="rounded bg-muted px-1 text-xs">?</kbd>{" "}
              at any time to see the full list.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
