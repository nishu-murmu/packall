import * as React from "react"
import {
  Globe,
  MessageSquare,
  Code2,
  FileText,
  Gamepad2,
  Play,
  Server,
  Wrench,
  Terminal,
  Settings2,
  ShieldCheck,
  Box,
  GraduationCap,
  Palette,
  Star,
  Download,
  Settings,
  Search,
  HelpCircle,
  ChevronRight,
  Heart,
  Check,
  ExternalLink,
  Package,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  MessageSquare,
  Code2,
  FileText,
  Gamepad2,
  Play,
  Server,
  Wrench,
  Terminal,
  Settings2,
  ShieldCheck,
  Box,
  GraduationCap,
  Palette,
  Star,
  Download,
  Settings,
  Search,
  HelpCircle,
  ChevronRight,
  Heart,
  Check,
  ExternalLink,
  Package,
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = ICON_MAP[name] ?? Package
  return <Icon className={className} />
}
