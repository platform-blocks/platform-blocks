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
  onClose: Callback for the dismiss button
  fullWidth: Stretch the alert to fill its container
  titleProps: Override props applied to the title `<Text>` (style, weight, ff, size, color)
  bodyProps: Override props applied to the body `<Text>` (the children content)
examples:
  - basic
  - variants
  - interactive
---
The Alert component displays important messages to users with different severity levels, variants, and optional actions like dismissal. Title and body each accept full `<Text>` props via `titleProps` / `bodyProps`.
