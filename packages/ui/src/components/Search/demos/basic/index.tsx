import { useState } from 'react';
import { Block, Search, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [query, setQuery] = useState('');

  return (
    <Block maxW={320} w="100%">
      <Search value={query} onChange={setQuery} placeholder="Search docs" />
      <Text size="xs" colorVariant="muted">
        Current query: {query || '—'}
      </Text>
    </Block>
  );
}
