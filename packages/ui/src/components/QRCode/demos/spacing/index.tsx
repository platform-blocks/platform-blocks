import { Block, QRCode, Text, useTheme } from '@platform-blocks/react-ui-library';
import { QUIET_ZONES } from './data';

export function Demo() {
  const theme = useTheme();

  return (
    <Block align="center">
      {QUIET_ZONES.map(({ label, quietZone }) => (
        <QRCode
          key={label}
          value="https://react-ui-library.com"
          size={150}
          quietZone={quietZone}
          label={label}
        />
      ))}
      <Block align="center">
        <Block bg={theme.backgrounds.subtle} radius="lg" p="sm">
          <QRCode
            value="https://react-ui-library.com"
            size={150}
            quietZone={0}
            m="xs"
          />
        </Block>
        <Text variant="small" color="muted">
          Use spacing props and container styling to pad the QR code externally.
        </Text>
      </Block>
    </Block>
  );
}
