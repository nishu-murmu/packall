import { AppStateProvider, useAppState } from "@/lib/app-state"
import { useKeybindings } from "@/lib/use-keybindings"
import { AppSidebar } from "@/components/app-sidebar"
import { SoftwareGrid } from "@/components/software-grid"
import { SoftwareDrawer } from "@/components/software-drawer"
import { SystemPackagesView } from "@/components/system-packages-view"
import { BatchActionBar } from "@/components/batch-action-bar"
import { BatchExecutionModal } from "@/components/batch-execution-modal"
import { SearchBar } from "@/components/search-bar"
import { HelpOverlay } from "@/components/help-overlay"
import { SettingsView } from "@/components/settings-view"
import { AboutView } from "@/components/about-view"
import { StatusBar } from "@/components/status-bar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { PanelLeft, Package } from "lucide-react"

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
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20">
                  <Package className="size-3.5" />
                </div>
                <span className="text-sm font-bold tracking-tight gradient-text">Packall</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {view.kind !== "detail" && !inspectSoftwareId && <SearchBar />}
            <ModeToggle />
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden relative">
          {view.kind === "settings" ? (
            <SettingsView />
          ) : view.kind === "about" ? (
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

      {/* Batch Execution Dialog */}
      <BatchExecutionModal />

      {/* Slide-over Software Detail Drawer */}
      <SoftwareDrawer />

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
