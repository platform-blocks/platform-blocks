# Waveform

Waveform visualizes audio data and can provide a seek control.

## Metadata

- Import: `import { Waveform } from '@plocks/ui';`
- Tags: audio, waveform, visualization, media, interactive
- Docs: https://plocks.dev/components/Waveform
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Waveform

## Props

- `peaks` (required): number[] — Array of peak values (normalized between -1 and 1)
- `w`: number = 300 — Width in px; it sets the drawing's geometry. Use `fullWidth` to fill the parent. @default 300
- `h`: number — Height in px (the drawing's geometry). Defaults to the `size` token's height.
- `color`: string — Color of the waveform
- `variant`: 'bars' | 'line' | 'rounded' | 'gradient' — Visual variant of the waveform
- `size`: ComponentSizeValue = 'md' — Size token controlling height, bar width/gap, stroke width, and label type. Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which is read as the waveform height and scales the bar metrics proportionally. Individual props (`h`, `barWidth`, `barGap`, `strokeWidth`, `minBarHeight`) override the token they derive from.
- `barWidth`: number — Width of individual bars (for bar variants)
- `barGap`: number — Gap between bars (for bar variants)
- `strokeWidth`: number — Stroke width for line variant
- `gradientColors`: string[] — Colors for gradient variant
- `progress`: number — Progress value (0-1) to show playback position
- `progressColor`: string — Color for the progress indicator
- `interactive`: boolean — Whether the waveform is interactive. With `onSeek` it becomes a seek slider: pointer press/drag, arrow keys (5 s steps when `duration` is set, else 1%), PageUp/PageDown, Home/End, and screen-reader adjust actions.
- `onSeek`: (position: number) => void — Callback fired when user clicks/seeks to a position (0-1)
- `onDragStart`: (position: number) => void — Callback fired when user starts dragging
- `onDrag`: (position: number) => void — Callback fired when user is dragging
- `onDragEnd`: (position: number) => void — Callback fired when user ends dragging
- `accessibilityLabel`: string — Accessible name. Interactive waveforms are announced as a slider (default name "Audio waveform"), others as an image ("Audio waveform visualization").
- `accessibilityHint`: string — Accessibility hint for interactive waveforms (native)
- `minBarHeight`: number — Minimum height for bars (prevents invisible bars)
- `normalize`: boolean — Whether to normalize waveform heights so the tallest bar uses full height
- `fullWidth`: boolean — Whether the waveform should take the full width of its container
- `maxVisibleBars`: number — Maximum number of bars to render (for performance with large datasets)
- `showProgressLine`: boolean — Whether to show a vertical progress line indicator
- `progressLineStyle`: { color?: string; width?: number; opacity?: number; } — Style configuration for the progress line
- `showTimeStamps`: boolean — Whether to show time stamps along the waveform
- `duration`: number — Duration in seconds, for time stamps and for the seek slider's spoken value ("1:05 of 3:20") and keyboard step.
- `timeStampInterval`: number — Time stamp interval in seconds
- `loading`: boolean — Whether the waveform is in a loading state
- `error`: string — Error message to display
- `loadingProgress`: number — Loading progress (0-1): fills that share of the loading skeleton's bars
- `selection`: [number, number] — Selected time range [start, end] in normalized coordinates (0-1)
- `onSelectionChange`: (selection: [number, number]) => void — Callback when selection changes. When set, Shift+press-and-drag (web) selects a range instead of seeking.
- `showRMS`: boolean — Whether to show RMS (average) levels alongside peaks
- `rmsData`: number[] — RMS data array (should match peaks length)
- `markers`: WaveformMarker[] — Custom markers to display on the waveform
- `enablePerformanceMonitoring`: boolean — Enable performance monitoring
- `onPerformanceMetrics`: (metrics: PerformanceMetrics) => void — Callback for performance metrics
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { WaveformSkeleton } from '@plocks/ui';`

### WaveformSkeleton

- `w`: number = 300 — Width in px; the bars are laid out from it. @default 300
- `h`: number = 60 — Height in px; the bars are sized from it. @default 60
- `fullWidth`: boolean
- `barsCount`: number
- `progress`: number — Loading progress (0-1): that share of the bars is drawn filled.
- `accessibilityLabel`: string = 'Loading waveform' — Accessible name of the loading placeholder. @default 'Loading waveform'
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface WaveformMarker {
  /** Position on waveform (0-1) */
  position: number;
  /** Marker label */
  label?: string;
  /** Marker color */
  color?: string;
  /** Marker type */
  type?: 'line' | 'flag' | 'dot';
  /** Click handler */
  onPress?: () => void;
}

export interface PerformanceMetrics {
  /** Render time in milliseconds */
  renderTime: number;
  /** Number of elements rendered */
  elementsRendered: number;
  /** Memory usage estimate */
  memoryUsage: number;
  /** FPS during interactions */
  averageFPS: number;
}
```

## Examples

### Basics

Render a static waveform by passing the `peaks` array and update playback UI by adjusting the `progress` prop. Here a `Slider` drives that value directly — both use `fullWidth` so they share the container's width.

```tsx
import { useState } from 'react';
import { Block, Slider, Waveform } from '@plocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  const [progress, setProgress] = useState<number>(0.3);

  return (
    <Block fullWidth>
      <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={progress} h={64} fullWidth />
      <Slider
        value={Math.round(progress * 100)}
        onChange={(percent) => setProgress(percent / 100)}
        min={0}
        max={100}
        step={1}
        valueLabel={(percent) => `${percent}%`}
      />
    </Block>
  );
}
```

`data.ts`

```ts
export const WAVEFORM_DEMO_PEAKS: number[] = [
  0, 0.002, 0.012, 0.006, -0.313, 0.151, 0.247, 0.114, -0.036, -0.097, -0.03,
  0.107, 0.24, 0.013, -0.124, 0.046, -0.016, 0.109, 0.067, 0.094, -0.171,
  -0.023, -0.104, 0.003, 0.081, 0.026, 0.187, 0.02, -0.15, 0.057, -0.001,
  0.275, 0.257, 0.076, 0.108, -0.066, 0.153, 0.071, 0.033, -0.09, 0.018,
  -0.049, -0.048, -0.007, 0.045, -0.024, -0.067, 0.123, -0.109, 0.038, -0.02,
  -0.031, 0.043, -0.092, 0.083, -0.004, 0.043, 0.076, -0.053, 0.035, -0.049,
  0.023, 0.008, 0.015, 0.008, 0.008
];

export const QUIET_WAVEFORM_PEAKS: number[] = [
  0, 0.05, 0.08, 0.03, -0.09, 0.04, 0.07, 0.02, -0.01, -0.03, -0.01, 0.04, 0.06,
  0.01, -0.04, 0.02, -0.01, 0.03, 0.02, 0.03, -0.05, -0.01, -0.03, 0.001, 0.02,
  0.01, 0.05, 0.01, -0.04, 0.02, 0, 0.07, 0.06, 0.02, 0.03, -0.02, 0.04, 0.02,
  0.01, -0.02, 0.01, -0.01, -0.01, -0.002, 0.01, -0.01
];

export const TRACK_TWO_PEAKS: number[] = [
  0.1, -0.25, 0.4, -0.15, 0.2, -0.35, 0.3, -0.1, 0.05, -0.2, 0.15, -0.3, 0.25,
  -0.05, 0.1, -0.15, 0.2, -0.25, 0.35, -0.1, 0.05, -0.2, 0.15, -0.3, 0.25,
  -0.05, 0.1, -0.15, 0.2, -0.25, 0.1
];

/** Peaks measured from assets/sounds/melody.mp3 (3.86s), 96 buckets. */
export const MELODY_PEAKS: number[] = [
  0.765, 0.683, 0.598, 0.528, 0.464, 0.407, 0.36, 0.316, 0.277, 0.243, 0.949, 0.876,
  0.776, 0.698, 0.592, 0.533, 0.477, 0.407, 0.365, 0.323, 0.528, 0.922, 0.851, 0.738,
  0.643, 0.569, 0.489, 0.438, 0.383, 0.34, 0.297, 0.954, 0.885, 0.798, 0.693, 0.606,
  0.525, 0.468, 0.41, 0.354, 0.308, 0.925, 0.919, 0.828, 0.727, 0.64, 0.557, 0.474,
  0.415, 0.376, 0.338, 0.297, 0.997, 0.869, 0.775, 0.667, 0.595, 0.51, 0.444, 0.408,
  0.356, 0.316, 1, 0.872, 0.786, 0.691, 0.619, 0.555, 0.483, 0.4, 0.359, 0.322,
  0.288, 0.941, 0.835, 0.748, 0.661, 0.588, 0.506, 0.439, 0.39, 0.342, 0.306, 0.272,
  0.238, 0.203, 0.148, 0.13, 0.114, 0.101, 0.088, 0.078, 0.068, 0.06, 0.053, 0.047,
];

/** Peaks measured from the audio track of assets/video/demo-clip.mp4 (7.86s), 96 buckets. */
export const CLIP_PEAKS: number[] = [
  0.77, 0.591, 0.457, 0.354, 0.268, 0.94, 0.741, 0.58, 0.448, 0.342, 0.921, 0.806,
  0.616, 0.469, 0.356, 0.978, 0.803, 0.619, 0.489, 0.366, 0.934, 0.851, 0.647, 0.484,
  0.37, 0.992, 0.859, 0.663, 0.502, 0.393, 0.993, 0.861, 0.691, 0.488, 0.396, 0.923,
  0.932, 0.696, 0.543, 0.41, 0.317, 0.239, 0.153, 0.119, 0.091, 0.071, 0.054, 0.081,
  0.209, 0.379, 0.524, 0.814, 0.61, 0.69, 0.658, 0.619, 0.763, 0.645, 0.576, 0.575,
  0.646, 0.67, 0.795, 0.688, 0.611, 0.65, 0.785, 0.552, 0.612, 0.699, 0.749, 0.72,
  0.731, 0.633, 0.584, 0.748, 0.511, 0.692, 0.698, 0.546, 0.541, 1, 0.466, 0.571,
  0.653, 0.494, 0.526, 0.413, 0.613, 0.41, 0.392, 0.442, 0.499, 0.647, 0.581, 0.319,
];
```

### Full Width

A waveform is a fixed `w` wide (300 by default); enable the `fullWidth` prop to let it stretch to its container instead.

```tsx
import { Block, Text, Waveform } from '@plocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small">Default</Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={0.35} h={56} />
      </Block>

      <Block>
        <Text variant="small">fullWidth</Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={0.6} h={56} fullWidth />
      </Block>
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Variants

`variant` picks the render style — `bars` (the default), `rounded`, `line`, or `gradient`, whose ramp derives from `color` unless you pass `gradientColors`. `color` and `normalize` restyle the result without changing the peak data.

```tsx
import { Block, Text, Waveform } from '@plocks/ui';

import { QUIET_WAVEFORM_PEAKS, WAVEFORM_DEMO_PEAKS } from '../data';

const VARIANTS = ['bars', 'rounded', 'line', 'gradient'] as const;

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Block>
        {VARIANTS.map((variant) => (
          <Block key={variant} gap="xs">
            <Text variant="small">{variant}</Text>
            <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={64} progress={0.4} variant={variant} fullWidth />
          </Block>
        ))}
      </Block>

      <Block>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.25} color="primary" fullWidth />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.5} color="success" fullWidth />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.75} color="warning" fullWidth />
      </Block>

      <Block>
        <Block gap="xs">
          <Text variant="small">Default</Text>
          <Waveform peaks={QUIET_WAVEFORM_PEAKS} h={56} progress={0.45} color="surface" fullWidth />
        </Block>
        <Block gap="xs">
          <Text variant="small">normalize</Text>
          <Waveform peaks={QUIET_WAVEFORM_PEAKS} h={56} progress={0.45} normalize color="surface" fullWidth />
        </Block>
      </Block>
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Synchronized

