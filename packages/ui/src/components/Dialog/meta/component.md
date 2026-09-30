---
title: Dialog
description: Accessible modal dialog / sheet for interruptive content, confirmations, and forms.
source: ui/src/components/Dialog
status: experimental
category: overlay
tags: [modal, dialog, overlay, sheet]
playground: true
accessibility: "role=dialog with aria-modal, named by its title (aria-labelledby) or accessibilityLabel. A modal layer: focus moves in on open, Tab is trapped, Escape / Android back close only the topmost overlay, and focus returns to the opener. The close button is labelled 'Close dialog'. Popovers, selects and menus opened inside render in the dialog's own overlay host, above it."
props:
  opened: Whether the dialog is shown
  variant: 'modal' | 'bottomsheet' | 'fullscreen'
  title: Optional title rendered in the header
  closable: Show the close button + handle escape/back gestures
  accessibilityLabel: Accessible name for an untitled dialog
  closeButtonLabel: Accessible label of the close button (default 'Close dialog')
  backdrop: Render the dimming backdrop
  backdropClosable: Whether tapping the backdrop closes the dialog
  onClose: Called when the dialog requests close
  showHeader: Show the styled header bar
  titleProps: Override props applied to the title `<Text>` (style, fw, ff, size, c)
  autoFocus: Where focus lands on open (it always moves in) — the dialog itself by default, `true` for the first focusable field (web), or a ref to focus that element on any platform
  trapFocus: Keep Tab focus inside the dialog (web, default true); focus is always restored on close
examples:
  - basic
  - confirmation
  - form
  - bottomsheet
  - title-customization
---

The Dialog component presents content above the app, supporting focus trapping, scroll locking, and multiple presentation styles (modal, confirmation, bottom sheet).
