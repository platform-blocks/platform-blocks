import { useState } from 'react';
import { Block, Button, Input, Row, Text, useDebouncedCallback } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [query, setQuery] = useState('');
  const [calls, setCalls] = useState<string[]>([]);

  const search = useDebouncedCallback((next: string) => {
    setCalls((prev) => [...prev, next]);
  }, 300);

  return (
    <Block>
      <Input
        label="Search"
        placeholder="Type fast…"
        description="Invocations are debounced by 300ms."
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          search(next);
        }}
      />
      <Row gap="sm" wrap="wrap">
        <Button variant="outline" onPress={() => search.cancel()}>Cancel pending</Button>
        <Button variant="ghost" onPress={() => search.flush()}>Flush now</Button>
        <Button variant="ghost" onPress={() => setCalls([])}>Reset log</Button>
      </Row>
      {calls.length ? (
        calls.map((call, index) => (
          <Text key={index} ff="monospace" size="sm">{`#${index + 1} → "${call}"`}</Text>
        ))
      ) : (
        <Text size="sm" color="muted">No invocations yet.</Text>
      )}
    </Block>
  );
}
