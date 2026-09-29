---
name: Search
playground: true
title: Search
category: input
tags: [search, input, filter, debounce]
---
The Search component provides a search input with debouncing, loading states, and customizable clear functionality.

Use `value` / `onChangeText` (controlled) or `defaultValue` (uncontrolled). `onChangeText` fires after `debounce` milliseconds when set, while the typed text shows immediately. `onChange` still works but is deprecated in favour of `onChangeText`.
