import { useState } from 'react';
import { Block, Button, Gallery, Row, Text } from '@platform-blocks/react-ui-library';
import type { GalleryItem } from '@platform-blocks/react-ui-library';

import { SAMPLE_IMAGES } from './data';

export function Demo() {
  const [active, setActive] = useState<'minimal' | 'custom' | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        <Button variant="outline" onPress={() => setActive('minimal')}>
          Minimal
        </Button>
        <Button variant="outline" onPress={() => setActive('custom')}>
          Custom download
        </Button>
      </Row>

      {/* Chrome stripped back to the image itself — swipe and arrow keys still navigate. */}
      <Gallery
        visible={active === 'minimal'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        showThumbnails={false}
        showDownloadButton={false}
      />

      {/* `onDownload` replaces the built-in behaviour, so the host app decides what saving means. */}
      <Gallery
        visible={active === 'custom'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        onDownload={(image: GalleryItem) => setDownloaded(image.title ?? image.id)}
        showMetadata
      />

      {downloaded ? (
        <Text size="sm" color="secondary">
          Downloaded {downloaded}
        </Text>
      ) : null}
    </Block>
  );
}
