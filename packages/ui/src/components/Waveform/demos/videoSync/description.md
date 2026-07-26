---
title: Synced to video
category: advanced
order: 46
tags: [video, sync, progress, onSeek]
status: stable
since: 1.0.0
---

Use the waveform as a scrub bar for a `Video`: `onTimeUpdate` feeds `progress`, and seeking on the waveform calls `seek()` on the video ref, so the two stay aligned in both directions.
