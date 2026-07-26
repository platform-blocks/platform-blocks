import { Block, Divider, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" colorVariant="secondary">{size}</Text>
          <Divider size={size} />
        </Block>
      ))}

      <Block fullWidth>
        <Text variant="small" colorVariant="secondary">1 (numeric)</Text>
        <Divider size={1} />
      </Block>
    </Block>
  );
}
