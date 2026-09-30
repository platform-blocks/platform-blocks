import { Block, Grid, GridItem, Text } from '@plocks/ui';
import { BrandIcon, brandNames } from '@plocks/brands';

export function Demo() {
  return (
    <Grid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} gap="md" fullWidth>
      {brandNames.map((brand) => (
        <GridItem key={brand} span={1}>
          <Block align="center">
            <BrandIcon brand={brand} size={36} />
            <Text ta="center" size={10}>
              {brand}
            </Text>
          </Block>
        </GridItem>
      ))}
    </Grid>
  );
}
