---
title: Toggle
description: "A toggle button group component for selecting between multiple options with support for single and multi-selection modes."
source: "@platform-blocks/ui"
status: "stable"  
category: input
playground: true
accessibility: "One tab stop; arrow keys (RTL-aware) move focus, Home/End jump, Space/Enter toggle. Standalone and multi-select toggles expose aria-pressed; exclusive groups are radio groups with aria-checked."
variants:
  - name: "basic"
    description: "Simple toggle group with three options"
  - name: "sizes"
    description: "Different size variants (small, medium, large)"
  - name: "orientation"
    description: "Horizontal and vertical layout orientations"
  - name: "multiple"
    description: "Multi-selection mode allowing multiple active toggles"
  - name: "exclusive"
    description: "Exclusive selection mode (radio-like behavior)"
  - name: "standalone"
    description: "Individual toggle buttons outside of a group"
dependencies:
  - "@platform-blocks/core"
related:
  - "Radio"
  - "Checkbox"
  - "Button"
  - "Tabs"
props:
  - name: "value"
    type: "string | number | (string | number)[]"
    description: "Selected toggle value(s) (controlled)"
  - name: "defaultValue"
    type: "string | number | (string | number)[]"
    description: "Initial value(s) for uncontrolled use"
  - name: "onChange"
    type: "(value) => void"
    description: "Called with the pressed value (or [] when deselected) in exclusive mode, else the array of selected values"
  - name: "exclusive"
    type: "boolean"
    description: "Single selection — a radio group (role radiogroup, items role radio + aria-checked). Otherwise items are toggle buttons (aria-pressed)"
  - name: "size"
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'"
    description: "Size of the toggle buttons (control-size table: same height as Button)"
  - name: "orientation"
    type: "'horizontal' | 'vertical'"
    description: "Layout orientation — also which arrow keys move focus"
  - name: "disabled"
    type: "boolean"
    description: "Whether the entire toggle group is disabled"
  - name: "accessibilityLabel"
    type: "string"
    description: "Accessible name of the group"
  - name: "children"
    type: "React.ReactNode"
    description: "ToggleButton components"
---

Toggle provides an intuitive way to select between multiple options. It supports both single and multi-selection modes with various visual styles and orientations for different use cases.
