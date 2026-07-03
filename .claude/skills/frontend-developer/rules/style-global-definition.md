---
title: style-global-definition
impact: HIGH
impactDescription: Centralizes global style definitions to prevent pollution and maintain predictability.
tags: style, css, global, architecture
---

# Global Styles Definition

Global styles, including CSS variables, resets, and generic element selectors, must be managed centrally.

## Rule

1.  **Centralized Location**: All global styles must be defined and modified **exclusively** in `src/index.css`.
2.  **Scope**: This includes:
    - CSS Variables definition (`:root`).
    - CSS Resets (e.g., `box-sizing`, `margin: 0`).
    - Base element styles (e.g., `body`, `h1`, `a`, `button` generic styles).
    - Utility classes used across the entire application (e.g., `.visually-hidden`).
3.  **Prohibition**: Do NOT define global styles or override global variables in component-specific CSS files (like `App.css` or modular component files).

## Why it matters

- **Predictability**: Developers know exactly where to look to change the font, brand colors, or background.
- **Maintainability**: Prevents "Specific Wars" where a component tries to undo a global style defined in an unexpected place.
- **Cleanliness**: Keeps component CSS focused strictly on the component itself.

## Incorrect Example

```css
/* src/App.css or src/components/pages/Dashboard.css */

/* ❌ Defining global variables in a component file */
:root {
  --color-primary: red;
}

/* ❌ Changing global body style in a component */
body {
  background-color: #000;
}
```

## Correct Example

```css
/* src/index.css */

/* ✅ Global variables defined here */
:root {
  --color-primary: #3b82f6;
  --font-family-base: system-ui, sans-serif;
}

/* ✅ Base element styles defined here */
body {
  margin: 0;
  font-family: var(--font-family-base);
}
```