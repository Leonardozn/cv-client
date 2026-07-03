---
title: Sheet
description: Component features and generic usage instructions.
tags: component, sheet
---

# Sheet

## Description

A blank semantic grouping primitive similar to a 'Card' or Material 'Paper' but stripped of fixed internal hierarchies. It exists strictly to group inputs or sections atop backgrounds seamlessly.

## Features

- **children (ReactNode)**: Free-format nodes encapsulated within the group.
- **elevation (number)**: Essential to its purpose, dictating the Z-level drop-shadow overlay. Default: `1`.
- **padding (string)**: Built-in CSS spacing offset for internal contents. Default: `"1.5rem"`.
- **borderRadius (string)**: Rounded corner modifier. Default: `"8px"`.
- **bgColor (string)**: Defines background explicit coloring dynamically. Default: `"var(--color-bg)"`.
