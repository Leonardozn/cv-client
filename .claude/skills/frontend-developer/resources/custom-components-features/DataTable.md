---
title: DataTable
description: Component features and generic usage instructions.
tags: component, table
---

# DataTable

## Description

A highly intricate data-table component comprising search, configurable pagination controls, alternative row palettes, and data-grid mapping.

## Features

- **header (string)**: The headline describing the table content.
- **columns (array)**: Mapped configs describing column IDs, labels, width limits, and bolding flags natively.
- **data (array)**: Primitive properties mapped to column IDs or rich cell config JSONs modeling text coloring and nested `ActionButton` events.
- **alternate (boolean)**: Displays zebra striping (alternating backgrounds on table grid rows). Default `false`.
- **type (string)**: Generates a branded head-piece color and adjusts alternate striping to closely match the variant's hex map.
- **search (boolean)**: Mounts an internal generic search `Input` over the header box. Note: Handled by external search arrays filtering the `data`.
- **searchValue (string)** / **onSearchChange (function)**: Sync handlers linked to the `search` primitive.
- **pagination (object)**: Complex config object managing pagination boundaries `{ currentPage, totalPages, position, type, onClick, rowsOptions, rowsPerPage, onRowsChange }`.
- **elevation (number)**: Controls drop shadow over the global `DataTable` primitive container. Default: `0`.
- **searchElevation (number)**: Applies a drop shadow exclusively to the embedded search input field.
- **rowsElevation (number)**: Applies a drop shadow exclusively to the inner `Select` governing row limits.
- **paginationElevation (number)**: Applies a shadow to the central `ButtonGroup` managing pagination iteration.

## Data Cell Mapping & Resolvers

The `DataTable` component supports advanced column configuration to mutate UI natively without reinventing conditionals:

- **`renderCell: (val, row) => JSX`**: Define an arbitrary arrow function mapped per-column to replace the table grid cell rendering. Useful for formatting (e.g. `formatCurrency` methods) or advanced components wrapper inside cells.
- **Smart Resolvers**: For standard CRUD implementations, always use the generic `fetchAndResolveTableData` (from `map-methods.jsx`) to pre-process data. Internally, it relies on `resolveTableDataOptions` to automatically convert boolean `true`/`false` values into `<FiCheck>`/`<FiX>` UI components and populate raw ID references into human-readable labels from `select` configurations magically.
