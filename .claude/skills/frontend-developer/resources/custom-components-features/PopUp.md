---
title: PopUp
description: Component features and generic usage instructions.
tags: component, popup
---

# PopUp

## Description

A toast-like or notification-driven iteration of the generic Alert component. Designed to temporarily float over all interface elements, sporting edge animations and a self-destructing timeout interval.

## Features

- **isOpen (boolean)**: The visibility orchestrator toggling CSS animations inward and outward securely.
- **onClose (function)**: Manual function to dispatch when dismissing the notification.
- **text (string)**: Notification content body.
- **type (string)**: Semantic severity model identical to Alerts (`"info"`, `"warning"`, `"error"`, `"success"`).
- **orientation (string)**: Screen pinning variants and animation starting corners (`"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`). Default: `"bottom-left"`.
- **duration (number)**: Auto-dismissal time logic bound to `ms` (e.g., `5000` to close after 5 seconds). Not defined means it requires manual closure.
- **elevation (number)**: Box-shadow variant for floating state logic. Default: `16`.
