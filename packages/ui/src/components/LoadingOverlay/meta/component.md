---
playground: true
title: LoadingOverlay
description: Overlay helper that blocks a section with a centered loader while background work completes.
source: "@plocks/ui"
status: "beta"
category: feedback
accessibility: "The covered region (the overlay's parent) is marked aria-busy on web while loading; the overlay is an indeterminate role=progressbar named `loadingLabel`, and waits longer than `announceAfter` (1s) are announced to screen readers. It is non-modal: disable the covered controls (as the demo does) when they must not be used."
variants:
  - name: "basic"
    description: "Dim background content with a centered loader using overlay and loader props."
dependencies:
  - "@plocks/core"
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
    description: "z-index of the overlay container; `overlayProps.zIndex` wins when both are set. Defaults to Overlay's, which lifts it above the content it covers."
  - name: "overlayProps"
    type: "OverlayProps"
    description: "Props forwarded to the underlying Overlay component (blur, radius, opacity, etc.)."
  - name: "loaderProps"
    type: "LoaderProps"
    description: "Props forwarded to the Loader component (variant, size, color)."
  - name: "loader"
    type: "ReactNode"
    description: "Provide custom loader content. When set, the default Loader is not rendered."
  - name: "loadingLabel"
    type: "string"
    description: "Accessible name of the busy indicator and the text announced (default 'Loading')."
  - name: "announceAfter"
    type: "number | false"
    description: "Announce `loadingLabel` when loading lasts longer than this many ms (default 1000); `false` never announces."
---

LoadingOverlay covers content with a loading indicator while work is in progress.
