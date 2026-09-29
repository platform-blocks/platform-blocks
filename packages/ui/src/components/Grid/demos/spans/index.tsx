import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

export function Demo() {
  const spans = [6, 6, 4, 4, 4, 3, 3, 3, 3];

  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {spans.map((span, index) => (
          <GridItem key={`${span}-${index}`} span={span}>
            <Card variant="outline">
              <Text size="sm" ta="center">{`span=${span}`}</Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Block>
  );
}
