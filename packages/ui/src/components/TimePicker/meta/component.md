---
name: TimePicker
playground: true
category: dates
status: beta
since: 0.1.0
props:
  value: Controlled time value (TimePickerValue)
  defaultValue: Initial value when uncontrolled
  onChange: Fired on every column selection
  onChangeComplete: Fired when the last meaningful column (minutes, or seconds when `withSeconds`) is picked
  format: '12 | 24'
  withSeconds: Render a seconds column
  minuteStep: Increment between selectable minutes
  secondStep: Increment between selectable seconds
  columnWidth: Width of each scroll column
  columnHeight: Max height of each scroll column
  disabled: Disable selection
---

Inline panel for selecting a time with hour/minute (and optional seconds) precision, rendered directly in the page rather than in a dialog — the time counterpart to `MonthPicker` and `YearPicker`. Supports 12-hour or 24-hour clocks, a meridiem column on 12-hour clocks, and custom step intervals for minutes and seconds. Works in controlled and uncontrolled modes.

For a form field that displays the selected time and opens this panel in a dialog, use [`TimePickerInput`](/components/TimePickerInput).
