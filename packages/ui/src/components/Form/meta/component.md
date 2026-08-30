---
name: Form
title: Form
category: input
tags: [form, fields, validation, submit]
playground: true
source: "@platform-blocks/react-ui-library"
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

Form manages values, validation, and submission state for a group of inputs. Wrap each control in a `Form.Field` (which injects value and change handlers via context) and submit with `Form.Submit`.
