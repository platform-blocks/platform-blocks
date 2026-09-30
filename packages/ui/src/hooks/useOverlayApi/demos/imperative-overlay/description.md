---
title: Open imperatively
category: basics
order: 10
tags: [overlay, imperative]
status: stable
hidden: false
---

`openOverlay` takes the `content` plus an `anchor`, the `{ x, y, width, height }` viewport point its top-left corner is placed at, and returns the overlay's id. The renderer doesn't measure or flip, so work the coordinates out yourself (here with `measureElement`) or use `useFloating`, which does it for you. By default the overlay closes on Escape and outside press (`closeOnEscape`, `closeOnClickOutside`), `anchorNode` keeps presses on the trigger from counting as outside, and `onClose` runs after every close; on native it opens in a transparent React Native `Modal` whose backdrop catches outside taps, and on web it is `position: fixed`. An overlay outlives the component that opened it, so close it on unmount.
