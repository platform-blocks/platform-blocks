import { useMemo, useState } from 'react';
import { Asset } from 'expo-asset';
import { Block, Button, Card, Text, Video } from '@platform-blocks/ui';
import type { VideoTimelineEvent, VideoState } from '@platform-blocks/ui';

// `source.url` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const SOURCE = {
  url: Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri,
} as const;

export function Demo() {
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