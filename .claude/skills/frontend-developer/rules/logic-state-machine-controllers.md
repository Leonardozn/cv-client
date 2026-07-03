---
title: logic-state-machine-controllers
impact: HIGH
impactDescription: Standardizes component logic using a Finite State Machine pattern to prevent "Impossible States" and keep UI components dumb.
tags: logic, state-machine, controllers, crud
---

# State Machine Controllers

To ensure UI robustness and prevent "Impossible States" (e.g., being in a 'loading' state and 'editing' state simultaneously), all Page components must delegate their logic to a State Machine Controller.

## 1. Page-Specific Controller Hooks

**Purpose**: Every Page component must have its own specialized controller hook (e.g., `useArticleController.jsx`) to manage its state, data fetching, and event handlers. This ensures complete isolation and easy customization without affecting other pages.

**Location**: These hooks reside in `src/config/controllers/`.

**Key Features**:
- **State Isolation**: Each page manages its own `isInitialized`, `status`, `data`, and `pagination` states.
- **Finite State Machine**: Uses a `status` state (`'IDLE'`, `'LOADING'`, `'SUBMITTING'`) to prevent race conditions and "Impossible States".
- **Debounced Data Loading**: Centralizes table data fetching into a single debounced effect that depends on `isInitialized` and search/pagination parameters.
- **Form Handling**: Manages its own `formData` and `handleSubmit`, ensuring data is correctly formatted (Multipart/FormData vs JSON) before calling the API.

### Correct Usage (Page Component)
```javascript
import useArticleController from "../../../config/controllers/useArticleController";

const Article = () => {
    // Controller returns everything the UI needs
    const {
        status,
        data,
        formFields,
        pagination,
        search,
        modal,
        confirm,
        actions // setSearch, handleEdit, handleDelete, etc.
    } = useArticleController();

    if (status === "INITIALIZING") return <Spinner />;

    return (
        <Sheet title="Articles">
            <DataTable 
                data={data} 
                onSearch={actions.setSearch} 
                // ... props from controller
            />
            {/* Modal and Form also driven by controller state */}
        </Sheet>
    );
};
```

### Correct Usage (Controller Hook)
```javascript
export const useArticleController = () => {
    const [status, setStatus] = useState("IDLE");
    const [isInitialized, setIsInitialized] = useState(false);
    
    // 1. Stable data loading function
    const loadTableData = useCallback(async (page, size, searchVal) => {
        // ... API call
    }, []);

    // 2. Debounced effect for loading data
    useEffect(() => {
        if (!isInitialized) return;
        const timer = setTimeout(() => {
            loadTableData(pagination.currentPage, pagination.rowsPerPage, search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, pagination.currentPage, pagination.rowsPerPage, isInitialized, loadTableData]);

    return { status, ... };
};
```

## 2. Why it Matters

1.  **Low Cognitive Load**: Developers don't need to understand a complex "Universal Controller". They just look at the hook corresponding to the page.
2.  **Total Customization**: New requirements for a specific page can be implemented in its controller without risk of breaking other modules.
3.  **Prevents Interface Crashes**: Explicit states (`INITIALIZING`, `LOADING`) ensure the UI only rennders when data is confirmed ready.
4.  **Decoupled UI**: The Page component remains "dumb"; it just connects the Controller's state and actions to the UI components.

