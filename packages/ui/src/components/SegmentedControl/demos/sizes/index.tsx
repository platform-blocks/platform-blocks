import { Block, SegmentedControl, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" c="secondary">{size}</Text>
          <SegmentedControl size={size} data={['React', 'Angular', 'Vue']} defaultValue="React" />
        </Block>
      ))}
    </Block>
  );
}
