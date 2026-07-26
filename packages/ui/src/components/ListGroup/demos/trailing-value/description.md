---
title: Trailing value
category: composition
order: 30
tags: [list, value, alignment, sections]
status: stable
since: 1.0.0
hidden: false
---

`value` renders muted text at the end of the row, before `endSection`. A
two-line row already claims the free space, so its value sits flush right on its
own; a single-line row only takes its natural width, so the value is what gets
pushed to the edge and `endSection` follows it.
