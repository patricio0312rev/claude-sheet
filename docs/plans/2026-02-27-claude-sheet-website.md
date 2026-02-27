# Claude Code Cheat Sheet Website — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a terminal-aesthetic static website at clawd.patriciomarroquin.dev that renders the Claude Code cheat sheet markdown with search, copy buttons, keyboard navigation, and a sticky TOC.

**Architecture:** Single-page Astro static site using content collections to load the cheat sheet markdown at build time. React islands handle interactive features (search, copy, keyboard nav). Tailwind v4 handles all styling with custom CSS for terminal effects.

**Tech Stack:** Astro 5.x, React 19, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript strict, ESLint flat config + Prettier (matching qhali-landing patterns)

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Create: `eslint.config.mjs`
- Create: `.gitignore`

**Step 1: Create the Astro project in the existing repo**

```bash
cd ~/Sites/claude-sheet
pnpm create astro@latest . --template minimal --no-install
```

If prompted about existing files, accept overwriting (we keep CHEAT-SHEET.md).

**Step 2: Install dependencies**

```bash
pnpm add astro @astrojs/react react react-dom
pnpm add -D @tailwindcss/vite tailwindcss typescript @types/react @types/react-dom @astrojs/check
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-astro astro-eslint-parser
pnpm add -D prettier prettier-plugin-astro
```

**Step 3: Configure astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Step 4: Configure tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

**Step 5: Configure ESLint (eslint.config.mjs)**

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';

export default tseslint.config(
  { ignores: ['dist/', '.astro/'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,mjs}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
    },
  },
  ...astroPlugin.configs.recommended
);
```

**Step 6: Configure Prettier (.prettierrc)**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

**Step 7: Create .prettierignore**

```
pnpm-lock.yaml
dist/
.astro/
```

**Step 8: Add scripts to package.json**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "astro check"
  }
}
```

**Step 9: Update .gitignore**

Ensure it includes:
```
node_modules/
dist/
.astro/
.vercel/
```

**Step 10: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json eslint.config.mjs .prettierrc .prettierignore .gitignore
git commit -m "chore: scaffold Astro project with React, Tailwind, ESLint, Prettier"
```

---

### Task 2: Set up content collection and global styles

**Files:**
- Move: `CHEAT-SHEET.md` → `src/content/sheet/cheat-sheet.md`
- Create: `src/content.config.ts`
- Create: `src/styles/global.css`

**Step 1: Create content directory and move the markdown**

```bash
mkdir -p src/content/sheet
mv CHEAT-SHEET.md src/content/sheet/cheat-sheet.md
```

**Step 2: Create content config (src/content.config.ts)**

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const sheet = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sheet' }),
});

export const collections = { sheet };
```

**Step 3: Create global CSS (src/styles/global.css)**

```css
@import 'tailwindcss';

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 100 800;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/jetbrainsmono/v20/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmNZDlk.woff2') format('woff2');
}

@theme {
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  --color-terminal-green: #00ff41;
  --color-terminal-green-dim: #00cc33;
  --color-terminal-amber: #ffb000;
  --color-terminal-bg: #0a0a0a;
  --color-terminal-surface: #111111;
  --color-terminal-border: #1a1a1a;
  --color-terminal-text: #cccccc;
  --color-terminal-text-dim: #666666;
}
```

**Step 4: Commit**

```bash
git add src/content/ src/styles/global.css src/content.config.ts
git commit -m "feat: set up content collection and terminal theme tokens"
```

---

## Phase 2: Layout & Page Shell

### Task 3: Create the base layout

**Files:**
- Create: `src/layouts/Layout.astro`

**Step 1: Create the layout**

```astro
---
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en" class="bg-terminal-bg">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body class="font-mono text-terminal-text min-h-screen">
    <slot />
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
```

**Step 2: Create favicon (src/public/favicon.svg)**

A simple terminal prompt `>_` icon in green.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#0a0a0a"/>
  <text x="4" y="23" font-family="monospace" font-size="20" fill="#00ff41">›_</text>
</svg>
```

**Step 3: Commit**

```bash
git add src/layouts/Layout.astro public/favicon.svg
git commit -m "feat: add base layout with terminal theme and favicon"
```

---

### Task 4: Create the main index page

**Files:**
- Create: `src/pages/index.astro`

**Step 1: Create the page that loads and renders the cheat sheet**

```astro
---
import Layout from '../layouts/Layout.astro';
import { getEntry, render } from 'astro:content';

const entry = await getEntry('sheet', 'cheat-sheet');
const { Content, headings } = await render(entry);
---

