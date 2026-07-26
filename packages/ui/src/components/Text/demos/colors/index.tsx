import { Block, Card, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Semantic colors
          </Text>
          <Text colorVariant="primary">Primary color text</Text>
          <Text colorVariant="secondary">Secondary color text</Text>
          <Text colorVariant="muted">Muted color text</Text>
          <Text colorVariant="disabled">Disabled color text</Text>
          <Text colorVariant="link">Link color text</Text>
        </Block>
      </Card>

      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Custom palette
          </Text>
          <Text color="#ff6b6b">Custom red text</Text>
          <Text color="#4ecdc4">Custom teal text</Text>
          <Text color="#45b7d1">Custom blue text</Text>
          <Text color="#96ceb4">Custom green text</Text>
          <Text color="#feca57">Custom yellow text</Text>
        </Block>
      </Card>
    </Block>
  );
}





