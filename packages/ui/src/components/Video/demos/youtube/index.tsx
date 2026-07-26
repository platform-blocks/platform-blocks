import { useState } from 'react';
import { Block, Button, Card, Row, Text, Video } from '@platform-blocks/ui';

const YOUTUBE_SOURCE = { youtube: 'dQw4w9WgXcQ' } as const;

export default function Demo() {
  const [status, setStatus] = useState('Paused');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  return (
    <Card p="md">
      <Block>
        <Text size="sm" colorVariant="secondary">
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
          <Text size="xs" colorVariant="secondary">
            Status: {status}
          </Text>
          <Text size="xs" colorVariant="secondary">
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