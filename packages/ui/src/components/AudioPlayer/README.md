# AudioPlayer Component

A professional-grade audio player component with waveform visualization, built to extend the React UI Library UI library with SoundCloud/WaveSurfer-like capabilities.

## Features

### Core Audio Functionality
- **Full playback controls**: Play, pause, stop, seek, volume, and speed control
- **Audio loading**: Support for local files and remote URLs with dynamic loading
- **Playback state management**: Real-time state tracking with callbacks
- **Loop support**: Seamless audio looping functionality
- **Error handling**: Graceful error handling with user-friendly messages

### Waveform Visualization
- **Interactive waveform**: Click/tap to seek to specific positions
- **Real-time progress**: Visual progress indicator with smooth updates
- **Customizable appearance**: Colors, dimensions, and styling options
- **Performance optimized**: Efficient rendering for smooth interactions

### User Interface
- **Multiple layouts**: Minimal, compact, and full variants
- **Flexible controls**: Configurable control panels (top, bottom, overlay, or hidden)
- **Metadata display**: Title, artist, and duration information
- **Time formatting**: Multiple time display formats (mm:ss, hh:mm:ss)
- **Responsive design**: Adapts to different screen sizes

### Integration & Accessibility
- **Sound system integration**: UI feedback sounds for interactions
- **Accessibility support**: Screen reader labels and keyboard navigation
- **Theme integration**: Automatic theme color adaptation
- **Graceful fallbacks**: Works with or without expo-av dependency

## Installation

The AudioPlayer is part of the React UI Library UI library. Make sure you have the required dependencies:

```bash
npm install @platform-blocks/react-ui-library
# Optional: for full audio functionality
npm install expo-av expo-haptics
```

## Basic Usage

```tsx
import React from 'react';
import { AudioPlayer } from '@platform-blocks/react-ui-library';

export const MyAudioPlayer = () => {
  return (
    <AudioPlayer
      source="https://example.com/audio.mp3"
      width={400}
      height={80}
      showControls={true}
      interactive={true}
      metadata={{
        title: "My Audio Track",
        artist: "Artist Name"
      }}
    />
  );
};
```

## Advanced Usage

```tsx
import React, { useRef, useState } from 'react';
import { AudioPlayer, type AudioPlayerRef, type PlaybackState } from '@platform-blocks/react-ui-library';

export const AdvancedAudioPlayer = () => {
  const playerRef = useRef<AudioPlayerRef>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);

  const handlePlaybackStateChange = (state: PlaybackState) => {
    setPlaybackState(state);
    console.log('Playback state:', state);
  };

  const handleSeek = async (position: number) => {
    console.log('Seeking to position:', position);
  };

  const handleError = (error: any) => {
    console.error('Audio error:', error);
  };

  return (
    <AudioPlayer
      ref={playerRef}
      source="https://example.com/audio.mp3"
      width={600}
      height={100}
      color="primary"
      variant="full"
      showControls={true}
      controls={{
        playPause: true,
        volume: true,
        speed: true,
        waveform: true,
      }}
      controlsPosition="bottom"
      showTime={true}
      timeFormat="mm:ss"
      showMetadata={true}
      metadata={{
        title: "Advanced Audio Track",
        artist: "Professional Artist",
        album: "Demo Album",
        duration: 180000, // 3 minutes
      }}
      generateWaveform={true}
      waveformOptions={{
        samples: 200,
        precision: 4,
        channel: 'mix',
      }}
      onLoad={(data) => console.log('Audio loaded:', data)}
      onPlaybackStateChange={handlePlaybackStateChange}
      onProgress={(data) => console.log('Progress:', data)}
      onSeek={handleSeek}
      onError={handleError}
    />
  );
};
```

## Props

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `string \| object` | - | Audio source (URL or audio object) |
| `peaks` | `number[]` | - | Pre-computed waveform peaks data |
| `width` | `number` | `300` | Component width in pixels |
| `height` | `number` | `60` | Component height in pixels |
| `color` | `string` | `'primary'` | Theme color for the waveform |

### Playback Control Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `autoPlay` | `boolean` | `false` | Start playing automatically when loaded |
| `loop` | `boolean` | `false` | Loop the audio when it reaches the end |
| `volume` | `number` | `1.0` | Initial volume (0.0 to 1.0) |
| `rate` | `number` | `1.0` | Initial playback rate (0.5 to 2.0) |

