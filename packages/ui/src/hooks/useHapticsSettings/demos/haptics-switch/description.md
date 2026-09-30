---
title: Haptics switch
category: basics
order: 10
tags: [haptics, settings]
status: stable
hidden: false
---

`useHaptics` fires the feedback and `useHapticsSettings` gates it: while `enabled` is false every `useHaptics` call is a no-op, including the press feedback built into Button, so one switch in a settings screen silences the whole library. `temporarilyDisable(ms)` turns haptics off for `ms`, then restores the previous setting, which suits a burst of programmatic changes that shouldn't buzz. Set the starting state with `<PlocksProvider haptics={{ defaultEnabled: false }}>`, or pass `haptics={false}` to leave the provider out. Haptics only play on iOS and Android with `expo-haptics` installed, so on web the switch changes nothing you can feel.
