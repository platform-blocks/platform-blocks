import { Block, SegmentedControl, Text } from '@platform-blocks/ui';

import { frameworkNames } from '../data';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" colorVariant="secondary">{size}</Text>
          <SegmentedControl size={size} data={frameworkNames} defaultValue="React" />
        </Block>
      ))}
    </Block>
  );
}
