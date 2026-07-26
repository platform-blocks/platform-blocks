import { Block, Table, Text } from '@platform-blocks/ui';
import { data } from './data';

export default function Demo() {
  return (
    <Block>
      <Text size="sm" colorVariant="secondary">
        Combine table, column, and row borders to separate dense numeric data.
      </Text>
      <Table
        data={data}
        withTableBorder
        withColumnBorders
        withRowBorders
        striped
        fullWidth
      />
    </Block>
  );
}
