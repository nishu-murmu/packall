import { AppStateProvider, useAppState } from "@/lib/app-state"
import { useKeybindings } from "@/lib/use-keybindings"
import { AppSidebar } from "@/components/app-sidebar"
import { SoftwareGrid } from "@/components/software-grid"
import { SoftwareDetail } from "@/components/software-detail"
import { SearchBar } from "@/components/search-bar"
import { HelpOverlay } from "@/components/help-overlay"
import { SettingsView } from "@/components/settings-view"
import { StatusBar } from "@/components/status-bar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { PanelLeft, Package } from "lucide-react"

function AppContent() {
  const { view, sidebarOpen, setSidebarOpen } = useAppState()
  useKeybindings()

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="size-4" />
              </Button>
            )}
            {!sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Package className="size-3.5" />
                </div>
                <span className="text-sm font-semibold">Almanac</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SearchBar />
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {view.kind === "detail" ? (
            <SoftwareDetail />
          ) : view.kind === "settings" ? (
            <SettingsView />
          ) : (
            <SoftwareGrid />
          )}
        </div>

        <StatusBar />
      </div>

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
