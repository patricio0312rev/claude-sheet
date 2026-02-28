# Sheet Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toggleable "sheet mode" that transforms the linear doc layout into a dense card grid with zoom-on-click modal.

**Architecture:** A new `SheetMode` React island parses the rendered `#sheet-content` DOM by H2 boundaries and renders a card grid when active. A toggle button in the header/sticky header dispatches `view-mode-changed` CustomEvent. Mode persists to localStorage with FOUC prevention via inline script.

**Tech Stack:** React 19 (createElement API), Tailwind CSS 4, Lucide React icons, CSS keyframe animations.

---

### Task 1: FOUC Prevention — Add viewMode inline script

**Files:**
- Modify: `src/layouts/Layout.astro:21-27`

**Step 1: Add viewMode script below the existing theme script**

Add this immediately after the closing `</script>` on line 27:

```html
<script is:inline>
  (function() {
    var v = localStorage.getItem('viewMode');
    if (v === 'sheet') document.documentElement.setAttribute('data-view-mode', 'sheet');
  })();
</script>
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds, no errors.

**Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add viewMode FOUC prevention script"
```

---

### Task 2: Add CSS for sheet mode visibility toggling and card colors

**Files:**
- Modify: `src/styles/global.css` (append at end)

**Step 1: Add sheet mode CSS**

Append these styles to the end of `src/styles/global.css`:

```css
/* ===== Sheet Mode ===== */

/* Hide content/sidebar when in sheet mode */
html[data-view-mode="sheet"] #sheet-content,
html[data-view-mode="sheet"] #toc-sidebar {
  display: none !important;
}

/* Hide sheet grid when in doc mode (default) */
#sheet-grid {
  display: none;
}

html[data-view-mode="sheet"] #sheet-grid {
  display: grid;
}

/* Card color palette */
.sheet-card-border-0 { border-left-color: var(--color-accent); }
.sheet-card-border-1 { border-left-color: var(--color-green); }
.sheet-card-border-2 { border-left-color: #3B82F6; }
.sheet-card-border-3 { border-left-color: #F59E0B; }
.sheet-card-border-4 { border-left-color: #8B5CF6; }
.sheet-card-border-5 { border-left-color: #14B8A6; }
.sheet-card-border-6 { border-left-color: #EC4899; }
.sheet-card-border-7 { border-left-color: #6366F1; }

/* Card preview fade-out gradient */
.sheet-card-preview {
  position: relative;
  max-height: 200px;
  overflow: hidden;
}

.sheet-card-preview::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, var(--color-surface));
  pointer-events: none;
}

/* Sheet zoom modal animations */
@keyframes sheet-backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sheet-modal-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes sheet-modal-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add sheet mode CSS styles and animations"
```

---

### Task 3: Create the SheetMode component — section parsing and card grid

**Files:**
- Create: `src/components/SheetMode.tsx`

**Step 1: Create the SheetMode component**

Create `src/components/SheetMode.tsx` with the full component. This component:

1. Parses `#sheet-content` DOM on mount (same pattern as `SearchModal.buildSections()` but captures `innerHTML`)
2. Listens for `view-mode-changed` events and reads `data-view-mode` attribute
3. Renders a responsive card grid when sheet mode is active
4. Each card shows the section icon, title, and a preview of the content
5. Clicking a card opens a zoom modal with the full section content
6. Modal dismisses via backdrop click, Esc, or X button
7. Body scroll locks when modal is open

The component uses `createElement` API (not JSX in effects) following the project pattern.

Key implementation details:
- Section parsing: iterate `#sheet-content` children, split by `H2` tags, capture `outerHTML` of each element between H2s
- Card grid: `id="sheet-grid"` div with CSS grid classes for responsive columns
- Card colors: cycle through 8 border color classes (`sheet-card-border-0` through `7`) using `index % 8`
- Icons: import `SECTION_ICONS` from `../utils/icons` to render the lucide icon per section
- Modal: fixed overlay with backdrop blur, scrollable content area with prose class, X button top-right
- Animations: use the CSS keyframes defined in Task 2

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/SheetMode.tsx
git commit -m "feat: create SheetMode component with card grid and zoom modal"
```

---

### Task 4: Add mode toggle button to the main header

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Import SheetMode and add toggle button**

In `index.astro`:

1. Import `SheetMode` at the top with the other component imports
2. Add a toggle button next to the search trigger and ThemeToggle in the header's button area (line 39-53). The button shows a grid icon (LayoutGrid) when in doc mode, and a list icon (LayoutList) when in sheet mode. On click, it toggles `data-view-mode` on `<html>` and dispatches `view-mode-changed`.
3. Mount `<SheetMode client:load />` alongside the other islands (after ScrollSpy, around line 91)

The toggle button is an inline `<script is:inline>` block (like the search trigger) that:
- Queries the toggle button by ID
- On click: reads current `data-view-mode`, toggles between `"sheet"` and `"doc"` (or removes attribute), persists to localStorage, dispatches `view-mode-changed` CustomEvent

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add sheet mode toggle button to header"
```

