---
title: Loader
description: A loading indicator component for showing progress and pending states.
category: feedback
tags: [loader, loading, progress, indicator, animation]
playground: true
---

A animated loading component for indicating ongoing processes and loading states with various sizes and styles.

## Accessibility

The loader is an indeterminate `progressbar` with `aria-busy`, named "Loading" by default — pass `accessibilityLabel` to say what is loading. When the user prefers reduced motion (OS setting, or `PlatformBlocksProvider reducedMotion`), the indicator stays static.
