---
title: struct-component-files
impact: CRITICAL
impactDescription: Ensures consistent component organization and file naming conventions.
tags: structure, components, file-system
---

# Component File Structure

All React components must be organized in a specific structure to ensure consistency and modularity.

## Rule

Every new component must:

1. Reside in its own directory with the **PascalCase** name of the component (e.g., `MyButton/`).
2. Contain the component file with the **.jsx** extension and the same PascalCase name (e.g., `MyButton/MyButton.jsx`).
3. Contain the styles file with the **.css** extension and the same PascalCase name (e.g., `MyButton/MyButton.css`).

## Why it matters

- Keeps styles and logic tightly coupled and modular.
- Makes navigation easier by grouping related files.
- Prevents file name collisions in larger projects.

## Incorrect Example

```
src/components/
  button.jsx
  button.css
  MyHeader.js
  my-header-styles.css
```

## Correct Example

```
src/components/
  MyButton/
    MyButton.jsx
    MyButton.css
  MyHeader/
    MyHeader.jsx
    MyHeader.css
```