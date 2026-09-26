import type { Category, CategoryId } from "./types"

export const CATEGORIES: Category[] = [
  {
    id: "browsers",
    name: "Browsers",
    description: "Web browsers for navigating the internet",
    icon: "Globe",
  },
  {
    id: "communications",
    name: "Communications",
    description: "Chat, email, and communication tools",
    icon: "MessageSquare",
  },
  {
    id: "development",
    name: "Development",
    description: "Code editors, IDEs, and developer tooling",
    icon: "Code2",
  },
  {
    id: "documents",
    name: "Documents",
    description: "Office suites, note-taking, and PDF tools",
    icon: "FileText",
  },
  {
    id: "games",
    name: "Games",
    description: "Gaming clients, emulators, and game managers",
    icon: "Gamepad2",
  },
  {
    id: "multimedia",
    name: "Multimedia",
    description: "Audio, video, and media playback tools",
    icon: "Play",
  },
  {
    id: "self-hosted",
    name: "Self-Hosted",
    description: "Self-hosted services and server applications",
    icon: "Server",
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Everyday utility apps and helpers",
    icon: "Wrench",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Terminal emulators and shell tools",
    icon: "Terminal",
  },
  {
    id: "system",
    name: "System",
    description: "System management and configuration tools",
    icon: "Settings2",
  },
  {
    id: "security",
    name: "Security",
    description: "Privacy, encryption, and security tools",
    icon: "ShieldCheck",
  },
  {
    id: "virtualization",
    name: "Virtualization",
    description: "VMs, containers, and sandboxing",
    icon: "Box",
  },
  {
    id: "education",
    name: "Education",
    description: "Learning and reference applications",
    icon: "GraduationCap",
  },
  {
    id: "graphics",
    name: "Graphics",
    description: "Image editing, 3D, and design tools",
    icon: "Palette",
  },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, Category>
)
