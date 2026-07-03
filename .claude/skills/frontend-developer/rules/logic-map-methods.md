---
title: logic-map-methods
impact: HIGH
impactDescription: Standardizes the process for fetching, formatting, and transforming backend data for Form and Table visual components.
tags: logic, maps, methods, data
---

# Map Methods (Data Transformation layer)

To keep UI components (`<Form />`, `<DataTable />`, Pages) as clean and dumb as possible regarding raw data manipulation, we rely on the helper functions centralized in `src/config/controllers/map-methods.jsx`.

These methods are designed to adapt backend payloads into the exact structure that your application configurations (`form-source` and `table-source`) require.

Never write loops or conditional mappings for data payloads inside your pages.

## 1. `fetchAndResolveTableData`

**Purpose**: Fetches paginated records and count from a standard LIST endpoint, passing the records automatically to `resolveTableDataOptions`.

**When to use it**: Inside the `loadTableData` function of any Page component displaying a DataTable.

```javascript
// Incorrect: Doing raw fetching, slicing, or manual counting inside the Page component
const res = await apiMethods.GET_CLIENT_LIST.method(params);
const rows = res.data.content.records;
const mappedRows = resolveTableDataOptions(rows, activeFields);

// Correct: Delegating extraction and resolution
import { fetchAndResolveTableData } from "../../../config/controllers/map-methods";

const { records, count } = await fetchAndResolveTableData(
  apiMethods.GET_CLIENT_LIST,
  params,
  activeFields, // form configuration array
);

// Map the records loop just to inject external actions (like Edit buttons).
setTableData(records); // records are fully resolved
setTotalPages(Math.ceil(count / size));
```

## 2. `mapDynamicOptions`

**Purpose**: Iterates over a Form configuration array, identifying any field with a `dynamicOptions` property (e.g. Lookups/Foreign Keys) and securely injects the list of options to its dropdown (`<select>`).

**When to use it**: In your Page component initialization before passing the definition to the `<Form />`.

```javascript
// Inside a useEffect on component mount
const initialize = async () => {
  // It takes the static config and populates it with live data from the API
  const configWithLiveOptions = await mapDynamicOptions(
    clientFormConfig,
    apiMethods,
  );
  setFormFields(configWithLiveOptions);
};
```

## 3. `buildTableSearchQuery`

**Purpose**: Generates the structural Axios query object for searching across multiple configured columns simultaneously forming an implicit `AND`, based purely on the `<tableConfig>` file where columns set `searchable: true` and a specific `type` (e.g. `"string"`, `"number"`).

**When to use it**: In the `loadTableData` function, right before making the search request.

```javascript
// Correct implementation
import { buildTableSearchQuery } from "../../../config/controllers/map-methods";

if (searchValue) {
  const query = buildTableSearchQuery(searchValue, clientTableConfig);
  if (Object.keys(query).length > 0) {
    // Example output generated for "10": { name: { or: { like: "10" } }, stock: { or: { eq: 10 } } }
    params.query = query;
  }
}
```

## 4. `resolveTableDataOptions`

**Purpose**: This operates implicitly under `fetchAndResolveTableData`, but its main role is converting raw ObjectIds into Human-readable Strings based on active Form Field Options, and replacing raw Boolean `true`/`false` into standard semantic checkmark (`<FiCheck />`) icons.

**When to use it**: Mostly automatically used, but can be called when you securely need to transform backend raw elements manually into the visually appealing structure that `<DataTable />` natively expects.
