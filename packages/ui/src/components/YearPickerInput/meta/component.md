---
name: YearPickerInput
playground: true
category: dates
status: beta
since: 0.1.0
inherits: Shared field props (label, description, error, helperText, required, disabled, readOnly, size, radius, variant, labelProps, descriptionProps, placeholder, placeholderTextColor, clearable, startSection, endSection, startSectionProps, endSectionProps)
props:
  dropdownType: "'modal' (default) — a centered sheet; 'popover' — anchored to the field on desktop web"
  modalTitle: Title of the picker sheet / name of the popover
---

Input component that opens `YearPicker` inside a modal dialog. Ideal for settings where only the year matters (fiscal periods, graduation year, etc.) while keeping the UI aligned with the rest of our picker inputs.
