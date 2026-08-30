# Waveform

Waveform component provides visualization and interaction capabilities for audio data, supporting various display modes and interactive features.

## Metadata

- Canonical name: `Waveform`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Waveform } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: media
- Tags: audio, waveform, visualization, media, interactive
- Docs: https://react-ui-library.com/components/Waveform
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Waveform

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `peaks` | number[] | Yes |  | Array of peak values (normalized between -1 and 1) |
| `w` | number | No |  | Width of the waveform |
| `h` | number | No |  | Height of the waveform |
| `color` | string | No |  | Color of the waveform |
| `variant` | 'bars' \| 'line' \| 'rounded' \| 'gradient' | No |  | Visual variant of the waveform |
| `size` | ComponentSizeValue | No | 'md' | Size token controlling height, bar width/gap, stroke width, and label type. Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which is read as the waveform height and scales the bar metrics proportionally. Individual props (`h`, `barWidth`, `barGap`, `strokeWidth`, `minBarHeight`) override the token they derive from. |
| `barWidth` | number | No |  | Width of individual bars (for bar variants) |
| `barGap` | number | No |  | Gap between bars (for bar variants) |
| `strokeWidth` | number | No |  | Stroke width for line variant |
| `gradientColors` | string[] | No |  | Colors for gradient variant |
| `progress` | number | No |  | Progress value (0-1) to show playback position |
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
ID: `Waveform.basic` • Tags: peaks, progress • Category: basics • Status: stable • Since: 1.0.0

Render a static waveform by passing the `peaks` array and update playback UI by adjusting the `progress` prop. Here a `Slider` drives that value directly — both use `fullWidth` so they share the container's width.

