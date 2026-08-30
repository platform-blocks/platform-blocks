import { Block, QRCode, Row } from '@platform-blocks/react-ui-library';
import { SIZES } from './data';

export function Demo() {
  return (
    <Block>
      <Row align="flex-end" gap="lg" wrap="wrap">
        {SIZES.map((size) => (
          <QRCode
            key={size}
            value="https://react-ui-library.com"
            size={size}
            quietZone={2}
            label={size}
          />
        ))}
      </Row>

      <QRCode
        value="https://react-ui-library.com"
        size={144}
        quietZone={2}
        label="144 (numeric)"
      />
    </Block>
  );
}
