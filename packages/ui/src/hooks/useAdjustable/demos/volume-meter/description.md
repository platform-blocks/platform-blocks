---
title: Custom volume slider
category: basics
order: 10
tags: [slider, keyboard, value, screen-reader]
status: stable
hidden: false
---

The bar meter is the slider. Tab to it: the arrow keys move by `step` (Shift+arrow by ten steps, and the horizontal arrows swap under RTL), PageUp/PageDown move by `largeStep` (default 10% of the range), and Home/End jump to `min` / `max`. VoiceOver and TalkBack adjust it with their increment/decrement gestures and read `valueText` ("60 percent"). `useAdjustable({ value, min, max, step, onChange, label, valueText })` returns `adjustableProps` for the focusable element, `increment` / `decrement` (the − and + buttons here) and `handleKeyDown`; each change is clamped to the range and calls `onChange`, then `onChangeEnd`. It also takes `disabled`, `readOnly`, `orientation: 'vertical'`, `endless` (no clamping and no Home/End) and `getNextValue` for detents.
