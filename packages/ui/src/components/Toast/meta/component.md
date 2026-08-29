---
title: Toast
category: feedback
tags: [toast, notification, alert, message, feedback]
playground: true
props:
  variant: 'light' | 'filled' | 'outline'
  size: Size token — xs | sm | md | lg | xl | 2xl | 3xl (or a number)
  color: Theme color token or custom string
  severity: Severity helper — info | success | warning | error
  title: Toast title rendered above the body
  children: Body content (or use `message` on `useToast` shortcuts)
  icon: Override the leading icon
  withCloseButton: Show a dismiss button
  position: 'top' | 'bottom' | 'left' | 'right'
  autoHide: Auto-hide duration in ms (0 to disable)
  paused: Suspend the auto-hide countdown, resuming with the time that was left
  persistent: Keep toast visible until manually dismissed
  onExited: Fired once the hide transition has finished playing
  actions: Action buttons rendered next to the body
  titleProps: Override props applied to the title `<Text>` (style, weight, ff, size, color)
  bodyProps: Override props applied to the body `<Text>` (the children content)
examples:
  - basic
  - visual-variants
  - sizes
  - variants
  - interactive
  - stacking
  - positions
  - enhanced
  - text-customization
---

The Toast component provides non-blocking notification messages that appear temporarily to give feedback about an operation or event. Title and body each accept full `<Text>` props via `titleProps` / `bodyProps` — also forwarded by every `useToast()` shortcut.
