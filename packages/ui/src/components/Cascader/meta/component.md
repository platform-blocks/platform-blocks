---
title: Cascader
description: Selects a path through hierarchical options in cascading columns.
source: "@plocks/ui"
status: "beta"
category: input
accessibility: "The trigger is a combobox. Each column is a listbox with selected and disabled states; keyboard arrows navigate levels and rows. Phone sheets use flat paths."
related:
  - "TreeSelect"
  - "Select"
props:
  - name: "data"
    type: "CascaderOption[]"
    description: "Nested options with unique values."
  - name: "withColumns"
    type: boolean
    description: "Shows cascading columns or flat paths."
    default: true
  - name: "searchable"
    type: boolean
    description: "Searches across full paths."
    default: false
  - name: "safeAreaPolygon"
    type: "boolean | { buffer?: number }"
    description: "Protects diagonal pointer travel into an open child column; buffer is in pixels."
    default: true
examples:
  - basic
---

Only leaves are selected by default. Set `changeOnSelect` to allow intermediate levels.
