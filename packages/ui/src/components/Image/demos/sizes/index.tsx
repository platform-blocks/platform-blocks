import { Block, Image, Row, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

/** Inline 8x8 PNG — keeps the demo offline and identical on web and native. */
const SAMPLE_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAALklEQVR42mNITvsIR409P+CIAasokMuAVRQqgSkKksAqiiKB5goGrKJQCawuBgC2Wnfh+zNA9wAAAABJRU5ErkJggg==';

export function Demo() {
  return (
    <Row align="flex-end" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Image src={SAMPLE_SRC} size={size} radius="md" alt={`Sample image at ${size}`} />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
