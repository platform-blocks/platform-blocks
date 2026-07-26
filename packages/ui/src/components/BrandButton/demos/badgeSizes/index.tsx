import { BrandButton, Block, Row, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function BadgeSizes() {
  return (
    <Row gap="lg" wrap="wrap" align="flex-end">
      {SIZES.map((size) => (
        <Block key={size} align="center" gap="xs">
          <BrandButton
            brand="app-store"
            primaryText="Download on the"
            secondaryText="App Store"
            size={size}
          />
          <Text variant="small" colorVariant="secondary">
            {size}
          </Text>
        </Block>
      ))}
    </Row>
  );
}
