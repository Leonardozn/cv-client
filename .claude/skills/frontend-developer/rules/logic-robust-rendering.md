---
title: logic-robust-rendering
impact: MEDIUM
impactDescription: Covers the edge cases generic component logic tends to skip — empty data, overflowing text, locale-sensitive formatting, and RTL-readiness — so the UI degrades predictably instead of silently breaking.
tags: logic, robustness, i18n, edge-cases
---

# Robust Rendering

Most component logic is written for the happy path with a full, well-sized dataset. This rule covers what happens when that assumption doesn't hold.

## Rule

1.  **Empty states need three things**: what would normally be there, why it matters, and a clear call to action — not just "No data". The CLI-generated model-management page already does this minimally (`No records found. Use the "New <Model>" button to add one.`); extend the same three-part shape to custom pages with their own empty/no-results states.
2.  **Dynamic text needs an explicit overflow strategy.** Never leave text that can vary in length (names, descriptions, labels from user input) to silently overflow its container. Pick one: single-line truncation (`text-overflow: ellipsis` + `white-space: nowrap` + `overflow: hidden`), multi-line clamp (`-webkit-line-clamp`), or wrapping (`overflow-wrap: break-word`).
3.  **Format dates, numbers, and currency with the `Intl` API** (`Intl.DateTimeFormat`, `Intl.NumberFormat`), not manual string concatenation. This is the same centralization principle `logic-map-methods` already requires for table data — formatting logic belongs in a shared helper, not inlined per component.
4.  **Use CSS logical properties for new spacing/border rules** — `margin-inline-start`, `padding-inline`, `border-inline-end` — instead of physical ones (`margin-left`, `padding-right`). This costs nothing today and avoids a rewrite if the app ever needs RTL support.

## Why it matters

- **Empty states are often the very first thing a new user sees** — "No data" with no explanation or next step is a dead end.
- **Overflowing text is one of the most common breakages** once real (long) user data replaces the placeholder text used during development.
- **Manual date/number formatting drifts** — one component writes `DD/MM/YYYY`, another `MM-DD-YY`, and neither matches the user's actual locale.

## Incorrect Example

```jsx
// ❌ No explanation, no next step
{data.length === 0 && <p>No data.</p>}
```

```css
/* ❌ No overflow strategy for a name that can be arbitrarily long */
.user-card-name {
  font-size: 1rem;
}
```

```jsx
// ❌ Manual formatting, ignores locale
<span>{`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`}</span>
```

## Correct Example

```jsx
// ✅ What's missing, why it matters, and what to do about it
{data.length === 0 && (
  <p className="users-empty-state">
    No users yet. Invite your team so they can start managing orders — use the
    "New User" button above.
  </p>
)}
```

```css
/* ✅ Explicit single-line truncation */
.user-card-name {
  font-size: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

```jsx
// ✅ Locale-aware formatting
<span>{new Intl.DateTimeFormat("en-US").format(date)}</span>
```
