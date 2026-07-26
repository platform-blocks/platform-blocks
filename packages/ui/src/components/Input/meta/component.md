---
displayName: Input
description: A versatile text input component with support for different types, states, and validation.
category: input
status: stable
since: 1.0.0
tags: [input, form, text, validation]
playground: true
props:
  value: The current value of the input
  onChangeText: Callback fired when the input value changes
  placeholder: Placeholder text displayed when input is empty
  label: Label text displayed above the input
  error: Error message displayed below the input
  disabled: Whether the input is disabled
  required: Whether the input is required
  type: Input type (text, password, email, number, etc.)
  variant: Visual variant of the input shell — 'default' | 'filled' | 'outline' | 'unstyled'
  size: Size token controlling height, font, label, and toggle icon scaling
  autoFocus: Whether to auto-focus the input on mount
  maxLength: Maximum number of characters allowed
  multiline: Whether the input supports multiple lines
  numberOfLines: Number of lines for multiline inputs
  autoComplete: Auto-complete behavior
  labelProps: Override props applied to the label `<Text>` (style, weight, ff, etc.)
  descriptionProps: Override props applied to the description `<Text>`
  disclaimer: Helper text rendered below the field
  disclaimerProps: Override props for the disclaimer `<Text>`
  placeholderTextColor: Color of the placeholder text (overrides theme.text.muted)
  startSection: Content rendered before the input
  startSectionProps: View props applied to the startSection wrapper (style, accessibility, etc.)
  endSection: Content rendered after the input
  endSectionProps: View props applied to the endSection wrapper
related:
  - PasswordInput
  - AutoComplete
  - Form
examples:
  - Basic text input with label and placeholder
  - Visual variants (default, filled, outline, unstyled)
  - Different input types (email, password, number, tel)
  - Validation, required, and disabled states
  - Multiline text input
  - Sections and slot styling (startSection, endSection, clearable)
---

A versatile text input component that provides a consistent interface for text entry across different platforms. The Input component supports various types, validation states, and accessibility features.
