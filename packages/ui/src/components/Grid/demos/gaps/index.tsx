import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

const sections = [
  {
    label: 'Compact gap (xs)',
    props: { gap: 'xs' as const },
  },
  {
    label: 'Roomy gap (2xl)',
    props: { gap: '2xl' as const },
  },
  {
    label: 'Wide rows, tight columns',
    props: { rowGap: '2xl' as const, columnGap: 'xs' as const },
  },
];

export function Demo() {
  return (
    <Block fullWidth>
      {sections.map(({ label, props }) => (
        <Block key={label} fullWidth>
          <Text size="sm" fw="semibold">
            {label}
          </Text>
          <Grid columns={6} {...props}>
            {Array.from({ length: 12 }).map((_, index) => (
              <GridItem key={index} span={1}>
                <Card variant="outline">
                  <Text size="sm" ta="center">
                    Item {index + 1}
                  </Text>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Block>
      ))}
    </Block>
  );
}
