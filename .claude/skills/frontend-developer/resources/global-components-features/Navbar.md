---
title: Navbar
description: Component features and generic usage instructions.
tags: component, navbar
---

# Navbar

## Description

A global application header component typically spanning the top edge of the layout. Responsible for housing the application title, primary global actions, or user profile sections.

## Features

- **isOpen (boolean)**: Optional bind to sync state with the `SideMenu` if the toggle logic needs to be hosted or reflected on the header.
- **toggleSidebar (function)**: Callback mapped to internal toolbar hamburger buttons to drive the side menu expanding/collapsing.
- Structurally designed to sit fixed at the top of the CSS Grid layout mapping to a `header` semantic tag.
