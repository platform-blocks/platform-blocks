---
name: Waveform
description: A waveform visualization component for audio data representation and interaction
category: media
subcategory: Visualization
tags: [audio, waveform, visualization, media, interactive]
status: stable
since: 1.0.0
playground: true
platform:
  web: true
  ios: true
  android: true
accessibility:
  - Screen reader compatible
  - Keyboard controls
  - ARIA labels
related:
  - Chart
  - Progress
  - Slider
examples:
  basic: Basic waveform display
  variants: Different visual variants
  sizes: The seven size tokens
  synchronized: Synchronized waveforms
  audioPlayback: Waveform driven by real audio playback
  videoSync: Waveform synced to the Video component
  interactive: Interactive waveform controls
  fullWidth: Full width responsive layout
---

Waveform component provides visualization and interaction capabilities for audio data, supporting various display modes and interactive features.

A non-interactive waveform is announced as an image. With `interactive` and `onSeek` it is a seek slider (`aria-valuenow` in percent, spoken as a time when `duration` is set): arrow keys step 5 s (or 1%), Page Up/Down 10%, Home/End jump to the ends, and native screen readers can adjust it. `loadingProgress` fills the loading skeleton.
