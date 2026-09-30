---
title: Responsive layout
category: basics
order: 10
tags: [media-query, responsive, dimensions]
status: stable
hidden: false
---

Web: subscribes to a CSS media query via `window.matchMedia`. Native: parses width/height queries (`(min-width: 640px)`, `(max-height: 480px)`) and watches `Dimensions.addEventListener('change')`. Unparseable queries on native return the supplied `initialValue`.
