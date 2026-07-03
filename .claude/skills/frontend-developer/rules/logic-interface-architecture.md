---
title: logic-interface-architecture
impact: HIGH
impactDescription: Enforces standard interface design architecture, routing layouts, and reusability paradigms.
tags: architecture, best-practices, ui
---

# Interface Architecture Best Practices

## Why it matters

Following a unified architecture for user interfaces ensures maintainability, predictability, and a cohesive user experience across the application. Using consistent layouts and reusing components reduces duplicated work and prevents UI fragmentation.

## Best Practices

1. **Routing**: Application navigation should be centrally managed using routing libraries (e.g., React Router) wrapping the application.
2. **Global Main Wrapper**: Always use a global `Main` layout component (located in `src/components/globals/`). This component should act as the shell that wraps persistent UI navigational elements (like a `Navbar` and a `SideMenu`) alongside the dynamic routed `page` content.
3. **Pages as Views**: Specific `page` components must be created to act as the primary views. Pages are the structural containers where you accommodate your `custom` and `modular` components in a grid or flex layout. They should handle data fetching and manage high-level state.
4. **UX-Driven Component Arrangement**: Position your components in ways that enhance user experience. Group related inputs inside a `Sheet` or `Card`, keep primary action `Button`s highly visible and accessible, and ensure spacing (`gap` and padding) gives the UI breathing room. A `Card`-like wrapper is a legitimate grouping tool, not a default reflex — reach for one only when the content is genuinely distinct and actionable, and never nest one inside another (see `struct-page-layers`).
5. **Component Reusability**: **Always** prioritize the use of existing `modular` and `custom` components (like `Button`, `Input`, `Sheet`, `Modal`, `PopUp`, `DataTable`) to compose your pages instead of writing custom raw HTML. This ensures the design system remains consistent. For a better understanding of the available base components, refer to the `custom-components-features`, `global-components-features`, and `modular-component-features` resources, in addition to directly exploring the components within `src/components/`.
6. **Accessibility and Keyboard Navigation (UX)**: Ensure that all forms and interactive controls are fully navigable using the `Tab` key. Custom components that act as inputs (like custom dropdowns, toggles, or radio groups) must include `tabIndex={0}` and map keyboard events like `Enter` and `Space` to replicate native HTML input behavior, guaranteeing a smooth and professional user flow. This is the baseline; `logic-interactive-states` covers the fuller contract (all required interaction states, `:focus-visible`, overlay positioning, roving tabindex, and the shared z-index scale).

## Incorrect Example ❌

```jsx
// Building an interface without a Main layout shell and using raw HTML instead of existing components
const Dashboard = () => {
  return (
    <div className="custom-dashboard-layout">
      <nav className="custom-navbar">Dashboard</nav>
      <div className="content">
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "5px",
          }}
        >
          <h2>Form</h2>
          <input type="text" placeholder="Name" />
          <button style={{ backgroundColor: "blue", color: "white" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Correct Example ✅

```jsx
// Composing a page utilizing existing components and designed to be rendered within the `<Main>` router outlet.
import Sheet from "../../customs/Sheet/Sheet";
import Input from "../../modulars/Input/Input";
import Button from "../../modulars/Button/Button";

const DashboardPage = () => {
  return (
    <div className="dashboard-grid">
      <Sheet elevation={1}>
        <h2>User Form</h2>
        <div className="form-group">
          <Input label="Name" placeholder="Enter your name" />
          <Button text="Save" type="primary" />
        </div>
      </Sheet>
    </div>
  );
};
```
