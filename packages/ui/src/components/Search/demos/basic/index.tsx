import { useState } from 'react';
import { Block, Search, Text } from '@platform-blocks/ui';

export function Demo() {
  const [query, setQuery] = useState('');

  return (
    <Block maxW={320} w="100%">
      <Search value={query} onChange={setQuery} placeholder="Search docs" />
      <Text size="xs" color="muted">
        Current query: {query || '—'}
      </Text>
    </Block>
  );
}
