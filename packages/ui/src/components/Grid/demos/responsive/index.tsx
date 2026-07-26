import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

// Responsive props match the breakpoint configuration used in Grid

export default function ResponsiveGridDemo() {
  return (
    <Block fullWidth>
      <Grid columns={{ base: 4, md: 8, lg: 12 }} gap={12}>
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card p={12}>
            <Text>Hero (4/8/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card p={12}>
            <Text>Hero (4/8/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card p={12}>
            <Text>Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card p={12}>
            <Text>Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 8, lg: 12 }}>
          <Card p={12}>
            <Text>Footer (4/8/12)</Text>
          </Card>
        </GridItem>
      </Grid>
      <Text size="sm" colorVariant="secondary">
        Column and span props adapt at base, md, and lg breakpoints
      </Text>
    </Block>
  );
}
