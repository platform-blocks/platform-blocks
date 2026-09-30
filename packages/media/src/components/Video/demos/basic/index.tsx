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
