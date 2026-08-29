import { useState } from 'react';

import { Block, Icon, Input, Text } from '@platform-blocks/ui';

export function Demo() {
  const [workspace, setWorkspace] = useState('');
  const [search, setSearch] = useState('');

  return (
    <Block>
      <Input
        label="URL"
        placeholder="my-workspace"
        value={workspace}
        onChangeText={setWorkspace}
        startSection={<Text ff="monospace" color="muted">https://</Text>}
        startSectionProps={{ style: { paddingRight: 8 } }}
      />

      <Input
        label="Search"
        placeholder="Find anything…"
        value={search}
        onChangeText={setSearch}
        clearable
        placeholderTextColor="#a855f7"
        startSection={<Icon name="search" size={16} />}
        startSectionProps={{ style: { paddingRight: 8 } }}
      />
    </Block>
  );
}
