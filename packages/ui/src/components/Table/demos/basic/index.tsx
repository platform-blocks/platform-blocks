import { Block, Table } from '@plocks/ui';

const data = {
  caption: 'User accounts overview',
  head: ['Name', 'Role', 'Status', 'Posts'],
  body: [
    ['Alice', 'Admin', 'Active', 128],
    ['Bob', 'Editor', 'Invited', 42],
    ['Carol', 'Viewer', 'Active', 5],
    ['Dave', 'Editor', 'Suspended', 16],
  ],
};

export function Demo() {
  return (
    <Block fullWidth>
      <Table data={data} withTableBorder />
    </Block>
  );
}
