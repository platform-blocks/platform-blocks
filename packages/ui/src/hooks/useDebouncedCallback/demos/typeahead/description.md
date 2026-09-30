---
title: Debounced typeahead
category: basics
order: 10
tags: [debounce, callback, typeahead]
status: stable
hidden: false
---

`useDebouncedCallback` debounces an *imperative* function. The returned wrapper has stable identity (safe for `useEffect` deps) and exposes `.cancel()` and `.flush()`. Use this when an event handler should fire a request after a quiet period — that's how `<AutoComplete>` does its search internally.
