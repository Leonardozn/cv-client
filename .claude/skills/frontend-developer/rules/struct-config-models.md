---
title: struct-config-models
impact: CRITICAL
impactDescription: Standardizes where form and table configurations are kept, file extensions, and naming conventions under the config directory.
tags: structure, config, models, directories, naming
---

# Configuration Models & Naming Conventions

To maintain a consistent and scalable application architecture, all configuration models, directory names, and file extensions must strictly adhere to the following rules:

## Rules

1. **Separation of Concerns for Models**:
   - **Form Configurations**: All form setups must reside exclusively in `src/config/models/form-source`.
   - **Table Configurations**: All table setups must reside exclusively in `src/config/models/table-source`.
2. **Universal Extension (.jsx)**:
   - **All new files** created within the project (even pure configuration or logic files) must use the `.jsx` extension instead of `.js`. This unifies file types, standardizes tooling, and allows inline JSX rendering (like rendering icons in tables) without breaking module loaders.
3. **Kebab-Case Naming Pattern in `src/config`**:
   - All files and directories within `src/config` must be written entirely in lowercase.
   - Distinct words must be separated using hyphens (`-`).
   - _Example_: `apiConnection` or `enodeRestaurant` are restricted; use `api-connection` and `enode-restaurant` instead.

## Incorrect Example

```text
src/
  config/
    apiConnection/     <-- Error: camelCase directory
      index.js         <-- Error: .js extension
    models/
      ingredientForm.js  <-- Error: not separated into form/table folders, no .jsx
      ingredientTable.js
```

## Correct Example

```text
src/
  config/
    api-connection/    <-- Correct: kebab-case
      index.jsx        <-- Correct: .jsx extension
    models/
      form-source/     <-- Correct: dedicated form configs folder
        ingredient.jsx <-- Correct: kebab-case and .jsx
      table-source/    <-- Correct: dedicated table configs folder
        ingredient.jsx
```
