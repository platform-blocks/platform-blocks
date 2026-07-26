import { Block, Table, Text } from '@platform-blocks/ui';
import { data } from './data';

export default function Demo() {
  return (
    <Block>
      <Text size="sm" colorVariant="secondary">
        Provide the `data` prop to render the caption, header, and body automatically.
      </Text>
      <Table data={data} withTableBorder fullWidth />
    </Block>
  );
}
