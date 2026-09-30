---
title: useLatestCallback
category: utilities
order: 20
tags: [callbacks, effects, stable-identity]
status: stable
hidden: false
---

Wrap a callback in a function whose identity never changes but always calls the latest version, so effects, timers and subscriptions that call it don't restart when an inline handler changes.
