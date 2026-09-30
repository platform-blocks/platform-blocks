---
title: Disclosure ids
category: basics
order: 10
tags: [id, aria-controls, disclosure]
status: stable
hidden: false
---

`useA11yId(explicitId?, prefix = 'plocks')` returns `explicitId` when you pass one. Otherwise it returns React's `useId()` stripped to `[A-Za-z0-9_-]` behind the prefix (`«r1»` becomes `faq-r1`), which is unique per instance and the same on server and client. Here each trigger points `aria-controls` at its own panel, and the second disclosure passes `id="returns-policy"` through unchanged. Pass the id to an element's `id` prop: it becomes the DOM `id` on web, and React Native maps it to `nativeID`.
