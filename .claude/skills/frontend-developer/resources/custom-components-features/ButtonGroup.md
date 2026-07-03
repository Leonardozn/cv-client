---
title: ButtonGroup
description: Component features and generic usage instructions.
tags: component, buttongroup
---

# ButtonGroup

## Description

A custom component that groups multiple buttons visually and handles the active state between them, similar to a radio group or pagination UI. It composes the modular `Button` component internally.

## Features

- **buttons (array)**: An array of strings representing the text for each grouped button.
- **elevation (number)**: Controls the MD shadow elevation level for the entire group. Default: `0`.
- **active button logic**: Internally, it manages a clicked state and sets the active button's outline to `false` indicating it's selected, while unselected ones use `outline=true`.
