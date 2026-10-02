# Video

Video plays video sources with playback controls and a seekable timeline.

## Metadata

- Import: `import { Video } from '@plocks/media';`
- Install: `npm install @plocks/media` — a separate package from `@plocks/ui`
- Docs: https://plocks.dev/components/Video
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/media/src/components/Video

## Props

- `source` (required): VideoSource — Video source configuration
- `aspectRatio`: number = 16 / 9 — Width / height ratio used when `w` or `h` is missing: with only one of them the other follows this ratio; with neither the player fills the width. @default 16 / 9
- `poster`: string
- `autoPlay`: boolean = false — Playback configuration
- `loop`: boolean = false
- `muted`: boolean = false
- `volume`: number = 1
- `playbackRate`: 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 = 1
- `quality`: 'auto' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' = 'auto'
- `controls`: boolean | VideoControls = true — Controls configuration
- `timeline`: VideoTimelineEvent[] = EMPTY_TIMELINE — Timeline events for synchronization
- `youtubeOptions`: { start?: number; end?: number; modestbranding?: boolean; rel?: boolean; iv_load_policy?: number; } — YouTube specific options
- `onPlay`: (state: VideoState) => void — Event handlers
- `onPause`: (state: VideoState) => void
- `onSeek`: (time: number, state: VideoState) => void
- `onTimeUpdate`: (state: VideoState) => void
- `onDurationChange`: (duration: number) => void
- `onVolumeChange`: (volume: number) => void
- `onPlaybackRateChange`: (rate: VideoPlaybackRate) => void
- `onQualityChange`: (quality: VideoQuality) => void — YouTube reported a quality change.
- `onFullscreenChange`: (fullscreen: boolean) => void — Entered / left fullscreen (web).
- `onError`: (error: string) => void
- `onLoad`: (state: VideoState) => void
- `onLoadStart`: () => void
- `onBuffer`: (buffering: boolean) => void
- `onTimelineEvent`: (event: VideoTimelineEvent, state: VideoState) => void
- `videoStyle`: StyleProp<ImageStyle> — Styling
- `controlsStyle`: StyleProp<ViewStyle>
- `accessibilityLabel`: string — Accessible name of the video (default "Video player")
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type VideoSource = {
  /** Video URL (mp4, webm, etc.) */
  url?: string;
  /** YouTube video ID or URL */
  youtube?: string;
  /** File buffer (for React Native) */
  buffer?: ArrayBuffer | string;
  /** MIME type for buffer */
  type?: string;
};

export interface VideoControls {
  /** Show/hide play button */
  play?: boolean;
  /** Show/hide pause button */
  pause?: boolean;
  /** Show/hide progress bar */
  progress?: boolean;
  /** Show/hide time display */
  time?: boolean;
  /** Show/hide volume control */
  volume?: boolean;
  /** Show/hide fullscreen toggle */
  fullscreen?: boolean;
  /** Show/hide playback speed control */
  playbackRate?: boolean;
  /** Auto-hide controls after inactivity */
  autoHide?: boolean;
  /** Auto-hide timeout in milliseconds */
  autoHideTimeout?: number;
}

export interface VideoTimelineEvent {
  /** Event ID */
  id: string;
  /** Time in seconds when event should trigger */
  time: number;
  /** Event type */
  type: 'marker' | 'chapter' | 'annotation' | 'cue' | 'custom';
  /** Event data */
  data?: VideoTimelineEventData;
  /** Callback function */
  callback?: (event: VideoTimelineEvent, state: VideoState) => void;
}

export interface VideoState {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Is video playing */
  playing: boolean;
  /** Is video loading */
  loading: boolean;
  /** Is video muted */
  muted: boolean;
  /** Volume level (0-1) */
  volume: number;
  /** Current playback rate */
  playbackRate: VideoPlaybackRate;
  /** Is video in fullscreen */
  fullscreen: boolean;
  /** Video quality (YouTube) */
  quality: VideoQuality;
  /** Error state */
  error: string | null;
  /** Is video buffering */
  buffering: boolean;
}

export type VideoPlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export type VideoQuality = 'auto' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres';

export interface VideoTimelineEventData {
  title?: string;
  label?: string;
  [key: string]: unknown;
}
```

## Examples

### Basics

Render `Video` with a local source, default transport controls, and custom buttons wired to the imperative ref for play, pause, and seeking.

```tsx
import { useRef } from 'react';
import { Asset } from 'expo-asset';
import { Block, Button, Row } from '@plocks/ui';
import { Video } from '@plocks/media';
import type { VideoRef } from '@plocks/media';

// `source.url` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const SOURCE = {
  url: Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri,
} as const;

export function Demo() {
  const videoRef = useRef<VideoRef>(null);

  return (
    <Block fullWidth>
      <Video ref={videoRef} source={SOURCE} />
      <Row gap="sm">
        <Button size="xs" variant="outline" onPress={() => videoRef.current?.play()}>
          Play
        </Button>
        <Button size="xs" variant="outline" onPress={() => videoRef.current?.pause()}>
          Pause
        </Button>
        <Button size="xs" variant="outline" onPress={() => videoRef.current?.seek(4)}>
          Skip to 4s
        </Button>
      </Row>
    </Block>
  );
}
```

### Timeline Events

Pass `timeline` markers to fire callbacks at specific timestamps and keep a log of playback milestones without polling the player.

```tsx
import { useState } from 'react';
import { Asset } from 'expo-asset';
import { Block, Text } from '@plocks/ui';
import { Video } from '@plocks/media';
import type { VideoTimelineEvent } from '@plocks/media';

// `source.url` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const SOURCE = {
  url: Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri,
} as const;

export function Demo() {
  const [log, setLog] = useState<string[]>([]);

  const timeline: VideoTimelineEvent[] = [
    {
      id: 'intro',
      time: 2,
      type: 'chapter',
      data: { title: 'Introduction' },
      callback: () => setLog((entries) => [...entries, 'Reached introduction at 2s']),
    },
    {
      id: 'main-content',
      time: 5,
      type: 'chapter',
      data: { title: 'Main content' },
      callback: () => setLog((entries) => [...entries, 'Reached main content at 5s']),
    },
  ];

  return (
    <Block fullWidth>
      <Video source={SOURCE} timeline={timeline} />
      {log.map((entry, index) => (
        <Text key={`${entry}-${index}`} size="xs">
          {entry}
        </Text>
      ))}
    </Block>
  );
}
```

### YouTube Source

Set `source.youtube` to a YouTube video ID or URL to stream hosted media with the same controls as native sources.

```tsx
import { Block } from '@plocks/ui';
import { Video } from '@plocks/media';

export function Demo() {
  return (
    <Block fullWidth>
      <Video source={{ youtube: 'dQw4w9WgXcQ' }} />
    </Block>
  );
}
```
