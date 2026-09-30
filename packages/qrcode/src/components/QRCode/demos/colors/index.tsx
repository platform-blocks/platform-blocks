import { Row, useTheme } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SCHEMES = ['primary', 'success', 'warning', 'error'] as const;

export function Demo() {
  const theme = useTheme();

  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {SCHEMES.map((scheme) => (
        <QRCode
          key={scheme}
          value="https://plocks.dev"
          size={144}
          color={theme.colors[scheme][6]}
          bg={theme.colors[scheme][0]}
          quietZone={2}
          label={scheme}
        />
      ))}
    </Row>
  );
}
