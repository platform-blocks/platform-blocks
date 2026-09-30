import { Block, Row } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block>
      <Row align="flex-end" gap="lg" wrap="wrap">
        {SIZES.map((size) => (
          <QRCode
            key={size}
            value="https://plocks.dev"
            size={size}
            quietZone={2}
            label={size}
          />
        ))}
      </Row>

      <QRCode
        value="https://plocks.dev"
        size={144}
        quietZone={2}
        label="144 (numeric)"
      />
    </Block>
  );
}
