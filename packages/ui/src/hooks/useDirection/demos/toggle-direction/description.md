---
title: Toggle direction
category: basics
order: 10
tags: [rtl, direction]
status: stable
hidden: false
---

`useDirection()` returns `{ dir, isRTL, setDirection, toggleDirection }`. Toggling here flips the whole docs site: on web the provider writes `dir` to `<html>`, while on native it calls `I18nManager.forceRTL`, which takes effect after an app reload. `DirectionProvider` accepts `initialDirection` (otherwise read from `<html dir>` or `I18nManager.isRTL`) plus an async `storage` controller and `storageKey` to persist the choice. Icons and layout props such as `start` / `end` already mirror on their own, so reach for `isRTL` only in logic like gesture math or value direction.
