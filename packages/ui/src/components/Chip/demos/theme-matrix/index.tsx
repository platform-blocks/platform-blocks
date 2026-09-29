import { Block, Card, Chip, DARK_THEME, DEFAULT_THEME, PlatformBlocksThemeProvider, Row, Text } from '@platform-blocks/ui';
import type { ChipProps } from '@platform-blocks/ui';

const VARIANTS: NonNullable<ChipProps['variant']>[] = ['filled', 'outline', 'light', 'subtle', 'gradient'];

const ROWS = [
  { color: 'primary', label: 'Primary' },
  { color: 'secondary', label: 'Secondary' },
  { color: 'success', label: 'Success' },
  { color: 'warning', label: 'Warning' },
  { color: 'error', label: 'Error' },
  { color: 'gray', label: 'Gray' },
  { color: '#7C3AED', label: 'Custom' },
];

const LABEL_W = 78;
const CELL_W = 104;

function Matrix() {
  return (
    <Block>
      <Row gap="xs" align="center">
        <Text style={{ width: LABEL_W }}> </Text>
        {VARIANTS.map((variant) => (
          <Text key={variant} size="xs" c="muted" ta="center" style={{ width: CELL_W }}>
            {variant}
          </Text>
        ))}
      </Row>

      {ROWS.map(({ color, label }) => (
        <Row key={color} gap="xs" align="center">
          <Text size="xs" c="muted" style={{ width: LABEL_W }}>
            {label}
          </Text>
          {VARIANTS.map((variant) => (
            <Row key={variant} justify="center" style={{ width: CELL_W }}>
              <Chip variant={variant} color={color} size="sm">
                {label}
              </Chip>
            </Row>
          ))}
        </Row>
      ))}
    </Block>
  );
}

function Panel({ theme, title }: { theme: typeof DEFAULT_THEME; title: string }) {
  return (
    <PlatformBlocksThemeProvider theme={theme} inherit={false}>
      <Card
        withBorder
        padding="lg"
        radius="lg"
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: 380, minWidth: 300 }}
      >
        <Block fullWidth>
          <Text fw="600">{title}</Text>
          <Matrix />
        </Block>
      </Card>
    </PlatformBlocksThemeProvider>
  );
}

export function Demo() {
  return (
    <Row gap="md" wrap="wrap" align="stretch">
      <Panel theme={DEFAULT_THEME} title="Light surface" />
      <Panel theme={DARK_THEME} title="Dark surface" />
    </Row>
  );
}
