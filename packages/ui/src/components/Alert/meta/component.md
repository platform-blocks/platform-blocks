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
The Alert component displays important messages to users with different severity levels, variants, and optional actions like dismissal. Title and body each accept full `<Text>` props via `titleProps` / `bodyProps`.

## Accessibility

- `severity="error"` / `"warning"` (or, without a severity, `color="error"` / `"warning"`) render `role="alert"`: urgent, announced when the alert appears. On native, where live regions are unreliable, urgent alerts are announced on mount. Every other alert is a polite `role="status"`. The `variant` never changes urgency.
- The dismiss button is a `button` named "Close" (override with `closeButtonLabel`) with a 24px (web) / 44pt (native) touch target.