Drive multiple waveforms from the same `progress` state so scrubbing either track keeps every timeline aligned.

```tsx
import { useState } from 'react';
import { Block, Text, Waveform } from '@plocks/ui';

import { TRACK_TWO_PEAKS, WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  const [progress, setProgress] = useState<number>(0.35);

  return (
    <Block fullWidth>
      <Block>
        <Text variant="small">Narration track</Text>
        <Waveform
          peaks={WAVEFORM_DEMO_PEAKS}
          progress={progress}
          h={80}
          fullWidth
          interactive
          onSeek={setProgress}
        />
      </Block>

      <Block>
        <Text variant="small">Background score</Text>
        <Waveform
          peaks={TRACK_TWO_PEAKS}
          progress={progress}
          h={80}
          fullWidth
          color="secondary"
          interactive
          onSeek={setProgress}
        />
      </Block>
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Audio playback

Drive the waveform from real playback: `expo-audio` reports the position of a bundled clip, `progress` follows it, and `onSeek` scrubs by calling `seekTo`. The `peaks` array was measured from the same file, so the bars match what you hear.

```tsx
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Block, Button, Waveform } from '@plocks/ui';

import { MELODY_PEAKS } from '../data';

const MELODY_SOURCE = require('../../../../assets/sounds/melody.mp3');

