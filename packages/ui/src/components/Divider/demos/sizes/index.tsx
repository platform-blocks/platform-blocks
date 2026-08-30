import { Block, Divider, Text } from '@platform-blocks/react-ui-library';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" color="secondary">{size}</Text>
          <Divider size={size} />
        </Block>
      ))}

      <Block fullWidth>
        <Text variant="small" color="secondary">1 (numeric)</Text>
        <Divider size={1} />
      </Block>
    </Block>
  );
}
