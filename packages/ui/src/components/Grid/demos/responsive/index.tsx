import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/react-ui-library';

// Responsive props match the breakpoint configuration used in Grid

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={{ base: 4, md: 8, lg: 12 }} gap="md">
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card>
            <Text>Hero (4/8/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card>
            <Text>Hero (4/8/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card>
            <Text>Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card>
            <Text>Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 8, lg: 12 }}>
          <Card>
            <Text>Footer (4/8/12)</Text>
          </Card>
        </GridItem>
      </Grid>
      <Text size="sm" color="secondary">
        Column and span props adapt at base, md, and lg breakpoints
      </Text>
    </Block>
  );
}
