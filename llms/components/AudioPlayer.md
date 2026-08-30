# AudioPlayer

AudioPlayer wraps `expo-audio` with a seekable [Waveform](/components/Waveform), transport controls and progress callbacks. Times in `PlaybackState`, `ProgressData` and the ref methods are milliseconds.

Playback needs the optional `expo-audio` peer dependency (`npx expo install expo-audio`); without it the component renders and reports a missing-module error rather than throwing.

## Metadata

- Canonical name: `AudioPlayer`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { AudioPlayer } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.11.0
- Category: media
- Tags: audio, player, waveform, media, playback
- Docs: https://react-ui-library.com/components/AudioPlayer
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/AudioPlayer

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `source` | string \| number \| { uri: string } | No |  | Audio source - can be URL, local file, or asset |
| `peaks` | number[] | No |  | Pre-computed waveform peaks (optional - will generate if not provided) |
| `autoPlay` | boolean | No |  | Whether to auto-play when loaded |
| `loop` | boolean | No |  | Whether to loop the audio |
| `volume` | number | No |  | Initial volume (0-1) |
| `rate` | number | No |  | Playback rate (0.5-2.0) |
| `showControls` | boolean | No |  | Whether to show player controls |
| `controls` | { playPause?: boolean; skip?: boolean; volume?: boolean; speed?: boolean; download?: boolean; share?: boolean; waveform?: boolean; } | No |  | Which controls to display |
| `controlsPosition` | 'top' \| 'bottom' \| 'overlay' \| 'none' | No |  | Custom control layout |
| `variant` | 'minimal' \| 'compact' \| 'full' \| 'soundcloud' \| 'spotify' | No |  | Player theme variant |
| `colorScheme` | 'light' \| 'dark' \| 'auto' | No |  | Color scheme |
| `onLoad` | (data: AudioLoadData) => void | No |  | Called when audio is loaded and ready |
| `onPlaybackStateChange` | (state: PlaybackState) => void | No |  | Called when playback state changes |
| `onProgress` | (data: ProgressData) => void | No |  | Called during playback with current time |
| `onEnd` | () => void | No |  | Called when playback finishes |
| `onError` | (error: AudioError) => void | No |  | Called on playback error |
| `onBuffer` | (data: BufferData) => void | No |  | Called when audio buffer updates |
| `generateWaveform` | boolean | No |  | Whether to generate waveform from audio |
| `waveformOptions` | { samples?: number; precision?: number; channel?: 'left' \| 'right' \| 'mix'; } | No |  | Waveform generation options |
| `showTime` | boolean | No |  | Show time labels |
| `timeFormat` | 'mm:ss' \| 'hh:mm:ss' \| 'relative' | No |  | Time format |
| `showMetadata` | boolean | No |  | Show audio metadata |
| `metadata` | AudioMetadata | No |  | Audio metadata |
| `showSpectrum` | boolean | No |  | Show spectrum analyzer |
| `spectrumOptions` | SpectrumOptions | No |  | Spectrum analyzer options |
| `enableKeyboardShortcuts` | boolean | No |  | Enable keyboard shortcuts |
| `keyboardShortcuts` | KeyboardShortcuts | No |  | Custom keyboard shortcuts |
| `enableGestures` | boolean | No |  | Enable gesture controls |
| `gestureConfig` | GestureConfig | No |  | Gesture configuration |
| `enableEffects` | boolean | No |  | Enable audio effects |
| `effects` | AudioEffects | No |  | Audio effects configuration |
| `playlist` | PlaylistItem[] | No |  | Enable playlist support |
| `currentTrack` | number | No |  | Current playlist index |
| `onTrackChange` | (index: number, track: PlaylistItem) => void | No |  | Playlist callbacks |
| `enableExport` | boolean | No |  | Enable audio export |
| `exportOptions` | { formats?: ('mp3' \| 'wav' \| 'aac')[]; quality?: 'low' \| 'medium' \| 'high'; } | No |  | Export options |
| `shareOptions` | { platforms?: ('copy' \| 'email' \| 'social')[]; includeTimestamp?: boolean; } | No |  | Custom share options |
| `w` | number | No |  | Width of the waveform |
| `h` | number | No |  | Height of the waveform |
| `color` | string | No |  | Color of the waveform |
| `size` | ComponentSizeValue | No | 'md' | Size token controlling height, bar width/gap, stroke width, and label type. Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which is read as the waveform height and scales the bar metrics proportionally. Individual props (`h`, `barWidth`, `barGap`, `strokeWidth`, `minBarHeight`) override the token they derive from. |
| `barWidth` | number | No |  | Width of individual bars (for bar variants) |
| `barGap` | number | No |  | Gap between bars (for bar variants) |
| `strokeWidth` | number | No |  | Stroke width for line variant |
| `gradientColors` | string[] | No |  | Colors for gradient variant |
| `progressColor` | string | No |  | Color for the progress indicator |
| `interactive` | boolean | No |  | Whether the waveform is interactive (clickable for seeking) |
| `onSeek` | (position: number) => void | No |  | Callback fired when user clicks/seeks to a position |
| `onDragStart` | (position: number) => void | No |  | Callback fired when user starts dragging |
| `onDrag` | (position: number) => void | No |  | Callback fired when user is dragging |
| `onDragEnd` | (position: number) => void | No |  | Callback fired when user ends dragging |
| `accessibilityLabel` | string | No |  | Accessibility label for the waveform |
| `accessibilityHint` | string | No |  | Accessibility hint for interactive waveforms |
| `minBarHeight` | number | No |  | Minimum height for bars (prevents invisible bars) |
| `normalize` | boolean | No |  | Whether to normalize waveform heights so the tallest bar uses full height |
| `fullWidth` | boolean | No |  | Whether the waveform should take the full width of its container |
| `maxVisibleBars` | number | No |  | Maximum number of bars to render (for performance with large datasets) |
| `showProgressLine` | boolean | No |  | Whether to show a vertical progress line indicator |
| `progressLineStyle` | { color?: string; width?: number; opacity?: number; } | No |  | Style configuration for the progress line |
| `showTimeStamps` | boolean | No |  | Whether to show time stamps along the waveform |
| `duration` | number | No |  | Duration in seconds for time stamp calculation |
| `timeStampInterval` | number | No |  | Time stamp interval in seconds |
| `loading` | boolean | No |  | Whether the waveform is in a loading state |
| `error` | string | No |  | Error message to display |
| `loadingProgress` | number | No |  | Loading progress (0-1) for progressive loading |
| `selection` | [number, number] | No |  | Selected time range [start, end] in normalized coordinates (0-1) |
| `onSelectionChange` | (selection: [number, number]) => void | No |  | Callback when selection changes |
| `zoomLevel` | number | No |  | Zoom level (1 = normal, 2 = 2x zoom, etc.) |
| `zoomCenter` | number | No |  | Zoom center position (0-1) |
| `onZoomChange` | (zoomLevel: number, center: number) => void | No |  | Callback when zoom changes |
| `enableAnimations` | boolean | No |  | Whether to enable smooth animations |
| `showRMS` | boolean | No |  | Whether to show RMS (average) levels alongside peaks |
| `rmsData` | number[] | No |  | RMS data array (should match peaks length) |
| `markers` | WaveformMarker[] | No |  | Custom markers to display on the waveform |
| `enablePerformanceMonitoring` | boolean | No |  | Enable performance monitoring |
| `onPerformanceMetrics` | (metrics: PerformanceMetrics) => void | No |  | Callback for performance metrics |

## Examples

### Basic Usage
ID: `AudioPlayer.basic` • Tags: audio, playback, peaks, expo-audio • Category: basics • Status: stable • Since: 1.0.0

Point `source` at a URL or a bundled clip and the player handles loading, play/pause, seeking and progress. Playback requires `expo-audio`; without it the controls render but report a missing-module error.

```tsx
// Peaks measured from the same bundled clip the player loads.
  return (
    <Block gap="sm" w="100%" maxW={520}>
      <AudioPlayer
        source={require('../../../../assets/sounds/melody.mp3')}
        peaks={MELODY_PEAKS}
        h={72}
        showMetadata
        metadata={{ title: 'Arpeggio', artist: 'Demo Tones' }}
        controlsPosition="top"
        controls={{ playPause: true, volume: true, speed: true, waveform: true }}
      />
      <Text variant="small" color="muted">
        Playback runs through `expo-audio`. Pass `peaks` to draw the real waveform, then tap it to
        seek — the progress line follows playback either way.
      </Text>
    </Block>
  );
}
```
