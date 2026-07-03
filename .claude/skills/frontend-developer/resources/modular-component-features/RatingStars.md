---
title: RatingStars
description: Component features and generic usage instructions.
tags: component, ratingstars
---

# RatingStars

## Description

A 5-star rating presentation component. Can be used in both "read-only" presentation mode or interactive input mode depending on whether `onChange` is passed.

## Features

- **value (number)**: The score or rating (`0` to `5`, supports half stars visually). Default: `0`.
- **onChange (function)**: Automatically turns the component into interactive mode allowing users to click and set the value.
- **size (string)**: Controls the size of the stars. E.g., `"1.5rem"`, `"24px"`.
- **elevation (number)**: Adjusts the drop shadow on the wrapper. Default: `0`.
- **Style Overrides**: Can accept a `style` property setting `--color-warning` (or similar) to force custom colored stars across the group overriding the base CSS theme.
