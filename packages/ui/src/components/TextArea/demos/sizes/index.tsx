import { Block, Text, TextArea } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" colorVariant="secondary">{size}</Text>
          <TextArea size={size} rows={3} placeholder="Write a message" fullWidth />
        </Block>
      ))}
    </Block>
  );
}
