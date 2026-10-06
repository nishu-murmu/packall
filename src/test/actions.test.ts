import { describe, expect, it } from "vitest"
import {
  bootstrapCommands,
  buildCommands,
  buildSystemPackageCommands,
  familyFromDistro,
  hasNativePackage,
  matchesDistroFilter,
  missingUniversalFor,
  parseOption,
  pickOption,
} from "@/lib/actions"
import { SOFTWARE_MAP, SOFTWARE } from "@/lib/software"
import type { DistroInfo, PackageManagerInfo, SoftwareEntry } from "@/lib/types"

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
      "flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
      "flatpak install --user -y --noninteractive flathub org.x.Y",
    ])
    expect(buildCommands("install", opt("zypper", "sudo zypper install git"))).toEqual([
      "sudo zypper --non-interactive install git",
    ])
  })

  it("builds update and remove commands", () => {
    expect(buildCommands("remove", opt("apt", "sudo apt install git"))).toEqual(["sudo apt-get remove -y git"])
    expect(buildCommands("remove", opt("pacman", "sudo pacman -S git"))).toEqual(["sudo pacman -Rns --noconfirm git"])
    expect(buildCommands("update", opt("dnf", "sudo dnf install git"))).toEqual(["sudo dnf upgrade -y git"])
    expect(buildCommands("update", opt("flatpak", "flatpak install flathub a.b.C"))[0]).toContain(
      "flatpak update --user -y --noninteractive a.b.C ||"
    )
  })

  it("uses the installed AUR helper with a graphical sudo", () => {
    const o = { method: "aur" as const, command: "yay -S vivaldi" }
    expect(buildCommands("install", o, [mgr("paru"), mgr("yay", false)])[0]).toBe(
      "paru -S --needed --noconfirm vivaldi"
    )
    expect(buildCommands("install", o, [mgr("paru", false), mgr("yay")])[0]).toContain("yay -S")
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
    expect(buildSystemPackageCommands("remove", pkg)).toEqual([
      "flatpak uninstall --user -y --noninteractive org.mozilla.firefox || sudo flatpak uninstall --system -y --noninteractive org.mozilla.firefox",
    ])
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
    // Synthetic so the assertion tests the fallback, not today's catalogue data.
    const flatpakOnly: SoftwareEntry = {
      ...firefox,
      id: "flatpak-only",
      install: [{ method: "flatpak", command: "flatpak install flathub com.example.App" }],
    }
    const fedora = pickOption(flatpakOnly, "install", {
      distro: distro("fedora"),
      managers: [mgr("dnf"), mgr("flatpak")],
      systemPackages: [],
    })
    expect(fedora?.method).toBe("flatpak")
  })

  it("prefers the native package once the distro has one", () => {
    const fedora = pickOption(firefox, "install", {
      distro: distro("fedora"),
      managers: [mgr("dnf"), mgr("flatpak")],
      systemPackages: [],
    })
    expect(fedora?.method).toBe("dnf")
    const suse = pickOption(firefox, "install", {
      distro: distro("suse"),
      managers: [mgr("zypper"), mgr("flatpak")],
      systemPackages: [],
    })
    expect(suse?.method).toBe("zypper")
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
    expect(matchesDistroFilter(firefox, "fedora")).toBe(true)
    expect(matchesDistroFilter(firefox, "suse")).toBe(true)
    expect(matchesDistroFilter(firefox, "flatpak")).toBe(true)
    expect(matchesDistroFilter(firefox, "all")).toBe(true)
  })

  it("keeps universal-only apps in every distro view", () => {
    // Spotify has no native package anywhere; Flatpak is the only way in.
    const universalOnly: SoftwareEntry = {
      ...SOFTWARE_MAP["firefox"],
      id: "universal-only",
      install: [{ method: "flatpak", command: "flatpak install flathub com.example.App" }],
    }
    for (const f of ["debian", "fedora", "arch", "suse"] as const) {
      expect(matchesDistroFilter(universalOnly, f), `filter '${f}'`).toBe(true)
      expect(hasNativePackage(universalOnly, f), `native '${f}'`).toBe(false)
    }
  })

  it("excludes apps that cannot be installed on the family at all", () => {
    const archOnly: SoftwareEntry = {
      ...SOFTWARE_MAP["firefox"],
      id: "arch-only",
      install: [{ method: "aur", command: "paru -S something" }],
    }
    expect(matchesDistroFilter(archOnly, "arch")).toBe(true)
    expect(matchesDistroFilter(archOnly, "fedora")).toBe(false)
    expect(matchesDistroFilter(archOnly, "suse")).toBe(false)
  })

  it("every filter returns a usable share of the catalogue", () => {
    for (const f of ["debian", "fedora", "arch", "suse", "flatpak", "snap"] as const) {
      const n = SOFTWARE.filter((s) => matchesDistroFilter(s, f)).length
      expect(n, `filter '${f}' matched ${n} entries`).toBeGreaterThan(20)
    }
  })

  it("every distro family has real native packages in the catalogue", () => {
    for (const f of ["debian", "fedora", "arch", "suse"] as const) {
      const n = SOFTWARE.filter((s) => hasNativePackage(s, f)).length
      expect(n, `family '${f}' has only ${n} native packages`).toBeGreaterThan(50)
    }
  })

  it("classifies distro ids when the backend sends no family", () => {
    expect(familyFromDistro({ ...distro(undefined, "linuxmint") })).toBe("debian")
    expect(familyFromDistro({ ...distro(undefined, "opensuse-tumbleweed") })).toBe("suse")
    expect(familyFromDistro(null)).toBe("other")
  })
})

describe("Flatpak/Snap bootstrap", () => {
  const firefox = SOFTWARE_MAP["firefox"]

  it("asks for flatpak when it is the only option and the tool is missing", () => {
    // Fedora box with neither dnf-native firefox match usable nor flatpak installed.
    const miss = missingUniversalFor(firefox, {
      distro: distro("fedora"),
      managers: [mgr("dnf", false), mgr("flatpak", false)],
      systemPackages: [],
    })
    expect(miss).toBe("flatpak")
  })

  it("does not ask when a native or installed method exists", () => {
    expect(
      missingUniversalFor(firefox, {
        distro: distro("debian"),
        managers: [mgr("apt")],
        systemPackages: [],
      })
    ).toBeNull()
    expect(
      missingUniversalFor(firefox, {
        distro: distro("fedora"),
        managers: [mgr("flatpak")],
        systemPackages: [],
      })
    ).toBeNull()
  })

  it("builds runtime-install commands per distro family", () => {
    expect(bootstrapCommands("flatpak", distro("debian"))[0]).toBe("sudo apt-get install -y flatpak")
    expect(bootstrapCommands("flatpak", distro("fedora"))[0]).toBe("sudo dnf install -y flatpak")
    expect(bootstrapCommands("flatpak", distro("arch"))[0]).toBe("sudo pacman -S --needed --noconfirm flatpak")
    expect(bootstrapCommands("flatpak", distro("debian"))).toContain(
      "flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo"
    )
    const snap = bootstrapCommands("snap", distro("fedora"))
    expect(snap[0]).toBe("sudo dnf install -y snapd")
    expect(snap).toContain("sudo systemctl enable --now snapd.socket")
  })
})
