---
title: Define a UI model's field shapes in ui-settings.json
impact: HIGH
impactDescription: Unlike the backend, nothing validates ui-settings.json before generate_ui_model/generate_ui_models runs. A malformed field never throws — it silently produces a broken or incomplete form/table with no warning, which is harder to catch than a hard failure.
tags: data, model, ui-settings, fields, schema, forms
---

# Define a UI model's field shapes in ui-settings.json

## Why it matters

Before `generate_ui_model`/`generate_ui_models` can write a model's form-source,
table-source, controller hook, and page, the model must already exist as an
object under `ui-settings.json` → `apps[<app>].models.<modelName>`. You define
that object by hand — there is no tool that builds it for you (see
`proc-mcp-scaffolding`).

Unlike the backend's `settings.json`, **there is no `validateSettings()`
equivalent for `ui-settings.json`** — reading it only checks that the file
parses as JSON. A malformed field doesn't throw an error or block generation;
it silently produces a degraded form or table (a missing placeholder, a
dropdown that never loads, nested fields that just don't appear) with nothing
telling you it happened. Get the shape right yourself — nothing will catch a
mistake for you.

## Field type reference

| `type` | Extra keys | Notes |
| --- | --- | --- |
| `String`, `Number`, `Boolean` | `label`, `placeholder`, `required` (all optional metadata) | Primitives. No required extra key. |
| `Dateonly`, `Datetime`, `Time` | `label`, `placeholder`, `required` | Date variants — `Dateonly` is a calendar date, `Datetime` a full timestamp, `Time` a time-of-day only. |
| `select`, `multiselect` | `ref` (or literal `options`), `label`, `placeholder`, `required` | `ref` names a **sibling model's key** in the same app's `models` (e.g. `"sub_data_model"`); the generator builds a `GET_<ref>_LIST` fetch and a `linkTo`. **Never cross-validated** — a typo'd `ref` silently breaks the dropdown instead of failing generation. |
| `file` | `accept`, `apiHost`, `imageHost`, `apiPath`, `label`, `placeholder` | Upload field. `apiHost`/`imageHost`/`apiPath` are **env var names**, not literal URLs — they're emitted as raw identifiers resolved through the generated `config/environment/index.jsx`. |
| `Object` | `structure` | An object of fields, same rules recursively. Read if present, but — unlike the backend — **nothing errors if it's missing**; the nested fields are just silently skipped. |
| `Array` | `contentType` | The type of each element: a primitive name or `"Object"`. Needed for the field to render as a real list; without it the field falls back to a flat/generic rendering instead of erroring. |
| `Array` + `contentType: "Object"` | `structure` | Same recursive field rules apply inside `structure`. |
| `select`/`multiselect`/`Array` | `enum` (optional) | Restricts to literal values. Only has a visible effect on `select`/`multiselect`-shaped fields — see the first gotcha below for what happens when it's combined with the wrong `type`. |

Model-level keys (sibling of `fields`):

| Key | Notes |
| --- | --- |
| `fields` | The only one you write by hand. |
| `generated` | Set by the CLI once `generate_ui_model` has run; don't set it yourself before generating. |

There is **no `dbType`/`dbName`/`collectionName` equivalent** on the UI side —
those are purely backend concepts.

## Gotchas the schema can't show you

- **`contentType` only does anything when `type` is `"Array"`** — it picks the
  element type. Putting it on a scalar field (`type: "String"`/`"Number"`/etc.)
  isn't a documented pattern; it's silently accepted, and the only observable
  effect is that the generated form field's `placeholder` gets suppressed
  (the generator treats any field with a `contentType` and a non-`"array"`
  `type` as "array-like" for that one purpose). This isn't hypothetical — this
  project's own `frontend/ui-settings.json` has it on `numbers` and
  `limited_numbers`.
- **`ref` on `select`/`multiselect` is read but never checked** against the
  app's other models. A typo'd or renamed `ref` produces a dropdown that
  silently fails to load options instead of an error at generate time.
- **`structure` is optional to the generator, not required** like the
  backend's validator demands. Omitting it on an `Object` or `Array`-of-`Object`
  field doesn't fail `generate_ui_model` — it just produces a form that
  silently drops those nested fields.
- **Table generation never recurses into `structure` at all** — `Object` and
  `Array`-of-`Object` fields always render as a flat fallback/count column in
  the table regardless of how deeply you nest fields. The nesting only matters
  for the form, never for the table.

## Incorrect Example

```jsonc
// ❌ contentType on a scalar — silently suppresses the form placeholder, does nothing else
"amount": { "type": "Number", "contentType": "Number", "label": "Amount" }

// ❌ ref pointing at a model that doesn't exist in this app's models — no error, dropdown just never loads
"sub_data_model": { "type": "select", "ref": "suppliers", "label": "Sub Data Model" }

// ❌ Object without structure — no error, the nested fields are just silently dropped from the form
"nested_object": { "type": "Object", "label": "Nested" }

// ❌ Array without contentType — falls back to a flat/generic rendering instead of a real list
"numbers": { "type": "Array", "label": "Numbers" }
```

## Correct Example

Two real, related models from a generated `frontend/ui-settings.json`:
`sub_data_model` is the simple referenced model, and `data_model` references it
(both as a single `select` and as a `multiselect`), plus a `file` upload and a
nested `Object`/`Array` of `Object`.

```jsonc
{
  "data_model": {
    "fields": {
      "text": { "type": "String", "label": "Text", "placeholder": "Text", "required": true },
      "birthdate": { "type": "Dateonly", "label": "Birthdate", "placeholder": "Birthdate" },
      "arrival": { "type": "Datetime", "label": "Arrival", "placeholder": "Arrival" },

      "image_url": {
        "type": "file",
        "label": "Image URL",
        "placeholder": "Image URL",
        "accept": "images/*",
        "apiHost": "BACKEND_API_HOST",
        "imageHost": "BACKEND_STATIC_IMAGES_HOST",
        "apiPath": "BACKEND_IMAGES_API_PATH"
      },

      // single relation — ref names the sibling model's key, "sub_data_model"
      "sub_data_model": {
        "type": "select",
        "required": true,
        "ref": "sub_data_model",
        "label": "Sub Data Model",
        "placeholder": "Sub Data Model"
      },

      // array of relations — same ref, type: multiselect
      "sub_data_models": {
        "type": "multiselect",
        "ref": "sub_data_model",
        "label": "Sub Data Models",
        "placeholder": "Sub Data Models"
      },

      // nested object — fields inside structure follow the same rules, including their own relations
      "nested_object": {
        "type": "Object",
        "structure": {
          "text": { "type": "String", "label": "Text", "placeholder": "Text" },
          "sub_data_model": {
            "type": "select",
            "required": true,
            "ref": "sub_data_model",
            "label": "Sub Data Model",
            "placeholder": "Sub Data Model"
          }
        }
      },

      // array of objects — contentType: "Object" + structure
      "object_list": {
        "type": "Array",
        "contentType": "Object",
        "structure": {
          "nickname": { "type": "String", "label": "Text", "placeholder": "Text" },
          "event_date": { "type": "Dateonly", "label": "Event Date", "placeholder": "Event Date" }
        }
      }
    },
    "generated": true
  },

  "sub_data_model": {
    "fields": {
      "name": { "type": "String", "label": "Name", "placeholder": "Name", "required": true }
    },
    "generated": true
  }
}
```

Once this is in place, call `generate_ui_model('data_model', 'backend')` /
`generate_ui_model('sub_data_model', 'backend')` (or `generate_ui_models('backend')`
for both at once) to materialize the form-source, table-source, controller
hook, and page.

## Key Rules

1. **Only use `contentType` on `Array` fields** — anywhere else it's noise
   whose one real effect is silently killing the field's `placeholder`.
2. **`select`/`multiselect`'s `ref` must exactly match a sibling model's key**
   in the same app's `models` — there's no error if it doesn't, just a
   dropdown that never loads.
3. **Always write `structure` on `Object` and `Array`-of-`Object` fields**
   even though the generator won't complain if you skip it — omitting it
   silently drops those nested fields from the form.
4. **Define the field shape yourself, by hand** — `generate_ui_model` only
   reads this object and writes files for it; it never infers or validates
   the shape (there is no UI equivalent of `validateSettings()`).
5. **Don't expect `dbType`/`dbName`/`collectionName` on a UI model** — those
   are backend-only; a UI model needs nothing besides `fields` (plus the
   CLI-set `generated`).
