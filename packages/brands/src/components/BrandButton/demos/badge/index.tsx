import { BrandButton } from '@plocks/brands';
import { Flex } from '@plocks/ui';

export function Demo() {
  return (
    <Flex>
      <BrandButton
        brand="app-store"
        primaryText="Download on the"
        secondaryText="App Store"
      />
      <BrandButton
        brand="google-play"
        primaryText="Get it on"
        secondaryText="Google Play"
      />
    </Flex>
  );
}
