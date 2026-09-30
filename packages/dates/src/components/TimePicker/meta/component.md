---
name: TimePicker
playground: true
category: dates
status: beta
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
  accessibilityLabel: Accessible name of the column group (default "Time")
---

TimePicker provides an inline panel for choosing hours, minutes, and optional seconds.