---

### Task 5: Add mode toggle to StickyHeader

**Files:**
- Modify: `src/components/StickyHeader.tsx`

**Step 1: Add toggle button to sticky header**

In `StickyHeader.tsx`:

1. Import `LayoutGrid` and `LayoutList` from `lucide-react`
2. Add state `isSheetMode` initialized from `document.documentElement.getAttribute('data-view-mode') === 'sheet'`
3. Listen for `view-mode-changed` event to update `isSheetMode` state
4. Add a toggle button between the search and theme buttons in the right-side button group
5. On click: toggle `data-view-mode` attribute, persist to localStorage, dispatch `view-mode-changed`

The button uses the same pattern as the existing theme toggle button — `createElement('button', ...)` with the appropriate icon.

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/StickyHeader.tsx
git commit -m "feat: add sheet mode toggle to sticky header"
```

---

### Task 6: Update ScrollSpy and MobileToc to respect sheet mode

**Files:**
- Modify: `src/components/ScrollSpy.tsx`
- Modify: `src/components/MobileToc.tsx`

**Step 1: Update ScrollSpy**

In `ScrollSpy.tsx`, add a listener for `view-mode-changed`. When sheet mode is active, disconnect the IntersectionObserver (no TOC to highlight). When switching back to doc mode, reconnect.

Add inside the existing `useEffect`:
```typescript
const handleModeChange = () => {
  const isSheet = document.documentElement.getAttribute('data-view-mode') === 'sheet';
  if (isSheet) {
    observer.disconnect();
    mutationObserver.disconnect();
  } else {
    headings.forEach((heading) => {
      if (heading.style.display !== 'none') observer.observe(heading);
    });
    if (content) mutationObserver.observe(content, { attributes: true, subtree: true, attributeFilter: ['style'] });
  }
};
window.addEventListener('view-mode-changed', handleModeChange);
```

And clean up in the return function:
```typescript
window.removeEventListener('view-mode-changed', handleModeChange);
```

**Step 2: Update MobileToc**

In `MobileToc.tsx`, hide the floating "Contents" button when in sheet mode.

Add a `isSheetMode` state that listens for `view-mode-changed`. Wrap the trigger button render with a condition: if `isSheetMode`, don't render the button.

```typescript
const [isSheetMode, setIsSheetMode] = useState(false);

useEffect(() => {
  setIsSheetMode(document.documentElement.getAttribute('data-view-mode') === 'sheet');
  const handler = () => setIsSheetMode(document.documentElement.getAttribute('data-view-mode') === 'sheet');
  window.addEventListener('view-mode-changed', handler);
  return () => window.removeEventListener('view-mode-changed', handler);
}, []);
```

Then conditionally render: `{!isSheetMode && <button ...>Contents</button>}`

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/ScrollSpy.tsx src/components/MobileToc.tsx
git commit -m "feat: update ScrollSpy and MobileToc to respect sheet mode"
```

---

### Task 7: Visual QA and polish

**Files:**
- Possibly modify: `src/styles/global.css`, `src/components/SheetMode.tsx`

**Step 1: Dev server visual check**

Run: `pnpm dev`

Check in browser:
- [ ] Toggle button visible in header next to search/theme
- [ ] Clicking toggle switches to card grid view
- [ ] Cards show correct section titles with icons
- [ ] Cards have colored left borders cycling through 8 colors
- [ ] Card preview shows condensed content with fade-out gradient
- [ ] Clicking a card opens zoom modal with full section content
- [ ] Modal scrollable if content is long
- [ ] Modal dismisses via backdrop click, Esc, X button
- [ ] Sticky header shows toggle button when scrolled
- [ ] Sidebar TOC hidden in sheet mode
- [ ] Mobile TOC button hidden in sheet mode
- [ ] Mode persists after page refresh
- [ ] Works in both light and dark mode
- [ ] Responsive: 3 cols (desktop), 2 cols (tablet), 1 col (mobile)

**Step 2: Fix any issues found**

**Step 3: Final build check**

Run: `pnpm build`
Expected: Build succeeds with no errors.

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: sheet mode visual polish and fixes"
```
