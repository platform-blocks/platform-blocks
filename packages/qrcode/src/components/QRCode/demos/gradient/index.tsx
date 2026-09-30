import { Row, useTheme } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

export function Demo() {
  const theme = useTheme();

  return (
    <Row gap="lg" wrap="wrap" justify="center">
      <QRCode
        value="https://plocks.dev"
        size={160}
        quietZone={2}
        gradient={{ type: 'linear', from: theme.colors.primary[6], to: theme.colors.highlight[5], rotation: 45 }}
        label="linear"
      />
      <QRCode
        value="https://plocks.dev"
        size={160}
        quietZone={2}
        gradient={{ type: 'radial', from: theme.colors.success[5], to: theme.colors.primary[4] }}
        label="radial"
      />
    </Row>
  );
}
