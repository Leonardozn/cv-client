---
title: Input
description: Component features and generic usage instructions.
tags: component, input
---

# Input

## Description

A highly versatile input field that handles standard text entries, passwords, floating labels, textareas, files, and displays error messages consistently.

## Features

- **label (string)**: The label text attached to the input field.
- **placeholder (string)**: The standard HTML placeholder.
- **type (string)**: In the context of colors context (`"primary"`, `"secondary"`, or a custom hex) it dictates the active/focus border and label colors. (Not HTML `<input type>`).
- **htmlType (string)**: Supports passing `"password"`, `"email"`, `"text"`, etc. Default: `"text"`.
- **floatingLabel (boolean)**: Triggers an alternative UI design where the placeholder acts as a label and shrinks/floats when focused or populated.
- **error (boolean)**: Transitions the entire input field to an error/red state.
- **errorMessage (string)**: Informational text displayed beneath the field when `error` is `true`.
- **textarea (boolean)**: Renders a multi-line `<textarea>` component instead of standard `<input>`.
- **file (boolean)**: Modifies the layout slightly for input type="file". (Currently, setting `file=true` renders `<input type="file">`).
- **elevation (number)**: Drop shadow shadow for the input layout. Default: `0`.
- Native input props like `onChange`, `value`, `disabled`, `required` are forwarded to the input primitive element.
