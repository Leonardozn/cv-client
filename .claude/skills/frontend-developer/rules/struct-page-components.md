---
title: struct-page-components
impact: CRITICAL
impactDescription: Defines page components as layout orchestrators and data controllers.
tags: structure, pages, layout
---

# Page Components

Page components act as the main containers for distinct views in the application, orchestrating data fetching and layout.

## Rule

1.  **Location**: Must be placed in `src/components/pages/` (e.g., `src/components/pages/Dashboard/`).
2.  **Role**: Act as wrappers/containers that compose the UI using Custom Components, Modular Components, and other elements.
3.  **Data Handling**: Page components are **allowed** and encouraged to use specialized per-page controller hooks (e.g., `useArticleController.jsx`) to manage their complex state, data fetching, and event handlers. They pass this data and actions down to child components via props.
4.  **Layout Styles**: Styles must be defined in the component's **own `.css` file**. These styles should focus on **layout and positioning** (margins, sizing, grid/flex arrangement, responsive design) of the child components they wrap, rather than the internal look of those components.

## Why it matters

- **Separation of Concerns**: clearly separates "Smart" containers (Pages) from "Dumb" presentational components (Modulars and Custom components).
- **Scalability**: Makes it easier to manage data flow and application state at the page level.
- **Maintainability**: Centralizes layout logic in the page, letting individual components remain agnostic of their environment.

## Incorrect Example

```jsx
// src/components/pages/UserProfilePage/UserProfilePage.jsx

// ❌ Page defining internal styles of a child component
// ❌ Hardcoded data instead of fetching
const UserProfilePage = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* ❌ Modifying child internal style directly via style prop if not intended for layout */}
      <div
        className="card"
        style={{ backgroundColor: "red", borderRadius: "5px" }}
      >
        User Name
      </div>
    </div>
  );
};
```

## Correct Example

```jsx
// src/components/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { UserController } from "../../../controllers/UserController";
import UserProfile from "../../modulars/UserProfile/UserProfile";
import "./Dashboard.css"; // ✅ Layout styles

const Dashboard = () => {
  const [user, setUser] = useState(null);

  // ✅ Allowed to fetch data
  useEffect(() => {
    UserController.getProfile().then(setUser);
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    // ✅ Uses CSS class for layout
    <main className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user.name}</h1>

      {/* ✅ Composes Modular components */}
      <section className="dashboard-content">
        <UserProfile
          name={user.name}
          imageUrl={user.image}
          onAction={() => console.log("View")}
        />
      </section>
    </main>
  );
};
```

```css
/* src/components/pages/Dashboard/Dashboard.css */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-content {
  display: grid; /* ✅ Controls layout of children */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

/* ✅ Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
}
```
