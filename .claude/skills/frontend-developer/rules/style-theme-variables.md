---
title: style-theme-variables
impact: HIGH
impactDescription: Enforces the use of CSS variables for consistent branding and theming.
tags: style, css, theme, variables
---

# Theme Variables Usage

Maintain consistent branding and easy theming by using CSS variables for colors and typography.

## Rule

1.  **Use CSS Variables**: Always use the project's defined CSS variables (e.g., `var(--color-primary)`) for colors, backgrounds, and global typographic properties.
2.  **Avoid Hardcoded Values**: Do not use hex codes (e.g., `#3b82f6`), RGB values, or named colors (e.g., `blue`) directly in component styles, unless it is a specific, one-off value that is not part of the theme.
3.  **Defined Variables**:
    - `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-quaternary`
    - `--color-bg`, `--color-text`, `--color-text-light`
4.  **Accessibility**: Ensure that your chosen color combinations (e.g., `--color-primary` text on `--color-bg` background) meet the **WCAG 2.1 AA** contrast ratio of at least **4.5:1**.
    - See detail in: `../resources/color-contrast-accessibility.md`
5.  **Avoid Bad Pairings**: Consult `../resources/color-combinations-to-avoid.md` and ensure you **do not** use prohibited color combinations (e.g., Green/Red, Blue/Purple) for text or adjacent UI elements.
6.  **Use Proven Pairs**: For inspiration on high-contrast, accessible color schemes, refer to `../examples/accessible-color-pairs.md`.
7.  **Color Usage Weight (60-30-10)**: distribute color so roughly 60% of the UI is neutral surfaces, 30% is a secondary/supporting color, and only 10% is the accent — and reserve the accent exclusively for primary actions, selection, and status. The accent is never decorative.
8.  **Never Gray-on-Color**: never place gray text directly over a colored background. Darken or lighten the background's own hue for that text instead, or use a transparency of the text color — an unrelated gray reads as washed-out regardless of its own contrast ratio.
9.  **Dark Mode Surfaces**: when a dark theme exists, build depth by raising surface lightness in 2-3 steps (`--color-bg` → `--color-surface-1` → `--color-surface-2`), not by adding shadows — shadows barely register on dark backgrounds. Keep the same hue/chroma across the steps and vary only lightness.

- **Consistency**: Ensures the same shade of "primary blue" is used everywhere.
- **Maintainability**: Changing a brand color requires updating only one line in `index.css` instead of hundreds of components.
- **Theming**: Enables easy implementation of dark mode or multiple themes in the future.

## Incorrect Example

```css
/* src/components/modulars/MyButton/MyButton.css */
.my-button {
  /* ❌ Hardcoded color makes theming difficult */
  background-color: #3b82f6;
  color: white;
  border: 1px solid #10b981;
}
```

## Correct Example

```css
/* src/components/modulars/MyButton/MyButton.css */
.my-button {
  /* ✅ Uses theme variables */
  background-color: var(--color-primary);
  color: var(--color-bg);
  border: 1px solid var(--color-secondary);
}
```
