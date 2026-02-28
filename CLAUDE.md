# Claude Code Cheat Sheet — Project Guide

## Project Overview

A single-page static site built with Astro 5, React 19 islands, and Tailwind CSS 4. Displays a cheat sheet for Claude Code (Anthropic's CLI tool). Deployed at `clawd.patriciomarroquin.dev`.

## Commands

```bash
pnpm dev        # Start dev server (localhost:4321)
pnpm build      # Production build to dist/
pnpm preview    # Preview production build
pnpm lint       # ESLint
pnpm format     # Prettier (write)
pnpm typecheck  # Astro check + TypeScript
```

## Architecture

### Stack

- **Astro 5** — static site generator, content collections, SSG
- **React 19** — island components via `client:load`
- **Tailwind CSS 4** — styling via `@tailwindcss/vite` plugin, `@theme` block for design tokens
- **Lucide React** — icons for section headings, search, and sticky header

### Key Constraints

- **Astro islands are isolated React roots.** Module-level state (e.g., a `Set` of listeners) is NOT shared between islands. Use `CustomEvent` on `window` to communicate across islands.
- **Use `createElement` (not JSX) inside `useEffect` with `createRoot`.** JSX in that context causes `jsxDEV is not a function` errors.
- **pnpm only.** npm is broken on this machine.

### Content

All cheat sheet content lives in `src/content/sheet/cheat-sheet.md`. The markdown is rendered by Astro's content collections and enhanced client-side by React island components (icons, copy buttons, search, etc.).

### Design Tokens

Defined in `src/styles/global.css` under `@theme`. Key tokens:

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#FAFAF7` | `#141310` |
| `--color-surface` | `#F0EFE9` | `#1E1D19` |
| `--color-text` | `#1A1A1A` | `#E8E6DF` |
| `--color-accent` | `#C53D2D` | `#E05544` |
| `--color-green` | `#2D7D46` | `#4CAF68` |

Dark mode overrides use `html.dark { ... }` in the same file.

### Design Language

Brutalist: zero border-radius, offset shadows (`3px 3px 0`), square stroke caps/joins, textured grain overlay via SVG filter on `body::before`.

## File Map

| Path | Purpose |
|------|---------|
| `src/pages/index.astro` | Single page — header, sidebar TOC, content, footer |
| `src/layouts/Layout.astro` | HTML shell — meta tags, OG, dark mode FOUC prevention |
| `src/content/sheet/cheat-sheet.md` | All cheat sheet content (markdown) |
| `src/styles/global.css` | Design tokens, typography, prose styles, animations |
| `src/utils/icons.ts` | Shared `SECTION_ICONS` map (lucide icons per section) |
| `src/utils/dom.ts` | `isInputFocused()` helper |

### Components

| Component | What it does |
|-----------|-------------|
| `ClaudeIcon` | Inline SVG of the Claude AI logo |
| `CopyButton` | Copy button on code blocks, uses `showToast` |
| `CopyButtons` | Finds all `<pre>` blocks and mounts a `CopyButton` on each |
| `CopyCommands` | Adds click-to-copy on table rows (command sections) and inline code (content sections) |
| `HeadingIcons` | Injects lucide icons into H2 headings |
| `KeyboardNav` | Shows `j`/`k` keyboard hint, handles section navigation |
| `MobileToc` | Bottom-sheet table of contents for mobile |
| `ScrollSpy` | Tracks scroll position and highlights active TOC link |
| `SearchModal` | Spotlight-style search — `/` key, section filtering, keyboard nav |
| `StickyHeader` | Fixed header on scroll — logo, search trigger, theme toggle |
| `ThemeToggle` | Light/dark mode toggle, persists to localStorage |
| `Toast` | Cross-island toast via `CustomEvent` — green checkmark style |

## Cross-Island Communication

Islands communicate through `window` events:

| Event | Dispatched by | Consumed by |
|-------|--------------|-------------|
| `show-toast` | `CopyButton`, `CopyCommands` | `Toast` |
| `open-search` | `StickyHeader`, header button, `/` key | `SearchModal` |
| `theme-changed` | `ThemeToggle` | `StickyHeader` |

Pattern: `window.dispatchEvent(new CustomEvent('event-name', { detail: data }))`.

## Conventions

- **Commits**: `type: description` (conventional commits, lowercase unless acronyms)
- **One file per commit** when possible
- **No co-authors** on commits
- **Branches**: `type/short-descriptive-name` (e.g., `feat/add-search-modal`)
