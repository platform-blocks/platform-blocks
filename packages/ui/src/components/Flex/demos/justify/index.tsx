import { Block, Card, Flex, Text, useTheme, type FlexProps } from '@platform-blocks/ui';

const JUSTIFY_OPTIONS: Array<{ label: string; value: NonNullable<FlexProps['justify']> }> = [
  { label: 'Start', value: 'flex-start' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'flex-end' },
  { label: 'Between', value: 'space-between' },
  { label: 'Around', value: 'space-around' },
  { label: 'Evenly', value: 'space-evenly' },
];

export function Demo() {
  const theme = useTheme();

  return (
    <Block align="stretch">
      {JUSTIFY_OPTIONS.map(({ value }) => (
        <Block key={value} align="stretch">
          <Text variant="span" size="sm" c="muted">justify="{value}"</Text>
          <Flex
            direction="row"
            justify={value}
            mih={60}
            style={{
              // Give the row a large track to clearly expose free space
              width: 600,
              maxWidth: '100%',
              borderWidth: 1,
              borderStyle: 'dashed' as const,
              // Without an explicit color the dashed track falls back to black
              // in both themes.
              borderColor: theme.backgrounds.border,
              borderRadius: 4
            }}
          >
            {/* Small fixed squares with no shrink so free space is obvious */}
            <Card padding={0} style={{ width: 40, height: 40, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="small">A</Text>
            </Card>
            <Card padding={0} style={{ width: 40, height: 40, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="small">B</Text>
            </Card>
            <Card padding={0} style={{ width: 40, height: 40, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="small">C</Text>
            </Card>
          </Flex>
        </Block>
      ))}
    </Block>
  );
}
