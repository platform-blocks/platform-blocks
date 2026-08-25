---
title: Dialog
description: Accessible modal dialog / sheet for interruptive content, confirmations, and forms.
source: ui/src/components/Dialog
status: experimental
category: overlay
tags: [modal, dialog, overlay, sheet]
playground: true
props:
  visible: Whether the dialog is shown
  variant: 'modal' | 'bottomsheet' | 'fullscreen'
  title: Optional title rendered in the header
  closable: Show the close button + handle escape/back gestures
  backdrop: Render the dimming backdrop
  backdropClosable: Whether tapping the backdrop closes the dialog
  onClose: Called when the dialog requests close
  showHeader: Show the styled header bar
  titleProps: Override props applied to the title `<Text>` (style, weight, ff, size, colorVariant)
  autoFocus: Move focus into the dialog once it opens — `true` for the first focusable field (web only), or a ref to focus that element on any platform
  trapFocus: Keep Tab focus inside the dialog and restore it on close (web only, default true)
examples:
  - basic
  - confirmation
  - form
  - bottomsheet
  - title-customization
---

The Dialog component presents content above the app, supporting focus trapping, scroll locking, and multiple presentation styles (modal, confirmation, bottom sheet).
