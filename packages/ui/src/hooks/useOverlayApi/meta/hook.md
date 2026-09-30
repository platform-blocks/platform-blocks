---
title: useOverlayApi
category: overlay
order: 40
tags: [overlay, imperative, portal]
status: stable
hidden: false
---

Open, update and close overlays imperatively in the nearest `OverlayProvider` (`PlocksProvider` mounts one along with its renderer): `openOverlay(config)` returns an id for `updateOverlay` and `closeOverlay`, and `closeAllOverlays` clears them all. `useOverlays()` returns the configs currently open; both hooks throw outside a provider.
