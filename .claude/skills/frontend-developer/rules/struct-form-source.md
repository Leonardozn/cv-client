---
title: struct-form-source
impact: HIGH
impactDescription: Ensures form configurations comply with component props constraints, preventing unintended color themes or UI breakage.
tags: forms, source, inputs, config
---

# Form Source Configurations

Forms in this application are largely driven by configuration arrays (e.g., `src/config/models/form-source/ingredient.js`). When building these configurations (especially translating from backend `settings.json` or `frontend-settings.json`), you must account for how the existing structural components actually interpret the props.

## 1. Use `input` instead of `type` for Field Types

In `Input.jsx` and other custom elements within this framework, the `type` property is explicitly reserved to dictate the **color theme** (e.g., `type: 'primary'`, `type: 'error'`, `type: 'neutral'`, etc.).

If you set `type: "text"` or `type: "number"` in your form fields configuration, it will be injected into components as a color type, which is incorrect. **You must set `input: "text"`, `input: "number"`, `input: "date"`, etc.**

The `<Form />` component parses `field.input` to route the field to specific specialty components (like `<InputDate />` or `<Switch />` for `"boolean"`) and passes it down correctly to the native `<input>` element.

## 2. Handling Input Variants

Since the generic `Input` defaults to rendering `text` internally:

- For text, numbers, or specific HTML variants, use `input: "text"`, `input: "number"`, `input: "email"`, etc.
- For specialty types like dates, booleans, or clocks, use `input: "date"`, `"boolean"`, `"time"`, `"datetime"`. The form will automatically switch to the custom specialty component.
- For passwords, use the property `password: true`.
- For files, use `file: true`.
- For multiline strings or Selects, you can use `textarea: true` or `select: true`.\_

## 3. Dynamic Select Options

Instead of hardcoding options arrays for dropdowns, use the `dynamicOptions` feature along with `select: true`. The Form's orchestrator (`mapDynamicOptions`) will handle asynchronously filling the options before injecting them into the component.

```javascript
  {
    select: true,
    dynamicOptions: {
      methodName: "GET_CATEGORY_LIST", // Corresponds to the api-connections export
      valueKey: "_id",
      labelKey: "name",
    },
    linkTo: "/category" // ✅ Adds quick access (+) and (edit) buttons
  }
```

## 4. Complex Fields: SubLists

For fields that require managing an array of items (like Ingredients, Taxes, or Articles in a Sale), use `input: "sublist"`.

- **`structure`**: An array defining the columns of the sub-table.
- **`outputType`**: (Optional) If the `structure` has **only one column**, you can specify `outputType: "string" | "number" | "boolean"`. The component will automatically flatten the array to primitive values of that type.
- **`linkTo`**: Adds quick access `(+)` and `(✎)` buttons to the cell for navigating to the related model page.

```javascript
  {
    id: "taxes",
    input: "sublist",
    outputType: "string", // Returns ["id1", "id2"] instead of [{tax:"id1"}, {tax:"id2"}]
    structure: [
      {
        id: "tax",
        label: "Tax",
        select: true,
        dynamicOptions: { methodName: "GET_TAX_LIST", ... }
      }
    ]
  }
```

### 4a. Multi-Select inside a SubList column

When a column in a SubList's `structure` needs to allow **selecting multiple values** (e.g., several taxes per article), use `select: true` together with `multiple: true`:

```javascript
  {
    id: "taxes",
    label: "Taxes",
    select: true,
    multiple: true,           // ← renders SelectMultiple instead of Select
    placeholder: "Select taxes",
    linkTo: "/tax",           // ← adds (+) New and (✎) Edit buttons
    dynamicOptions: {
      methodName: "GET_TAX_LIST",
      valueKey: "_id",
      labelKey: "name",
    },
  }
```

**Data format**: `onChange` returns an array of selected IDs (e.g. `["id1", "id2"]`).

### 4b. Nested SubList inside a SubList column

A column in a SubList's `structure` can itself be a sublist (`input: "sublist"` with its own `structure`). This is used when a single row of the parent sublist contains a collection of sub-records with **multiple fields each**.

**UX behavior** (rendered by `NestedSublistCell`):
- The cell shows a **count badge** (`N items`) + a **`+` (Add)** button and, when items exist, a **`✎` (Manage)** button.
- Clicking `+` opens a **modal form** built from the nested `structure`, allowing the user to fill in the sub-record fields. On submit the form closes and the count updates.
- Clicking `✎` opens a **manage modal** listing all existing sub-records with per-row `✎` (edit) and `🗑` (remove) buttons, plus an `+ Add` button at the bottom.
- Editing a sub-record from the manage modal returns to the manage modal after saving.

```javascript
  {
    id: "components",
    label: "Components",
    input: "sublist",
    structure: [
      {
        id: "part",
        label: "Part",
        select: true,
        dynamicOptions: { methodName: "GET_PART_LIST", valueKey: "_id", labelKey: "name" },
      },
      {
        id: "measurements",
        label: "Measurements",
        input: "sublist",         // ← nested sublist
        structure: [
          { id: "width",  label: "Width",  input: "number" },
          { id: "height", label: "Height", input: "number" },
        ],
      },
    ],
  }
```

> **Important — `mapDynamicOptions` is recursive**: The `resolveStructureColumns` helper inside `map-methods.jsx` resolves `dynamicOptions` at every level of nesting automatically. No extra configuration is needed.

> **No depth limit**: Nesting is theoretically unlimited, but for UX reasons keep nesting to **at most 2 levels** (sublist inside a sublist column).

## 5. Field State: Disabled & Required

- **`required: true`**: Triggers validation in the `Form` component and shows a default error message if empty.
- **`disabled: true`**: Disables the input. The `useModelController` respects this property even when switching between Create and Edit modes.

## 6. Field Visibility by Mode

You can control whether a field appears in the modal form depending on the active mode. The `useModelController` filters fields before injecting them into the `<Form />` component.

| Property | Effect |
|---|---|
| `hidden: true` | **Always takes priority.** The field is excluded from all three modes (Create, Edit, View/Detail). |
| `createHidden: true` | The field is excluded when the modal is in **CREATE** mode. |
| `editHidden: true` | The field is excluded when the modal is in **EDIT** mode. |
| `detailHidden: true` | The field is excluded when the modal is in **VIEW (detail)** mode. |

```javascript
// Example: a field that only appears on Edit and Detail, not on Create
{
  id: "created_at",
  label: "Created At",
  input: "date",
  disabled: true,
  createHidden: true,  // ✅ Hidden when creating a new record
}

// Example: a field hidden everywhere (useful for internal references)
{
  id: "internal_code",
  hidden: true,
}
```

> **Note**: `hidden` always wins. If `hidden: true` is set alongside any other visibility property, the field will never be shown regardless.

## 6. Example

### ❌ Incorrect config

```javascript
export const badConfig = [
  {
    id: "stock",
    label: "Stock Quantity",
    type: "number", // ❌ WRONG: The component will try to find a CSS color variable named "number".
    value: 0,
  },
];
```

### ✅ Correct config

```javascript
export const goodConfig = [
  {
    id: "stock",
    label: "Stock Quantity",
    value: 0,
    input: "number", // ✅ Correct: Form.jsx routes this correctly to htmlType="number"
    required: true,
  },
  {
    id: "reference",
    label: "Reference",
    input: "text",
    disabled: true, // ✅ Correct: Field will be read-only in all modes
    value: "REF-001",
  },
  {
    id: "category",
    label: "Category",
    select: true, 
    linkTo: "/category", // ✅ Correct: Adds shortcuts
    value: "",
  },
];
```

