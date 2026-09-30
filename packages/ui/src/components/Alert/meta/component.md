---
name: Alert
title: Alert
category: feedback
tags: [alert, notice, notification, message, status, feedback, callout]
playground: true
props:
  variant: 'light' | 'filled' | 'outline' | 'subtle'
  color: Theme color token or custom string
  severity: Severity helper — info | success | warning | error (sets color and default icon)
  title: Title rendered above the body
  children: Body content
  icon: Override the leading icon (or set to null/false to hide)
  withCloseButton: Show a dismiss button
  closeButtonLabel: Accessible name of the dismiss button (default "Close")
  onClose: Callback for the dismiss button
  fullWidth: Stretch the alert to fill its container
  titleProps: Override props applied to the title `<Text>` (style, fw, ff, size, c)
  bodyProps: Override props applied to the body `<Text>` (the children content)
examples:
  - basic
  - variants
  - interactive
---

Alert displays prominent messages with severity styles and optional actions.
