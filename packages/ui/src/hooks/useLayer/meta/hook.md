---
title: useLayer
category: overlay
order: 10
tags: [overlay, layer, dismiss, escape, focus]
status: stable
hidden: false
---

Register a custom overlay in the app-wide layer stack (no provider needed), so Escape and Android back close only the topmost layer, a press inside a nested layer doesn't close its parent, and focus moves in on open, can be trapped, and returns on close. Wrap its content in `<LayerScope id={id}>` so layers opened from inside it stack above it, and use `useIsTopLayer(id)` to know whether it is currently on top.
