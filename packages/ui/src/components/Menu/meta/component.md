---
playground: true
title: Menu
description: A dropdown menu component for navigation and actions
source: ui/src/components/Menu
status: stable
category: navigation
accessibility: "Menu button pattern: the trigger carries aria-haspopup / aria-expanded / aria-controls, the dropdown is role=menu with role=menuitem items. Focus moves to the first item on open; Arrow keys, Home/End and typeahead move between items (disabled items are skipped), Enter/Space activate, Escape closes and returns focus to the trigger, Tab closes. Submenus open with ArrowRight and close with ArrowLeft (mirrored in RTL)."
props:
  - name: children
    type: ReactNode
    description: The trigger element followed by a Menu.Dropdown with Menu.Item / Menu.Label / Menu.Divider / Menu.Sub
  - name: trigger
    type: "'click' | 'hover' | 'contextmenu'"
    description: What opens the menu. `contextmenu` opens at the pointer (right-click, long-press, Shift+F10)
    default: click
  - name: position
    type: PlacementType
    description: Menu position relative to the trigger (mirrored in RTL)
    default: auto
  - name: offset
    type: number
    description: Distance between trigger and menu
    default: 4
  - name: opened
    type: boolean
    description: Controlled open state
  - name: defaultOpened
    type: boolean
    description: Initial open state when uncontrolled
    default: false
  - name: onOpen / onClose / onChange
    type: function
    description: Open-state callbacks
  - name: w
    type: "number | 'target' | 'auto'"
    description: Menu width
    default: auto
  - name: maxH
    type: number
    description: Maximum height before the items scroll
    default: 300
  - name: closeOnClickOutside
    type: boolean
    description: Close when pressing outside the menu
    default: true
  - name: closeOnEscape
    type: boolean
    description: Close on Escape (web) and Android back
    default: true
  - name: disabled
    type: boolean
    description: Whether the menu is disabled
    default: false
examples:
  - choiceItems
  - basic
  - submenu
  - context
  - positioning
---

The Menu component provides a dropdown interface for navigation links, actions, and contextual options.
