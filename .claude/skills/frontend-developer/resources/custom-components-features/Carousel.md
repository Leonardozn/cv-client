---
title: Carousel
description: Component features and generic usage instructions.
tags: component, carousel
---

# Carousel

## Description

A media slider designed for showcasing images sequentially. It can show full-screen items or "peek" adjacent items.

## Features

- **images (array)**: An array of image URL strings to display.
- **layout (string)**: Controls rendering style. `"peek"` shows partial images on sides; `"full"` spans 100% width. Default: `"peek"`.
- **interval (number)**: Sets an auto-sliding time in `ms` between images.
- **marginBottom (string)**: Optional bottom margin for spacing. Default: `"0"`.
- **elevation (number)**: Drop shadow shadow for the carousel wrapper layout. Default: `0`.
