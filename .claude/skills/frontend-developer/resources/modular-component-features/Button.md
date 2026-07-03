---
title: Button
description: Component features and generic usage instructions.
tags: component, button
---

# Button

## Description

A standard, highly customizable call-to-action component containing text and optional icons.

## Features

- **text (string)**: The label of the button.
- **type (string)**: Built-in color preset (e.g., `"primary"`, `"secondary"`) or custom hex color.
- **outline (boolean)**: Allows the button to have a transparent background with colored text and borders.
- **icon (ReactNode)**: A React Icon component to be placed alongside text.
- **iconPosition (string)**: `"start"` (left of text) or `"end"` (right of text).
- **elevation (number)**: Drop shadow value. Default: `0`.
- **Standard props**: Passes through typical button attributes like `disabled`, `onClick`, `className`.
