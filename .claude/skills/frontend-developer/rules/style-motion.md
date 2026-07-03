---
title: style-motion
impact: MEDIUM
impactDescription: Standardizes animation timing, easing, and accessibility so motion reads as intentional instead of arbitrary, and never traps users who've disabled it.
tags: style, motion, animation, css, accessibility
---

# Motion

Animation in this project follows fixed timing and easing conventions, the same way color and spacing follow a fixed scale.

## Rule

1.  **No bounce or elastic easing.** Use decelerating curves only — `ease-out`, or the steeper `cubic-bezier` equivalents of quart/quint/expo. Motion should settle, not overshoot.
2.  **Duration ranges**: `100–150ms` for instant feedback (hover, press), `200–300ms` for state changes (opening a panel, toggling a value), `300–500ms` for layout changes (a card expanding). Never exceed `500ms` for feedback-level interactions — it reads as lag, not polish.
3.  **Exit faster than enter.** An exit transition runs at roughly 75% of the duration of its matching enter transition.
4.  **Never animate layout-driving properties.** Don't animate `width`, `height`, `top`, `left`, or `margin` — these force the browser to recompute layout on every frame. Animate `transform` and `opacity` instead.
5.  **`prefers-reduced-motion` is mandatory.** Every animation/transition needs a reduced-motion fallback (typically a crossfade or an instant state change), never an unconditional motion effect.
6.  **Cap stagger delay.** When staggering a list's entrance, the *total* stagger delay stays around `500ms` regardless of how many items there are — reduce the per-item delay as the list grows, don't let a long list take seconds to finish animating in.

## Why it matters

- **Perceived quality**: bounce/elastic easing and layout-property animation are the two most common reasons AI/template-generated motion feels janky rather than deliberate.
- **Accessibility**: motion can trigger vestibular discomfort; `prefers-reduced-motion` isn't optional polish, it's a requirement for users who've already told the OS they need it.
- **Performance**: animating `transform`/`opacity` runs on the compositor; animating `width`/`top`/`margin` runs layout every frame and can visibly jank on lower-end devices.

## Incorrect Example

```css
/* ❌ Bounce easing, and animating a layout property */
.panel-enter {
  transition: height 600ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

## Correct Example

```css
/* ✅ Transform/opacity only, decelerating curve, capped duration */
.panel-enter {
  transform: translateY(8px);
  opacity: 0;
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out;
}
.panel-enter-active {
  transform: translateY(0);
  opacity: 1;
}

/* ✅ Mandatory reduced-motion fallback */
@media (prefers-reduced-motion: reduce) {
  .panel-enter {
    transition: opacity 150ms linear;
  }
}
```
