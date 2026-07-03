---
title: logic-interactive-states
impact: HIGH
impactDescription: Gives every interactive component a fixed state contract and a consistent stacking/positioning model, instead of leaving focus, loading, and overlay behavior to be improvised per component.
tags: logic, accessibility, interaction, states, z-index
---

# Interactive States, Focus, and Overlays

`logic-interface-architecture` already requires keyboard navigability for custom inputs (`tabIndex={0}`, `Enter`/`Space`). This rule extends that into a full contract for every interactive component's states, and into how overlays and stacking are handled consistently across the app.

## Rule

1.  **Eight states, not two.** Every interactive component (button, input, custom dropdown, toggle) must account for: `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`, `success`. A component that only styles `default`/`hover` and leaves the rest to "whatever the browser does" is incomplete.
2.  **Never `outline: none` without a `:focus-visible` replacement.** Keyboard users need a visible focus ring; mouse/touch users don't need to see one for every click. Use `:focus-visible` to show the ring conditionally, with at least `2-3px` thickness, `3:1` contrast against its background, and `outline-offset` (not inset).
3.  **Overlays escape clipped ancestors, and that's a `custom`-component concern.** A dropdown/menu/popover positioned with `position: absolute` inside a `<Sheet>` or any `overflow: hidden`/`overflow: auto` ancestor gets clipped. Escape with `createPortal`, the Popover API, or `position: fixed`. Per `struct-modular-components` (no external positioning) and `struct-custom-components` (full freedom over proprietary/internal elements), this kind of positioning belongs in a `custom` component, never a `modular` one — a `modular` Dropdown body can render the list, but the `custom` component owning it manages where that list actually mounts.
4.  **Roving `tabindex` for composite widgets.** A group of related focusable items (tabs, a menu's items) should expose exactly one `tabIndex={0}` at a time (the active/selected item) and `tabIndex={-1}` on the rest, moving focus with arrow keys — not make every item independently tabbable.
5.  **One semantic z-index scale.** Define stacking order once, as CSS variables in `src/index.css` alongside the rest of the theme tokens (`style-global-definition`): dropdown < sticky < modal-backdrop < modal < toast < tooltip. Never hardcode an arbitrary value like `999`/`9999` inside a component file.

## Why it matters

- **Predictable UX**: a button that doesn't visibly react to `disabled`/`loading` looks broken, not unstyled.
- **Accessibility**: keyboard-only and screen-reader users depend on focus visibility and roving tabindex; both are easy to skip and hard to notice missing without testing with a keyboard.
- **Bugs that only show up in real layouts**: a dropdown that works in isolation but gets clipped the moment it's placed inside a `<Sheet>` is one of the most common integration bugs in generated UI code.

## Incorrect Example

```css
/* ❌ Removes the focus ring with no replacement */
.menu-item:focus {
  outline: none;
}
```

```jsx
// ❌ Dropdown positioned absolutely inside a Sheet that clips overflow
<Sheet className="filters-panel" style={{ overflow: "hidden" }}>
  <div className="dropdown" style={{ position: "absolute", top: "100%" }}>
    {options.map((o) => <div key={o.id}>{o.label}</div>)}
  </div>
</Sheet>
```

```css
/* ❌ Arbitrary z-index, no shared scale */
.toast { z-index: 9999; }
```

## Correct Example

```css
/* ✅ Focus ring shown only for keyboard users */
.menu-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

```jsx
// ✅ Dropdown body escapes the clipped Sheet via a portal
import { createPortal } from "react-dom";

const DropdownMenu = ({ anchorRect, options }) => {
  return createPortal(
    <div className="dropdown-menu" style={{ position: "fixed", top: anchorRect.bottom, left: anchorRect.left }}>
      {options.map((o) => <div key={o.id}>{o.label}</div>)}
    </div>,
    document.body,
  );
};
```

```css
/* ✅ src/index.css — one shared z-index scale */
:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal-backdrop: 30;
  --z-modal: 31;
  --z-toast: 40;
  --z-tooltip: 50;
}
```
