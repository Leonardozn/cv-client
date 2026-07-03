# Form Payloads and API Methods Rules

This rule defines the logic to prepare form data before submitting to the backend, and how to choose the right API method for updating.

## Why it matters

To ensure backend consistency and save bandwidth, we don't send empty fields. Additionally, choosing the correct API method (PATCH vs PUT mapping to our custom methods) distinguishes between partial changes and full replacements. Furthermore, removing the primary keys (`_id` or `id`) from the actual payload body prevents database constraint errors.

## The Rule

1. Remove all keys from the payload whose value is an empty string (`""`) before making the API request.
2. **Never** include primary keys (`_id` or `id`) in the payload body being sent via PUT/PATCH/POST. These should only be read initially to define the route/id for the API Method.
3. When a form is used to edit a full record, you must use the `REPLACE_` method (which maps to a PUT request).
4. The `UPDATE_` method (which maps to a PATCH request) is strictly reserved for updating only a specific part of a record, not full forms.
5. **Multipart/Form-Data Transformation**: If a payload contains a `File` object (triggering `multipart/form-data`), all **array fields** must be converted to **JSON strings** (using `JSON.stringify`) before appending them to the `FormData`. This ensures the backend correctly reconstructs the array from the multi-part request.

## Incorrect

```jsx
// Sending empty strings, IDs in the payload body, and using UPDATE_ for full form editing
const handleSubmit = async (formData) => {
  const isEditing = Boolean(formData.id);

  // Incorrect: Not filtering out IDs or empty strings
  const payload = formData;

  if (isEditing) {
    // Incorrect: Using UPDATE_ for a full form edit instead of REPLACE_
    await apiMethods.UPDATE_RECORD.method(payload.id, payload);
  } else {
    // Incorrect: Sending empty strings like "" inside the raw payload
    await apiMethods.ADD_RECORD.method(payload);
  }
};
```

## Correct

```jsx
// Filtering empty strings and primary keys, and using REPLACE_ for full form editing
const handleSubmit = async (formData) => {
  const isEditing = Boolean(formData._id || formData.id);

  // 1 & 2. Remove empty strings AND primary keys
  const payload = Object.fromEntries(
    Object.entries(formData).filter(
      ([k, v]) => v !== "" && k !== "_id" && k !== "id",
    ),
  );

  if (isEditing) {
    // 3. Use REPLACE_ for full modifications and grab the ID from the raw object
    const id = formData._id || formData.id;
    await apiMethods.REPLACE_RECORD.method(id, payload);
  } else {
    await apiMethods.ADD_RECORD.method(payload);
  }
};
```

---

## Pre-Submit Calculations (Enriching the Payload)

When a Page needs to compute derived values (totals, taxes, etc.) **before** sending the data to the API, **wrap** `actions.handleSubmit` with a local middleware function in the Page component. Never put business calculation logic inside `model-controller.jsx`.

### Pattern: Submit Middleware

```jsx
// PurchasePage.jsx
const { actions, fields, isViewMode, isSubmitting } = useModelController({ ... });

// Wraps the controller's handleSubmit to enrich the payload
const handleSubmitWithCalcs = (formData) => {
    const subtotal = formData.articles?.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    ) ?? 0;

    const enrichedData = {
        ...formData,
        subtotal,
        total: subtotal * 1.19, // apply tax
    };

    // Delegate transport to the controller — it handles confirmation modal + API call
    actions.handleSubmit(enrichedData);
};

// In JSX — replace onSubmit with the wrapper
<Form
    fields={fields}
    onSubmit={isViewMode ? undefined : handleSubmitWithCalcs}
    onCancel={actions.closeModal}
    isLoading={isSubmitting}
/>
```

---

## Reactive Fields (Updating Fields on Change)

When calculated values need to be reflected in other fields **while the user fills the form**, and if `Form.jsx` exposes an `onFieldChange` callback, use it to intercept changes and push derived values back through `actions`:

```jsx
const handleFieldChange = (key, value) => {
    if (key === "articles") {
        const total = value.reduce((acc, item) => acc + item.price * item.quantity, 0);
        // Push the derived field update back into the controller state
        // (requires Form to call onFieldChange and the controller to expose updateField)
        actions.updateField?.("total", total);
    }
};

<Form
    fields={fields}
    onFieldChange={handleFieldChange}
    onSubmit={isViewMode ? undefined : handleSubmitWithCalcs}
/>
```

> [!NOTE]
> If `Form.jsx` does not yet support `onFieldChange`, add it as an optional prop that calls `onFieldChange?.(key, value, currentFormData)` inside `handleFieldChange`. This is a 2-line, fully backwards-compatible change.
