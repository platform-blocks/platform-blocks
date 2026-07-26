import { Block, QRCode, Row } from '@platform-blocks/ui';
import { SIZES } from './data';

export default function Demo() {
  return (
    <Block>
      <Row align="flex-end" gap="lg" wrap="wrap">
        {SIZES.map((size) => (
          <QRCode
            key={size}
            value="https://platform-blocks.com"
            size={size}
            quietZone={2}
            label={size}
          />
        ))}
      </Row>

      <QRCode
        value="https://platform-blocks.com"
        size={144}
        quietZone={2}
        label="144 (numeric)"
      />
    </Block>
  );
}
