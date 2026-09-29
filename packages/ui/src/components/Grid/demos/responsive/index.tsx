import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={{ base: 4, md: 8, lg: 12 }} gap="md">
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Hero (4/4/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Hero (4/4/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 8, lg: 12 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Footer (4/8/12)</Text>
          </Card>
        </GridItem>
      </Grid>
    </Block>
  );
}
