import { BrandIcon, Block, Row, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="small" color="secondary">
          Authentic brand palettes
        </Text>
        <Row align="center" gap="md" wrap="wrap">
          <BrandIcon brand="google" size="xl" />
          <BrandIcon brand="facebook" size="xl" />
          <BrandIcon brand="apple" size="xl" />
          <BrandIcon brand="github" size="xl" />
          <BrandIcon brand="x" size="xl" />
        </Row>
      </Block>

      <Block>
        <Text variant="small" color="secondary">
          Custom blue
        </Text>
        <Row align="center" gap="md" wrap="wrap">
          <BrandIcon brand="google" size="xl" color="#1976D2" />
          <BrandIcon brand="facebook" size="xl" color="#1976D2" />
          <BrandIcon brand="apple" size="xl" color="#1976D2" />
          <BrandIcon brand="github" size="xl" color="#1976D2" />
          <BrandIcon brand="x" size="xl" color="#1976D2" />
        </Row>
      </Block>

      <Block>
        <Text variant="small" color="secondary">
          Custom red
        </Text>
        <Row align="center" gap="md" wrap="wrap">
          <BrandIcon brand="google" size="xl" color="#D32F2F" />
          <BrandIcon brand="facebook" size="xl" color="#D32F2F" />
          <BrandIcon brand="apple" size="xl" color="#D32F2F" />
          <BrandIcon brand="github" size="xl" color="#D32F2F" />
          <BrandIcon brand="x" size="xl" color="#D32F2F" />
        </Row>
      </Block>
    </Block>
  );
}