### UI Configuration Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showControls` | `boolean` | `true` | Show playback controls |
| `controls` | `object` | - | Configure which controls to show |
| `controlsPosition` | `'top' \| 'bottom' \| 'overlay' \| 'none'` | `'bottom'` | Position of controls |
| `variant` | `'minimal' \| 'compact' \| 'full' \| 'soundcloud' \| 'spotify'` | `'full'` | Layout variant |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme |

### Waveform Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `interactive` | `boolean` | `true` | Enable click/tap to seek |
| `generateWaveform` | `boolean` | `true` | Auto-generate waveform from audio |
| `waveformOptions` | `object` | - | Waveform generation options |

### Display Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showTime` | `boolean` | `true` | Show current time and duration |
| `timeFormat` | `'mm:ss' \| 'hh:mm:ss' \| 'relative'` | `'mm:ss'` | Time display format |
| `showMetadata` | `boolean` | `false` | Show audio metadata |
| `metadata` | `AudioMetadata` | - | Audio metadata object |

### Event Props

| Prop | Type | Description |
|------|------|-------------|
| `onLoad` | `(data: AudioLoadData) => void` | Called when audio is loaded |
| `onPlaybackStateChange` | `(state: PlaybackState) => void` | Called when playback state changes |
| `onProgress` | `(data: ProgressData) => void` | Called during playback with progress |
| `onEnd` | `() => void` | Called when playback finishes |
| `onError` | `(error: AudioError) => void` | Called on audio errors |
| `onSeek` | `(position: number) => void` | Called when user seeks |

## Ref Methods

When using a ref, you can access these methods:

```tsx
const playerRef = useRef<AudioPlayerRef>(null);

// Playback control
await playerRef.current?.play();
await playerRef.current?.pause();
await playerRef.current?.stop();
await playerRef.current?.seek(30000); // Seek to 30 seconds

// Volume and rate control
await playerRef.current?.setVolume(0.8);
await playerRef.current?.setRate(1.5);
await playerRef.current?.setLoop(true);

// State queries
const currentTime = await playerRef.current?.getCurrentTime();
const duration = await playerRef.current?.getDuration();
const state = playerRef.current?.getPlaybackState();

// Waveform data
const peaks = playerRef.current?.getWaveformPeaks();

// Lifecycle
await playerRef.current?.load(newSource);
await playerRef.current?.unload();
```

## Styling

The AudioPlayer integrates with the React UI Library theme system and can be customized using the `style` prop:

```tsx
<AudioPlayer
  source="audio.mp3"
  style={{
    marginVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
  }}
/>
```

## Integration with Sound System

The AudioPlayer automatically integrates with the React UI Library sound system for UI feedback:

```tsx
import { SoundProvider } from '@platform-blocks/react-ui-library';

export const App = () => {
  return (
    <SoundProvider>
      <AudioPlayer source="audio.mp3" />
    </SoundProvider>
  );
};
```

## Accessibility

The AudioPlayer includes comprehensive accessibility support:

- **Screen reader support**: Proper ARIA labels and descriptions
- **Keyboard navigation**: Space for play/pause, arrow keys for seeking
- **Focus management**: Clear focus indicators and logical tab order
- **Announcements**: State changes announced to screen readers

## Performance

The AudioPlayer is optimized for performance:

- **Lazy loading**: Audio files are loaded only when needed
- **Efficient rendering**: Waveform optimizations for smooth interactions
- **Memory management**: Proper cleanup when component unmounts
- **Background processing**: Waveform generation doesn't block UI

## Troubleshooting

### Audio doesn't play
- Check that the audio source URL is accessible
- Verify expo-av is installed if using remote audio files
- Check browser/device audio permissions

### Waveform not showing
- Ensure `peaks` prop is provided or `generateWaveform` is true
- Check that the audio file is accessible for analysis
- Verify the peaks data format (array of numbers 0-1)

### Poor performance
- Reduce waveform `samples` in `waveformOptions`
- Use pre-computed `peaks` instead of `generateWaveform`
- Consider using smaller audio files for mobile devices

## Examples

Check out the `AudioPlayerDemo` component for comprehensive examples of all features and configurations.

## License

Part of the React UI Library UI library. See the main library license for details.