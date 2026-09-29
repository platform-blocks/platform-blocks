---
name: NumberInput
title: NumberInput
category: input
order: 22
tags: [input, numeric, stepper, formatter]
playground: true
---

The `NumberInput` component is a numeric text input field that provides built-in step controls for incrementing and decrementing the value. It supports custom formatting and parsing functions, allowing you to display numbers in various formats (e.g., currency, percentages) while maintaining a numeric value internally.

Pass `value` + `onChange` for a controlled field (passing `value={undefined}` means "controlled and empty"), or `defaultValue` for an uncontrolled one. ArrowUp / ArrowDown step the value (Shift multiplies by `shiftMultiplier`); on web the field is announced as a spin button with its min, max and current value. `ref` points at the underlying `TextInput`.
