---
title: Modal
description: Component features and generic usage instructions.
tags: component, modal
---

# Modal

## Description

A comprehensive dialog window overlay. When toggled, it renders above all application content, preventing body scrolling, handling ESC-to-close behavior, and supporting clicking on an outer backdrop to close itself.

## Features

- **isOpen (boolean)**: Renders the modal on screen if `true`.
- **onClose (function)**: The trigger handler that fires when trying to close (either by click, overlay or ESC).
- **title (string)**: Automatically constructs an internal header if provided.
- **children (ReactNode)**: Main HTML/React content pushed into the scrolling body.
- **footer (ReactNode)**: Fixed nodes appended to the bottom section (like `Confirm`/`Cancel` buttons).
- **size (string)**: Bounds the max-width relative to the viewport (`"sm"`, `"md"`, `"lg"`, `"xl"`). Default: `"md"`.
- **type (string)**: Color variant for headers, accent lines or custom highlights (e.g. `"primary"`).
- **elevation (number)**: Generates the drop shadow around the modal card. Default: `24`.
- **closeOnOverlayClick (boolean)**: Optional control to allow/disallow closing the modal when clicking outside. Default: `true`.
