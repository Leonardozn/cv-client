---
title: InputDate
description: Component features and generic usage instructions.
tags: component, inputdate
---

# InputDate

## Description

A styled custom component for capturing Dates from the user. Replaces standard `type="date"` and injects native custom theme properties. Noticeably, it does NOT support the generic modular `elevation` prop to maintain consistent form input alignments.

## Features

- **label (string)**: The textual label assigned to the date.
- **value (string)**: Standard input bind state (e.g. `"YYYY-MM-DD"`).
- **onChange (function)**: Handler fired upon updating the internal input event.
- **type (string)**: Controls the accent layout (`"primary"`, `"secondary"` or hex). Default: `"primary"`.
- **min/max (string)**: HTML limits restricting acceptable date spans.
