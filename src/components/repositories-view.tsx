import * as React from "react"
import { invoke } from "@tauri-apps/api/core"
import { useAppState } from "@/lib/app-state"
import { repoQueueId } from "@/lib/actions"
import type { RepoIndexInfo, RepoPackage, RepoSearch } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { CheckSquare, Square, Download, Database, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const LOCAL_LIMIT = 500
const LOCAL_DELAY = 120
// Typing must pause this long before the AUR is asked, so a word costs one
// request rather than one per keystroke.
const AUR_DELAY = 350

const MANAGER_LABEL: Record<string, string> = { pacman: "Pacman", apt: "APT", aur: "AUR" }

/**
 * Every package the host's repositories offer, not just the catalogue:
 * pacman's sync databases and apt's lists read from disk, plus the AUR online
 * when an AUR helper is installed. Searched with the header search box.
 */
export function RepositoriesView() {
  const {
    searchQuery,
    packageManagers,
    systemPackages,
    selectedQueue,
    toggleQueueItem,
    selectAllVisible,
    runBatch,
    busyIds,
    selectedIndex,
    setSelectedIndex,
    setSystemNavIds,
    registerRepoPackages,
    setSearchFocused,
  } = useAppState()

  const [info, setInfo] = React.useState<RepoIndexInfo | null>(null)
  const [local, setLocal] = React.useState<RepoSearch>({ hits: [], total: 0 })
  const [aur, setAur] = React.useState<{ query: string; hits: RepoPackage[]; error?: string }>({ query: "", hits: [] })
  const [searching, setSearching] = React.useState(false)

  const query = searchQuery.trim()
  const aurAvailable = packageManagers.some((m) => (m.id === "paru" || m.id === "yay") && m.available)

  React.useEffect(() => {
    invoke<RepoIndexInfo>("repo_index_info")
      .then(setInfo)
      .catch(() => setInfo({ total: 0, counts: {}, error: "Repository search needs the Packall desktop app" }))
  }, [])

  // Local index: cheap, so a short debounce is enough.
  React.useEffect(() => {
    if (!query) {
      setLocal({ hits: [], total: 0 })
      return
    }
    let stale = false
    setSearching(true)
    const t = setTimeout(() => {
      invoke<RepoSearch>("search_repositories", { query, limit: LOCAL_LIMIT })
        .then((r) => !stale && setLocal(r))
        .catch(() => !stale && setLocal({ hits: [], total: 0 }))
        .finally(() => !stale && setSearching(false))
    }, LOCAL_DELAY)
    return () => {
      stale = true
      clearTimeout(t)
    }
  }, [query])

  // AUR: a network round trip, so wait for typing to pause.
  React.useEffect(() => {
    if (!aurAvailable || query.length < 2) {
      setAur({ query: "", hits: [] })
      return
    }
    let stale = false
    const t = setTimeout(() => {
      invoke<RepoPackage[]>("search_aur_packages", { query })
        .then((hits) => !stale && setAur({ query, hits }))
        .catch((e) => !stale && setAur({ query, hits: [], error: String(e) }))
    }, AUR_DELAY)
    return () => {
      stale = true
      clearTimeout(t)
    }
  }, [query, aurAvailable])

  // The repositories' own copy wins over an AUR package of the same name.
  const rows = React.useMemo(() => {
    const names = new Set(local.hits.map((p) => p.name))
    const aurHits = aur.query === query ? aur.hits.filter((p) => !names.has(p.name)) : []
    return [...local.hits, ...aurHits]
  }, [local, aur, query])

  const installedKeys = React.useMemo(
    () => new Set(systemPackages.map((p) => `${p.manager}/${p.name}`)),
    [systemPackages]
  )
  const isInstalled = (p: RepoPackage) =>
    installedKeys.has(`${p.manager}/${p.name}`) ||
    (p.manager === "aur" && installedKeys.has(`pacman/${p.name}`)) ||
    (p.manager === "pacman" && installedKeys.has(`aur/${p.name}`))

  React.useEffect(() => {
    registerRepoPackages(rows)
    setSystemNavIds(rows.map(repoQueueId))
    setSelectedIndex(0)
  }, [rows, registerRepoPackages, setSystemNavIds, setSelectedIndex])
  React.useEffect(() => () => setSystemNavIds([]), [setSystemNavIds])

  React.useEffect(() => {
    document.querySelector('[data-highlighted="true"]')?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selectedIndex])

  const ids = rows.map(repoQueueId)
  const allSelected = ids.length > 0 && ids.every((id) => selectedQueue.has(id))
  const aurPending = aurAvailable && query.length >= 2 && aur.query !== query

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <div className="border-b border-border/50 px-6 py-4 shrink-0 bg-background/40 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20 shadow-sm">
              <Database className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">Repositories</h1>
                <Badge variant="secondary" className="font-mono text-xs rounded-full px-2">
                  {info ? `${info.total.toLocaleString()} indexed` : "indexing…"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every package your repositories offer{aurAvailable ? ", plus the AUR" : ""} — installed with your own
                package manager
              </p>
            </div>
          </div>
          {query && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {(searching || aurPending) && <Spinner className="size-3.5" />}
              <span>
                {local.total.toLocaleString()} match{local.total === 1 ? "" : "es"}
                {local.total > local.hits.length && ` · showing ${local.hits.length}`}
                {aur.query === query && aur.hits.length > 0 && ` · ${aur.hits.length} from the AUR`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {!query ? (
          <Intro info={info} aurAvailable={aurAvailable} onSearch={() => setSearchFocused(true)} />
        ) : rows.length === 0 && !searching && !aurPending ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground">
            Nothing in your repositories matches “{query}”.
            {aur.error && <span className="mt-2 text-xs text-destructive">{aur.error}</span>}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-3 pb-2 border-b border-border/40">
              <button
                onClick={() => selectAllVisible(ids)}
                className="cursor-pointer flex items-center gap-1.5 font-medium hover:text-foreground"
              >
                {allSelected ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4" />}
                Select All ({rows.length})
              </button>
              <span className="font-medium">Space to select · i to install</span>
            </div>

            {rows.map((p, idx) => {
              const id = repoQueueId(p)
              const queued = selectedQueue.has(id)
              const installed = isInstalled(p)
              return (
                <div
                  key={id}
                  data-card-index={idx}
                  data-highlighted={selectedIndex === idx ? "true" : undefined}
                  data-queued={queued ? "true" : undefined}
                  onClick={() => toggleQueueItem(id)}
                  className="sw-card cursor-pointer flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {queued ? (
                      <CheckSquare className="size-4.5 shrink-0 text-primary fill-primary/10" />
                    ) : (
                      <Square className="size-4.5 shrink-0 text-muted-foreground opacity-60" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{p.name}</span>
                        <span className="text-xs font-mono text-muted-foreground/70 truncate">{p.version}</span>
                        {installed && (
                          <span className="flex items-center gap-1 rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                            <Check className="size-3" strokeWidth={3} /> installed
                          </span>
                        )}
                      </div>
                      {p.summary && <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{p.summary}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        p.manager === "aur"
                          ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                          : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                      )}
                    >
                      {p.repo}
                    </span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      title={installed ? "Already installed" : `Install ${p.name}`}
                      disabled={installed || busyIds.has(id)}
                      onClick={() => void runBatch("install", [id])}
                      className="size-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                    >
                      <Download className="size-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Intro({ info, aurAvailable, onSearch }: { info: RepoIndexInfo | null; aurAvailable: boolean; onSearch: () => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 pt-6 text-sm">
      <p className="text-muted-foreground">
        The catalogue is hand-picked. When what you want is not in it, search here: Packall reads the package lists your
        manager already keeps on disk.
      </p>
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        {!info ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-4" /> Reading package indexes…
          </div>
        ) : info.total === 0 ? (
          <div className="flex items-start gap-2 text-muted-foreground">
            <AlertTriangle className="size-4 mt-0.5 text-amber-500" />
            <span>
              No package indexes found. Packall reads pacman’s sync databases and apt’s package lists; dnf and zypper
              repositories are not indexed yet.
              {info.error && <span className="block mt-1 text-xs text-destructive">{info.error}</span>}
            </span>
          </div>
        ) : (
          Object.entries(info.counts).map(([mgr, n]) => (
            <div key={mgr} className="flex items-center justify-between">
              <span className="font-medium">{MANAGER_LABEL[mgr] ?? mgr}</span>
              <span className="font-mono text-xs text-muted-foreground">{n.toLocaleString()} packages</span>
            </div>
          ))
        )}
        <div className="flex items-center justify-between border-t border-border/50 pt-2">
          <span className="font-medium">AUR</span>
          <span className="text-xs text-muted-foreground">
            {aurAvailable ? "searched online as you type" : "install yay or paru to include it"}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        The index is only as fresh as your last <code>sudo pacman -Sy</code> or <code>sudo apt update</code>. AUR
        packages are user-submitted — read the PKGBUILD before installing.
      </p>
      <Button variant="outline" size="sm" onClick={onSearch} className="gap-2 rounded-xl text-xs">
        Start typing to search <Kbd>/</Kbd>
      </Button>
    </div>
  )
}
