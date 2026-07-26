---
title: Two-line rows
category: basics
order: 20
tags: [list, label, description, settings]
status: stable
since: 1.0.0
hidden: false
---

Pass `label` and `description` for a stacked row. These take precedence over
`children`, which renders as a single line of text and so cannot hold a layout
block. `description` is optional — a `label` on its own reads the same as
`children`, and mixing both row shapes in one group stays aligned.
