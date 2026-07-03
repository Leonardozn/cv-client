---
name: frontend-developer
description: Guidelines and rules for creating and structuring React components in the project.
license: MIT
metadata:
  author: User
  version: "1.0.0"
---

# Frontend Developer

Comprehensive guide for creating, structuring, and maintaining React components in the project.

## When to use this skill

Reference these guidelines when:

- Creating a new React component
- Refactoring an existing component
- Structuring component files and folders
- Reviewing component code for consistency
- Ensuring best practices in React development
- Refactoring project global styles
- Scaffolding a UI app or model through the `easy-node-mcp` tools (the UI project itself is created by `technical-leader`)
- Starting, committing, pushing, or opening a PR for any task from this project's `DOCUMENTATION.md`

## Rule Categories by Priority

| Priority | Category           | Impact   | Prefix    |
| -------- | ------------------ | -------- | --------- |
| 1        | Workflow & Process | CRITICAL | `proc-`   |
| 2        | Data               | HIGH     | `data-`   |
| 3        | Structure           | CRITICAL | `struct-` |
| 4        | Styles             | HIGH     | `style-`  |
| 5        | Logic              | HIGH     | `logic-`  |

## Quick Reference

### 1. Workflow & Process (CRITICAL)

- `proc-mcp-scaffolding` - Scaffold via `easy-node-mcp` in the right order (app → model); the UI project itself is created by `technical-leader`, before this skill runs. A UI model's shape is defined by hand in `ui-settings.json`, never by a tool, and several generated files (`SideMenu.jsx` above all) get silently overwritten on every later scaffolding call. **Generate all models with the CLI first; only then apply the `struct-`/`style-`/`logic-` rules on top of the generated code** — a regenerate after styling silently wipes page/form/table/controller edits.
- `proc-git-task-workflow` - For every task: sync `develop`, branch `feature/<abbreviation>-<number>` from it, implement, commit/push, then `gh pr create --base develop` with a skimmable, grouped summary of the changes.

### 2. Data (HIGH)

- `data-ui-model-field-shapes` - Define a UI model's fields by hand in `ui-settings.json` (types, `contentType`, `structure`, `ref`, `file`/date variants) before generating it; unlike the backend, nothing validates this file, so a malformed field degrades silently instead of failing.

### 3. Structure (CRITICAL)

- `struct-component-files` - All components must reside in their own directory with the same PascalCase name, containing the `.jsx` and `.css` files.
- `struct-modular-components` - Modular components go in `src/components/modulars`, must be independent (no other components), self-contained styles, and use props only.
- `struct-custom-components` - Custom components go in `src/components/customs/`, consist of groups of modular components (like forms/carousels), encapsulate styles to their wrapper border, and receive data only via props.
- `struct-page-components` - Page components must reside in `src/components/pages/`, retrieve component data via a **page-specific controller hook**, and define layout/wrapper styles using a separate `.css` file.
- `struct-page-layers` - Page components must use the `<Sheet />` custom component to draw visual blocks or sections (panels) instead of writing custom background/shadow CSS.
- `struct-global-components` - Global components (Navbar, Footer, Layouts) reside in `src/components/globals/`, act as persistent shells, and have insulated styles.
- `struct-api-controllers` - API Request Methods must reside in `src/config/controllers/`, exporting an object with a `name` and `method` property, and grouped by API source. **Page-specific hooks** also reside here (e.g., `useArticleController.jsx`).
- `struct-config-models` - All configurations must separate form-source and table-source, and all internal `config` files/dirs must be kebab-case and `.jsx`.
- `struct-form-source` - Forms are driven by `form-source` configs; strictly use `input`, `select: true`, and `dynamicOptions` for setup.
- `struct-table-source` - Tables are mapping abstractions. Use `renderCell` for raw data formatting instead of hardcoding logic inside components.

### 4. Styles (HIGH)

