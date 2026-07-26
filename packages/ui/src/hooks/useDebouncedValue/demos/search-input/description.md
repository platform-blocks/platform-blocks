---
title: Debounced search
category: basics
order: 10
tags: [debounce, search, input]
status: stable
since: 1.0.0
hidden: false
---

`useDebouncedValue` is the declarative pattern: derive a debounced copy of state and read from it during render (or from a `useEffect` when a real side-effect is involved). Best when the consumer is React-driven. For imperative event handlers, use `useDebouncedCallback`.
