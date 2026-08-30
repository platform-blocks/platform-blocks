import { Block, Table, Text } from '@platform-blocks/react-ui-library';
import { columns, data } from './data';

export function Demo() {
  return (
    <Block>
      <Text size="sm" color="secondary">
        Pass column sizing rules to control flex growth, widths, and minimums.
      </Text>
      <Table data={data} columns={columns} withTableBorder fullWidth />
    </Block>
  );
}
