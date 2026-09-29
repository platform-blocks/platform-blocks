import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {Array.from({ length: 12 }).map((_, index) => (
          <GridItem key={index} span={1}>
            <Card variant="outline">
              <Text size="sm" ta="center">
                {index + 1}
              </Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Block>
  );
}
