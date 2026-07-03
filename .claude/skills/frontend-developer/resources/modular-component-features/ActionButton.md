---
title: ActionButton
description: Component features and generic usage instructions.
tags: component, actionbutton
---

# ActionButton

## Description

A circular button component intended specifically for housing a single icon. Features a hover and active animation out-of-the-box.

## Features

- **type (string)**: Supports theme colors (`"primary"`, `"secondary"`, etc.) or base hex colors (`"#ff0000"`). Default: `"primary"`.
- **icon (ReactNode)**: The icon element to render inside the button.
- **elevation (number)**: Controls the MD shadow elevation level (`0` to `24`). Default: `0`.
- **onClick (function)**: Callback fired on button click.
- **Support for native HTML/React button props**: Includes `disabled`, `className`, `aria-label`, etc.
