---
title: HoverCard
description: Floating preview card shown while the pointer rests on (or keyboard focus is on) a target, for supplementary details like profile or link previews.
source: "@platform-blocks/ui"
status: "beta"
category: overlay
playground: true
accessibility: "The target itself carries the handlers (no extra tab stop) plus aria-expanded / aria-controls. Hover cards also open on keyboard focus, stay open while hovered, and close on Escape; `trigger=\"click\"` moves focus into the card and returns it on close."
variants:
  - name: "basic"
    description: "Hover (or focus) preview card with an arrow"
  - name: "click"
    description: "Press-to-toggle card with interactive content"
dependencies:
  - "@platform-blocks/core"
related:
  - "Popover"
  - "Tooltip"
props:
  - name: "target"
    type: "ReactElement"
    description: "Element that shows the card"
  - name: "children"
    type: "ReactNode"
    description: "Card content"
  - name: "trigger"
    type: "'hover' | 'click'"
    description: "Hover (and focus) or press to open"
    default: "hover"
  - name: "position"
    type: "'top' | 'bottom' | 'left' | 'right' | 'auto'"
    description: "Placement relative to the target (mirrored in RTL)"
    default: "bottom"
  - name: "openDelay / closeDelay"
    type: "number"
    description: "Delays in ms before opening / closing"
  - name: "opened / defaultOpened"
    type: "boolean"
    description: "Controlled / initial open state"
  - name: "onOpen / onClose"
    type: "() => void"
    description: "Open-state callbacks"
  - name: "withArrow"
    type: "boolean"
    description: "Show an arrow pointing at the target"
  - name: "w"
    type: "number"
    description: "Fixed card width"
  - name: "shadow / radius"
    type: "'none' | 'sm' | 'md' | 'lg' / RadiusValue"
    description: "Card elevation and corner radius"
  - name: "closeOnEscape"
    type: "boolean"
    description: "Close on Escape (web) and Android back"
    default: "true"
  - name: "disabled"
    type: "boolean"
    description: "Never open"
---

`HoverCard` shows supplementary content next to a target — a user or link preview — without a click. It is positioned with the shared overlay primitive (flips and shifts to stay on screen, follows scroll), sits on the elevation ladder's level 2 surface, and is dismissible with Escape.
