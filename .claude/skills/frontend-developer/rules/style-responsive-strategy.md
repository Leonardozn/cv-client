---
title: style-responsive-strategy
impact: HIGH
impactDescription: Establishes clear responsibilities for layout (Pages) vs fluid content (Modulars).
tags: style, responsive, layout, css
---

# Responsive Design Strategy

Responsive design relies on a clear contract between container (Page) and content (Modular) components to avoid breaking layouts.

## Rule

1.  **Page Components (Layout)**:
    - Must use **CSS Grid** or **Flexbox** to define the overall structure and positioning of child components.
    - **Choose deliberately between the two**: Flexbox for one-dimensional arrangements (a row of buttons, a navbar, a list of tags); Grid for two-dimensional arrangements (the page's overall layout, a dashboard of cards). Don't default to Grid when `flex-wrap` would do the job, and don't fake a 2D layout with Flexbox tricks.
    - Must define spacing between children using the `gap` property (avoid relying on children's margins), with every `gap`/`padding` value taken from the Spacing Scale below.
    - Are responsible for media queries that change the overall layout arrangement (e.g., changing from 3 columns to 1 column).

2.  **Modular Components (Fluidity)**:
    - Must be **fluid**. Avoid fixed dimensions (e.g., never use `width: 300px`). Instead, use `width: 100%`, `max-width`, or `min-width`.
    - Must **NOT** have external `margin`. They should fill the space provided by the parent. Spacing is the parent's responsibility.
    - Internal implementation should use Flexbox/Grid for its own inner elements if needed, but its outer container must be flexible.
    - When placed in a flex/grid row, the component's own root element needs `min-width: 0` (or `min-height: 0` in a column flow) so its content — text especially — can shrink and truncate instead of forcing the row to overflow.

## Spacing Scale

All `gap`, `padding`, and `margin` values used by Page components must come from a fixed 4pt scale: `4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px` — never an arbitrary value like `13px` or `22px`. Touch targets (buttons, icons, anything clickable) must measure at least `44×44px` even when the visual glyph is smaller; pad instead of shrinking the hit area.

## Why it matters

- **Predictability**: A component shouldn't unexpectedly push other components away with invisible margins.
- **Reusability**: A modular component fits anywhere (sidebar, main content, modal) because it adapts to the container's width.
- **Clean Layouts**: Using `gap` in the parent is cleaner and easier to maintain than managing margins on every child.

## Incorrect Example

```css
/* Modular Component CSS */
.user-card {
  /* ❌ Fixed width breaks on small mobile screens or large layouts */
  width: 400px;
  /* ❌ External margin messes up parent's grid/flex alignment */
  margin: 20px;
}
```

## Correct Example

**Page Component (Layout):**

```css
/* src/components/pages/Dashboard/Dashboard.css */
.dashboard-grid {
  display: grid;
  /* ✅ Responsive columns (auto-fit) */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  /* ✅ Parent controls spacing */
  gap: 24px;
  padding: 20px;
}
```

**Modular Component (Fluid):**

```css
/* src/components/modulars/UserCard/UserCard.css */
.user-card {
  /* ✅ Adapts to whatever cell size the grid gives it */
  width: 100%;
  /* ✅ Optional constraint for very wide screens */
  max-width: 500px;
  /* ✅ No margins! */
}
```