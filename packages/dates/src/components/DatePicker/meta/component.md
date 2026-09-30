---
playground: true
title: DatePicker
description: Inline calendar component for selecting single dates, ranges, and multiple values without an input trigger.
source: "@plocks/ui"
status: "stable"
category: dates
accessibility: "Days form a labelled grid on web (one tab stop; arrow keys, Home/End and PageUp/PageDown move focus, crossing months; Space/Enter select). Each day is named by its full localized date and exposes selected, today (aria-current=date) and disabled state. accessibilityLabel names the surrounding group without merging the days into one element."
variants:
  - name: "inline"
    description: "Inline calendar selection for single dates"
  - name: "inline-range"
    description: "Inline date range selection"
  - name: "inline-multiple"
    description: "Inline multiple date selection"
dependencies:
  - "@plocks/core"
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
    description: "Accessible name of the group wrapping the calendar (days stay individually reachable)."
  - name: "accessibilityHint"
    type: "string"
    description: "Accessibility hint describing the calendar interaction."
---

DatePicker renders an inline calendar focused on keyboard-friendly, accessible selection flows.