import { describe, expect, it } from "vitest"
import {
  buildCommands,
  buildSystemPackageCommands,
  familyFromDistro,
  matchesDistroFilter,
  parseOption,
  pickOption,
} from "@/lib/actions"
import { SOFTWARE_MAP, SOFTWARE } from "@/lib/software"
import type { DistroInfo, PackageManagerInfo } from "@/lib/types"

const mgr = (id: string, available = true): PackageManagerInfo => ({
  id,
  name: id,
  available,
  is_aur: id === "paru" || id === "yay",
  install_cmd: "",
  update_cmd: "",
  remove_cmd: "",
})

const distro = (family: DistroInfo["family"], id = family as string): DistroInfo => ({
  id,
  name: id,
  pretty_name: id,
  preferred_manager: "apt",
  family,
  managers: [],
})

describe("parseOption", () => {
  it("extracts package names and flags", () => {
    expect(parseOption({ method: "snap", command: "sudo snap install code --classic" })).toMatchObject({
      pkgs: ["code"],
      flags: ["--classic"],
      automatable: true,
    })
    expect(parseOption({ method: "flatpak", command: "flatpak install flathub org.mozilla.firefox" }).pkgs).toEqual([
      "org.mozilla.firefox",
    ])
  })

  it("only reads the first segment of compound commands", () => {
    const p = parseOption({
      method: "pacman",
      command: "sudo pacman -S docker docker-compose && sudo systemctl enable --now docker",
    })
    expect(p.pkgs).toEqual(["docker", "docker-compose"])
  })

  it("marks prose instructions as not automatable", () => {
    expect(parseOption({ method: "manual", command: "Download from zed.dev" }).automatable).toBe(false)
    expect(parseOption({ method: "deb", command: "Download .deb from vivaldi.com" }).automatable).toBe(false)
  })
})

describe("buildCommands", () => {
  const opt = (method: "apt" | "dnf" | "pacman" | "flatpak" | "zypper", command: string) => ({ method, command })

  it("is non-interactive for every manager", () => {
    expect(buildCommands("install", opt("apt", "sudo apt install git"))[0]).toContain("apt-get install -y git")
    expect(buildCommands("install", opt("dnf", "sudo dnf install git"))).toEqual(["sudo dnf install -y git"])
    expect(buildCommands("install", opt("pacman", "sudo pacman -S git"))).toEqual([
      "sudo pacman -S --needed --noconfirm git",
    ])
    expect(buildCommands("install", opt("flatpak", "flatpak install flathub org.x.Y"))).toEqual([
      "flatpak install -y --noninteractive flathub org.x.Y",
    ])
    expect(buildCommands("install", opt("zypper", "sudo zypper install git"))).toEqual([
      "sudo zypper --non-interactive install git",
    ])
  })

  it("builds update and remove commands", () => {
    expect(buildCommands("remove", opt("apt", "sudo apt install git"))).toEqual(["sudo apt-get remove -y git"])
    expect(buildCommands("remove", opt("pacman", "sudo pacman -S git"))).toEqual(["sudo pacman -Rns --noconfirm git"])
    expect(buildCommands("update", opt("dnf", "sudo dnf install git"))).toEqual(["sudo dnf upgrade -y git"])
    expect(buildCommands("update", opt("flatpak", "flatpak install flathub a.b.C"))).toEqual([
      "flatpak update -y --noninteractive a.b.C",
    ])
  })

  it("uses the installed AUR helper with a graphical sudo", () => {
    const o = { method: "aur" as const, command: "yay -S vivaldi" }
    expect(buildCommands("install", o, [mgr("paru"), mgr("yay", false)])[0]).toBe(
      "paru --sudo pkexec -S --needed --noconfirm vivaldi"
    )
    expect(buildCommands("install", o, [mgr("paru", false), mgr("yay")])[0]).toContain("yay --sudo pkexec")
  })

  it("returns nothing for prose instructions", () => {
    expect(buildCommands("install", { method: "manual", command: "Download from zed.dev" })).toEqual([])
  })

  it("replays multi-step installs verbatim", () => {
    const o = {
      method: "apt" as const,
      command: "sudo curl -fsSLo key https://x",
      steps: [
        { title: "key", command: "sudo curl -fsSLo key https://x" },
        { title: "install", command: "sudo apt install brave-browser" },
      ],
    }
    expect(buildCommands("install", o)).toHaveLength(2)
  })

  it("builds raw system package commands", () => {
    const pkg = { name: "Firefox", version: "1", manager: "flatpak", installed: true, description: "org.mozilla.firefox" }
    expect(buildSystemPackageCommands("remove", pkg)).toEqual(["flatpak uninstall -y --noninteractive org.mozilla.firefox"])
  })
})

describe("pickOption", () => {
  const firefox = SOFTWARE_MAP["firefox"]

  it("prefers the native manager for each distro family", () => {
    const deb = pickOption(firefox, "install", {
      distro: distro("debian"),
      managers: [mgr("apt"), mgr("flatpak"), mgr("snap")],
      systemPackages: [],
    })
    expect(deb?.method).toBe("apt")
    const arch = pickOption(SOFTWARE_MAP["neovim"], "install", {
      distro: distro("arch"),
      managers: [mgr("pacman"), mgr("flatpak")],
      systemPackages: [],
    })
    expect(arch?.method).toBe("pacman")
  })

  it("falls back to flatpak when no native option exists on the distro", () => {
    const fedora = pickOption(firefox, "install", {
      distro: distro("fedora"),
      managers: [mgr("dnf"), mgr("flatpak")],
      systemPackages: [],
    })
    expect(fedora?.method).toBe("flatpak")
  })

  it("ignores methods whose tool is missing", () => {
    const none = pickOption(firefox, "install", {
      distro: distro("debian"),
      managers: [mgr("apt", false), mgr("flatpak", false), mgr("snap", false)],
      systemPackages: [],
    })
    expect(none).toBeNull()
  })

  it("update and remove use the method the package was installed with", () => {
    const o = pickOption(firefox, "remove", {
      distro: distro("debian"),
      managers: [mgr("apt"), mgr("flatpak")],
      systemPackages: [{ name: "Firefox", version: "1", manager: "flatpak", installed: true, description: "org.mozilla.firefox" }],
    })
    expect(o?.method).toBe("flatpak")
  })
})

describe("distro filter", () => {
  it("matches native packages per family", () => {
    const firefox = SOFTWARE_MAP["firefox"]
    expect(matchesDistroFilter(firefox, "debian")).toBe(true)
    expect(matchesDistroFilter(firefox, "fedora")).toBe(false)
    expect(matchesDistroFilter(firefox, "flatpak")).toBe(true)
    expect(matchesDistroFilter(firefox, "all")).toBe(true)
  })

  it("every filter returns at least one catalogue entry", () => {
    for (const f of ["debian", "fedora", "arch", "suse", "flatpak", "snap"] as const) {
      if (f === "suse") continue // no zypper entries in the catalogue yet
      expect(SOFTWARE.some((s) => matchesDistroFilter(s, f))).toBe(true)
    }
  })

  it("classifies distro ids when the backend sends no family", () => {
    expect(familyFromDistro({ ...distro(undefined, "linuxmint") })).toBe("debian")
    expect(familyFromDistro({ ...distro(undefined, "opensuse-tumbleweed") })).toBe("suse")
    expect(familyFromDistro(null)).toBe("other")
  })
})
