# AudioPlayer

AudioPlayer combines audio playback controls with a seekable waveform.

## Metadata

- Import: `import { AudioPlayer } from '@plocks/media';`
- Install: `npm install @plocks/media` — a separate package from `@plocks/ui`
- Status: beta
- Tags: audio, player, waveform, media, playback
- Docs: https://plocks.dev/components/AudioPlayer
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/media/src/components/AudioPlayer

## Props

- `source`: string | number | { uri: string } — Audio source - can be URL, local file, or asset
- `peaks`: number[] — Pre-computed waveform peaks (optional - placeholder peaks are generated if not provided)
- `w`: number = 300 — Waveform width in px — not the player's, which fills its parent. @default 300
- `h`: number = 60 — Waveform height in px. @default 60
- `autoPlay`: boolean — Whether to auto-play when loaded
- `loop`: boolean — Whether to loop the audio
- `volume`: number — Initial volume (0-1)
- `rate`: number — Playback rate (0.5-2.0)
- `showControls`: boolean — Whether to show player controls
- `controls`: AudioPlayerControls — Which controls to display; merged over the defaults.
- `controlsPosition`: 'top' | 'bottom' | 'overlay' | 'none' — Where the controls sit: above or below the waveform, laid over it, or hidden. Metadata renders above the waveform for `overlay` and `none`.
- `onLoad`: (data: AudioLoadData) => void — Called when audio is loaded and ready
- `onPlaybackStateChange`: (state: PlaybackState) => void — Called when playback state changes
- `onProgress`: (data: ProgressData) => void — Called during playback with current time
- `onEnd`: () => void — Called when playback finishes
- `onError`: (error: AudioError) => void — Called on playback error
- `generateWaveform`: boolean — Draw placeholder peaks when `peaks` is omitted. expo-audio can't analyze a file up front, so pass measured `peaks` when the waveform's shape matters.
- `waveformOptions`: { samples?: number; } — Placeholder waveform options
- `showTime`: boolean — Show time labels
- `timeFormat`: 'mm:ss' | 'hh:mm:ss' | 'relative' — Time format: `mm:ss`, `hh:mm:ss`, or `relative` (elapsed / `-remaining`).
- `showMetadata`: boolean — Show audio metadata
- `metadata`: AudioMetadata — Audio metadata
- `enableKeyboardShortcuts`: boolean = true — Keyboard shortcuts while the waveform (seek slider) has focus (web): Space play/pause, J / L skip back / forward, M mute. Arrow keys, Page Up/Down and Home/End seek. @default true
- `keyboardShortcuts`: KeyboardShortcuts — Override the shortcut keys (`KeyboardEvent.key` values, case-insensitive).
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Waveform` props (`color` `size` `barWidth` `barGap` `strokeWidth` `gradientColors` `progressColor` `interactive` `onSeek` `onDragStart` `onDrag` `onDragEnd` `accessibilityLabel` `accessibilityHint` `minBarHeight` `normalize` `fullWidth` `maxVisibleBars` `showProgressLine` `progressLineStyle` `showTimeStamps` `timeStampInterval` `loading` `error` `loadingProgress` `selection` `onSelectionChange` `showRMS` `rmsData` `markers` `enablePerformanceMonitoring` `onPerformanceMetrics`): https://plocks.dev/llms/components/Waveform.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface AudioPlayerControls {
  /** Play / pause button. @default true */
  playPause?: boolean;
  /** Skip back / forward 10 seconds buttons. @default true */
  skip?: boolean;
  /** Mute / unmute button. @default true */
  volume?: boolean;
  /** Playback speed button (cycles 0.5x–2x). @default false */
  speed?: boolean;
  /** The seekable waveform. @default true */
  waveform?: boolean;
}

export interface AudioLoadData {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate?: number;
  format?: string;
  peaks?: number[];
}

export interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  rate: number;
  loop: boolean;
}

export interface ProgressData {
  currentTime: number;
  duration: number;
  progress: number; // 0-1
  position: number; // 0-1 for waveform
  /** Always 0: expo-audio doesn't report buffered ranges. */
  buffered: number;
}

export interface AudioError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: string;
  duration?: number;
  genre?: string;
  year?: number;
}

export interface KeyboardShortcuts {
  /** @default ' ' (Space) */
  playPause?: string;
  /** @default 'l' */
  skipForward?: string;
  /** @default 'j' */
  skipBackward?: string;
  volumeUp?: string;
  volumeDown?: string;
  /** @default 'm' */
  mute?: string;
}
```

## Examples

### Basics

Point `source` at a URL or a bundled clip and pass its `peaks` to draw the real waveform; the player handles loading, play/pause, seeking and progress. Playback requires `expo-audio`; without it the controls render but report a missing-module error.

```tsx
import { AudioPlayer } from '@plocks/media';
import { Block } from '@plocks/ui';

const MELODY_PEAKS = [
  0.765, 0.683, 0.598, 0.528, 0.464, 0.407, 0.36, 0.316, 0.277, 0.243, 0.949, 0.876,
  0.776, 0.698, 0.592, 0.533, 0.477, 0.407, 0.365, 0.323, 0.528, 0.922, 0.851, 0.738,
  0.643, 0.569, 0.489, 0.438, 0.383, 0.34, 0.297, 0.954, 0.885, 0.798, 0.693, 0.606,
  0.525, 0.468, 0.41, 0.354, 0.308, 0.925, 0.919, 0.828, 0.727, 0.64, 0.557, 0.474,
  0.415, 0.376, 0.338, 0.297, 0.997, 0.869, 0.775, 0.667, 0.595, 0.51, 0.444, 0.408,
  0.356, 0.316, 1, 0.872, 0.786, 0.691, 0.619, 0.555, 0.483, 0.4, 0.359, 0.322,
  0.288, 0.941, 0.835, 0.748, 0.661, 0.588, 0.506, 0.439, 0.39, 0.342, 0.306, 0.272,
  0.238, 0.203, 0.148, 0.13, 0.114, 0.101, 0.088, 0.078, 0.068, 0.06, 0.053, 0.047,
];

export function Demo() {
  return (
    <Block fullWidth>
      <AudioPlayer
        source={require('../../../../assets/sounds/melody.mp3')}
        peaks={MELODY_PEAKS}
        fullWidth
      />
    </Block>
  );
}
```
