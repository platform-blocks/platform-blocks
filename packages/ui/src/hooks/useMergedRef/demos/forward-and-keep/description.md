---
title: Forward a ref and keep your own
category: basics
order: 10
tags: [refs, forwardRef, focus]
status: stable
hidden: false
---

`SearchField` keeps its own ref to the `TextInput` (it blurs itself when Enter is pressed) and forwards the parent's ref to the same node (the button focuses it). `useMergedRef(...refs)` accepts object refs, callback refs and `null` / `undefined` slots, and returns a callback ref whose identity only changes when one of the refs does, so React doesn't detach and re-attach the node on every render. Input, Checkbox, Radio, Tooltip and other library components use it to forward refs they also need internally.
