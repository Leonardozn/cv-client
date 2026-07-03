---
title: logic-ux-copy
impact: MEDIUM
impactDescription: Standardizes button labels, error copy, and terminology so the UI reads as one coherent product instead of per-component improvisation.
tags: logic, copy, ux, accessibility
---

# UX Copy

The words on a button or in an error message are part of the interface's logic, not an afterthought — they are what the user actually reads to decide what an action will do.

## Rule

1.  **No generic button labels.** Never "OK", "Submit", "Yes", "No" — use verb + object naming the actual action: "Save changes", "Delete project", "Add Pay Method". The CLI-generated model-management page already follows this (`submitText` is `"Save changes"` on edit, `"Add <Model>"` on create) — extend the same convention to every custom form built by hand, instead of falling back to a generic label.
2.  **Error messages explain what, why, and how to fix it**, in plain language. Never surface a raw backend status/code (`"Error 403"`) without translating it into something the user can act on (`"You don't have permission to edit this record."`).
3.  **One term per concept, used everywhere.** If the action is "Delete", every button, confirmation modal, and toast for that action says "Delete" — never alternate with "Remove"/"Erase" for the same concept across different pages.

## Why it matters

- **Generic labels force the user to re-read the surrounding context** to know what a button does; a specific label tells them upfront.
- **Raw error codes blame the user for not knowing backend internals** they were never meant to know.
- **Inconsistent terminology makes the app feel like several different tools stitched together**, even when the underlying behavior is identical.

## Incorrect Example

```jsx
// ❌ Generic label, doesn't say what gets saved
<Button text="Submit" onClick={onSubmit} />

// ❌ Raw backend error surfaced as-is
<PopUp type="error" text={`Error ${error.statusCode}`} />
```

## Correct Example

```jsx
// ✅ Verb + object, matches the CLI-generated convention
<Button text={isEditing ? "Save changes" : "Add Supplier"} onClick={onSubmit} />

// ✅ Plain-language error with a next step
<PopUp
  type="error"
  text={
    error.statusCode === 403
      ? "You don't have permission to edit this record."
      : "Couldn't save the changes. Check your connection and try again."
  }
/>
```
