---
playground: true
title: DatePicker
description: Inline calendar component for selecting single dates, ranges, and multiple values without an input trigger.
source: "@platform-blocks/react-ui-library"
status: "stable"
category: dates
accessibility: "Supports keyboard navigation, ARIA attributes, screen readers, and date format announcements."
variants:
  - name: "inline"
    description: "Inline calendar selection for single dates"
  - name: "inline-range"
    description: "Inline date range selection"
  - name: "inline-multiple"
    description: "Inline multiple date selection"
dependencies:
  - "@platform-blocks/core"
  - "react-native-date-picker"
related:
  - "DatePickerInput"
  - "Calendar"
  - "TimePicker"
props:
  - name: "value"
    type: "Date | [Date | null, Date | null] | Date[] | null"
    description: "Controlled value for the inline calendar."
  - name: "defaultValue"
    type: "Date | [Date | null, Date | null] | Date[] | null"
    description: "Initial value when used uncontrolled."
  - name: "onChange"
    type: "(value: Date | [Date | null, Date | null] | Date[] | null) => void"
    description: "Callback fired when selection changes."
  - name: "type"
    type: "'single' | 'multiple' | 'range'"
    description: "Selection mode for the calendar."
  - name: "calendarProps"
    type: "Partial<CalendarProps>"
    description: "Additional props forwarded to the underlying calendar."
  - name: "style"
    type: "ViewStyle"
    description: "Style applied to the wrapping view."
  - name: "testID"
    type: "string"
    description: "Identifier used for testing."
  - name: "accessibilityLabel"
    type: "string"
    description: "Accessibility label for the calendar container."
  - name: "accessibilityHint"
    type: "string"
    description: "Accessibility hint describing the calendar interaction."
---

DatePicker renders an inline calendar focused on keyboard-friendly, accessible selection flows. Pair it with `DatePickerInput` when you need an input trigger and modal or popover calendar.
