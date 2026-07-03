---
title: struct-global-components
impact: CRITICAL
impactDescription: Defines the structure and usage of global components like layouts, headers, and footers.
tags: structure, globals, layout, components
---

# Global Components

Global components are persistent UI elements that exist outside the scope of individual pages, often serving as the main application shell.

## Rule

1.  **Location**: Must be placed in `src/components/globals/` (e.g., `src/components/globals/Navbar/`).
2.  **Role**:
    - They sit **outside** of Page components in the component tree (usually in `App.jsx` or a main Layout wrapper).
    - They can optionally **wrap** Page or Modular components (acting as a Layout).
    - They can **contain** other Global components (e.g., a `MainLayout` can contain a `Navbar` and a `Sidebar`).
    - Examples: `Navbar`, `Footer`, `Sidebar`, `MainMenu`, `MainLayout`.
3.  **Data Handling**:
    - Are **allowed** to use external controller methods, hooks, or state management stores to fetch and manage data (e.g., fetching user profile for the Navbar).
    - Can pass this data down to children if acting as a layout wrapper.
4.  **Styles**:
    - Must define their own styles in a dedicated `.css` file.
    - Styles must be **isolated**: they should only affect the global component itself, even if they wrap a page. They should not enforce layout styles on the content they wrap (the Page is responsible for its own internal layout).

## Why it matters

- **Persistence**: Ensures elements like navigation remain consistent while the user navigates between pages.
- **Organization**: Clearly distinguishes between reusable atomic widgets (Modulars), specific views (Pages), and structural application shells (Globals).
- **Style Isolation**: Prevents the "Sidebar" styles from accidentally breaking the "Dashboard" grid.

## Incorrect Example

```jsx
// src/components/globals/MainLayout/MainLayout.jsx

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      {/* ❌ Applying styles to children (Page) from the global component */}
      <div
        className="content"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>
    </div>
  );
};
```

## Correct Example

```jsx
// src/components/globals/MainLayout/MainLayout.jsx
import "./MainLayout.css";
import Sidebar from "../Sidebar/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      {/* ✅ The slot for page content is just a container. 
          The Page component inside {children} will handle its own internal layout. */}
      <main className="main-content">{children}</main>
    </div>
  );
};
```

```css
/* src/components/globals/MainLayout/MainLayout.css */
.main-layout {
  display: grid;
  grid-template-columns: 250px 1fr; /* Sidebar + Content */
  height: 100vh;
}

.main-content {
  overflow-y: auto;
  /* No opinion on what's inside. The Page component takes over from here. */
}
```
