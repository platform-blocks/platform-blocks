import { useState } from 'react';
import { Block, Search, Text } from '@platform-blocks/ui';

export function Demo() {
  const [query, setQuery] = useState('');

  return (
    <Block maw={320} w="100%">
      <Search value={query} onChangeText={setQuery} placeholder="Search docs" />
      <Text size="xs" c="muted">
        Current query: {query || '—'}
      </Text>
    </Block>
  );
}