- `style-english-only` - All code identifiers, comments, and UI text must be written in English.
- `style-responsive-strategy` - Page components (containers) define Grid/Flex layouts deliberately (1D vs 2D) and spacing from a fixed 4pt scale (`gap`), while Modular components (children) remain fluid (`width: 100%`, `min-width: 0`) without external `margin`.
- `style-theme-variables` - Always use CSS variables (`var(--color-primary)`, `--color-secondary`, etc.) for colors and typography, avoiding hex codes or rgb values. Also covers the 60-30-10 color-weight rule, the gray-on-color ban, and dark-mode surface elevation.
- `style-typography-scale` - A fixed `rem` type scale (ratio 1.125-1.2), capped families/weights, contextual line-height, and semantically-named tokens — the typography equivalent of `style-theme-variables`.
- `style-motion` - Fixed easing/duration conventions, never animating layout properties, and a mandatory `prefers-reduced-motion` fallback for every animation.
- `style-global-definition` - Global styles, base resets, and generic element rules (e.g., `body`, `h1`) must be defined and managed **only** in `src/index.css`.

> Every rule in this category is a **post-generation** step: apply it only after the app and all
> its models have been generated with the CLI, since re-generating a model overwrites its page,
> form-source, and table-source with no merge (see `proc-mcp-scaffolding`).

### 5. Logic (HIGH)

- `logic-interface-architecture` - Enforces standard architecture: Global routing/Main wrapper for Navbar/SideMenu, creating Pages to handle layout grids, prioritizing existing custom/modular component usage, and ensuring UX-driven component arrangement.
- `logic-interactive-states` - Every interactive component needs all 8 states (default/hover/focus/active/disabled/loading/error/success), `:focus-visible` instead of a bare `outline: none`, overlays that escape clipped ancestors (a `custom`-component concern), roving tabindex for composite widgets, and one shared z-index scale.
- `logic-crud-actions` - **Model-management pages only**: standardizes the View/Edit/Delete `DataTable` action column, view-only form mode, and confirmation modals on mutations. Pages with a different purpose (no list to manage) are exempt from this one, but still follow the rest of this category.
- `logic-form-payloads` - Restricts sending empty string fields within API payloads, requires `REPLACE_` methods for full form edits, and reserves `UPDATE_` purely for partial edits. **Crucial**: Array fields in `multipart/form-data` must be sent as `JSON.stringify` strings.
- `logic-map-methods` - Standardizes the fetching and transformation layer by mandating the usage of `fetchAndResolveTableData`, `mapDynamicOptions`, and other map extractors to keep UI code dumb and clean.
- `logic-state-machine-controllers` - Enforces the use of **page-specific controller hooks** (e.g., `useArticleController.jsx`) to handle UI logic via a Finite State Machine (IDLE, LOADING, SUBMITTING), preventing "Impossible States" and protecting the UI from crashes.
- `logic-ux-copy` - Button labels use verb+object, never generic ("OK"/"Submit"); error messages are plain-language (what/why/how), never a raw backend code; one term per concept across the whole app.
- `logic-robust-rendering` - Three-part empty states (what/why/CTA), an explicit overflow strategy for dynamic text, `Intl`-based date/number formatting, and CSS logical properties for RTL-readiness.

## How to Use

Read individual rule files for detailed explanations and examples:

Rules:

```
rules/proc-mcp-scaffolding.md
rules/proc-git-task-workflow.md
rules/data-ui-model-field-shapes.md
rules/struct-component-files.md
rules/struct-global-components.md
rules/struct-modular-components.md
rules/struct-custom-components.md
rules/struct-page-components.md
rules/struct-api-controllers.md
rules/struct-config-models.md
rules/struct-form-source.md
rules/struct-table-source.md
rules/style-english-only.md
rules/style-responsive-strategy.md
rules/style-theme-variables.md
rules/style-typography-scale.md
rules/style-motion.md
rules/style-global-definition.md
rules/logic-interface-architecture.md
rules/logic-interactive-states.md
rules/logic-crud-actions.md
rules/logic-form-payloads.md
rules/logic-map-methods.md
rules/logic-state-machine-controllers.md
rules/logic-ux-copy.md
rules/logic-robust-rendering.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect example with explanation
- Correct example with explanation
