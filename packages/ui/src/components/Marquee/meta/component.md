---
title: Marquee
description: Continuously scrolls repeated content across one axis.
source: "@plocks/ui"
status: "beta"
category: display
accessibility: "Only the first copy is exposed to assistive technology; reduced motion shows one static copy."
related:
  - "Badge"
props:
  - name: "duration"
    type: number
    description: "Milliseconds for a copy to travel its own length."
    default: 20000
  - name: "orientation"
    type: "'horizontal' | 'vertical'"
    description: "Scroll axis. Vertical marquees need an explicit h."
    default: "horizontal"
  - name: "repeat"
    type: number
    description: "Number of repeated copies."
    default: 4
examples:
  - basic
  - vertical
---

Use Marquee for decorative rows such as logos or short badges. It respects reduced motion settings.
