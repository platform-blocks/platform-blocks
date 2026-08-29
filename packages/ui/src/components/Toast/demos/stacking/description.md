---
title: Stacking
category: behavior
order: 45
tags: [toast, stack, queue, limit]
highlightLines: []
status: stable
since: 1.1.0
hidden: false
---

Toasts at the same position form a stack. The newest one always takes the slot against the anchored edge and the rest move out of its way; when one is dismissed, the toasts behind it slide into the gap while it fades. Hovering — or tabbing into — any toast pauses the countdown on the whole stack, and resumes it with the time that was left. `limit` caps how many are on screen at once, retiring the oldest with its normal exit rather than deleting it.
