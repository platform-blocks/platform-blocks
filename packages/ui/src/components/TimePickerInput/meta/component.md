---
name: TimePickerInput
playground: true
category: input
status: beta
since: 0.1.0
props:
  value: Controlled time value (TimePickerValue or null)
  defaultValue: Initial value when uncontrolled
  onChange: Fired when the time changes; emits null when cleared
  format: '12 | 24'
  withSeconds: Render a seconds column
  minuteStep: Increment between selectable minutes
  secondStep: Increment between selectable seconds
  allowInput: Allow typing a time directly into the field
  autoClose: Close the dialog as soon as the last column is picked
  panelWidth: Width of the dialog holding the panel
  label: Label rendered above the field
  description: Helper text shown beneath the label
  placeholder: Placeholder text shown when there is no value
  helperText: Helper text shown beneath the input
  error: Error message
  disabled: Disable the input
  clearable: Show a clear button when a value is selected
  labelProps: Override props applied to the label `<Text>`
  descriptionProps: Override props applied to the description `<Text>`
  placeholderTextColor: Override the placeholder color
  startSectionProps: View props applied to the startSection wrapper
  endSectionProps: View props applied to the endSection wrapper (clock icon by default)
---

Form field for selecting a time. Presents an input showing the formatted value and opens a [TimePicker](/components/TimePicker) panel in a dialog, mirroring the behavior of `DatePickerInput`, `MonthPickerInput` and `YearPickerInput`. Adds the field concerns the inline panel has no notion of — label, validation, clearing, and manual text entry — and supports the full `<Input>` slot-prop API.
