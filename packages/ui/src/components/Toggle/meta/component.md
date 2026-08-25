---
title: Toggle
description: "A toggle button group component for selecting between multiple options with support for single and multi-selection modes."
source: "@platform-blocks/ui"
status: "stable"  
category: input
playground: true
accessibility: "Supports keyboard navigation, ARIA attributes, and screen readers with proper toggle state announcements"
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
    type: "string | string[]"
    description: "Selected toggle value(s)"
  - name: "onChange"
    type: "(value: string | string[]) => void"
    description: "Callback when toggle selection changes"
  - name: "type"
    type: "'single' | 'multiple'"
    description: "Selection mode - single or multiple values"
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    description: "Size of the toggle buttons"
  - name: "orientation"
    type: "'horizontal' | 'vertical'"
    description: "Layout orientation of the toggle group"
  - name: "disabled"
    type: "boolean"
    description: "Whether the entire toggle group is disabled"
  - name: "children"
    type: "React.ReactNode"
    description: "ToggleButton components"
---

Toggle provides an intuitive way to select between multiple options. It supports both single and multi-selection modes with various visual styles and orientations for different use cases.
