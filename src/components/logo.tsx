import { cn } from "@/lib/utils"

/** Packall block logo — matches the marketing site's ▚ glyph. */
export function Logo({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl",
  }[size]

  return (
    <span
      aria-hidden="true"
      className={cn("shrink-0 select-none text-primary", sizeClass, className)}
    >
      ▚
    </span>
  )
}
