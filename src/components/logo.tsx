import { cn } from "@/lib/utils"

/** Packall app icon — the same artwork as the marketing site. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="Packall"
      draggable={false}
      className={cn("size-8 shrink-0 select-none", className)}
    />
  )
}
