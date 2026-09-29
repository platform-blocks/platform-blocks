import { QRCode, Row } from '@platform-blocks/ui';

const SHAPES = ['square', 'rounded', 'diamond'] as const;

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {SHAPES.map((shape) => (
        <QRCode
          key={shape}
          value="https://platform-blocks.com"
          size={150}
          moduleShape={shape}
          quietZone={1}
          label={shape}
        />
      ))}
    </Row>
  );
}
