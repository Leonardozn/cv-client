---
title: Color Combinations to Avoid
type: resource
tags: design, color, accessibility, aesthetics
---

# Color Combinations to Avoid

Certain color pairings are notoriously difficult to read, cause eye strain, or are indistinguishable for users with color blindness. Avoid these combinations in UI elements, text overlay, or charts.

## The "Forbidden" List

Do **NOT** use these pairs for foreground/background or adjacent UI elements requiring distinction:

| Combination         | Why it fails                                                                                                                                    |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Green & Red**     | ❌ **Critical Accessibility Issue**. Indistinguishable for Protanopia/Deuteranopia (Red-Green color blindness). Can look like muddy brown/gray. |
| **Green & Blue**    | ❌ **Vibration**. These colors are too close in luminance and hue, causing a "shimmering" effect that strains the eyes.                         |
| **Blue & Black**    | ❌ **Low Visibility**. Dark blue on black (or vice versa) disappears. Hard to read even for perfect vision.                                     |
| **Yellow & Orange** | ❌ **Low Contrast**. Too similar in saturation and brightness. Elements blend together.                                                         |
| **Yellow & Red**    | ⚠️ **Warning/Alarm Fatigue**. High contrast but associates strongly with "Danger" or "McDonald's". Use sparingly only for critical alerts.      |
| **Yellow & Green**  | ❌ **Color Blindness/Confusion**. Often indistinguishable for Tritanopia (Blue-Yellow color blindness).                                         |
| **Purple & Black**  | ❌ **Low Visibility**. Similar to Blue & Black, purple lacks sufficient luminance against dark backgrounds.                                     |
| **Red & Brown**     | ❌ **Muddy Contrast**. Red text on brown (or vice versa) has very low contrast and looks aesthetically unpleasing.                              |
| **Blue & Purple**   | ❌ **Vibration/Low Contrast**. Adjacent on the color wheel and similar in value. Hard to distinguish boundaries.                                |

## General Guidelines

- **Don't rely on color alone**: Always use icons, labels, or patterns in addition to color (especially for status indicators like "Success" vs "Error").
- **Check Grayscale**: If your design works in black and white, it likely has good contrast. Evaluating in grayscale quickly exposes bad pairings (e.g., Red and Green often have the same gray value).
