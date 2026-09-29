---
name: ContextMenu
playground: true
title: ContextMenu
category: overlay
tags: [menu, context, rightclick, longpress, actions]
accessibility: "Opens on right-click (web), long-press (native), Shift+F10 or the ContextMenu key (web keyboard), and the screen-reader long-press / \"Open menu\" actions. The menu is role=menu with role=menuitem items, focus moves to the first item, Arrow keys / Home / End / typeahead move between items, Escape closes and restores focus."
props:
  - name: items
    type: "ContextMenuItem[]"
    description: "Entries: { id, label, icon?, disabled?, danger?, onSelect? }"
  - name: children
    type: "(triggerProps) => ReactNode"
    description: "Render prop for the trigger; spread `triggerProps` onto it"
  - name: opened / defaultOpened
    type: boolean
    description: "Controlled / initial open state (`open` is a deprecated alias of `opened`)"
  - name: position
    type: "{ x: number; y: number }"
    description: "Controlled position"
  - name: closeOnSelect
    type: boolean
    description: "Close after an item is chosen"
    default: true
  - name: longPressDelay
    type: number
    description: "Native long-press duration in ms"
    default: 350
  - name: mah
    type: number
    description: "Menu max height before the items scroll (not the root's)"
    default: 280
---
The ContextMenu component provides a context-sensitive menu that appears on right-click (web) or long-press (mobile) with customizable actions. It shares Menu's surface and keyboard behaviour, stays inside the viewport, and closes on Escape, Android back or a press outside.
