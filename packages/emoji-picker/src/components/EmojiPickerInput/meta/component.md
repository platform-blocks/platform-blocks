---
title: EmojiPickerInput
description: Form field that opens the searchable emoji picker.
source: "@plocks/emoji-picker"
status: beta
category: input
tags: [emoji, input, picker, form]
related:
  - EmojiPicker
  - Input
props:
  - name: value / defaultValue
    type: string | null
    description: Selected Unicode emoji.
  - name: onChange
    type: "(emoji: string | null, selection: EmojiPickerSelection | null) => void"
    description: Called when an emoji is selected or cleared.
  - name: onSelect
    type: "(selection: EmojiPickerSelection) => void"
    description: Called when an emoji is selected.
  - name: pickerProps
    type: "Omit<EmojiPickerProps, 'onSelect'>"
    description: Props forwarded to the picker.
  - name: closeOnSelect
    type: boolean
    default: true
    description: Close the panel after selection.
  - name: dropdownType
    type: "'popover' | 'modal'"
    default: popover
    description: Desktop presentation; small screens use a sheet.
---

EmojiPickerInput opens an emoji picker from a form field and stores the selected Unicode emoji.
