# useDirection

Read the text direction (`dir`, `isRTL`) and switch it with `setDirection` or `toggleDirection`, for logic that has to know which way the layout runs. `PlocksProvider` mounts a `DirectionProvider` unless given `direction={false}`; outside one, the hook returns LTR with no-op setters instead of throwing.

## Metadata

- Import: `import { useDirection } from '@plocks/ui';`
- Tags: rtl, direction, layout, i18n
- Docs: https://plocks.dev/hooks/useDirection
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/providers/DirectionProvider.tsx

## Definition

```ts
export interface DirectionContextValue {
  /** Current text direction */
  dir: Direction;
  /** Whether current direction is RTL */
  isRTL: boolean;
  /** Set the text direction */
  setDirection: (direction: Direction) => void;
  /** Toggle between LTR and RTL */
  toggleDirection: () => void;
}

export type Direction = 'ltr' | 'rtl';

export function useDirection(): DirectionContextValue;
```

## Examples

### Toggle direction

`useDirection()` returns `{ dir, isRTL, setDirection, toggleDirection }`. Toggling here flips the whole docs site: on web the provider writes `dir` to `<html>`, while on native it calls `I18nManager.forceRTL`, which takes effect after an app reload. `DirectionProvider` accepts `initialDirection` (otherwise read from `<html dir>` or `I18nManager.isRTL`) plus an async `storage` controller and `storageKey` to persist the choice. Icons and layout props such as `start` / `end` already mirror on their own, so reach for `isRTL` only in logic like gesture math or value direction.

```tsx
import { Block, Button, DataList, useDirection } from '@plocks/ui';

export function Demo() {
  const { dir, isRTL, toggleDirection } = useDirection();

  return (
    <Block align="flex-start" maw={320}>
      <DataList
        labelWidth={80}
        data={[
          { label: 'dir', value: dir },
          { label: 'isRTL', value: String(isRTL) },
        ]}
      />
      <Button onPress={toggleDirection}>Switch to {isRTL ? 'LTR' : 'RTL'}</Button>
    </Block>
  );
}
```
