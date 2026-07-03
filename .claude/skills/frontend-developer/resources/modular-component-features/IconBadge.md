---
title: IconBadge
description: Component features and generic usage instructions.
tags: component, iconbadge
---

# IconBadge

## Description

An extended notification icon wrapper that takes an icon and overlays a small count or notification dot indicator.

## Features

- **icon (ReactNode)**: The base icon (like a bell, cart, or mail).
- **count (number)**: The notification number to display. If above max, it displays `max+`.
- **max (number)**: The ceiling display number. Default: `99`.
- **dot (boolean)**: If true, renders a small dot instead of a numerical count to indicate unread status.
- **type (string)**: Color for the badge background (`"error"`, `"primary"`, custom hex).
- **elevation (number)**: Shadow level on the wrapper module. Default: `0`.
