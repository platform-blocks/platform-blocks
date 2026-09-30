---
name: AudioPlayer
title: AudioPlayer
description: Audio playback with a seekable waveform, transport controls and progress callbacks
category: media
subcategory: Media
tags: [audio, player, waveform, media, playback]
status: beta
platform:
  web: true
  ios: true
  android: true
props:
  source: Audio URL, bundled asset from `require()`, or `{ uri }`
  peaks: Measured peak values for the waveform; generated placeholder data when omitted
  autoPlay: Start playback as soon as the clip loads
  loop: Repeat the clip when it ends
  volume: Playback volume from 0 to 1
  rate: Playback rate (0.5–2.0)
  controls: Toggles for the play/pause, skip, mute, speed and waveform controls (merged over the defaults)
  controlsPosition: Render the controls above, below or over the waveform, or hide them
  timeFormat: "`mm:ss`, `hh:mm:ss`, or `relative` (elapsed / -remaining)"
  enableKeyboardShortcuts: Space / J / L / M shortcuts while the waveform has focus (web)
  showTime: Show the current time and duration
  showMetadata: Show the `metadata` title and artist above the player
  onLoad: Called once the clip is ready, with duration in milliseconds
  onPlaybackStateChange: Called whenever playback state changes
  onProgress: Called during playback with time, duration and progress
  onEnd: Called when a non-looping clip finishes
  onError: Called when loading or playback fails
examples:
  basic: Bundled clip with a measured waveform
related:
  - Waveform
  - Video
---

AudioPlayer combines audio playback controls with a seekable waveform.
