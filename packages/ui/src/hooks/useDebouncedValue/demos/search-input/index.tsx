import { useMemo, useState } from 'react';
import { Badge, Block, DataList, Input, Row, Text, useDebouncedValue } from '@platform-blocks/ui';

const PACKAGES = ['react', 'react native', 'redux', 'rxjs', 'remix', 'rollup'];

export function Demo() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);

  // Derived from the debounced value, so filtering skips intermediate keystrokes.
  const hits = useMemo(
    () => (debouncedQuery ? PACKAGES.filter((name) => name.includes(debouncedQuery.toLowerCase())) : []),
    [debouncedQuery]
  );

  return (
    <Block>
      <Input
        label="Search packages"
        placeholder="Type to filter…"
        value={query}
        onChangeText={setQuery}
      />
      <DataList
        labelWidth={150}
        data={[
          { label: 'Live', value: query || '—' },
          { label: 'Debounced (300ms)', value: debouncedQuery || '—' }
        ]}
      />
      {hits.length ? (
        <Row gap="xs" wrap="wrap">
          {hits.map((hit) => (
            <Badge key={hit} variant="light">{hit}</Badge>
          ))}
        </Row>
      ) : (
        <Text size="sm" color="muted">No matches.</Text>
      )}
    </Block>
  );
}
