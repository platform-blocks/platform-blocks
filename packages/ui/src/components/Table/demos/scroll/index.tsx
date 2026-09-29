import { Block, Table } from '@platform-blocks/ui';

const columns = Array.from({ length: 12 }, (_, index) => `Col ${index + 1}`);

const body = Array.from({ length: 8 }, (_, rowIndex) =>
  columns.map((_, columnIndex) => `R${rowIndex + 1}C${columnIndex + 1}`)
);

export function Demo() {
  return (
    <Block fullWidth>
      <Table.ScrollContainer miw={900}>
        <Table
          data={{ head: columns, body, caption: 'Wide matrix sample' }}
          withTableBorder
          striped
        />
      </Table.ScrollContainer>
    </Block>
  );
}
