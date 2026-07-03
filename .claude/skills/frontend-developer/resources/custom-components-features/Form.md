---
title: Form
description: Component features and generic usage instructions.
tags: component, form
---

# Form

## Description

A dynamic and state management wrapper for orchestrating forms. The `Form` acts as a macro component interpreting a declarative JSON standard field configuration and piping it natively into specialized input UI block components automatically.

## Concepts & Features

- **fields (array)**: Configuration array defining exactly how the inputs behave (`input: 'text'`, `input: 'password'`, `input: 'boolean'`, `input: 'date'`, etc.).
- **onSubmit (function)**: Triggered asynchronously and natively strips out empty form payloads automatically before executing external triggers. Shows loading spinner.
- **onError (function)**: Triggers visual feedback to users automatically if inputs or external requests fall out logic boundaries.
- **Validation**: Supports complex standard rules (`validation: { minLength: 3, uppercase: true }` and `required`).
- **Dynamic Select Options Mapper**: Instead of pushing complex JS logic to components, Form configuration array files support declarative data dependencies:
  ```json
  {
    "select": true,
    "dynamicOptions": {
      "methodName": "GET_ROLES",
      "valueKey": "_id",
      "labelKey": "name"
    }
  }
  ```
  The component interacts with `mapDynamicOptions` mapper from `map-methods.jsx` to natively fetch these endpoints asynchronously during page load.

## State Reinitialization

If a `Form` receives `fields` asynchronously (e.g., fetching a profile configuration or patching an existing ID for edition), it must be forced to remount the React tree by hashing its props into its `key` property:

```jsx
<Form
  key={JSON.stringify(formFields)} // Re-mounts strictly when initial data arrives/changes
  fields={formFields}
  onSubmit={handleSubmit}
/>
```
