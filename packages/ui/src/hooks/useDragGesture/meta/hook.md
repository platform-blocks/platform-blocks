---
title: useDragGesture
category: gestures
order: 10
tags: [gesture, drag, pan, touch, scroll]
status: stable
hidden: false
---

The drag gesture behind Slider, RangeSlider, Joystick and Rating: spread its handlers, ref and style onto a View to get pointer samples in that View's own coordinates, which keep tracking after the finger leaves it, without the page or a ScrollView stealing the drag. `getGestureSurfaceStyle` and `GESTURE_RESPONDER_LOCK` are the two pieces it's built on, for a `PanResponder` of your own.
