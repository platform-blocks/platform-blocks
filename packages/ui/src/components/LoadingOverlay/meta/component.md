---
playground: true
title: LoadingOverlay
description: Overlay helper that blocks a section with a centered loader while background work completes.
source: "@platform-blocks/ui"
status: "beta"
category: feedback
accessibility: "Non-modal overlay; disable or trap focus manually when blocking interactive regions."
variants:
  - name: "basic"
    description: "Dim background content with a centered loader using overlay and loader props."
dependencies:
  - "@platform-blocks/core"
related:
  - "Overlay"
  - "Loader"
  - "Dialog"
props:
  - name: "visible"
    type: "boolean"
    description: "Controls whether the overlay is rendered."
  - name: "zIndex"
    type: "number"
    description: "Overrides overlay z-index when provided."
  - name: "overlayProps"
    type: "OverlayProps"
    description: "Props forwarded to the underlying Overlay component (blur, radius, opacity, etc.)."
  - name: "loaderProps"
    type: "LoaderProps"
    description: "Props forwarded to the Loader component (variant, size, color)."
  - name: "loader"
    type: "ReactNode"
    description: "Provide custom loader content. When set, the default Loader is not rendered."
---

`LoadingOverlay` composits the core `Overlay` and `Loader` primitives to create a convenient helper for blocking interactions with a visual indicator during asynchronous operations. Render it inside a relatively positioned container, toggle `visible` during asynchronous work, and customize appearance by passing `overlayProps` or `loaderProps`.
