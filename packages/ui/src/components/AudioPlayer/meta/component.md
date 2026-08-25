---
name: AudioPlayer
title: AudioPlayer
description: Audio playback with a seekable waveform, transport controls and progress callbacks
category: media
subcategory: Media
tags: [audio, player, waveform, media, playback]
status: beta
since: 0.11.0
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
  controls: Toggles for the play/pause, volume, speed and waveform controls
  controlsPosition: Render the controls above or below the waveform
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

AudioPlayer wraps `expo-audio` with a seekable [Waveform](/components/Waveform), transport controls and progress callbacks. Times in `PlaybackState`, `ProgressData` and the ref methods are milliseconds.

Playback needs the optional `expo-audio` peer dependency (`npx expo install expo-audio`); without it the component renders and reports a missing-module error rather than throwing.
