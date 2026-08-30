import { Block, QRCode, Row, Text, useTheme } from '@platform-blocks/react-ui-library';
import { createGradientExamples } from './data';

export function Demo() {
  const theme = useTheme();
  const gradients = createGradientExamples(theme);

  return (
    <Block>
      <Text variant="small" color="muted">
        Gradient fills
      </Text>
      <Row gap="lg" wrap="wrap" justify="center">
        {gradients.map(({ label, value, gradient, moduleShape, cornerRadius }) => (
          <QRCode
            key={label}
            value={value}
            size={160}
            gradient={gradient}
            moduleShape={moduleShape}
            cornerRadius={cornerRadius}
            quietZone={2}
            label={label}
          />
        ))}
      </Row>
    </Block>
  );
}
