---
title: Custom text field
category: basics
order: 10
tags: [form, label, error, helper-text]
status: stable
hidden: false
---

A plain `TextInput` wired like a plocks field. `useFieldA11y({ label, description, error, helperText, required, … })` returns `controlProps` for the control, `labelProps` / `descriptionProps` / `errorProps` / `helperProps` for the text around it, and `showError` / `showHelper`: the error replaces the helper text, and only the text that is rendered is referenced. Web gets `aria-labelledby`, `aria-describedby`, `aria-invalid` and `aria-required`; native gets a composed label ("Username, required") and a hint built from the error, description and helper text. `errorProps` makes the error a polite `role="alert"`, but iOS has no live regions, so call `announce()` for a new error when it must be spoken there.
