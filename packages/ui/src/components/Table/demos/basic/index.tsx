import { Block, Table, Text } from '@platform-blocks/react-ui-library';
import { data } from './data';

export function Demo() {
  return (
    <Block>
      <Text size="sm" color="secondary">
        Provide the `data` prop to render the caption, header, and body automatically.
      </Text>
      <Table data={data} withTableBorder fullWidth />
    </Block>
  );
}
