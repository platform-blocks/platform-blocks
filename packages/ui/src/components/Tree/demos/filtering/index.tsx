import { useState } from 'react';

import { Block, Input, Tree } from '@platform-blocks/ui';

import { TREE_DATA } from './data';

export default function Demo() {
  const [filterQuery, setFilterQuery] = useState('');

  return (
    <Block fullWidth>
      <Input
        label="Search technologies"
        value={filterQuery}
        onChangeText={setFilterQuery}
        placeholder="Type to filter the tree"
      />

      <Tree
        data={TREE_DATA}
        filterQuery={filterQuery}
        hideFiltered
        expandAll={!!filterQuery}
      />
    </Block>
  );
}
