---
name: MonthPickerInput
playground: true
category: dates
status: stable
since: 0.1.0
inherits: Shared field props (label, description, error, helperText, required, disabled, readOnly, size, radius, variant, labelProps, descriptionProps, placeholder, placeholderTextColor, clearable, startSection, endSection, startSectionProps, endSectionProps)
props:
  dropdownType: "'modal' (default) — a centered sheet; 'popover' — anchored to the field on desktop web"
  modalTitle: Title of the picker sheet / name of the popover
---

Form-friendly wrapper around `MonthPicker` that renders a field whose trigger is a button (aria-haspopup=dialog, named by the label, value announced) and opens the picker in a sheet. Mirrors the `DatePickerInput` API for consistency while focusing on month-level selection workflows.
