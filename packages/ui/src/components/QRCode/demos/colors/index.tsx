import { Block, QRCode, Row, Text, useTheme } from '@platform-blocks/ui';
import { SCHEMES } from './data';

export function Demo() {
  const theme = useTheme();

  return (
    <Block>
      <Text variant="small" color="muted">
        Theme-aligned palettes
      </Text>
      <Row gap="lg" wrap="wrap" justify="center">
        {SCHEMES.map(({ key, label }) => {
          const palette = theme.colors[key];
          const foreground = palette?.[6] ?? theme.colors.primary[6];
          const background = palette?.[0] ?? theme.backgrounds.surface;

          return (
            <QRCode
              key={key}
              value="https://platform-blocks.com"
              size={144}
              backgroundColor={background}
              color={foreground}
              quietZone={2}
              label={label}
            />
          );
        })}
      </Row>
    </Block>
  );
}
