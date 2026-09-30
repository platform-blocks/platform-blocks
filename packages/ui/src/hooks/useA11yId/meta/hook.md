---
title: useA11yId
category: accessibility
order: 10
tags: [accessibility, id, aria]
status: stable
hidden: false
---

A stable, SSR-safe element id for ARIA references like `aria-controls` and `aria-labelledby`. It returns the id you pass, or a sanitized `useId()` that is valid as a DOM id, a CSS selector and a native `nativeID`.
