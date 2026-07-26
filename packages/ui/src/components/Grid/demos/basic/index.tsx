import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

export default function BasicGridDemo() {
  return (
    <Block fullWidth>
      <Grid columns={12} gap={12}>
        {Array.from({ length: 12 }).map((_, index) => (
          <GridItem key={index} span={1}>
            <Card p={8} variant="outline">
              <Text size="sm" align="center">
                {index + 1}
              </Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
      <Text size="sm" colorVariant="secondary">
        Twelve even columns, each spanning a single track
      </Text>
    </Block>
  );
}
