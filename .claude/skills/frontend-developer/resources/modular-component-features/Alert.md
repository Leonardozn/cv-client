---
title: Alert
description: Component features and generic usage instructions.
tags: component, alert
---

# Alert

## Description

A block component used to highlight important information to the user. Ships with pre-configured semantic styles and corresponding icons depending on its state.

## Features

- **type (string)**: Accepts semantic states (`"info"`, `"success"`, `"warning"`, `"error"`). Default: `"info"`.
- **text (string|ReactNode)**: The content/message displayed inside the alert.
- **elevation (number)**: Controls the shadow effect. Default: `0`.
