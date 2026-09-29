---
playground: true
title: Video
category: media
description: A comprehensive video player component that supports YouTube videos, MP4 files, and file buffers with advanced timeline synchronization capabilities.
package: platform-blocks
since: 1.0.0
---

A comprehensive video player component that supports YouTube videos, MP4 files, and file buffers with advanced timeline synchronization capabilities.

The controls are labelled (Play / Pause, Mute / Unmute, Playback speed, Enter / Exit fullscreen) and the seek bar is a keyboard- and screen-reader-operable slider whose value is read as a time ("1:05 of 4:30"). While playing, the controls auto-hide but stay up while focus is inside them. `w` / `h` size the player (a missing dimension follows `aspectRatio`), and `ref.setMuted()` mutes or unmutes.
