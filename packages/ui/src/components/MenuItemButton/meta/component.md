---
title: MenuItemButton
description: A row button used inside menus and command palettes — supports tones, icons, hover/active states, and full label customization.
source: ui/src/components/MenuItemButton
category: navigation
tags: [menu, dropdown, command, item, button]
playground: true
props:
  title: Text label (alternative to children)
  startSection / endSection: Slot content (startIcon / endIcon are deprecated aliases)
  onPress: Activation handler
  disabled: Whether the button is disabled
  active: Whether the item is selected
  danger: Destructive styling
  fullWidth: Stretch to fill the parent container
  size: Component size token
  compact: Compact spacing
  rounded: Fully rounded corners
  color: Semantic color — 'default' | 'primary' | 'error' | 'success' | 'warning' ('danger' is a deprecated alias for 'error')
  hoverColor / activeColor: Colors applied on hover / active
  textColor / hoverTextColor / activeTextColor: Text color overrides
  labelProps: Override props applied to the inner label `<Text>` (style, fw, ff, size, c)
examples:
  - basic
---

A row button used inside menus and command palettes. The inner label `<Text>` accepts the full Text-prop API via `labelProps` (`ff`, `fw`, `lts`, `tt`, `c`, `style`).