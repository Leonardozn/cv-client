---
title: CardSlider
description: Component features and generic usage instructions.
tags: component, cardslider
---

# CardSlider

## Description

A horizontal scrollable container optimized for holding multiple `Card`s. It supports manual control arrows and an auto-scrolling interval mechanism. Distinct from Carousel which handles raw images.

## Features

- **children (ReactNode)**: The card components to slide across.
- **step (number)**: Defines how many pixels to scroll horizontally when an arrow is clicked. Default: `300`.
- **gap (string)**: Defines the spacing between child items (CSS gap). Default: `"16px"`.
- **padding (string)**: Sets the internal padding of the slider. Default: `"1rem"`.
- **bgColor (string)**: Sets a CSS background color for the section behind the cards. Default: `"transparent"`.
- **marginBottom (string)**: Spacing outside the bottom of the slider instance. Default: `"0"`.
- **interval (number)**: When provided (in `ms`), auto-scrolls the cards right infinitely.
- **elevation propagation**: The `elevation` prop provided to `CardSlider` is passed down natively to each inner `children` component instead of wrapping the slider natively in a shadow block.
