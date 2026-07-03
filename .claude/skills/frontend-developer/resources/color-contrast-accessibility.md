---
title: Color Contrast Accessibility
type: resource
tags: a11y, accessibility, color, contrast
---

# Color Contrast Accessibility (WCAG 2.1 AA)

Accessibility is not a feature; it's a fundamental requirement. Ensuring sufficient contrast between text and its background is critical for readability.

## The Standard: 4.5:1

According to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, the visual presentation of text and images of text must have a contrast ratio of at least:

- **4.5:1** for normal text (body copy, buttons, inputs).
- **3:1** for large text (18pt+ or 14pt+ bold) and graphical objects (icons, charts).

### Why 4.5:1?

This ratio compensates for the loss in contrast sensitivity common in people with visual impairments, including:

- Color blindness (protanopia, deuteranopia, tritanopia).
- Low vision due to aging.
- Temporary situational disabilities (e.g., glare on a screen outdoors).

## How to Verify

Use tools to check your color combinations against the WCAG standard:

1.  **DevTools**: Chrome/Edge DevTools will show the contrast ratio when you inspect an element and hover over its color value.
2.  **Online Checkers**: WebAIM Contrast Checker, Coolors based checker.
3.  **Figma/Design Tools**: Plugins like "Stark" or "Contrast" can audit designs before code.

## Meaningful Examples

### ✅ Pass (Accessible)

- **Dark Text on Light Background**: `#1f2937` (Gray 800) on `#ffffff` (White). Ratio: **16.0:1**.
- **Light Text on Dark Background**: `#ffffff` (White) on `#3b82f6` (Primary Blue). Ratio: **4.6:1** (Barely passes, acceptable for buttons).
- **High Contrast**: `#000000` (Black) on `#ffffff` (White). Ratio: **21:1** (Maximum).

### ❌ Fail (Inaccessible)

- **Low Contrast Gray**: `#9ca3af` (Gray 400) on `#ffffff` (White). Ratio: **2.8:1**. (Too light; hard to read).
- **Vibrant on Vibrant**: `#ef4444` (Red 500) on `#3b82f6` (Blue 500). Ratio: **1.3:1**. (Causes eye strain and is unreadable for colorblind users).
- **Light Primary on White**: `#60a5fa` (Blue 400) on `#ffffff`. Ratio: **3.3:1**. (Fails AA for normal text; only okay for very large headlines).

## Implementation Strategy

When defining your Theme Variables in `index.css`:

1.  Test your **Primary Color** against **White** background (for buttons/headers). If it fails, pick a darker shade (e.g., use Blue 600 instead of Blue 500).
2.  Test your **Text Color** against your **Background Color**.
3.  Ensure hover states (`a:hover`, `button:hover`) also maintain sufficient contrast.
