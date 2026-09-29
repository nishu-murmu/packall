import { useAppState } from "@/lib/app-state"
import { SOFTWARE } from "@/lib/software"
import { CATEGORIES } from "@/lib/categories"
import { Heart, Star, Terminal, Package, Cpu, Search } from "lucide-react"

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
  const { favorites, installed, systemPackages } = useAppState()

  const stats = [
    { label: "Apps in Catalog", value: SOFTWARE.length, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Categories", value: CATEGORIES.length, icon: Terminal, color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Your Favorites", value: favorites.size, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
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
            href="https://ko-fi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 dark:text-rose-400 px-4 py-2 text-xs font-semibold transition-all hover:bg-rose-500/20 hover:scale-102"
          >
            <Heart className="size-4 fill-current" />
            Support
          </a>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-7 max-w-3xl mx-auto pt-8">
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Support & Sponsorship</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Almanac is free, open-source software built for the Linux community.
              Choose your preferred platform to support ongoing development:
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://github.com/sponsors/nishu-murmu"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-3 text-xs font-semibold shadow-sm transition-all hover:bg-accent hover:border-pink-500/40 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                  <Heart className="size-4 fill-current" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">GitHub Sponsors</div>
                  <div className="text-[10px] text-muted-foreground font-normal">0% platform fee · Direct support</div>
                </div>
              </div>
              <span className="text-[10px] text-primary font-medium">Sponsor →</span>
            </a>

            <a
              href="https://buymeacoffee.com/nishumurmu"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-3 text-xs font-semibold shadow-sm transition-all hover:bg-accent hover:border-amber-500/40 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-bold text-sm">
                  ☕
                </div>
                <div>
                  <div className="font-semibold text-foreground">Buy Me a Coffee</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Card / Apple Pay / Google Pay</div>
                </div>
              </div>
              <span className="text-[10px] text-primary font-medium">Donate →</span>
            </a>

            <a
              href="https://ko-fi.com/nishumurmu"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-3 text-xs font-semibold shadow-sm transition-all hover:bg-accent hover:border-rose-500/40 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <Heart className="size-4" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Ko-fi / PayPal</div>
                  <div className="text-[10px] text-muted-foreground font-normal">One-time or monthly tips</div>
                </div>
              </div>
              <span className="text-[10px] text-primary font-medium">Tip →</span>
            </a>

            <a
              href="https://github.com/nishu-murmu/almanac"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer flex items-center justify-between rounded-xl border border-border/60 bg-card/70 p-3 text-xs font-semibold shadow-sm transition-all hover:bg-accent hover:border-primary/40 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GithubIcon className="size-4" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Star on GitHub</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Help spread the word</div>
                </div>
              </div>
              <span className="text-[10px] text-primary font-medium">⭐ Star →</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
