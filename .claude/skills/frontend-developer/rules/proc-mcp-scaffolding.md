---
title: Scaffold the UI with the easy-node-mcp tools in the right order
impact: CRITICAL
impactDescription: The MCP tools only materialize files for state that already exists in ui-settings.json; calling them out of order, or assuming a tool defines a model's shape, fails or silently clobbers hand-written code (SideMenu, routes, controllers).
tags: process, mcp, scaffolding, ui-settings, sequencing
---

# Scaffold the UI with the easy-node-mcp tools in the right order

## Why it matters

There is no separate "easy-ui-mcp" server — the **same `easy-node-mcp`** used by
`backend-developer` also exposes the UI side of the `enode` CLI as tools (`create_ui_app`,
`generate_ui_model`, `generate_ui_models`, `delete_ui_app`, `delete_ui_model`,
`delete_ui_models`). Their JSON schemas only tell you parameter names and
types — not the order they must be called in, or which generated files get silently rewritten
(and which manual edits get destroyed) as a side effect.

**`create_ui_project`/`init_ui_project` are not this skill's tools.** The UI project shell
(Vite+React base, component library, empty `ui-settings.json`, `npm i`) is created once by
`technical-leader`, which also hands this skill a scoped `DOCUMENTATION.md` at the project's own
root (see `technical-leader`'s `proc-genesis-scope`/`doc-scoped-handoff`) before any of the rules
below ever apply.

## Sequencing rules

1. **App → model**, always in that order: `create_ui_app` (registers an app entry with
   `host`/`path`/default env vars in `ui-settings.json`) before
   `generate_ui_model`/`generate_ui_models`.
2. **There is no `create_ui_model` tool, on purpose** — same reasoning as the backend (see
   `backend-developer`'s `proc-mcp-scaffolding`/`data-model-field-shapes`). `generate_ui_model`/
   `generate_ui_models` only materialize files for a model that must already exist as an object
   under `ui-settings.json` → `apps[].models`. Define it by hand first — note the **UI field
   shape is its own thing**, not the backend's: form metadata (`label`, `placeholder`,
   `required`), `select`/`multiselect` (not `ObjectId`) with the same `ref` convention, `file`
   for uploads (with `apiHost`/`imageHost`/`apiPath` pointing at env var names), `Datetime`/
   `Dateonly`/`Time` for date variants — see `data-ui-model-field-shapes` for the full reference
   and worked examples — then call the generate tool.
3. **`confirm` on `generate_ui_model`/`generate_ui_models`, and `-y` on `delete_ui_app`, only
   have an effect together with the target name** (and `appName` where applicable). Passing
   `confirm: true` without `name`/`appName` throws a validation error instead of skipping the
   "already generated, replace it?" prompt.
4. **Set `create_ui_app`'s `apiPath` correctly up front.** It's written once into
   `ui-settings.json` as the app's `path` and baked into the generated env var defaults
   (`<APPNAME>_API_HOST`, `<APPNAME>_API_PATH`, `<APPNAME>_IMAGES_API_PATH`). Changing it later
   means hand-editing `ui-settings.json` yourself and re-running `generate_ui_models` to refresh
   the generated env file.
5. **Generate first, style/structure/logic-refine second — never the other way around.** All the
   `struct-`, `style-`, and `logic-` rules of this skill apply **on top of already-generated
   code**: finish scaffolding the app and generating **all** its models with the CLI before you
   start refining any page, form-source, table-source, or controller hook by hand. This isn't a
   preference — `generate_ui_model[s]` overwrites those four files (and rewrites `SideMenu.jsx`
   project-wide) with **no merge** (see the gotchas below), so any styling or restructuring done
   before a later generate/regenerate is silently wiped. Treat CLI generation as the phase that
   produces the raw material, and every `struct-`/`style-`/`logic-` rule as the phase that shapes
   it afterward.

## Gotchas the schema can't show you

- **`generate_ui_model`/`generate_ui_models` always overwrite a model's form-source,
  table-source, controller hook, and page files**, even if you've hand-edited them — there is no
  merge for these four files. Re-generating a model is destructive to any manual changes inside
  its own `config/models/form-source/<model>.jsx`, `config/models/table-source/<model>.jsx`,
  `config/controllers/use<Model>Controller.jsx`, and `components/pages/<Model>/` files.
- **`components/globals/SideMenu.jsx` is fully rewritten from scratch on every single**
  `generate_ui_model(s)` / `delete_ui_model(s)` / `delete_ui_app` call, **across the whole
  project** — not just for the model/app you touched, and with zero merge logic. Any manual edit
  to `SideMenu.jsx` (custom link, icon, grouping, separator) is wiped the next time *any* model
  anywhere is generated or deleted.
- **`config/controllers/<appName>.jsx` (the CRUD methods file) and `config/router/index.jsx`
  merge into the existing file on generate**, preserving manual additions you made to them — but
  get **fully regenerated (manual edits dropped)** on delete, to remove the corresponding CRUD
  block or route cleanly.
- **Deleting the last generated model anywhere in the project wipes `src/config` back to empty**
  except `config/router/`: `environment/`, `api-connection/`, `controllers/`, and
  `config/models/` are all removed, even if they contain hand-written code unrelated to the
  model you deleted.
- **`preserveModel`/`preserveModels` don't delete — they set `generated: false`** in
  `ui-settings.json`, same as the backend MCP. Unlike the backend's evar preserve flag, though, a
  UI model preserved this way is **still addressable by name** through a later plain
  `delete_ui_model` call — but `delete_ui_models` (plural) only targets models where
  `generated: true`, so a preserved model is silently skipped by the plural delete.
- **The UI app name is upper-cased and `-`→`_`'d to build its env var prefix**
  (`MY_APP_API_HOST`, `MY_APP_API_PATH`, ...). Env vars are deduplicated **by name** across all
  apps in `config/environment/index.jsx` — if two apps happen to produce the same env var name
  (e.g. the shared `BASE_PATH`/`AUTH_STATES`/`APP_URL` defaults), the first app's `defaultValue`
  silently wins and the second is dropped, not merged or flagged as a conflict.
- **A model's component/hook names come from snake_case→PascalCase, splitting on `_` only**
  (`data_model` → `DataModel`, page at `components/pages/DataModel/`, hook
  `useDataModelController.jsx`). A model key using `-` instead of `_` won't title-case per word —
  keep model keys in `ui-settings.json` snake_case, matching the backend model's key.
- **The base component library (`components/customs/`, `components/modulars/`,
  `globals/Navbar`, `globals/Main`) is written once by `create_ui_project` and never rewritten by
  any other tool** (`Main.jsx` is only (re)written by the generate/delete tools if it's
  missing). `SideMenu.jsx` is the one exception — see above.

## Key Rules

1. `create_ui_app` → define the model by hand in `ui-settings.json` →
   `generate_ui_model`/`generate_ui_models`. Never skip a step or reorder it (the project itself
   was already created by `technical-leader`, before this skill runs).
2. Define a UI model's shape yourself in `ui-settings.json`; no tool creates it for you.
3. Pass `confirm`/`-y` together with the target name, never alone.
4. Don't hand-edit `SideMenu.jsx` if you still plan to generate or delete any model later — it
   will be silently overwritten project-wide on the next scaffolding call.
5. Know that deleting the last generated model without `preserveModel` also wipes
   `environment/`, `api-connection/`, `controllers/`, and `config/models/`, not just that model's
   own files.
6. Generate every model with the CLI **first**; only then apply this skill's `struct-`/`style-`/
   `logic-` rules to the generated code — a regenerate after styling silently wipes page/
   form-source/table-source/controller edits.
