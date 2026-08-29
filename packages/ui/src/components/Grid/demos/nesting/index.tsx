import { Block, Card, Grid, GridItem, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        <GridItem span={8}>
          <Card variant="outline">
            {/* Block's own gap separates the label from the nested grid — no
                margin on either one. */}
            <Block>
              <Text weight="semibold" size="sm">
                Parent span=8
              </Text>
              <Grid columns={6} gap="sm">
                {Array.from({ length: 6 }).map((_, index) => (
                  <GridItem key={index} span={2}>
                    <Card variant="filled" p="xs">
                      <Text size="xs" align="center">
                        Nested {index + 1}
                      </Text>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </Block>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card variant="outline">
            <Text weight="semibold" size="sm">
              Sidebar span=4
            </Text>
          </Card>
        </GridItem>
      </Grid>
      <Text size="sm" color="secondary">
        GridItem components can render another Grid to illustrate nested layouts
      </Text>
    </Block>
  );
}
