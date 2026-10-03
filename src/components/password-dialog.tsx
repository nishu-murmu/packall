import * as React from "react"
import { invoke } from "@tauri-apps/api/core"
import { useAppState } from "@/lib/app-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loader2, Lock } from "lucide-react"

/**
 * Asks for the sudo password once and keeps it in memory for this session.
 * Packall authenticates as the current user itself, so no terminal prompt (and
 * no other account) is ever involved.
 */
export function PasswordDialog() {
  const { passwordPromptOpen, finishPasswordPrompt } = useAppState()
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [failures, setFailures] = React.useState(0)
  const [checking, setChecking] = React.useState(false)

  React.useEffect(() => {
    if (passwordPromptOpen) {
      setPassword("")
      setError(null)
      setFailures(0)
    }
  }, [passwordPromptOpen])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || checking) return
    setChecking(true)
    try {
      await invoke("unlock_privileges", { password })
      setPassword("")
      finishPasswordPrompt(true)
    } catch (err) {
      setFailures((n) => n + 1)
      setError(typeof err === "string" ? err : "Incorrect password")
      setPassword("")
    } finally {
      setChecking(false)
    }
  }

  return (
    <Dialog open={passwordPromptOpen} onOpenChange={(open) => !open && finishPasswordPrompt(false)}>
      <DialogContent className="max-w-sm">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-4 text-primary" /> Password required
            </DialogTitle>
            <DialogDescription>
              Installing system packages needs administrator rights. Enter your account password.
              It stays in memory only and is never saved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Input
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            {failures >= 2 && (
              <p className="text-xs text-muted-foreground">
                Several wrong attempts can temporarily lock your account.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => finishPasswordPrompt(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!password || checking}>
              {checking && <Loader2 className="size-4 animate-spin" />}
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
