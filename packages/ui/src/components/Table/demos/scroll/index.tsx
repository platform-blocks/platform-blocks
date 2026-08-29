import { Block, Table, Text } from '@platform-blocks/ui';
import { body, columns } from './data';

export function Demo() {
  return (
    <Block>
      <Text size="sm" color="secondary">
        Wrap wide datasets in `Table.ScrollContainer` to enable horizontal scrolling.
      </Text>
      <Table.ScrollContainer minW={900}>
        <Table
          data={{ head: columns, body, caption: 'Wide matrix sample (scroll to explore)' }}
          withTableBorder
          striped
        />
      </Table.ScrollContainer>
    </Block>
  );
}
