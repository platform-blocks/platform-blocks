# useMergedRef

Combine any number of object or callback refs into one stable callback ref, so a component can keep its own ref to a node and still honor the ref its parent forwarded.

## Metadata

- Import: `import { useMergedRef } from '@plocks/ui';`
- Tags: refs, forwardRef, composition
- Docs: https://plocks.dev/hooks/useMergedRef
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/utils/mergeRefs.ts

## Definition

```ts
export function useMergedRef<T>(...refs: Array<Ref<T> | undefined>);
```

## Examples

### Forward a ref and keep your own

`SearchField` keeps its own ref to the `TextInput` (it blurs itself when Enter is pressed) and forwards the parent's ref to the same node (the button focuses it). `useMergedRef(...refs)` accepts object refs, callback refs and `null` / `undefined` slots, and returns a callback ref whose identity only changes when one of the refs does, so React doesn't detach and re-attach the node on every render. Input, Checkbox, Radio, Tooltip and other library components use it to forward refs they also need internally.

```tsx
import { forwardRef, useRef } from 'react';
import type { TextInput } from 'react-native';
import { Block, Button, Input, useMergedRef } from '@plocks/ui';

const SearchField = forwardRef<TextInput, { placeholder?: string }>(function SearchField({ placeholder }, ref) {
  const ownRef = useRef<TextInput>(null);
  const mergedRef = useMergedRef(ownRef, ref);

  return <Input ref={mergedRef} placeholder={placeholder} onEnter={() => ownRef.current?.blur()} />;
});

export function Demo() {
  const searchRef = useRef<TextInput>(null);

  return (
    <Block align="flex-start" maw={360} fullWidth>
      <SearchField ref={searchRef} placeholder="Search" />
      <Button onPress={() => searchRef.current?.focus()}>Focus search</Button>
    </Block>
  );
}
```
