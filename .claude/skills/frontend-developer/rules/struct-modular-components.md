---
title: struct-modular-components
impact: CRITICAL
impactDescription: Enforces isolation, reusability, and self-contained styles for modular components.
tags: structure, modular, components, css
---

# Modular Components Constraints

Modular components designed for high reusability and atomic usage have strict constraints.

## Rule

1.  **Location**: Must be placed in `src/components/modulars/`.
2.  **No Dependencies**: Must **not** import or use other custom components. They should only render standard HTML elements (leaf nodes).
3.  **Self-Contained CSS File**: Styles must be defined in the component's **own `.css` file** (e.g., `MyComponent.css`). Avoid inline styles unless strictly necessary for dynamic values. The CSS should only affect the component's internal layout (padding, border, etc.) and not external positioning (margin, absolute positioning).
4.  **Props Only**: Must receive all data via **props**. No data fetching or subscriptions to global state (Context/Redux/Zustand) allowed within the component.

## Why it matters

- **Reusability**: Makes components truly portable and independent.
- **Predictability**: "Pure" components are easier to test and reason about; they render solely based on props.
- **Maintainability**: Avoids complex dependency trees and circular references.

## Incorrect Example

```jsx
// src/components/modulars/UserProfile/UserProfile.jsx

// ❌ Importing another custom component
import UserAvatar from "../UserAvatar";
// ❌ Accessing global state
import { useStore } from "../../../store";

const UserProfile = () => {
  // ❌ Fetching data internally or from store
  const user = useStore((state) => state.user);

  return (
    // ❌ Layout styles (margin) that affect surroundings
    <div style={{ margin: "50px" }}>
      <UserAvatar src={user.image} />
      <h1>{user.name}</h1>
    </div>
  );
};
```

## Correct Example

```jsx
// src/components/modulars/UserProfile/UserProfile.jsx
import "./UserProfile.css"; // ✅ Styles imported from own CSS file

// ✅ No custom component imports. Data received via props.
const UserProfile = ({ name, imageUrl, onAction }) => {
  return (
    // ✅ Internal styles defined in CSS class.
    <div className="user-profile">
      <img src={imageUrl} alt={name} />
      <h1>{name}</h1>
      <button onClick={onAction}>View Profile</button>
    </div>
  );
};
```

```css
/* src/components/modulars/UserProfile/UserProfile.css */
.user-profile {
  padding: 16px;
  border: 1px solid #ccc; /* ✅ Self-contained styles */
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```