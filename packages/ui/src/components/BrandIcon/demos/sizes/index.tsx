import { BrandIcon, Block, Row, Text } from '@platform-blocks/ui';
import type { BrandIconProps } from '@platform-blocks/ui';

const SIZES: BrandIconProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={String(size)} align="center">
          <BrandIcon brand="google" size={size} />
          <Text variant="small">{String(size)}</Text>
        </Block>
      ))}
    </Row>
  );
}