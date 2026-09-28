import { invoke } from "@tauri-apps/api/core"
import { open as shellOpen } from "@tauri-apps/plugin-shell"

/**
 * Universal external URL opener that safely works inside Tauri webview,
 * falling back to browser window.open if running in pure web environment.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (!url) return

  // 1. Try custom Tauri invoke command (uses open::that under the hood in Rust)
  try {
    await invoke("open_external_url", { url })
    return
  } catch (err) {
    console.debug("open_external_url invoke failed, trying shell plugin:", err)
  }

  // 2. Try Tauri Shell plugin open
  try {
    await shellOpen(url)
    return
  } catch (err) {
    console.debug("shellOpen failed, falling back to window.open:", err)
  }

  // 3. Fallback for pure web browser dev environment
  try {
    window.open(url, "_blank", "noopener,noreferrer")
  } catch (err) {
    console.error("Failed to open URL:", url, err)
  }
}
