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
import { CATEGORY_MAP } from "@/lib/categories"

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
  categoryId,
  className,
}: {
  name?: string
  categoryId?: string
  className?: string
}) {
  let iconName = name
  if (!iconName && categoryId) {
    const cat = CATEGORY_MAP[categoryId as keyof typeof CATEGORY_MAP]
    iconName = cat?.icon
  }
  const Icon = (iconName ? ICON_MAP[iconName] : undefined) ?? Package
  return <Icon className={className} />
}