<Layout
  title="clawd — Claude Code Cheat Sheet"
  description="Everything you need in one place — Commands, Shortcuts, Features & Tips for Claude Code"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <header class="py-8 sm:py-12 border-b border-terminal-border">
      <div class="flex items-center gap-2 text-terminal-green text-sm mb-4">
        <span class="text-terminal-text-dim">$</span>
        <span>clawd</span>
        <span class="animate-pulse">▊</span>
      </div>
      <h1 class="text-2xl sm:text-4xl font-bold text-terminal-green tracking-tight">
        Claude Code Cheat Sheet
      </h1>
      <p class="text-terminal-text-dim mt-2 text-sm sm:text-base">
        Everything you need in one place — Commands, Shortcuts, Features & Tips
      </p>
      <span class="inline-block mt-3 px-2 py-0.5 text-xs border border-terminal-green/30 text-terminal-green rounded">
        2026 EDITION
      </span>
    </header>

    <!-- Main content area with sidebar -->
    <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8 py-8">
      <!-- TOC Sidebar (placeholder — Task 5) -->
      <aside id="toc-sidebar" class="hidden lg:block">
        <nav class="sticky top-8">
          <h2 class="text-xs uppercase tracking-wider text-terminal-text-dim mb-4">Contents</h2>
          <ul class="space-y-1 text-sm">
            {headings.filter((h) => h.depth === 2).map((heading) => (
              <li>
                <a
                  href={`#${heading.slug}`}
                  class="block py-1 text-terminal-text-dim hover:text-terminal-green transition-colors truncate"
                  data-toc-link
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <!-- Rendered markdown content -->
      <main class="prose-terminal min-w-0">
        <Content />
      </main>
    </div>

    <!-- Footer -->
    <footer class="border-t border-terminal-border py-6 text-center text-xs text-terminal-text-dim">
      <p>
        Built with <a href="https://astro.build" class="text-terminal-green hover:underline">Astro</a>
        · Source on <a href="https://github.com/patricio0312rev/claude-sheet" class="text-terminal-green hover:underline">GitHub</a>
      </p>
    </footer>
  </div>
</Layout>
```

**Step 2: Run dev server to verify it renders**

```bash
pnpm dev
```

Expected: Page loads at localhost:4321 with raw markdown content rendered (unstyled tables and headings).

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add index page with content rendering and TOC sidebar"
```

---

## Phase 3: Terminal Styling

### Task 5: Style the rendered markdown with terminal aesthetic

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Add prose-terminal styles to global.css**

Add comprehensive styles for the rendered markdown content: headings with green color, tables with terminal borders, code blocks with dark backgrounds, blockquotes with green left border, horizontal rules as dashed lines, etc.

Key styling targets:
- `.prose-terminal h2` — green color, border-bottom
- `.prose-terminal table` — monospace, bordered, striped rows with terminal-surface bg
- `.prose-terminal code` — green text on dark bg
- `.prose-terminal pre` — terminal-surface bg with padding
- `.prose-terminal blockquote` — left border green, dim text
- `.prose-terminal a` — green with underline on hover
- `.prose-terminal hr` — dashed border in terminal-border color
- Mobile-responsive table with horizontal scroll

**Step 2: Add CRT scanline effect (subtle, CSS-only)**

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

**Step 3: Verify the page looks properly styled**

```bash
pnpm dev
```

Expected: Terminal-themed page with green headings, bordered tables, styled code blocks.

**Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add terminal-aesthetic prose styles and CRT scanline effect"
```

---

## Phase 4: Interactive Features (React Islands)

### Task 6: Copy button component

**Files:**
- Create: `src/components/CopyButton.tsx`
- Create: `src/components/CodeBlockWrapper.tsx`

**Step 1: Create the CopyButton React component**

A button that copies text to clipboard and shows "Copied!" feedback for 2 seconds.

Props: `{ text: string }`

Uses `navigator.clipboard.writeText()`, internal state for copied feedback.

Styled: small green-bordered button, shows checkmark on copy.

**Step 2: Create CodeBlockWrapper that adds copy buttons to all pre/code blocks**

A client-side React component that uses `useEffect` to find all `pre > code` elements, extract their text content, and inject a copy button into each `pre` block.

This component wraps the content area and uses DOM manipulation post-render.

**Step 3: Add the component to index.astro as a React island**

```astro
<CodeBlockWrapper client:load>
  <Content />
</CodeBlockWrapper>
```

**Step 4: Verify copy buttons appear on code blocks**

```bash
pnpm dev
```

Expected: Each code block has a small copy button in the top-right corner. Clicking shows "Copied!" briefly.

**Step 5: Commit**

```bash
git add src/components/CopyButton.tsx src/components/CodeBlockWrapper.tsx src/pages/index.astro
git commit -m "feat: add copy-to-clipboard buttons on code blocks"
```

---

### Task 7: Search/filter component

**Files:**
- Create: `src/components/Search.tsx`

**Step 1: Create the Search React component**

A search input that:
- Styled as a terminal input (`$ search: ` prefix visual)
- Filters sections by hiding/showing `h2` sections based on search text
- Matches against heading text and table cell content
- Press `/` to focus (global keydown listener)
- Press `Escape` to clear and blur
- Shows match count

Uses `useEffect` + `useRef` for DOM interaction. Finds all sections (content between `h2` elements), toggles their visibility based on search match.

**Step 2: Add Search to index.astro as a React island**

Place it in the header area, between the title and the content grid.

```astro
<Search client:load />
```

**Step 3: Verify search works**

```bash
pnpm dev
```

Expected: Typing in search filters visible sections. `/` focuses the input. `Escape` clears.

**Step 4: Commit**

```bash
git add src/components/Search.tsx src/pages/index.astro
git commit -m "feat: add search/filter with keyboard shortcut"
```

---

### Task 8: Keyboard navigation

**Files:**
- Create: `src/components/KeyboardNav.tsx`

**Step 1: Create KeyboardNav React island**

A headless component (renders nothing visible) that:
- `j` — scroll to next `h2` section
- `k` — scroll to previous `h2` section
- Only active when not focused on an input/textarea
- Shows a small hint in bottom-right corner: `j/k navigate · / search`

**Step 2: Add to index.astro**

```astro
<KeyboardNav client:load />
```

**Step 3: Verify keyboard navigation**

Expected: Pressing `j` and `k` scrolls between sections smoothly.

**Step 4: Commit**

```bash
git add src/components/KeyboardNav.tsx src/pages/index.astro
git commit -m "feat: add keyboard navigation between sections"
```

---

### Task 9: Scroll spy for TOC

**Files:**
- Create: `src/components/ScrollSpy.tsx`

**Step 1: Create ScrollSpy React island**

Uses `IntersectionObserver` to track which `h2` section is currently in view. Updates the corresponding `[data-toc-link]` in the sidebar by adding an active class (green text, left border).

**Step 2: Add to index.astro**

```astro
<ScrollSpy client:load />
```

**Step 3: Verify scroll spy highlights TOC**

Expected: As you scroll, the current section is highlighted in the sidebar TOC.

**Step 4: Commit**

```bash
git add src/components/ScrollSpy.tsx src/pages/index.astro
git commit -m "feat: add scroll spy to highlight active TOC section"
```

---

## Phase 5: Mobile Experience

### Task 10: Mobile TOC (hamburger/dropdown)

**Files:**
- Create: `src/components/MobileToc.tsx`
- Modify: `src/pages/index.astro`

**Step 1: Create MobileToc React component**

A floating button (bottom-right on mobile) that:
- Shows a "Contents" button with a list icon
- Opens a full-screen overlay with all section links
- Tapping a link scrolls to the section and closes the overlay
- Only visible on screens < `lg` breakpoint

**Step 2: Add to index.astro as a React island**

Pass the headings data as a prop.

**Step 3: Verify mobile experience**

Use browser dev tools mobile view. The TOC button should appear and work.

**Step 4: Commit**

```bash
git add src/components/MobileToc.tsx src/pages/index.astro
git commit -m "feat: add mobile TOC overlay"
```

---

## Phase 6: SEO & Meta

### Task 11: Add meta tags and Open Graph

**Files:**
- Modify: `src/layouts/Layout.astro`
- Create: `public/og-image.png` (generate or create a simple OG image)

**Step 1: Add comprehensive meta tags to Layout.astro head**

- Open Graph: title, description, image, url, type
- Twitter Card: summary_large_image
- Canonical URL
- Theme color (#0a0a0a)

**Step 2: Commit**

```bash
git add src/layouts/Layout.astro public/og-image.png
git commit -m "feat: add SEO meta tags and Open Graph"
```

---

## Phase 7: Final Polish & Deploy

### Task 12: Lint, format, typecheck, build

**Step 1: Run all checks**

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```

Fix any issues.

**Step 2: Preview the production build**

```bash
pnpm preview
```

Verify everything works in the production build.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix lint, format, and typecheck issues"
```

### Task 13: Deploy to Vercel

**Step 1: Connect the repo to Vercel**

- Go to vercel.com → Import project → select `claude-sheet`
- Framework preset: Astro
- Build command: `pnpm build`
- Output directory: `dist`

**Step 2: Configure custom domain**

- Add `clawd.patriciomarroquin.dev` as a custom domain in Vercel project settings
- Add the CNAME/A record in your DNS provider pointing to Vercel

**Step 3: Verify the deployment**

Visit `clawd.patriciomarroquin.dev` and confirm everything works.

---

## Out of Scope

- Light mode / theme toggle (dark only)
- Analytics (user will configure in Vercel)
- Comments or social features
- Multi-page routing (single page)
- Blog or additional content pages
- Backend or API
