import { Block, QRCode, Row, Text } from '@platform-blocks/react-ui-library';
import { ERROR_LEVELS, QUIET_ZONES } from './data';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Error correction levels
        </Text>
        <Row gap="lg" wrap="wrap" justify="center">
          {ERROR_LEVELS.map(({ label, value }) => (
            <QRCode
              key={value}
              value={`https://react-ui-library.com/ecc/${value}`}
              errorCorrectionLevel={value}
              size={140}
              label={label}
            />
          ))}
        </Row>
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Quiet zone widths
        </Text>
        <Row gap="lg" wrap="wrap" justify="center">
          {QUIET_ZONES.map((quietZone) => (
            <QRCode
              key={quietZone}
              value={`https://react-ui-library.com/quiet-zone/${quietZone}`}
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
