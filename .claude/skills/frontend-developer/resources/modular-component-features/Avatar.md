---
title: Avatar
description: Component features and generic usage instructions.
tags: component, avatar
---

# Avatar

## Description

A circular component used to represent a user profile or entity. It can display an image, or fall back to displaying the initials/text centered with a background color.

## Features

- **imageUrl (string)**: Optional. URL of the image to show.
- **text (string)**: Text to display if there's no image. Usually a user's name or initials.
- **size (string)**: Size variants (e.g., `"sm"`, `"md"`, `"lg"`). Default: `"md"`.
- **type (string)**: A fallback accent color name (`"primary"`, `"neutral"`, etc.) or Hex code if `imageUrl` is not provided.
- **elevation (number)**: Drop shadow level (`0` to `24`). Default: `0`.
