import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const spans = [6, 6, 4, 4, 4, 3, 3, 3, 3];

  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {spans.map((span, index) => (
          <GridItem key={`${span}-${index}`} span={span}>
            <Card>
              <Text>{`span=${span}`}</Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
      <Text size="sm" color="secondary">
        Mix spans within a 12-column grid to create varied layouts
      </Text>
    </Block>
  );
}
