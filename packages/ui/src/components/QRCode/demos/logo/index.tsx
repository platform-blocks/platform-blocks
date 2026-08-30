import { QRCode, Row, useTheme } from '@platform-blocks/react-ui-library';
import { LOGO_EXAMPLES } from './data';

export function Demo() {
  const theme = useTheme();

  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {LOGO_EXAMPLES.map(({ label, value, moduleShape, cornerRadius, logo }) => (
        <QRCode
          key={label}
          value={value}
          size={176}
          moduleShape={moduleShape}
          cornerRadius={cornerRadius}
          quietZone={2}
          logo={{
            ...logo,
            backgroundColor: theme.backgrounds.surface
          }}
          label={label}
        />
      ))}
    </Row>
  );
}
