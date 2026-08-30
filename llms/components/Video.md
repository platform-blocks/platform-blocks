# Video

A comprehensive video player component that supports YouTube videos, MP4 files, and file buffers with advanced timeline synchronization capabilities.

## Metadata

- Canonical name: `Video`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Video } from '@platform-blocks/react-ui-library';`
- Since: 1.0.0
- Category: media
- Docs: https://react-ui-library.com/components/Video
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Video

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `source` | VideoSource | Yes |  | Video source configuration |
| `w` | number \| string | No |  | Display and sizing |
| `h` | number \| string | No |  |  |
| `aspectRatio` | number | No |  |  |
| `poster` | string | No |  |  |
| `autoPlay` | boolean | No |  | Playback configuration |
| `loop` | boolean | No |  |  |
| `muted` | boolean | No |  |  |
| `volume` | number | No |  |  |
| `playbackRate` | VideoPlaybackRate | No |  |  |
| `quality` | VideoQuality | No |  |  |
| `controls` | boolean \| VideoControls | No |  | Controls configuration |
| `timeline` | VideoTimelineEvent[] | No |  | Timeline events for synchronization |
| `youtubeOptions` | { start?: number; end?: number; modestbranding?: boolean; rel?: boolean; iv_load_policy?: number; } | No |  | YouTube specific options |
| `onPlay` | (state: VideoState) => void | No |  | Event handlers |
| `onPause` | (state: VideoState) => void | No |  |  |
| `onSeek` | (time: number, state: VideoState) => void | No |  |  |
| `onTimeUpdate` | (state: VideoState) => void | No |  |  |
| `onDurationChange` | (duration: number) => void | No |  |  |
| `onVolumeChange` | (volume: number) => void | No |  |  |
| `onPlaybackRateChange` | (rate: VideoPlaybackRate) => void | No |  |  |
| `onQualityChange` | (quality: VideoQuality) => void | No |  |  |
| `onFullscreenChange` | (fullscreen: boolean) => void | No |  |  |
| `onError` | (error: string) => void | No |  |  |
| `onLoad` | (state: VideoState) => void | No |  |  |
| `onLoadStart` | () => void | No |  |  |
| `onBuffer` | (buffering: boolean) => void | No |  |  |
| `onTimelineEvent` | (event: VideoTimelineEvent, state: VideoState) => void | No |  |  |
| `style` | StyleProp<ViewStyle> | No |  | Styling |
| `videoStyle` | StyleProp<ImageStyle> | No |  |  |
| `controlsStyle` | StyleProp<ViewStyle> | No |  |  |
| `accessibilityLabel` | string | No |  | Accessibility |
| `testID` | string | No |  |  |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basic Playback
ID: `Video.basic` • Tags: video, playback, controls • Category: basics • Status: stable • Since: 1.0.0

Render `Video` with a local source, default transport controls, and custom buttons wired to the imperative ref for play, pause, and seeking.

```tsx
// `source.url` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const SOURCE = {
  url: Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri,
} as const;
  const videoRef = useRef<VideoRef>(null);
  const [status, setStatus] = useState('Ready');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const actions = useMemo(
    () => [
      { label: 'Play', onPress: () => videoRef.current?.play() },
      { label: 'Pause', onPress: () => videoRef.current?.pause() },
      { label: 'Skip to 4s', onPress: () => videoRef.current?.seek(4) },
      { label: 'Volume 50%', onPress: () => videoRef.current?.setVolume(0.5) },
  { label: 'Mute', onPress: () => videoRef.current?.setVolume(0) },
  { label: 'Unmute', onPress: () => videoRef.current?.setVolume(1) },
      { label: '1.5× speed', onPress: () => videoRef.current?.setPlaybackRate(1.5) },
      { label: 'Reset status', onPress: () => setStatus('Ready') },
    ],
    []
  );
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  };
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Combine default transport controls with imperative helpers to script playback, adjust volume, and toggle captions from surrounding UI.
        </Text>
        <Video
          ref={videoRef}
          source={SOURCE}
          w="100%"
          h={300}
          controls={{
            play: true,
            pause: true,
            progress: true,
            time: true,
            volume: true,
            fullscreen: true,
            playbackRate: true,
            quality: true,
            autoHide: true,
            autoHideTimeout: 3000,
          }}
          onPlay={() => setStatus('Playing')}
          onPause={() => setStatus('Paused')}
          onLoad={() => setStatus('Loaded')}
          onBuffer={(buffering) => setStatus(buffering ? 'Buffering…' : 'Playing')}
          onTimeUpdate={(state) => setCurrentTime(state.currentTime)}
          onDurationChange={(value) => setDuration(value)}
          onError={(error) => setStatus(`Error: ${error}`)}
        />
        <Block>
          <Text size="xs" color="secondary">
            Status: {status}
          </Text>
          {duration > 0 && (
            <Text size="xs" color="secondary">
              Progress: {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          )}
        </Block>
        <Row gap="sm" wrap="wrap">
          {actions.map((action) => (
            <Button key={action.label} size="xs" variant="outline" onPress={action.onPress}>
              {action.label}
            </Button>
          ))}
        </Row>
      </Block>
    </Card>
  );
}
```

### Timeline Events
ID: `Video.timeline` • Tags: video, timeline, events • Category: advanced • Status: stable • Since: 1.0.0

Pass `timeline` markers to fire callbacks at specific timestamps and keep a log of playback milestones without polling the player.

```tsx
// `source.url` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const SOURCE = {
  url: Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri,
} as const;
  const [log, setLog] = useState<string[]>([]);
  const timelineEvents = useMemo<VideoTimelineEvent[]>(
    () => [
      {
        id: 'intro',
        time: 2,
        type: 'chapter',
        data: { label: 'Introduction', description: 'Video introduction starts' },
        callback: (_, state) => {
          console.log('Introduction reached!', state.currentTime);
          setLog((entries) => [...entries, 'Reached introduction at 2s']);
        },
      },
      {
        id: 'main-content',
        time: 5,
        type: 'chapter',
        data: { label: 'Main content', description: 'Main content begins' },
        callback: (_, state) => {
          console.log('Main content reached!', state.currentTime);
          setLog((entries) => [...entries, 'Reached main content at 5s']);
        },
      },
    ],
    []
  );
  const handleTimelineEvent = (event: VideoTimelineEvent, state: VideoState) => {
    console.log('Timeline event triggered:', event.id, 'at time:', state.currentTime);
  };
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Attach `timeline` markers to run callbacks as playback crosses those timestamps. Use the `onTimelineEvent` hook for analytics or syncing UI.
        </Text>
        <Video
          source={SOURCE}
          w="100%"
          h={300}
          controls
          timeline={timelineEvents}
          onTimelineEvent={handleTimelineEvent}
        />
        <Block>
          <Text size="xs" color="secondary">
            Timeline log
          </Text>
          {log.length === 0 ? (
            <Text size="xs" color="secondary">
              Press play to fire registered markers.
            </Text>
          ) : (
            <Block>
              {log.map((entry, index) => (
                <Text key={`${entry}-${index}`} size="xs">
                  {entry}
                </Text>
              ))}
            </Block>
          )}
          {log.length > 0 && (
            <Button size="xs" variant="outline" onPress={() => setLog([])}>
              Clear log
            </Button>
          )}
        </Block>
      </Block>
    </Card>
  );
}
```

### YouTube Source
ID: `Video.youtube` • Tags: video, youtube, providers • Category: integrations • Status: stable • Since: 1.0.0

Point `Video` at a YouTube URL to stream hosted media while keeping the same control surface and status callbacks as native sources.

```tsx
const YOUTUBE_SOURCE = { youtube: 'dQw4w9WgXcQ' } as const;
  const [status, setStatus] = useState('Paused');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Stream YouTube content by pointing `source.youtube` to an ID. Playback state stays in sync so you can react to buffering or progress updates.
        </Text>
        <Video
          source={YOUTUBE_SOURCE}
          w={420}
          h={280}
          controls={{
            play: true,
            pause: true,
            progress: true,
            time: true,
            volume: true,
            fullscreen: true,
            playbackRate: true,
            quality: true,
          }}
          youtubeOptions={{
            modestbranding: true,
            rel: false,
          }}
          onPlay={() => setStatus('Playing')}
          onPause={() => setStatus('Paused')}
          onBuffer={(buffering) => setStatus(buffering ? 'Buffering…' : 'Playing')}
          onError={() => setStatus('Error')}
          onTimeUpdate={(state) => {
            setCurrentTime(state.currentTime);
            setDuration(state.duration);
          }}
        />
        <Row gap="sm" justify="space-between" align="center">
          <Text size="xs" color="secondary">
            Status: {status}
          </Text>
          <Text size="xs" color="secondary">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </Text>
        </Row>
        <Row gap="sm" wrap="wrap">
          <Button size="xs" variant="outline" onPress={() => setStatus('Paused')}>
            Reset status
          </Button>
        </Row>
      </Block>
    </Card>
  );
}
```
