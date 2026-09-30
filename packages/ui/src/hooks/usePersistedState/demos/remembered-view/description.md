---
title: Remember a view setting
category: basics
order: 10
tags: [storage, persistence]
status: stable
hidden: false
---

Pick a view, then reload the page: the choice is read back from `localStorage`. `usePersistedState(key, defaultValue, options?)` returns `[value, setValue, { remove, ready }]`. `setValue` takes a value or an updater like `useState`, and `remove()` deletes the stored value so the state falls back to the default.

Values are stored as JSON; pass `serialize` / `deserialize` to change that, and throw from `deserialize` to reject a stale or hand-edited value. `ready` is `false` during static rendering and hydration (the state shows the default so the markup matches) and while an async storage such as AsyncStorage is loading. Pass `storage` for anything else with `getItem` / `setItem` / `removeItem`, for example `sessionStorage` or an MMKV adapter.
