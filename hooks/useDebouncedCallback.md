# useDebouncedCallback

Wrap an imperative function in a stable debounced callback that exposes `cancel` and `flush`.

## Metadata

- Import: `import { useDebouncedCallback } from '@plocks/ui';`
- Tags: debounce, callback, performance
- Docs: https://plocks.dev/hooks/useDebouncedCallback
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useDebouncedCallback/useDebouncedCallback.ts

## Definition

```ts
export interface UseDebouncedCallbackReturn<F extends AnyFunction> {
  /** Call to schedule the wrapped function. Identity is stable across renders. */
  (...args: Parameters<F>): void;
  /** Cancel any pending invocation. */
  cancel: () => void;
  /** Run the wrapped function immediately with the most recent args. */
  flush: () => void;
}

export function useDebouncedCallback<F extends AnyFunction>(callback: F, wait: number): UseDebouncedCallbackReturn<F>;
```

## Examples

### Debounced typeahead

`useDebouncedCallback` debounces an *imperative* function. The returned wrapper has stable identity (safe for `useEffect` deps) and exposes `.cancel()` and `.flush()`. Use this when an event handler should fire a request after a quiet period — that's how `<AutoComplete>` does its search internally.

```tsx
import { useState } from 'react';
import { Block, Button, Input, Row, Text, useDebouncedCallback } from '@plocks/ui';

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
        <Text size="sm" c="muted">No invocations yet.</Text>
      )}
    </Block>
  );
}
```
