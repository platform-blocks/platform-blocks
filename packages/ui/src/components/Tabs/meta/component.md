---
title: Tabs
description: A tab navigation component for organizing content into switchable sections with support for multiple variants and orientations.
source: "@platform-blocks/ui"
status: "stable"
category: navigation
playground: true
accessibility: "WAI-ARIA tabs pattern: tablist/tab/tabpanel roles, aria-selected and aria-controls/aria-labelledby wiring, one tab stop with Arrow (RTL-aware), Home and End keys"
variants:
  - name: "basic"
    description: "Standard tab navigation with simple content switching"
  - name: "location"
    description: "Tabs that persist state through navigation/routing"
  - name: "variants"
    description: "Different visual styles: line, chip, and folder variants"
  - name: "interactive"
    description: "Tabs with interactive content and complex state management"
  - name: "orientation"
    description: "Vertical and horizontal tab orientations"
  - name: "animated"
    description: "Smooth transitions and animations between tab content"
dependencies:
  - "@platform-blocks/core"
related:
  - "Navigation"
  - "Menu"
  - "Stepper"
props:
  - name: "items"
    type: "Array<{key: string, label: string, content: React.ReactNode, disabled?: boolean}>"
    description: "Array of tab items with keys, labels, and content"
  - name: "variant"
    type: "'line' | 'chip' | 'folder'"
    description: "Visual style variant of the tabs"
  - name: "orientation"
    type: "'horizontal' | 'vertical'"
    description: "Layout orientation of the tabs"
  - name: "defaultValue"
    type: "string"
    description: "Initially active tab key when uncontrolled"
  - name: "value"
    type: "string"
    description: "Controlled active tab key (replaces the deprecated `activeTab`)"
  - name: "onChange"
    type: "(key: string) => void"
    description: "Callback when the active tab changes (replaces the deprecated `onTabChange`)"
  - name: "activationMode"
    type: "'automatic' | 'manual'"
    description: "Whether arrow keys select the focused tab immediately or only move focus (Enter/Space selects)"
  - name: "animated"
    type: "boolean"
    description: "Whether to animate content transitions"
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    description: "Size of the tab buttons"
  - name: "textStyle"
    type: "StyleProp<TextStyle>"
    description: "Raw text style applied to all tab labels (escape hatch)."
  - name: "labelProps"
    type: "Omit<TextProps, 'children'>"
    description: "Rich Text-prop overrides applied to all tab labels (ff, weight, tracking, uppercase, size, color, style)."
---

Tabs organize content into multiple sections that users can navigate between. The component supports various visual styles, orientations, and interactive behaviors while maintaining accessibility standards.
