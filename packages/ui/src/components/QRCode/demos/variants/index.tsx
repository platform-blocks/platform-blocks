import { Block, QRCode, Row, Text } from '@platform-blocks/ui';
import { ERROR_LEVELS, QUIET_ZONES } from './data';

export default function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="small" colorVariant="muted">
          Error correction levels
        </Text>
        <Row gap="lg" wrap="wrap" justify="center">
          {ERROR_LEVELS.map(({ label, value }) => (
            <QRCode
              key={value}
              value={`https://platform-blocks.com/ecc/${value}`}
              errorCorrectionLevel={value}
              size={140}
              label={label}
            />
          ))}
        </Row>
      </Block>
      <Block>
        <Text variant="small" colorVariant="muted">
          Quiet zone widths
        </Text>
        <Row gap="lg" wrap="wrap" justify="center">
          {QUIET_ZONES.map((quietZone) => (
            <QRCode
              key={quietZone}
              value={`https://platform-blocks.com/quiet-zone/${quietZone}`}
              quietZone={quietZone}
              size={140}
              label={`Quiet zone: ${quietZone}`}
            />
          ))}
        </Row>
      </Block>
    </Block>
  );
}
