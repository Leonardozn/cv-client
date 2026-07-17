# cv-client

React + Vite single-page application for the CV generator system's end users: register/sign in,
edit a curriculum, pick a design (Template), and download it as a PDF. It has no backend of its
own — everything it does is a call to `auth-service` (identity/session/account) or `cv-service`
(curriculum content, catalogs, PDF generation).

## Features

- Registration, login and logout against auth-service, with access/refresh token session
  handling: on a `401`/`498` response the app renews the session once via `auth-service`'s
  `/auth/refresh` and retries the original request, sharing a single in-flight refresh across
  concurrent failing requests (`src/config/api-connection/index.jsx`).
- Forgot-password and reset-password flows, plus a two-step change-password flow (request a code
  by email, then confirm it) from the Account page.
- Account self-service: edit profile, change password, and deactivate the caller's own account
  (with a confirmation modal).
- Curriculum editor with independently auto-saved sections — Personal Data, Profile, Skills
  (free-text input with catalog suggestions), and repeatable Education / Experience / Certificate
  entries (`src/components/pages/Curriculum`).
- Home page to pick a Template design and generate/download the CV as a PDF; the file is fetched
  as a binary blob from cv-service and saved client-side (`useHomeController.jsx`).
- Responsive app shell (`Navbar` + collapsible `SideMenu`) that switches to a mobile overlay
  layout at a 768px breakpoint (`src/components/globals/Main`, `SideMenu`).
- Generated CRUD screens for `User`, `Skill` and `Template` still exist as routes
  (`/user`, `/skill`, `/template`, backed by `DataTable`/`Form`) but are intentionally left out of
  the navigation menu — cv-client is an end-user product, not an admin panel (see
  `src/components/globals/SideMenu/SideMenu.jsx`).

## Prerequisites

- Node.js — the Docker build stage uses `node:22-bookworm-slim` (see `Dockerfile`). `package.json`
  does not declare an `engines` field.
- npm — the project ships a `package-lock.json`; the Dockerfile installs with `npm ci`.

## Installation

```bash
npm install
```

Then create a `.env` file in the project root (see Configuration below) before running `dev` /
`build` — Vite only exposes variables prefixed `VITE_` to the app and to `vite.config.js`
(`loadEnv(mode, process.cwd(), 'VITE_')`). `.env` is gitignored; nothing is committed for you to
copy.

## Configuration

Environment variables are read in `src/config/environment/index.jsx` via `import.meta.env.VITE_*`
and are **inlined into the bundle at build time** — they must be known when `npm run build` runs
(the Dockerfile accepts the API host/path ones as `--build-arg`s for exactly this reason).

