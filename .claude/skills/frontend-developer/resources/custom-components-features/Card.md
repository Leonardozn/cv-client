---
title: Card
description: Component features and generic usage instructions.
tags: component, card
---

# Card

## Description

A complex layout component useful to structure an entity's data like products, articles, or users. Composes images, modular `Badge`s (for tags), text, modular `Button`s (for actions/footers).

## Features

- **title (string)**: The primary headline of the card.
- **description (string)**: The subtext or body copy.
- **imageUrl (string)**: Optional URL for an image cover.
- **imageAlt (string)**: Alt text for the image cover.
- **layout (string)**: Variations of structure (`"top"`, `"left"`, `"right"`, `"background"`). Default: `"top"`.
- **badges (array)**: Objects passing config to internal `Badge`s and their positions (`text`, `color`, `icon`, `position`).
- **actions (array)**: Action config (typically heart/share) rendering hover `ActionButton`s inside the image overlay (`icon`, `onClick`).
- **footer (ReactNode)**: Injects nodes (like `Button`s) into the bottom action bar of the card.
- **overlayStrength (string)**: When layout is `"background"`, controls darkness of the tint filter (`"heavy"` vs standard).
- **elevation (number)**: Adjusts the drop shadow on the wrapper. Default: `0`.
- **onClick (function)**: Gives the whole card an interactive click behavior.
