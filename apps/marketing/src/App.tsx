import { useState, useEffect, useCallback } from 'react'
import {
  Terminal,
  Download,
  Search,
  ExternalLink,
  Check,
  Star,
  Zap,
  ShieldCheck,
  Code2,
  Globe,
  MessageSquare,
  Gamepad2,
  Play,
  Server,
  Wrench,
  Settings2,
  Box,
  GraduationCap,
  Palette,
  FileText,
  Copy,
  ChevronRight,
  BookOpen,
  Keyboard,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react'

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

interface SampleApp {
  id: string
  name: string
  category: string
  tagline: string
  iconName: string
  packageManager: string
  installCmd: string
  tags: string[]
}

const SAMPLE_APPS: SampleApp[] = [
  {
    id: 'neovim',
    name: 'Neovim',
    category: 'Development',
    tagline: 'Vim-fork focused on extensibility and usability',
    iconName: 'Code2',
    packageManager: 'pacman',
    installCmd: 'sudo pacman -S neovim',
    tags: ['editor', 'vim', 'lua', 'cli']
  },
  {
    id: 'firefox',
    name: 'Firefox',
    category: 'Browsers',
    tagline: 'Fast, private and independent web browser by Mozilla',
    iconName: 'Globe',
    packageManager: 'flatpak',
    installCmd: 'flatpak install flathub org.mozilla.firefox',
    tags: ['web', 'privacy', 'open-source']
  },
  {
    id: 'alacritty',
    name: 'Alacritty',
    category: 'Terminal',
    tagline: 'A fast, cross-platform, OpenGL terminal emulator',
    iconName: 'Terminal',
    packageManager: 'apt',
    installCmd: 'sudo apt install alacritty',
    tags: ['gpu', 'rust', 'fast']
  },
  {
    id: 'obs-studio',
    name: 'OBS Studio',
    category: 'Multimedia',
    tagline: 'Free and open source software for video recording and live streaming',
    iconName: 'Play',
    packageManager: 'flatpak',
    installCmd: 'flatpak install flathub com.obsproject.Studio',
    tags: ['streaming', 'recording', 'video']
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    category: 'Utilities',
    tagline: 'A secure and open source password manager for all of your devices',
    iconName: 'Wrench',
    packageManager: 'appimage',
    installCmd: 'wget https://vault.bitwarden.com/download/?app=desktop&platform=linux',
    tags: ['security', 'passwords', 'encryption']
  },
  {
    id: 'steam',
    name: 'Steam',
    category: 'Games',
    tagline: 'The ultimate online game platform for PC and Linux gaming',
    iconName: 'Gamepad2',
    packageManager: 'deb',
    installCmd: 'sudo apt install steam-installer',
    tags: ['gaming', 'proton', 'store']
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud Desktop',
    category: 'Self-Hosted',
    tagline: 'Open source content collaboration platform sync client',
    iconName: 'Server',
    packageManager: 'appimage',
    installCmd: 'flatpak install flathub com.nextcloud.desktopclient.nextcloud',
    tags: ['cloud', 'sync', 'storage']
  },
  {
    id: 'wireshark',
    name: 'Wireshark',
    category: 'Security',
    tagline: 'The world’s foremost and widely-used network protocol analyzer',
    iconName: 'ShieldCheck',
    packageManager: 'pacman',
    installCmd: 'sudo pacman -S wireshark-qt',
    tags: ['networking', 'packet-capture', 'security']
  }
]

const CATEGORY_LIST = [
  { id: 'browsers', name: 'Browsers', icon: Globe, count: 6, desc: 'Privacy-first and high-speed web browsers' },
  { id: 'development', name: 'Development', icon: Code2, count: 12, desc: 'IDEs, modern editors, language toolchains' },
  { id: 'terminal', name: 'Terminal', icon: Terminal, count: 7, desc: 'GPU-accelerated emulators & multiplexers' },
  { id: 'communications', name: 'Communications', icon: MessageSquare, count: 8, desc: 'Decentralized chat, IRC, and VoIP clients' },
  { id: 'multimedia', name: 'Multimedia', icon: Play, count: 9, desc: 'Audio workstations, video editors, and players' },
  { id: 'games', name: 'Games', icon: Gamepad2, count: 6, desc: 'Proton wrappers, emulators, and launchers' },
  { id: 'utilities', name: 'Utilities', icon: Wrench, count: 11, desc: 'Archivers, clipboard managers, password vaults' },
  { id: 'self-hosted', name: 'Self-Hosted', icon: Server, count: 8, desc: 'Personal clouds, media servers, and containers' },
  { id: 'system', name: 'System', icon: Settings2, count: 9, desc: 'Monitors, partition managers, benchmarkers' },
  { id: 'security', name: 'Security', icon: ShieldCheck, count: 7, desc: 'VPNs, firewalls, encryption suites' },
  { id: 'virtualization', name: 'Virtualization', icon: Box, count: 5, desc: 'KVM, QEMU, Docker, Podman, Distrobox' },
  { id: 'documents', name: 'Documents', icon: FileText, count: 6, desc: 'Markdown note-taking and office suites' },
  { id: 'education', name: 'Education', icon: GraduationCap, count: 4, desc: 'Astronomy, flashcards, schematic tools' },
  { id: 'graphics', name: 'Graphics', icon: Palette, count: 6, desc: 'Vector illustration, 3D suites, RAW editors' },
]

export default function App() {
  const [activeSimulatorIndex, setActiveSimulatorIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchFilter, setSearchFilter] = useState('')
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['neovim', 'firefox']))

  // Filter apps in simulator
  const filteredApps = SAMPLE_APPS.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = searchFilter === '' ||
      app.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Keyboard simulator handler
  const handleKeySimulator = useCallback((key: string) => {
    setLastKeyPressed(key)
    setTimeout(() => setLastKeyPressed(null), 1000)

    if (key === 'j') {
      setActiveSimulatorIndex(prev => Math.min(prev + 1, Math.max(0, filteredApps.length - 1)))
    } else if (key === 'k') {
      setActiveSimulatorIndex(prev => Math.max(prev - 1, 0))
    } else if (key === 'gg') {
      setActiveSimulatorIndex(0)
    } else if (key === 'G') {
      setActiveSimulatorIndex(Math.max(0, filteredApps.length - 1))
    } else if (key === 'f') {
      const current = filteredApps[activeSimulatorIndex]
      if (current) {
        setFavorites(prev => {
          const next = new Set(prev)
          if (next.has(current.id)) next.delete(current.id)
          else next.add(current.id)
          return next
        })
      }
    }
  }, [filteredApps, activeSimulatorIndex])

  // Global key listener for demo interaction when focusing playground
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return

      if (['j', 'k', 'G', 'f'].includes(e.key)) {
        e.preventDefault()
        handleKeySimulator(e.key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKeySimulator])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const selectedApp = filteredApps[activeSimulatorIndex] || SAMPLE_APPS[0]

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[140px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0d14]/80 border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Almanac
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v0.1.0
                </span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">Interactive Demo</a>
            <a href="#categories" className="hover:text-emerald-400 transition-colors">Categories</a>
            <a href="#downloads" className="hover:text-emerald-400 transition-colors">Download</a>
            <a
              href="http://localhost:5175"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Docs
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/nishu-murmu/almanac"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all bg-white/[0.02]"
              aria-label="GitHub Repository"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a
              href="#downloads"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              <Download className="w-4 h-4" />
              Get Almanac
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tauri v2 + Rust Architecture • Pure Neovim Keybindings</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
          The Essential Directory for{' '}
          <span className="gradient-text">Linux Software</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Categorized across 14 essential domains, searchable in milliseconds, and completely navigable
          with Neovim modal shortcuts. The unified launchpad for every Linux desktop workstation.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#downloads"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            Download for Linux
          </a>

          <a
            href="#interactive-demo"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-base border border-white/10 hover:border-emerald-500/40 transition-all"
          >
            <Keyboard className="w-5 h-5 text-emerald-400" />
            Interactive Demo
          </a>

          <a
            href="http://localhost:5175"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 font-semibold text-base border border-white/5 transition-all"
          >
            <BookOpen className="w-5 h-5" />
            Documentation
          </a>
        </div>

        {/* Distro Badges */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col items-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-4">
            Supports All Major Distributions & Package Managers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-slate-400">
            {['Ubuntu (apt)', 'Arch Linux (pacman/AUR)', 'Fedora (dnf)', 'Universal Flatpak', 'Universal AppImage', 'openSUSE (zypper)', 'Snap', 'Homebrew'].map((distro) => (
              <span
                key={distro}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/[0.06] text-slate-300"
              >
                {distro}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Neovim Keybinding Simulator */}
      <section id="interactive-demo" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
            <Keyboard className="w-4 h-4" /> Live Interactive Demo
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Try the Neovim Navigation Right Now
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            Press <kbd className="kbd-key">j</kbd> and <kbd className="kbd-key">k</kbd> on your keyboard (or click below) to move the selection cursor. Press <kbd className="kbd-key">f</kbd> to toggle favorites!
          </p>
        </div>

        {/* Mock Tauri App Container */}
        <div className="glass-panel overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Mock Window Titlebar */}
          <div className="bg-[#0e1422] border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">almanac — tauriapp</span>
            </div>

            {/* Quick keys simulation toolbar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Try keys:</span>
              <button
                onClick={() => handleKeySimulator('k')}
                className="kbd-key hover:border-emerald-400 transition-colors"
                title="Move Up"
              >
                k (up)
              </button>
              <button
                onClick={() => handleKeySimulator('j')}
                className="kbd-key hover:border-emerald-400 transition-colors"
                title="Move Down"
              >
                j (down)
              </button>
              <button
                onClick={() => handleKeySimulator('f')}
                className="kbd-key hover:border-emerald-400 transition-colors"
                title="Favorite"
              >
                f (fav)
              </button>
              <button
                onClick={() => handleKeySimulator('gg')}
                className="kbd-key hover:border-emerald-400 transition-colors"
                title="Top"
              >
                gg (top)
              </button>
              <button
                onClick={() => handleKeySimulator('G')}
                className="kbd-key hover:border-emerald-400 transition-colors"
                title="Bottom"
              >
                G (bottom)
              </button>
            </div>

            {lastKeyPressed && (
              <div className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 animate-pulse border border-emerald-500/40">
                Key: {lastKeyPressed}
              </div>
            )}
          </div>

          {/* App Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-[#0c101c]">
            {/* Left Category Sidebar */}
            <div className="lg:col-span-3 border-r border-white/[0.08] p-3 space-y-1 bg-[#090d16]/70">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Categories
              </div>
              {['All', 'Development', 'Browsers', 'Terminal', 'Multimedia', 'Utilities', 'Games', 'Self-Hosted', 'Security'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setActiveSimulatorIndex(0)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${selectedCategory === cat
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                >
                  <span>{cat}</span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>

            {/* Middle: Software List */}
            <div className="lg:col-span-5 border-r border-white/[0.08] p-4 flex flex-col">
              {/* Search Header */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter software (/ to focus)..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value)
                    setActiveSimulatorIndex(0)
                  }}
                  className="w-full bg-slate-900/90 border border-white/[0.08] focus:border-emerald-500/50 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              {/* Cards List */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {filteredApps.map((app, index) => {
                  const isSelected = index === activeSimulatorIndex
                  const isFav = favorites.has(app.id)

                  return (
                    <div
                      key={app.id}
                      onClick={() => setActiveSimulatorIndex(index)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900/50 border-white/[0.06] hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-sm text-white">{app.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">({app.packageManager})</span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1">{app.tagline}</p>
                          </div>
                        </div>

                        {isFav && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Selected Software Detail Inspector */}
            <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[#0b0f19]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedApp.name}</h3>
                    <span className="text-xs text-emerald-400 font-medium">{selectedApp.category}</span>
                  </div>
                  <button
                    onClick={() => handleKeySimulator('f')}
                    className={`p-2 rounded-lg border transition-all ${favorites.has(selectedApp.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'border-white/10 text-slate-400 hover:text-white'
                      }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(selectedApp.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                  {selectedApp.tagline}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedApp.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Install Option */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Install Command ({selectedApp.packageManager})</span>
                    <button
                      onClick={() => copyToClipboard(selectedApp.installCmd, selectedApp.id)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copiedId === selectedApp.id ? (
                        <>
                          <Check className="w-3 h-3" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-black/70 border border-emerald-500/30 font-mono text-xs text-emerald-300 flex items-center justify-between overflow-x-auto">
                    <code>{selectedApp.installCmd}</code>
                  </div>
                </div>
              </div>

              {/* Vim status line simulation */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  -- NORMAL --
                </span>
                <span>{activeSimulatorIndex + 1}/{filteredApps.length}</span>
                <span>{favorites.size} starred</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14 Categories Showcase */}
      <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
            <Layers className="w-4 h-4" /> Comprehensive Catalog
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            14 Curated Categories of Essential Software
          </h2>
          <p className="text-slate-400 text-base mt-3 max-w-2xl mx-auto">
            From daily productivity and communications to system level kernel utilities and developer toolchains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORY_LIST.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.id}
                className="glass-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {cat.count}+ apps
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Download Center Section */}
      <section id="downloads" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
            <Download className="w-4 h-4" /> Download Almanac
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Install on Your Linux Machine
          </h2>
          <p className="text-slate-400 text-base mt-2">
            Choose your preferred packaging format or install directly via CLI.
          </p>
        </div>

        {/* Download cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* AppImage */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg text-white">AppImage</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Universal</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Single executable file. Works immediately on Ubuntu, Debian, Arch, Fedora, and openSUSE.
              </p>
            </div>
            <a
              href="https://github.com/nishu-murmu/almanac/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Download .AppImage
            </a>
          </div>

          {/* Debian / Ubuntu */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg text-white">Debian / Ubuntu</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">.deb</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Native package with system menu entry and desktop launcher integration.
              </p>
            </div>
            <a
              href="https://github.com/nishu-murmu/almanac/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Download .deb
            </a>
          </div>

          {/* Fedora / RPM */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg text-white">Fedora / RHEL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">.rpm</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Native RPM binary package for Red Hat, Fedora 39/40, and openSUSE distributions.
              </p>
            </div>
            <a
              href="https://github.com/nishu-murmu/almanac/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" /> Download .rpm
            </a>
          </div>

          {/* Arch Linux */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg text-white">Arch Linux</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AUR</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Install via `paru` or `yay` directly from the Arch User Repository.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard('paru -S almanac-bin', 'paru')}
              className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors font-mono"
            >
              {copiedId === 'paru' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              paru -S almanac-bin
            </button>
          </div>
        </div>

        {/* Quick Install One-Liner */}
        <div className="mt-12 max-w-2xl mx-auto glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-500/30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Terminal className="w-5 h-5 text-emerald-400 shrink-0" />
            <code className="text-xs font-mono text-emerald-300 truncate">
              curl -fsSL https://almanac.app/install.sh | bash
            </code>
          </div>
          <button
            onClick={() => copyToClipboard('curl -fsSL https://almanac.app/install.sh | bash', 'curl-install')}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          >
            {copiedId === 'curl-install' ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Installer
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#070a10] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-tight">Almanac</span>
            <span className="text-xs text-slate-500">
              MIT License • Built for the Linux Community
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="http://localhost:5175" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              Documentation <ArrowRight className="w-3 h-3" />
            </a>
            <a href="https://github.com/nishu-murmu/almanac" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
              GitHub
            </a>
            <a href="#downloads" className="hover:text-emerald-400 transition-colors">
              Releases
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