| Variable | Purpose | Default |
| -------- | ------- | ------- |
| `VITE_BASE_PATH` | Base path both Vite's `base` (`vite.config.js`) and the router's paths (`src/config/router/paths.jsx`) mount under, so the whole app can be served from a sub-path. | `/admin` (code-level default; the project's own committed `.env` overrides it to `/`) |
| `VITE_AUTH_STATES` | Comma-separated HTTP status codes the API interceptor treats as "session expired" and reacts to with a refresh attempt (`src/config/api-connection/index.jsx`). | `401,498` |
| `VITE_APP_URL` | Full URL of this app's own deployment. Declared but not currently read anywhere else in the code. | `http://localhost:5173${VITE_BASE_PATH}` |
| `VITE_AUTH_API_HOST` | Base host of `auth-service`. | `http://localhost:3000` |
| `VITE_AUTH_API_PATH` | Path prefix appended to `VITE_AUTH_API_HOST` for every auth-service call (register, login, refresh, logout, change/forgot/reset password, deactivate, `GET /role/:id`, `User` CRUD). | `/api` |
| `VITE_AUTH_STATIC_IMAGES_HOST` | Host used to resolve auth-service-hosted file/image URLs. Declared but not currently consumed by any component. | *(none)* |
| `VITE_AUTH_IMAGES_API_PATH` | Path prefix paired with `VITE_AUTH_STATIC_IMAGES_HOST`. | `/api/files` |
| `VITE_CV_API_HOST` | Base host of `cv-service`. | `http://localhost:3000` (code-level default in `src/config/environment/index.jsx`; the project's own committed `.env` overrides it to `http://localhost:3001`) |
| `VITE_CV_API_PATH` | Path prefix appended to `VITE_CV_API_HOST` for every cv-service call (Curriculum/Education/Experience/Certificate CRUD, PDF generation, Skill/Template catalogs). | `/api` |
| `VITE_CV_STATIC_IMAGES_HOST` | Host used to resolve uploaded file URLs from cv-service (e.g. `Curriculum.photo`, template preview images). Falls back to `${VITE_CV_API_HOST}${VITE_CV_IMAGES_API_PATH}` when unset (`useHomeController.jsx`, `form-source/curriculum.jsx`). | *(none)* |
| `VITE_CV_IMAGES_API_PATH` | Path prefix paired with `VITE_CV_STATIC_IMAGES_HOST` / the fallback above. | `/api/files` |

## Usage

```bash
npm run dev       # Start the Vite dev server
npm run build      # Production build to dist/
npm run preview    # Serve the production build locally
npm run lint        # Run ESLint over the project
```

### Docker

```bash
docker build \
  --build-arg VITE_BASE_PATH=/ \
  --build-arg VITE_AUTH_API_HOST=https://auth.example.com \
  --build-arg VITE_AUTH_API_PATH=/api \
  --build-arg VITE_CV_API_HOST=https://cv.example.com \
  --build-arg VITE_CV_API_PATH=/api \
  -t cv-client .
```

The `Dockerfile` is a two-stage build: it compiles the app with Vite in a `node:22-bookworm-slim`
stage (writing the build args into a `.env` so both `vite.config.js` and the app code see the same
values), then serves the resulting `dist/` as static files from `nginx:1.27-alpine` on port `80`
(config in `nginx.conf`). `nginx.conf` falls back unknown paths to `index.html` (client-side
routing) and long-caches fingerprinted files under `/assets/` while never caching `index.html`
itself. Only the five build args above are wired into the Dockerfile — `VITE_AUTH_STATES`,
`VITE_APP_URL`, and the `*_STATIC_IMAGES_HOST`/`*_IMAGES_API_PATH` variables are not accepted as
build args and fall back to their code-level defaults in a Docker build.

## Routes / Component reference

All paths below are relative to `VITE_BASE_PATH` (see Configuration); the router builds them in
`src/config/router/paths.jsx` and wires them in `src/config/router/index.jsx`.

**Public pages** (top-level routes, no session required):

| Path constant | Component | Notes |
| -------------- | --------- | ----- |
| `ROOT_PATH` | `Landing` (`components/pages/Landing`) | Placeholder landing page (title only). |
| `REGISTER_PATH` (`/register`) | `Register` | Registration form; shows a success message with a link to Login instead of auto-redirecting. |
| `LOGIN_PATH` (`/login`) | `Login` | Login form; links to Register and Forgot Password. |
| `FORGOT_PASSWORD_PATH` (`/forgot-password`) | `ForgotPassword` | Requests a password-reset email. |
| `RESET_PASSWORD_PATH` (`/reset-password`) | `ResetPassword` | Consumes a reset token from the URL; shows an error state if the token is missing. |
| `*` (any unmatched path) | `NotFound` | Static "404 - Not Found" page. |

**Authenticated shell** — `MAIN_PATH`, rendered by `Main` (`components/globals/Main`), which
renders `Navbar` + `SideMenu` around an `<Outlet />` for these nested children:

| Path (relative) | Component | Notes |
| ---------------- | --------- | ----- |
| `home` | `Home` | Lists Template designs as cards; "Download PDF" calls cv-service's PDF generation endpoint per template. |
| `curriculum` | `Curriculum` | Personal Data, Profile, Skills forms plus Education/Experience/Certificate entry lists, each auto-saved independently. |
| `account` | `Account` | Edit Profile form, two-step Change Password form, and Deactivate Account (with confirmation modal). |
| `template` | `Template` | Generated CRUD screen (`DataTable` + `Form`) for the Template catalog. Not linked from `SideMenu`. |
| `skill` | `Skill` | Generated CRUD screen for the Skill catalog. Not linked from `SideMenu`. |
| `user` | `User` | Generated CRUD screen for `User`. Not linked from `SideMenu`. |

`SideMenu` only lists Home, Curriculum and Account — see Features above for why the other three
routes exist but aren't reachable from the navigation.

## Project structure

```
cv-client/
├── src/
│   ├── main.jsx              # React entry point, mounts <App /> into #root
│   ├── App.jsx                # Wraps the app in <RouterProvider>
│   ├── index.css               # Global styles / CSS variable theme tokens
│   ├── assets/                 # Static assets bundled by Vite
│   ├── components/
│   │   ├── pages/               # Route-level screens (Landing, Login, Register, Home, Curriculum, Account, User, Skill, Template, ...)
│   │   ├── globals/             # Persistent shells: Main (layout), Navbar, SideMenu
│   │   ├── customs/             # Composite components (Form, DataTable, Modal, Sheet, Card, PopUp, ...)
│   │   └── modulars/             # Dependency-free primitives (Button, Input, Badge, Spinner, ...)
│   └── config/
│       ├── router/               # createBrowserRouter tree (index.jsx) and path constants (paths.jsx)
│       ├── controllers/          # Page-level state/data hooks (useXController) + API request methods (auth.jsx, cv.jsx)
│       ├── environment/          # Reads import.meta.env.VITE_* into typed constants
│       ├── api-connection/       # Axios instance factory with the auth/refresh interceptor
│       └── models/
│           ├── form-source/       # Declarative field definitions consumed by <Form>
│           └── table-source/      # Column/mapping definitions consumed by <DataTable>
├── public/                      # Static files served as-is (vite.svg)
├── index.html                    # Vite HTML entry point
├── vite.config.js                # Vite config; resolves `base` from VITE_BASE_PATH
├── nginx.conf                    # Static file server config for the Docker "serve" stage
├── Dockerfile                    # Multi-stage build: compile with Vite, serve with nginx
├── ui-settings.json                # UI/model settings (gitignored, not committed)
└── eslint.config.js               # ESLint flat config (React + hooks + refresh rules)
```
