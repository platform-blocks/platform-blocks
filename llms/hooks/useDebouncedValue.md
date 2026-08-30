# useDebouncedValue

Derive a debounced copy of a changing value so renders and effects react only once it settles.

## Metadata

- Canonical name: `useDebouncedValue`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useDebouncedValue } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: state
- Tags: debounce, search, performance
- Docs: https://react-ui-library.com/hooks/useDebouncedValue
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useDebouncedValue

## Definition

```ts
export interface UseDebouncedValueOptions {
  /** Skip the initial debounce — first value is set immediately. Default: true. */
  leading?: boolean;
}

export function useDebouncedValue<T>(value: T, wait: number, options: UseDebouncedValueOptions = {}): [T, () => void];
```

## Examples

### Debounced search

`useDebouncedValue` is the declarative pattern: derive a debounced copy of state and read from it during render (or from a `useEffect` when a real side-effect is involved). Best when the consumer is React-driven. For imperative event handlers, use `useDebouncedCallback`.

```tsx
import { useMemo, useState } from 'react';
import { Badge, Block, DataList, Input, Row, Text, useDebouncedValue } from '@platform-blocks/react-ui-library';

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
```
