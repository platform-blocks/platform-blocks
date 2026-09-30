import { Row } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SHAPES = ['square', 'rounded', 'diamond'] as const;

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {SHAPES.map((shape) => (
        <QRCode
          key={shape}
          value="https://plocks.dev"
          size={150}
          moduleShape={shape}
          quietZone={1}
          label={shape}
        />
      ))}
    </Row>
  );
}
