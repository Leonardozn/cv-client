---
title: style-english-only
impact: HIGH
impactDescription: Standardizes code language to English to ensure accessibility and consistency.
tags: style, language, naming
---

# English Language Usage

English is the designated language for all code, documentation, and non-localized text.

## Rule

1.  **Code Identifiers**: All variable names, function names, class names, component names, and file names must be in English.
2.  **Comments**: All code comments and documentation must be written in English.
3.  **UI Text**: Hardcoded text in the UI should be in English (unless using an i18n library, where keys should still be logical English).

## Why it matters

- **Global Standard**: English is the universal language of programming; using it ensures the codebase is accessible to the widest possible audience of developers.
- **Consistency**: Avoiding mixed languages (e.g., Spanish variables with English keywords like `if`, `while`, `const`) makes the code easier to read and parse mentally.
- **Tooling Support**: Many dev tools and libraries assume English naming conventions (e.g., `get...`, `set...`, `is...`).

## Incorrect Example

```jsx
// ❌ Comentarios en español
// Componente de botón de usuario
const BotonUsuario = ({ nombre, alHacerClick }) => {
  const [estaCargando, setEstaCargando] = useState(false);

  return (
    <button onClick={alHacerClick}>
      {estaCargando ? "Cargando..." : nombre}
    </button>
  );
};
```

## Correct Example

```jsx
// ✅ Comments in English
// User button component
const UserButton = ({ name, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  return <button onClick={onClick}>{isLoading ? "Loading..." : name}</button>;
};
```