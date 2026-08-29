import { Block, Card, Flex, Text, useTheme } from '@platform-blocks/ui';

const ALIGNMENTS = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] as const;

export function Demo() {
  const theme = useTheme();
  // Baseline is only legible if each Text has a visible box; pull the fill from
  // the theme so it reads in both light and dark.
  const chip = { backgroundColor: theme.backgrounds.elevated, paddingHorizontal: 8 };

  return (
    // wrap="wrap" — five fixed-width examples in a row would overflow on narrow
    // viewports, since flex children don't shrink by default here.
    <Flex wrap="wrap" align="flex-start" gap="lg" fullWidth>
      {ALIGNMENTS.map((value) => (
        <Block key={value} gap="xs">
          <Text variant="span" size="sm" color="muted">align=&quot;{value}&quot;</Text>
          <Card variant="subtle" p="sm">
            {value === 'baseline' ? (
              <Flex direction="row" align="baseline" gap="sm" h={80}>
                {/* Text of varying sizes — their baselines line up, not their boxes */}
                <Text variant="span" size={24} style={chip}>Aa</Text>
                <Text variant="span" size={16} style={chip}>Bb</Text>
                <Text variant="span" size={12} style={chip}>Cc</Text>
              </Flex>
            ) : value === 'stretch' ? (
              <Flex direction="row" align={value} gap="sm" h={80}>
                {/* No fixed heights so children stretch to the container's cross-size */}
                <Card p="xs" style={{ minWidth: 32 }}><Text variant="small">1</Text></Card>
                <Card p="xs" style={{ minWidth: 32 }}><Text variant="small">2</Text></Card>
                <Card p="xs" style={{ minWidth: 32 }}><Text variant="small">3</Text></Card>
              </Flex>
            ) : (
              <Flex direction="row" align={value} gap="sm" h={80}>
                {/* Different heights to showcase flex-start/center/flex-end */}
                <Card p="xs" h={40}><Text variant="small">A</Text></Card>
                <Card p="xs" h={60}><Text variant="small">B</Text></Card>
                <Card p="xs" h={30}><Text variant="small">C</Text></Card>
              </Flex>
            )}
          </Card>
        </Block>
      ))}
    </Flex>
  );
}
