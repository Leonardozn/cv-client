---
title: Document the test execution flow — seed data and endpoint ordering, step by step
impact: HIGH
impactDescription: A PRD that lists requirements and scenarios but not the order to run them in, nor the data that must exist first, produces false failures — a tester who calls a dependent endpoint before its precondition sees a 400/404 that looks like a bug but is just wrong sequencing.
tags: structure, prd, test-flow, seed-data, ordering, preconditions
---

# Document the test execution flow — seed data and endpoint ordering, step by step

## Why it matters

A service's endpoints almost never run in arbitrary order. Most have **data dependencies** the
tester (a human or an agent such as TestSprite) cannot guess from the requirements list alone:

- A record that **references another entity** can't be created before that entity exists — a
  `User` with a `role` reference needs a `Role` on record first; a `Product` with a `category`
  reference needs the `Category` first.
- A **protected endpoint** can't be exercised before authentication — you log in first and carry
  the resulting session cookie/token into every guarded call.
- `findOne`/`update`/`replace`/`delete` on `/:id` can't run before a `create` has produced the
  id they operate on.
- **Lookup / configurable-data models** (Role, Category, Plan, Status — the reference models a
  service uses instead of hardcoded enums) usually need seeding before anything that points at
  them works.

If the PRD documents *what* to test and *what the assertions are* but not *what must exist first*
and *in what order to call things*, the tester runs the endpoints in FR order and everything
downstream fails for the wrong reason. So the PRD must carry an explicit **Test data & execution
flow** section: the initial records to seed, and a numbered, step-by-step endpoint runbook. This
isn't new content you invent — it's the ordering already implied by the models and auth you read
during `proc-analyze-before-writing`, made explicit.

## What the section contains

1. **Preconditions & seed data.** The records that must exist before the functional scenarios
   run. Derive them from the code: every reference field in a model (→ its target must be seeded)
   and every lookup/configurable-data model. For each seed record give **concrete field values**
   and **how it's created** — a dedicated seed endpoint/script if the project has one, otherwise
   that model's own create endpoint, otherwise a direct DB insert (say so explicitly). Note any
   unique constraint so seeds use distinct values.
2. **Ordered endpoint sequence.** A numbered runbook, each step naming: the endpoint
   (`METHOD /path`), what it consumes from an earlier step (a seeded reference, an id returned by
   a create, an auth cookie/token), and what it produces for later steps. The canonical order:
   **authenticate → seed/create referenced (parent) entities → create the dependent entity →
   read/update/replace it by id → delete it → teardown.** Ground each ordering claim in the code
   (a reference field, an auth guard/middleware, a unique index), not in convention.

## Incorrect Example

A PRD that jumps straight from requirements to a scenario table assuming records already exist.

```markdown
## 7. Test scenarios (Given / When / Then)

| # | Given | When | Then | FR |
| - | ----- | ---- | ---- | -- |
| 1 | a user exists | GET /user/{id} | 200 + the user | FR-U2 |
```

<!-- ❌ No seed section, no order. The tester runs scenario 1 first, but no user exists yet and
     `role` was never seeded, so POST /user 400s and GET /user/{id} 404s — both read as bugs. -->

## Correct Example

```markdown
## 7. Test data & execution flow

### 7.1 Preconditions & seed data
Seed these before any functional scenario (references derived from `src/models/*`):

| Seed record | Model | How | Values |
| ----------- | ----- | --- | ------ |
| Admin role  | Role (lookup) | `POST /role` | `{ name: "admin" }` |
| Test account | User | `POST /user` (needs the Admin role id) | `{ email: "qa@test.dev", password: "Passw0rd!", role: "<role id>" }` |

### 7.2 Ordered endpoint sequence
1. **`POST /role`** → seed the `admin` role; capture `content.id` as `roleId` (User references it).
2. **`POST /user`** with `role: roleId` → create the account; capture `userId`.
3. **`POST /auth/login`** with the account credentials → sets the `st` session cookie; carry it
   into every step below (all `/user` routes are guarded).
4. **`GET /user/{userId}`** (cookie from step 3) → read back the created user.
5. **`PATCH /user/{userId}`** → update a field; assert the change.
6. **`DELETE /user/{userId}`** → remove it; a follow-up `GET /user/{userId}` now returns the
   not-found error (400 in this service — see the endpoint's Swagger).
```

## Key Rules

1. Every backend PRD includes a **Test data & execution flow** section: the seed/preconditions
   *and* the ordered, step-by-step endpoint runbook — never leave sequencing implicit.
2. Derive the order from the code you already analyzed: a **reference field** means "create the
   target first"; an **auth guard** means "authenticate first"; an **`/:id` route** means "create
   before read/update/delete".
3. Seed records list concrete values and their creation method (seed endpoint/script → create
   endpoint → direct insert, in that preference), and respect unique constraints.
4. Each runbook step names what it **consumes** from earlier steps (id, cookie/token, seeded
   reference) and what it **produces** for later ones.
5. For a **frontend** project (`scope-backend-vs-frontend`), the same idea is required app state /
   preceding navigation: which screen/login/selection must happen before the step under test.
