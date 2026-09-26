# React & State Engine

The frontend is a lightweight, responsive React 19 application running with Tailwind CSS and Radix UI components.

## Keybinding Engine

The keybinding dispatcher operates on an event listener registered on the global `window` object in `use-keybindings.ts`.

### Buffer-Based Sequences

Sequences such as `gg` (jump to top) or number multipliers like `5j` are handled via an internal key buffer with an auto-flush timer:

```ts
const keyBuffer = React.useRef<string>("")
const bufferTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

// If digits are typed, accumulate count
if (/^[0-9]$/.test(key)) {
  keyBuffer.current += key
  e.preventDefault()
  return
}

const count = parseInt(keyBuffer.current || "1", 10)
```

This guarantees standard Vim/Neovim ergonomics in web environments.
