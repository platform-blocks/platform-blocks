---
title: Stable handler, latest state
category: basics
order: 10
tags: [callbacks, effects, interval]
status: stable
hidden: false
---

The interval is set up once, yet each tick adds the step selected right now: `tick` keeps one identity while always calling the latest closure. `useLatestCallback(fn)` returns `(...args) => ReturnType<fn> | undefined` and accepts `undefined` (the call is then a no-op), which suits optional callback props such as `onComplete`. The latest `fn` is stored in a layout effect after each commit, so call the returned function from effects and event handlers, never during render.
