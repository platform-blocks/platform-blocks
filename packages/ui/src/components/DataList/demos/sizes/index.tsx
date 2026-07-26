import { Block, DataList, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" colorVariant="secondary">{size}</Text>
          <DataList size={size} labelWidth={90}>
            <DataList.Item label="Status" value="Active" />
            <DataList.Item label="Region" value="us-east-1" />
          </DataList>
        </Block>
      ))}
    </Block>
  );
}
