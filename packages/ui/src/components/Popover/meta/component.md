---
title: Popover
description: Layered surface that displays contextual content next to a trigger without blocking the rest of the UI.
source: "@platform-blocks/react-ui-library"
status: "beta"
category: overlay
playground: true
accessibility: "Supports keyboard navigation, Escape to close, focus return, and optional focus trapping"
variants:
  - name: "basic"
    description: "Default popover with stacked buttons and helper text"
  - name: "placements"
    description: "Popover positioned using every preset placement"
  - name: "controlled"
    description: "Controlled state example with a small invite form"
dependencies:
  - "@platform-blocks/core"
related:
  - "Tooltip"
  - "Menu"
  - "Dialog"
props:
  - name: "opened"
    type: "boolean"
    description: "Controls the open state when provided"
  - name: "defaultOpened"
    type: "boolean"
    description: "Sets the initial open state in uncontrolled mode"
  - name: "position"
    type: "PlacementType"
    description: "Determines where the dropdown appears relative to the target"
  - name: "withArrow"
    type: "boolean"
    description: "Shows a directional arrow next to the dropdown"
  - name: "offset"
    type: "number | { mainAxis?: number; crossAxis?: number }"
    description: "Adjusts the distance between the dropdown and trigger"
  - name: "trapFocus"
    type: "boolean"
    description: "When true, keeps focus inside the dropdown while it is open"
  - name: "closeOnClickOutside"
    type: "boolean"
    description: "Closes the dropdown when interactions happen outside of it"
---

Popover sits on the same overlay primitives as Menu and Tooltip, making it suitable for interactive content like forms, lists, and quick action menus while keeping focus management predictable.
