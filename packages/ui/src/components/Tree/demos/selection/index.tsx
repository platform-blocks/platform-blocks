import { useState } from 'react';

import { Block, Text, Tree } from '@platform-blocks/ui';

import { TREE_DATA } from './data';

export function Demo() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <Block fullWidth>
      <Tree
        data={TREE_DATA}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        expandAll
      />

      <Text size="xs" color="secondary">
        {selectedIds.length === 0
          ? 'Click a row, shift-click for a range, or Cmd/Ctrl-click to toggle.'
          : `${selectedIds.length} selected`}
      </Text>
    </Block>
  );
}
