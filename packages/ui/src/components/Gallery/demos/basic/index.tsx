import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Block, Gallery, Image, Row } from '@platform-blocks/ui';

import { SAMPLE_IMAGES } from './data';

export function Demo() {
  // `null` closes the gallery; any index opens it on that image.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {SAMPLE_IMAGES.map((image, index) => (
          <TouchableOpacity key={image.id} onPress={() => setOpenIndex(index)}>
            <Image src={image.uri} w={120} h={90} rounded resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </Row>

      <Gallery
        visible={openIndex !== null}
        images={SAMPLE_IMAGES}
        initialIndex={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        showMetadata
      />
    </Block>
  );
}
