# Sheet Mode — Design Document

## Objective

Add a toggleable "sheet mode" to the cheat sheet site that transforms the linear doc layout into a dense card grid, where clicking a card zooms into the full section content via a modal overlay.

## Architecture

A new `SheetMode` React island component (`client:load`) that:

1. On mount, reads the rendered `#sheet-content` DOM and splits it into sections by `<h2>` boundaries
2. Stores each section's HTML and heading text
3. When sheet mode is active: hides the prose content + sidebar TOC, renders a card grid
4. When doc mode is active: shows the original prose, hides the grid

## Mode Toggle

- Pill/icon button in the **header** (next to search + theme toggle) and mirrored in the **sticky header**
- Uses `CustomEvent` (`view-mode-changed`) to communicate between islands
- Persists choice to `localStorage` key `viewMode` (`"doc"` | `"sheet"`)
- FOUC prevention: inline `<script>` in `Layout.astro` reads localStorage and sets `data-view-mode` on `<html>` before paint

## Card Grid

- **Layout:** CSS Grid — `grid-cols-1` → `grid-cols-2` (md) → `grid-cols-3` (lg)
- **Each card:**
  - Colored left border (rotating through 6-8 color palette per section)
  - Section heading (h2 text) with lucide icon
  - Condensed preview: first ~200px of content, overflow hidden with fade-out gradient
  - `cursor: pointer`, hover lift with subtle shadow shift
- **Card colors:** Cycle through palette that works in both light/dark mode (accent red, green, blue, orange, purple, teal, amber, pink)

## Zoom Modal

- Click a card → modal overlay with full section content
- **Animation:** Card scales up from its position (`getBoundingClientRect` + CSS transform) into centered modal — shared element transition feel
- **Dismiss:** Click backdrop, press `Esc`, click X button
- **Content:** Section's original HTML re-injected with same prose styling
- **Scrollable** if content exceeds viewport
- **Body scroll locked** while open

## What Stays the Same

- Header, footer, sticky header, search modal, toast, keyboard nav — all unchanged
- Sidebar TOC hides in sheet mode
- Mobile TOC hides in sheet mode

## Responsive

- 3 columns on desktop (lg), 2 on tablet (md), 1 on mobile
- Modal is full-width on mobile, max-width centered on desktop

## Persistence

- `localStorage.viewMode` = `"doc"` | `"sheet"`
- Inline script prevents FOUC on page load

## Cross-Island Communication

| Event              | Dispatched by    | Consumed by              |
|--------------------|------------------|--------------------------|
| `view-mode-changed`| Toggle button    | SheetMode, ScrollSpy, MobileToc, StickyHeader |

## Out of Scope

- Drag-and-drop card reordering
- Custom card sizing or pinning
- Filtering cards (search already covers this)
- Print-specific layout for sheet mode
