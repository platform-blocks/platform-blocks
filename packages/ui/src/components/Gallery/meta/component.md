---
playground: true
title: Gallery
description: Responsive media gallery with thumbnails, navigation, and modal viewing.
source: ui/src/components/Gallery
status: experimental
category: media
tags: [gallery, images, thumbnails, media]
examples:
  - basic
  - advanced
---

The Gallery component displays a collection of images or media with thumbnail navigation, keyboard controls, and optional fullscreen/modal viewing.

Open it with `opened` (the older `visible` still works but is deprecated). The gallery is a modal dialog: focus moves in and is trapped while open, Escape and the Android back button close it, and focus returns to the trigger. The thumbnail strip is a tab list (arrow keys, Home and End move between images), every control is labelled, and image changes are announced to screen readers.
