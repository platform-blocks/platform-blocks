import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

const sections = [
  {
    label: 'Compact gap (xs)',
    columns: 6,
    items: 12,
    props: { gap: 'xs' as const, rowGap: 6, columnGap: 6 },
  },
  {
    label: 'Roomy gap (24px)',
    columns: 6,
    items: 6,
    props: { gap: 24, rowGap: 24, columnGap: 12 },
  },
];

export default function GapsGridDemo() {
  return (
    <Block fullWidth>
      {sections.map(({ label, columns, items, props }) => (
        <Block key={label} fullWidth>
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Grid columns={columns} {...props}>
            {Array.from({ length: items }).map((_, index) => (
              <GridItem key={index} span={1}>
                <Card p={8}>
                  <Text size="sm">Item {index + 1}</Text>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Block>
      ))}
    </Block>
  );
}
