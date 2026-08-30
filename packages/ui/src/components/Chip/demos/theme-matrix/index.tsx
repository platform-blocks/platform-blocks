import { Block, Card, Chip, DARK_THEME, DEFAULT_THEME, PlatformBlocksThemeProvider, Row, Text } from '@platform-blocks/react-ui-library';
import type { ChipProps } from '@platform-blocks/react-ui-library';

const VARIANTS: NonNullable<ChipProps['variant']>[] = [
  'filled',
  'outline',
  'light',
  'subtle',
  'gradient',
]

// Core palette colors plus one raw custom color, to prove the resolver works for both.
const ROWS: { color: string; label: string }[] = [
  { color: 'primary', label: 'Primary' },
  { color: 'secondary', label: 'Secondary' },
  { color: 'success', label: 'Success' },
  { color: 'warning', label: 'Warning' },
  { color: 'error', label: 'Error' },
  { color: 'gray', label: 'Gray' },
  { color: '#7C3AED', label: 'Custom' },
]

const LABEL_W = 78
const CELL_W = 104

// A single chip with a leading status dot. The dot defaults to the chip's own
// resolved text color, so the indicator stays legible across every variant +
// scheme without any per-cell color plumbing.
function ChipCell({ variant, color, label }: { variant: NonNullable<ChipProps['variant']>; color: string; label: string }) {
  return (
    <Row justify="center" style={{ width: CELL_W }}>
      <Chip variant={variant} color={color} size="sm" dot>
        {label}
      </Chip>
    </Row>
  )
}

function Matrix() {
  return (
    <Block fullWidth={false}>
      {/* Column headers */}
      <Row gap="xs" align="center">
        <Text style={{ width: LABEL_W }}> </Text>
        {VARIANTS.map((v) => (
          <Text
            key={v}
            size="xs"
            color="muted"
            align="center"
            style={{ width: CELL_W }}
          >
            {v}
          </Text>
        ))}
      </Row>

      {ROWS.map(({ color, label }) => (
        <Row key={color} gap="xs" align="center">
          <Text size="xs" color="muted" style={{ width: LABEL_W }}>
            {label}
          </Text>
          {VARIANTS.map((v) => (
            <ChipCell key={v} variant={v} color={color} label={label} />
          ))}
        </Row>
      ))}
    </Block>
  )
}

function Panel({
  theme,
  title,
  surface,
}: {
  theme: typeof DEFAULT_THEME
  title: string
  surface: string
}) {
  return (
    <PlatformBlocksThemeProvider theme={theme} inherit={false}>
      <Card
        withBorder
        padding="lg"
        radius="lg"
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: 380, minWidth: 300 }}
      >
        <Block fullWidth>
          <Row justify="space-between" align="baseline">
            <Text weight="600">{title}</Text>
            <Text size="xs" color="muted">
              {surface}
            </Text>
          </Row>
          <Matrix />
        </Block>
      </Card>
    </PlatformBlocksThemeProvider>
  )
}

export function Demo() {
  // Two panels, each locked to a scheme, so every variant can be read side by side
  // on the real light and dark surfaces. Text is resolved by measured contrast, so
  // every variant stays legible on both.
  return (
    <Row gap="md" wrap="wrap" align="stretch">
      <Panel theme={DEFAULT_THEME} title="Light surface" surface="#FFFFFF" />
      <Panel theme={DARK_THEME} title="Dark surface" surface="#1C1C1E" />
    </Row>
  )
}
