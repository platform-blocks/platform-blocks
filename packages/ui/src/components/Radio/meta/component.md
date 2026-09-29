---
name: Radio
description: A radio button component for single-choice selection from a group of options
category: input
subcategory: Form Controls
tags: [input, form, selection, choice]
status: stable
playground: true
since: 1.0.0
platform:
  web: true
  ios: true
  android: true
accessibility:
  - RadioGroup is a labelled role="radiogroup"; each option is role="radio" with aria-checked
  - One tab stop per group (the selected option, or the first while none is selected)
  - Arrow keys move focus and selection together, following the reading direction; Home/End jump to the ends; Space selects
  - Group label, description, helperText and error are linked through the shared Field frame
related:
  - Checkbox
  - Switch
  - Select
examples:
  basic: Basic radio button usage
  variants: Different visual variants
  orientations: Horizontal and vertical layouts
  forms: Integration with form controls
---

Radio buttons allow users to select a single option from a group of mutually exclusive choices.

`RadioGroup` works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
