---
title: TreeSelect
description: Form field for choosing values from a nested tree.
source: "@plocks/ui"
status: "beta"
category: input
accessibility: "The trigger announces a tree popup; the popup uses Tree's keyboard navigation and selection semantics."
related:
  - "Tree"
  - "Select"
props:
  - name: "data"
    type: "TreeNode[]"
    description: "Nested options keyed by id."
  - name: "mode"
    type: "'single' | 'multiple' | 'checkbox'"
    description: "Selection behavior."
    default: "single"
  - name: "searchable"
    type: boolean
    description: "Filters nodes by label."
    default: false
examples:
  - basic
---

Branches open within the dropdown; in single and multiple mode, leaves are selectable.
