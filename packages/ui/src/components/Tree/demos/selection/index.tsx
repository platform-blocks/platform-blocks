import { useState } from 'react';

import { Block, Text, Tree } from '@platform-blocks/ui';

import { TREE_DATA } from './data';

export default function Demo() {
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

      <Text size="xs" colorVariant="secondary">
        {selectedIds.length === 0
          ? 'Click a row, shift-click for a range, or Cmd/Ctrl-click to toggle.'
          : `${selectedIds.length} selected`}
      </Text>
    </Block>
  );
}
