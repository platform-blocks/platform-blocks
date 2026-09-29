---
title: Skeleton
description: Placeholder loading indicator that mimics the shape of content while data loads.
source: ui/src/components/Skeleton
status: stable
category: feedback
tags: [loading, placeholder, skeleton]
playground: true
examples:
  - basic
  - card
  - shapes
---

Skeleton components provide visual placeholders for text, avatars, and blocks to reduce perceived loading time.

## Accessibility

Skeletons are decorative: they are hidden from assistive technology, so label the region that is loading (e.g. `aria-busy` on its container). Pass `accessibilityLabel` to make a skeleton itself a busy `status` with that name. The pulse never runs while reduced motion is on. `radius` tokens resolve on the theme's radius scale.
