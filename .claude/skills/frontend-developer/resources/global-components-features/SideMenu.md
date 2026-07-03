---
title: SideMenu
description: Component features and generic usage instructions.
tags: component, sidemenu
---

# SideMenu

## Description

A global layout primitive acting as the primary vertical navigation drawer. Displays navigation groups, single links, and nested sub-pages while managing its own expanded/collapsed width states.

## Features

- **isOpen (boolean)**: State prop governing if the sidebar is expanded (showing text) or collapsed (showing only icons).
- **toggleSidebar (function)**: The trigger to mutate the `isOpen` state, mapped to the top chevron/hamburger icon.
- **Internal `menuConfig` (array)**: Hardcoded/Dynamic list representing the navigation tree schema containing `{label, link, icon, children}` objects.
- **Nested Groups Navigation**: Supports array nesting `children`. Parent menus automatically turn into accordion buttons sliding out sub-links flawlessly.
- Structurally designed to span `100vh` on the left grid edge mapped inside an `aside` tag rendering React Router's `NavLink` elements.
