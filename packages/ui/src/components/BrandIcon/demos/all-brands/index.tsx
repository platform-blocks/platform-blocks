import { Block, BrandIcon, Grid, GridItem, Text } from '@platform-blocks/react-ui-library';
import { ALL_BRANDS } from '../data';

export function Demo() {
  return (
    <Grid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} gap="md" fullWidth>
      {ALL_BRANDS.map((brand) => (
        <GridItem key={brand} span={1}>
          <Block align="center">
            <BrandIcon brand={brand} size={36} />
            <Text align="center" size={10}>
              {brand}
            </Text>
          </Block>
        </GridItem>
      ))}
    </Grid>
  );
}
