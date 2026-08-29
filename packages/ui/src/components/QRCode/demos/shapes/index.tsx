import { Block, QRCode, Row, Text } from '@platform-blocks/ui';
import { SHAPES } from './data';

export function Demo() {
  return (
    <Block>
      <Text variant="small" color="muted">
        Module geometry
      </Text>
      <Row gap="lg" wrap="wrap" justify="center">
        {SHAPES.map(({ label, value, moduleShape, cornerRadius }) => (
          <QRCode
            key={label}
            value={value}
            size={150}
            moduleShape={moduleShape}
            cornerRadius={cornerRadius}
            quietZone={1}
            label={label}
          />
        ))}
      </Row>
    </Block>
  );
}
