import { Block, Table, Text } from '@platform-blocks/ui';
import { columns, data } from './data';

export default function Demo() {
  return (
    <Block>
      <Text size="sm" colorVariant="secondary">
        Pass column sizing rules to control flex growth, widths, and minimums.
      </Text>
      <Table data={data} columns={columns} withTableBorder fullWidth />
    </Block>
  );
}