export function Demo() {
  const player = useAudioPlayer(MELODY_SOURCE);
  const status = useAudioPlayerStatus(player);

  const duration = status.duration || 0;
  const progress = duration > 0 ? Math.min(1, status.currentTime / duration) : 0;

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // Replay from the top instead of sitting at the end of a finished clip.
    if (status.didJustFinish || (duration > 0 && status.currentTime >= duration - 0.05)) {
      player.seekTo(0);
    }
    player.play();
  };

  const handleSeek = (position: number) => {
    if (duration > 0) {
      player.seekTo(position * duration);
    }
  };

  return (
    <Block fullWidth>
      <Waveform
        peaks={MELODY_PEAKS}
        progress={progress}
        h={96}
        fullWidth
        interactive
        onSeek={handleSeek}
        showProgressLine
        showTimeStamps
        duration={duration}
        accessibilityLabel="Arpeggio waveform"
        accessibilityHint="Tap or drag to seek within the clip"
      />

      <Button size="sm" onPress={togglePlayback}>
        {status.playing ? 'Pause' : 'Play'}
      </Button>
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Synced to video

Use the waveform as a scrub bar for a `Video`: `onTimeUpdate` feeds `progress`, and seeking on the waveform calls `seek()` on the video ref, so the two stay aligned in both directions.

```tsx
import { useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { Block, Waveform } from '@plocks/ui';
import { Video } from '@plocks/media';
import type { VideoRef, VideoState } from '@plocks/media';

import { CLIP_PEAKS } from '../data';

// `Video` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const CLIP_URL = Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri;

export function Demo() {
  const videoRef = useRef<VideoRef>(null);
  const [playback, setPlayback] = useState({ currentTime: 0, duration: 0 });

  const progress = playback.duration > 0 ? Math.min(1, playback.currentTime / playback.duration) : 0;

  // `duration` is 0 until metadata loads, so keep the last known value.
  const track = (state: VideoState) =>
    setPlayback((prev) => ({
      currentTime: state.currentTime,
      duration: state.duration || prev.duration,
    }));

  return (
    <Block w="100%" maw={640}>
      <Video
        ref={videoRef}
        source={{ url: CLIP_URL }}
        w="100%"
        aspectRatio={640 / 426}
        controls
        onLoad={track}
        onTimeUpdate={track}
        onDurationChange={(duration) => setPlayback((prev) => ({ ...prev, duration }))}
      />

      <Waveform
        peaks={CLIP_PEAKS}
        progress={progress}
        h={72}
        fullWidth
        interactive
        onSeek={(position) => videoRef.current?.seek(position * playback.duration)}
        showProgressLine
        showTimeStamps
        duration={playback.duration}
        accessibilityLabel="Waveform of the clip audio"
        accessibilityHint="Tap or drag to seek the video"
      />
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Interactive

Turn on the `interactive` prop and handle `onSeek`/drag callbacks to update shared playback progress as the user scrubs the waveform.

```tsx
import { useState } from 'react';
import { Block, Text, Waveform } from '@plocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  const [progress, setProgress] = useState<number>(0.2);

  return (
    <Block fullWidth>
      <Waveform
        peaks={WAVEFORM_DEMO_PEAKS}
        progress={progress}
        fullWidth
        h={72}
        interactive
        showProgressLine
        onSeek={setProgress}
        onDrag={setProgress}
        accessibilityLabel="Audio timeline"
        accessibilityHint="Drag or tap to seek"
      />

      <Text variant="small">Progress: {Math.round(progress * 100)}%</Text>
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.
