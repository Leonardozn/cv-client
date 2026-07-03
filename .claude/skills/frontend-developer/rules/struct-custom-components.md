---
title: struct-custom-components
impact: CRITICAL
impactDescription: Enforces isolation and composition of modular components within custom components like forms or carousels.
tags: structure, custom, components, composition
---

# Custom Components Constraints

Custom components act as an intermediate composition layer, typically formed by grouping functional modular components, but they can also contain their own specific internal components. Examples include complex Forms or Carousels.

## Rule

1.  **Location**: Must be placed in `src/components/customs/`.
2.  **Composition**: They are usually formed by a grouping of shared modular components, aggregating them into a functional piece. However, they can also contain their own internal modular components with specific styles and behaviors tailored specifically for that custom component.
3.  **Self-Contained Styles**: The styles of these components must not go beyond the border of the layer that wraps them (e.g., no external margins). External positioning should be managed by the parent container.
    - **Imported Modular Components**: When using a component imported from `src/components/modulars`, the custom component can only influence its **external layout** (e.g., width, grid/flex arrangement, margins, responsiveness). It must **not** override the internal styles of that modular component (like padding, colors, or borders).
    - **Proprietary/Internal Components**: If the custom component uses its own specific internal elements (like a standard HTML `<button>` or an internal component that wasn't imported), it has full freedom to style both their internal appearance and external layout.
4.  **Props Only**: The data they handle is obtained exclusively through properties (**props**). No data fetching or subscriptions to global state are allowed within the component itself.

## Why it matters

- **Separation of Concerns**: Creates a clear middle-tier for handling UI composition without polluting high-level Page components or complicating atomic Modular components.
- **Reusability**: Whole composite blocks of UI can be easily reused in multiple pages.
- **Predictability**: Receiving data strictly via props helps with debugging and testing the complex interplay between modular pieces.

## 5. Specialized Custom Patterns

### Form Component
The `Form` component is a **fully controlled component**. It does not manage its own internal field state; instead, it receives `value` (the data object) and `onChange` (handler for single field updates) from its parent (usually the controller hook). It handles validation and renders fields based on a configuration array.

### SubList Component
Used for managing nested arrays of data. It is also **fully controlled** via `value` and `onChange`. It supports:
- **Matrix Mode**: Multiple columns in `structure` (returns array of objects).
- **Primitive Mode**: Single column in `structure` (returns array of strings/numbers).
- **Responsibility**: The parent controller hook is responsible for any logic based on sublist changes (e.g., calculations).

## Incorrect Example

```jsx
// src/components/customs/AuthForm/AuthForm.jsx

// ❌ Accessing global state directly
import { useAuthStore } from "../../../store/auth";
import ModularInput from "../../modulars/ModularInput/ModularInput";
import ModularButton from "../../modulars/ModularButton/ModularButton";

const AuthForm = () => {
  // ❌ Fetching data/actions internally
  const login = useAuthStore((state) => state.login);

  return (
    // ❌ Layout styles (margin) that affect surroundings
    <div style={{ margin: "50px" }}>
      <ModularInput type="text" placeholder="Username" />
      <ModularInput type="password" placeholder="Password" />
      <ModularButton onClick={login}>Submit</ModularButton>
    </div>
  );
};
```

## Correct Example

```jsx
// src/components/customs/AuthForm/AuthForm.jsx
import "./AuthForm.css"; // ✅ Styles imported from own CSS file
import ModularInput from "../../modulars/ModularInput/ModularInput";
import ModularButton from "../../modulars/ModularButton/ModularButton";

// ✅ No global state. Data and actions received via props.
const AuthForm = ({ usernameProps, passwordProps, onSubmit }) => {
  return (
    // ✅ Internal layout styles defined in CSS class. No external margin.
    <div className="auth-form-wrapper">
      <ModularInput {...usernameProps} className="auth-input" />{" "}
      {/* Allowed to set layout sizing class */}
      <ModularInput {...passwordProps} className="auth-input" />
      {/* ✅ This is a proprietary button, so we can style its internal colors/padding via the 'auth-submit-btn' class */}
      <button className="auth-submit-btn" onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
};
```

```css
/* src/components/customs/AuthForm/AuthForm.css */
.auth-form-wrapper {
  /* ✅ Self-contained styles that don't go beyond the wrapper border */
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

/* ✅ Controlling ONLY external layout of imported modular components */
.auth-input {
  width: 100%;
}

/* ✅ Controlling internal AND external styles of a proprietary/internal element */
.auth-submit-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```