```tsx
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

### Full Width
ID: `Waveform.fullWidth` • Tags: responsive, fullWidth • Category: layout • Status: stable • Since: 1.0.0

Enable the `fullWidth` prop to let the waveform stretch to its container; wrap it in a constrained parent when you need a fixed width.

```tsx
return (
    <Block>
      <Block w="100%" maxW={320}>
        <Text variant="small">Fixed width waveform</Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={0.35} h={56} />
      </Block>
      <Block w="100%">
        <Text variant="small">`fullWidth` stretches to the container</Text>
        <Waveform
          peaks={WAVEFORM_DEMO_PEAKS}
          progress={0.6}
          h={56}
          fullWidth
          color="primary"
        />
      </Block>
    </Block>
  );
}
```

### Variants
ID: `Waveform.variants` • Tags: color, variant, normalize • Category: theming • Status: stable • Since: 1.0.0

`variant` picks the render style — `bars`, `rounded`, `line`, or `gradient` — and `color` and `normalize` restyle the result. All four are drawn from the same peak data.

```tsx
const VARIANTS = [
  { variant: 'bars', hint: 'Square bars — the default.' },
  { variant: 'rounded', hint: 'Bars with pill caps.' },
  { variant: 'line', hint: 'Continuous stroked path.' },
  { variant: 'gradient', hint: 'Bars filled with a color ramp.' },
] as const;
  return (
    <Block gap="lg">
      <Block gap="sm">
        <Text variant="small" weight="medium">
          Variant styles
        </Text>
        {VARIANTS.map(({ variant, hint }) => (
          <Block key={variant} gap="xs">
            <Row gap="xs" align="baseline" wrap="wrap">
              <Text variant="small" weight="medium">
                {variant}
              </Text>
              <Text size="xs" color="secondary">
                {hint}
              </Text>
            </Row>
            <Waveform
              peaks={WAVEFORM_DEMO_PEAKS}
              h={64}
              progress={0.4}
              variant={variant}
              color="primary"
            />
          </Block>
        ))}
        <Text size="xs" color="secondary">
          The gradient ramp is derived from `color`; pass `gradientColors` to
          supply your own stops.
        </Text>
      </Block>
      <Block gap="sm">
        <Text variant="small" weight="medium">
          Semantic colors
        </Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.25} color="primary" />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.5} color="success" />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.75} color="warning" />
      </Block>
      <Block gap="sm">
        <Text variant="small" weight="medium">
          Normalized quiet tracks
        </Text>
        <Waveform peaks={QUIET_WAVEFORM_PEAKS} h={56} progress={0.45} color="surface" />
        <Waveform
          peaks={QUIET_WAVEFORM_PEAKS}
          h={56}
          progress={0.45}
          normalize
          color="surface"
        />
      </Block>
    </Block>
  );
}
```

### Synchronized
ID: `Waveform.synchronized` • Tags: multi-track, shared-state • Category: advanced • Status: stable • Since: 1.0.0

Drive multiple waveforms from the same `progress` state so scrubbing either track keeps every timeline aligned.

```tsx
const CUE_POINTS: number[] = [0, 0.25, 0.5, 0.75, 1];
  const [progress, setProgress] = useState<number>(0.35);
  const handleSeek = (value: number) => {
    setProgress(value);
  };
  return (
    <Block>
      <Block>
        <Text variant="small">Narration track</Text>
        <Waveform
          peaks={WAVEFORM_DEMO_PEAKS}
          progress={progress}
          h={80}
          fullWidth
          color="primary"
          interactive
          onSeek={handleSeek}
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
          onSeek={handleSeek}
        />
      </Block>
      <Row gap="sm" wrap="wrap">
        {CUE_POINTS.map((value) => (
          <Button key={value} variant="outline" onPress={() => handleSeek(value)}>
            {Math.round(value * 100)}%
          </Button>
        ))}
      </Row>
      <Text variant="small">Shared progress: {Math.round(progress * 100)}%</Text>
    </Block>
  );
}
```

### Audio playback
ID: `Waveform.audioPlayback` • Tags: audio, expo-audio, progress, onSeek • Category: advanced • Status: stable • Since: 1.0.0

Drive the waveform from real playback: `expo-audio` reports the position of a bundled clip, `progress` follows it, and `onSeek` scrubs by calling `seekTo`. The `peaks` array was measured from the same file, so the bars match what you hear.

```tsx
const TRACKS = [
  {
    id: 'melody',
    label: 'Arpeggio',
    peaks: MELODY_PEAKS,
    source: require('../../../../assets/sounds/melody.mp3'),
  },
  {
    id: 'chime',
    label: 'Chime',
    peaks: CHIME_PEAKS,
    source: require('../../../../assets/sounds/chime.mp3'),
  },
  {
    id: 'rain',
    label: 'Rainfall',
    peaks: RAIN_PEAKS,
    source: require('../../../../assets/sounds/rain.mp3'),
  },
];
const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};
  const [index, setIndex] = useState(0);
  const track = TRACKS[index];
  // expo-audio rebuilds the player whenever the source changes, so selecting a
  // track loads that clip.
  const player = useAudioPlayer(track.source);
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
    <Block gap="sm">
      <Row gap="xs" wrap="wrap">
        {TRACKS.map((item, itemIndex) => (
          <Button
            key={item.id}
            size="sm"
            variant={itemIndex === index ? 'filled' : 'outline'}
            onPress={() => setIndex(itemIndex)}
          >
            {item.label}
          </Button>
        ))}
      </Row>
      <Waveform
        peaks={track.peaks}
        progress={progress}
        h={96}
        fullWidth
        variant="rounded"
        color="primary"
        interactive
        onSeek={handleSeek}
        showProgressLine
        showTimeStamps
        duration={duration}
        accessibilityLabel={`${track.label} waveform`}
        accessibilityHint="Tap or drag to seek within the clip"
      />
      <Row gap="sm" align="center" wrap="wrap">
        <Button size="sm" onPress={togglePlayback}>
          {status.playing ? 'Pause' : 'Play'}
        </Button>
        <Text variant="small" color="muted">
          {formatTime(status.currentTime)} / {formatTime(duration)}
        </Text>
      </Row>
    </Block>
  );
}
```

### Synced to video
ID: `Waveform.videoSync` • Tags: video, sync, progress, onSeek • Category: advanced • Status: stable • Since: 1.0.0

Use the waveform as a scrub bar for a `Video`: `onTimeUpdate` feeds `progress`, and seeking on the waveform calls `seek()` on the video ref, so the two stay aligned in both directions.

```tsx
// `Video` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const CLIP_URL = Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri;
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
    <Block gap="sm" w="100%" maxW={640}>
      <Video
        ref={videoRef}
        source={{ url: CLIP_URL }}
        w="100%"
        aspectRatio={640 / 426}
        controls
        muted={false}
        onLoad={track}
        onTimeUpdate={track}
        onDurationChange={(duration) => setPlayback((prev) => ({ ...prev, duration }))}
      />
      <Waveform
        peaks={CLIP_PEAKS}
        progress={progress}
        h={72}
        fullWidth
        color="primary"
        interactive
        onSeek={(position) => videoRef.current?.seek(position * playback.duration)}
        showProgressLine
        showTimeStamps
        duration={playback.duration}
        accessibilityLabel="Waveform of the clip audio"
        accessibilityHint="Tap or drag to seek the video"
      />
      <Text variant="small" color="muted">
        The peaks were measured from this clip's audio track. `onTimeUpdate` feeds `progress`, and
        scrubbing the waveform calls `seek()` on the video ref — so the two stay in step in both
        directions.
      </Text>
    </Block>
  );
}
```

### Interactive
ID: `Waveform.interactive` • Tags: interactive, onSeek, progress • Category: advanced • Status: stable • Since: 1.0.0

Turn on the `interactive` prop and handle `onSeek`/drag callbacks to update shared playback progress as the user scrubs the waveform.

```tsx
const SEEK_PRESETS: number[] = [0.25, 0.5, 0.75];
  const [progress, setProgress] = useState<number>(0.2);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const handleSeek = (value: number) => {
    setProgress(value);
  };
  return (
    <Block>
      <Waveform
        peaks={WAVEFORM_DEMO_PEAKS}
        progress={progress}
        fullWidth
        h={72}
        color="primary"
        interactive
        showProgressLine
        onSeek={handleSeek}
        onDragStart={() => setIsScrubbing(true)}
        onDrag={handleSeek}
        onDragEnd={(value) => {
          setIsScrubbing(false);
          handleSeek(value);
        }}
        accessibilityLabel="Audio timeline"
        accessibilityHint="Drag or tap to seek"
      />
      <Row gap="sm" wrap="wrap">
        {SEEK_PRESETS.map((value) => (
          <Button key={value} variant="outline" onPress={() => handleSeek(value)}>
            Jump to {Math.round(value * 100)}%
          </Button>
        ))}
      </Row>
      <Text variant="small">
        {isScrubbing ? 'Scrubbing…' : 'Progress:'} {Math.round(progress * 100)}%
      </Text>
    </Block>
  );
}
```
