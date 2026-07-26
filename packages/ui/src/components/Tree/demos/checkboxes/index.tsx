import { useState } from 'react';

import { Tree } from '@platform-blocks/ui';

import { TREE_DATA } from './data';

export default function Demo() {
  const [checkedIds, setCheckedIds] = useState<string[]>(['react', 'css']);

  return (
    <Tree
      data={TREE_DATA}
      checkboxes
      cascadeCheck
      checkedIds={checkedIds}
      onCheckedChange={setCheckedIds}
      expandAll
    />
  );
}
