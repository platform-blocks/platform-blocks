import { useState } from 'react';
import { Block, Button, Lightbox, Row, Text } from '@plocks/ui';
import type { LightboxItem } from '@plocks/ui';

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
      <Lightbox
        opened={active === 'minimal'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        showThumbnails={false}
        showDownloadButton={false}
      />

      {/* `onDownload` replaces the built-in behaviour, so the host app decides what saving means. */}
      <Lightbox
        opened={active === 'custom'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        onDownload={(image: LightboxItem) => setDownloaded(image.title ?? image.id)}
        showMetadata
      />

      {downloaded ? (
        <Text size="sm" c="secondary">
          Downloaded {downloaded}
        </Text>
      ) : null}
    </Block>
  );
}
