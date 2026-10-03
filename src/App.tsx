import { AppStateProvider, useAppState } from "@/lib/app-state"
import { useKeybindings } from "@/lib/use-keybindings"
import { AppSidebar } from "@/components/app-sidebar"
import { SoftwareGrid } from "@/components/software-grid"
import { SoftwareDrawer } from "@/components/software-drawer"
import { SystemPackagesView } from "@/components/system-packages-view"
import { BatchActionBar } from "@/components/batch-action-bar"
import { JobsDock } from "@/components/jobs-dock"
import { SearchBar } from "@/components/search-bar"
import { HelpOverlay } from "@/components/help-overlay"
import { AboutView } from "@/components/about-view"
import { StatusBar } from "@/components/status-bar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { PanelLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { PasswordDialog } from "@/components/password-dialog"

function AppContent() {
  const { view, sidebarOpen, setSidebarOpen, inspectSoftwareId } = useAppState()
  useKeybindings()

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background app-bg-gradient">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 bg-background/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(true)}
                className="cursor-pointer"
              >
                <PanelLeft className="size-4" />
              </Button>
            )}
            {!sidebarOpen && (
              <div className="flex items-center gap-2">
                <Logo className="size-7" />
                <span className="text-sm font-bold tracking-tight">Packall</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {view.kind !== "detail" && !inspectSoftwareId && <SearchBar />}
            <ModeToggle />
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden relative">
          {view.kind === "about" ? (
            <AboutView />
          ) : view.kind === "system" ? (
            <SystemPackagesView />
          ) : (
            <SoftwareGrid />
          )}

          {/* Floating Batch Action Bar */}
          <BatchActionBar />
        </main>

        <StatusBar />
      </div>

      {/* Background job progress */}
      <JobsDock />

      {/* Slide-over Software Detail Drawer */}
      <SoftwareDrawer />

      <PasswordDialog />
      <HelpOverlay />
      <Toaster />
    </div>
  )
}

export function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  )
}

export default App
