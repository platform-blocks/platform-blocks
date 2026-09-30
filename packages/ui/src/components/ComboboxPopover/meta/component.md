---
title: ComboboxPopover
description: Searchable option list anchored to any trigger.
source: "@plocks/ui"
status: "beta"
category: input
accessibility: "The target announces a listbox popup and expanded state. Options use listbox roles, keyboard navigation, and selected state."
related:
  - "Select"
  - "Popover"
props:
  - name: "data"
    type: "ComboboxPopoverData"
    description: "Strings, option objects, or labelled groups."
  - name: "searchable"
    type: boolean
    description: "Adds a filter input."
    default: false
  - name: "multiple"
    type: boolean
    description: "Allows several selected options."
    default: false
examples:
  - basic
---

Use a ref-forwarding child inside Target. On phones the list opens in a centered dialog.
