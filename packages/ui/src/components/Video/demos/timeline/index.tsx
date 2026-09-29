import { useState } from 'react';
import { Asset } from 'expo-asset';
import { Block, Text, Video } from '@platform-blocks/ui';
import type { VideoTimelineEvent } from '@platform-blocks/ui';

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
