---
title: struct-page-layers
impact: HIGH
impactDescription: Standardizes the use of the Sheet component to construct visual layers or blocks in pages.
tags: structure, pages, ui, layout
---

# Page Content Layers

In complex applications, page content is often divided into distinct visual blocks or "layers" (e.g., header actions, data tables, detail grids). To ensure UI consistency, these blocks must be constructed using the dedicated layout component `Sheet`.

## Rule

1.  **Usage of Sheet**: Whenever a Page Component needs to wrap a section of content in a visually elevated box (like a panel or card-like wrapper), it **must** use the `<Sheet />` custom component instead of native `<div>` tags with custom background and shadow CSS.
2.  **CSS Abstraction**: The `Sheet` component handles `elevation`, `padding`, `borderRadius`, and `bgColor` via its props. Avoid duplicating CSS rules like `box-shadow` or `background-color` within the Page's individual CSS file for these layers.
3.  **Layout Only**: If the layer only serves to group elements visually (e.g., action buttons at the top of a page), wrap them within a `<Sheet>`.
4.  **No Nested Sheets**: never wrap a `<Sheet>` inside another `<Sheet>` to create a "card inside a card" effect. If a sub-section genuinely needs visual separation, use spacing/alignment, or at most one additional `elevation` step — not a second nested wrapper.
5.  **Elevation Scale**: keep `elevation` values few and consistent across the whole app (e.g. 1-3). Treat it as a hierarchy signal — the panel that matters more sits at a higher elevation — not as decoration; don't reach for the highest elevation by default.

## Why it matters

- **Visual Consistency**: Every page panel looks exactly the same in terms of shadows, borders, and backgrounds without re-writing CSS.
- **Maintainability**: Changing the core styling of "panels" across the application is done centrally in the `Sheet` component.
- **Cleaner DOM and CSS**: Reduces boilerplate in `.css` files of the Page components.

## Incorrect Example

```jsx
// src/components/pages/Users/Users.jsx
import "./Users.css";

const Users = () => {
  return (
    <div className="users-page">
      {/* ❌ Using a raw div for a content layer and handling styling in CSS */}
      <div className="users-actions-panel">
        <button>New User</button>
      </div>
    </div>
  );
};
```

```css
/* ❌ Re-inventing the wheel */
.users-actions-panel {
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
}
```

## Correct Example

```jsx
// src/components/pages/Users/Users.jsx
import Sheet from "../../customs/Sheet/Sheet";
import "./Users.css";

const Users = () => {
  return (
    <div className="users-page">
      {/* ✅ Using the standard Sheet component to create the layer */}
      <Sheet elevation={1} className="users-actions">
        <button>New User</button>
      </Sheet>
    </div>
  );
};
```

```css
/* ✅ Now the CSS only manages structural layout, not visual box themes */
.users-actions {
  display: flex;
  justify-content: flex-end;
}
```
