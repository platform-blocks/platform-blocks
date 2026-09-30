---
title: usePersistedState
category: state
order: 20
tags: [state, storage, localStorage, persistence, AsyncStorage]
status: stable
hidden: false
---

`useState` that survives reloads: the value is saved under a key in `localStorage` on the web (AsyncStorage on native when installed, or any storage you pass) and shared by every component using that key.
