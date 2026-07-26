---
title: Lazy Loading
category: behavior
order: 65
tags: [tree, async, loading]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

Mark a node with `hasChildren` and supply `loadChildren` to fetch a branch the first time it opens. The disclosure control shows a loader while the promise is in flight.
