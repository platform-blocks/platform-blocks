---
name: Form
title: Form
category: input
tags: [form, fields, validation, submit]
playground: true
source: "@platform-blocks/ui"
status: "stable"
related:
  - "Input"
  - "Select"
  - "Checkbox"
props:
  children: Form fields and controls (typically Form.Field / Form.Submit)
  initialValues: Initial field values keyed by field name
  validationSchema: Declarative validation rules per field
  onSubmit: Called with the collected values when the form is submitted
  validate: Custom validation function returning a map of field errors
  disabled: Disable all fields at once
  validateOnChange: Run validation as values change
  validateOnBlur: Run validation when a field is blurred
---

Form manages values, validation, and submission state for a group of inputs. Give each `Form.Field` a `name`; the `Form.Input`, `Form.Label` and `Form.Error` inside it bind to that field (value, change and blur handlers, error, disabled/required state), and `Form.Submit` validates and submits.

`Form.Field` also accepts `validation` rules (optionally gated by `validateWhen`), `dependsOn` rules to show/hide/enable/require it from other values, and `label` / `description` / `helperText` / `error` to render the shared field frame around its children (the same component is exported as `FormField` for form layouts).
