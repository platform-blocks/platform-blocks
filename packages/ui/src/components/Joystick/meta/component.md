---
title: Joystick
category: input
tags: [joystick, xy, pad, gesture, two-axis, input]
playground: true
---

Joystick is a two-axis positional input. In its default `circle` shape it behaves like a physical stick — the handle rides the rim at full deflection and springs back to centre when released. As a `square` it becomes an XY pad: each axis clamps on its own so the corners are reachable, and the handle stays where it is left.

Both axes are normalized to −1…1. `y` is up-positive by default, matching how a gamepad axis reads; pass `invertY={false}` to follow screen space instead.

`deadZone` zeroes small deflections and rescales what is left, so the value still spans the full range past the threshold rather than jumping to the dead-zone size. `step` snaps each axis, `lockAxis` restricts travel to one direction, and `showCrosshair` adds accent rules that track the handle — the usual XY-pad readout.

The gesture runs on the shared `useDragGesture` hook, which means a drag that leaves the pad keeps tracking the finger instead of handing the touch back to the page. Arrow keys nudge by `keyboardStep` on web, `Home` and `Escape` recentre, and VoiceOver/TalkBack get increment and decrement actions.
