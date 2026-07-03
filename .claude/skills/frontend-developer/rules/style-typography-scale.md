---
title: style-typography-scale
impact: HIGH
impactDescription: Defines a concrete, verifiable typographic system instead of leaving font size, weight, and line-height to per-component discretion.
tags: style, typography, css, scale
---

# Typography Scale

Typography needs the same systemized treatment as color (`style-theme-variables`): a fixed, named scale that every component pulls from, instead of one-off values picked per component.

## Rule

1.  **Always `rem`, never `px`, for font sizes.** Body text is never smaller than `1rem` (16px).
2.  **Fixed step scale, not fluid.** This skill targets product/app UI (dashboards, forms, tables), where a fixed `rem` scale with a ratio of **1.125–1.2** between consecutive steps is the right tool (e.g. `0.875rem`, `1rem`, `1.125rem`, `1.25rem`, `1.5rem`, `1.875rem`, `2.25rem`). Fluid scales (`clamp()`) belong to marketing/long-form pages, which are out of this skill's scope.
3.  **Cap families and weights.** No more than 2–3 font families per project — one is enough for most product UI. No more than 3–4 weights, each with one fixed role (e.g. Regular = body, Medium = labels, Semibold = headings); don't pick a weight ad hoc per component.
4.  **Contextual `line-height`.** `1.1–1.2` for headings, `1.5–1.7` for body copy.
5.  **Cap prose width.** Long-form text blocks (descriptions, help text) get a `max-width` in `ch` units, `45–75ch`, so lines stay readable.
6.  **Name tokens semantically.** `--text-body`, `--text-heading-sm`, not `--font-size-16` — the same convention `style-theme-variables` already requires for color.

## Why it matters

- **Consistency**: without a shared scale, every new component invents its own font sizes, and the UI drifts visually over time.
- **Readability**: line-height and prose width are the two most common readability mistakes left unmanaged when typography isn't a system.
- **Maintainability**: a rename of `--text-heading-sm`'s value updates every consumer; a hardcoded `1.125rem` scattered across files does not.

## Incorrect Example

```css
/* src/components/pages/Invoice/Invoice.css */
.invoice-title {
  font-size: 19px; /* ❌ px, not part of any scale */
  line-height: 1; /* ❌ too tight for a heading at this size, no clear convention */
}
.invoice-note {
  font-size: 0.8rem; /* ❌ arbitrary value, no role */
  max-width: 900px; /* ❌ not based on a readable measure */
}
```

## Correct Example

```css
/* src/index.css */
:root {
  --text-body: 1rem;
  --text-label: 0.875rem;
  --text-heading-sm: 1.25rem;
  --text-heading-lg: 1.875rem;
}
```

```css
/* src/components/pages/Invoice/Invoice.css */
.invoice-title {
  font-size: var(--text-heading-sm);
  line-height: 1.2; /* ✅ heading range */
}
.invoice-note {
  font-size: var(--text-label);
  line-height: 1.6; /* ✅ body range */
  max-width: 65ch; /* ✅ readable line length */
}
```
