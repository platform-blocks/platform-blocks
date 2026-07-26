---
name: NumberInput
title: NumberInput
category: input
order: 22
tags: [input, numeric, stepper, formatter]
playground: true
---

The `NumberInput` component is a numeric text input field that provides built-in step controls for incrementing and decrementing the value. It supports custom formatting and parsing functions, allowing you to display numbers in various formats (e.g., currency, percentages) while maintaining a numeric value internally.

- Enable `withSideButtons` to render dedicated minus/plus buttons that respect modifier keys (e.g., shift for larger increments via `shiftMultiplier`).
- Enable `withDragGesture` to scrub the value by pressing and dragging across the field. The gesture only takes over once the pointer travels past a short activation distance along `dragAxis`, so a plain press still places the caret and a double-click still selects the value for retyping. While a scrub is in flight the field suppresses the browser's own text selection, so the value is never highlighted mid-drag.