# Contributing Software Entries

We welcome contributions to the LinuxDir software catalog! If your favorite Linux app or tool is missing, adding it is straightforward.

## Workflow

1. Fork the [LinuxDir repository](https://github.com/nishu-murmu/almanac).
2. Create a new branch: `git checkout -b add-myapp`.
3. Open `packages/shared/src/software.ts` (and `src/lib/software.ts`).
4. Append your new `SoftwareEntry` object to the `SOFTWARE` array.
5. Verify with TypeScript checks: `npm run typecheck` or `npm run build`.
6. Submit a Pull Request.

---

## Example Entry

```ts
{
  id: "zellij",
  name: "Zellij",
  tagline: "A terminal workspace with batteries included",
  description: "Zellij is a terminal multiplexer and workspace with built-in tabs, pane management, layout system, and webassembly plugin system.",
  category: "terminal",
  homepage: "https://zellij.dev",
  license: "MIT",
  tags: ["multiplexer", "terminal", "workspace", "rust"],
  featured: true,
  install: [
    {
      method: "cargo",
      command: "cargo install --locked zellij",
      notes: "Requires Rust toolchain"
    },
    {
      method: "pacman",
      command: "sudo pacman -S zellij"
    },
    {
      method: "brew",
      command: "brew install zellij"
    },
    {
      method: "appimage",
      command: "curl -LO https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz && tar -xvf zellij*.tar.gz && sudo mv zellij /usr/local/bin/"
    }
  ]
}
```

---

## Inclusion Criteria

- The software must run reliably on modern Linux systems.
- Preference for open-source (GPL, MIT, Apache, BSD, MPL) software.
- Quality proprietary tools (e.g. Steam, 1Password, AnyDesk) are accepted if they provide official Linux packages.
- Provide at least two distinct installation methods whenever possible.
