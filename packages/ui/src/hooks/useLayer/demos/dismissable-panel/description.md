---
title: Dismissable panel
category: basics
order: 10
tags: [overlay, layer, dismiss, escape]
status: stable
hidden: false
---

`useLayer({ active, onDismiss, containerRef, … })` registers the panel while `active` is true and returns its `{ id }`. `onDismiss(reason)` receives `'escape-key'`, `'back-button'` or `'outside-press'`, and the panel stays open until you set `active` back to false; `closeOnOutsidePress` is off by default, and `outsidePressIgnoreRefs` stops a press on the trigger from counting as outside. Escape and outside press are web-only: on native, Android back dismisses the topmost layer, and a tap outside needs your own backdrop. `modal: true` walls off the layers below it and traps Tab, and focus moves into the panel on open and back on close (`autoFocus`, `restoreFocus`, both on by default).
