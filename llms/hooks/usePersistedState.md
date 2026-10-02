# usePersistedState

`useState` that survives reloads: the value is saved under a key in `localStorage` on the web (AsyncStorage on native when installed, or any storage you pass) and shared by every component using that key.

## Metadata

- Import: `import { usePersistedState } from '@plocks/ui';`
- Tags: state, storage, localStorage, persistence, AsyncStorage
- Docs: https://plocks.dev/hooks/usePersistedState
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/usePersistedState/usePersistedState.ts

## Definition

```ts
export interface UsePersistedStateOptions<T> {
  /**
   * Where to keep the value. Defaults to `localStorage` on the web and, on
   * native, `@react-native-async-storage/async-storage` when it is installed
   * (otherwise values live in memory until the app restarts). Pass a stable
   * object: one created during render is a new store every render.
   */
  storage?: PersistedStateStorage;
  /** Turns the value into the stored string. @default JSON.stringify */
  serialize?: (value: T) => string;
  /**
   * Turns the stored string back into a value. Throw to reject it (a stale
   * shape, a hand-edited entry); the default value is used instead.
   * @default JSON.parse
   */
  deserialize?: (raw: string) => T;
}

export type UsePersistedStateReturn<T> = readonly [
  T,
  Dispatch<SetStateAction<T>>,
  PersistedStateControls,
];

export interface PersistedStateStorage {
  getItem(key: string): string | null | undefined | Promise<string | null | undefined>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface PersistedStateControls {
  /** Deletes the stored value; the state falls back to the default value. */
  remove: () => void;
  /**
   * `false` until the stored value has been read: during static rendering and
   * hydration, and while an async storage (AsyncStorage) is loading. The state
   * shows the default value until then.
   */
  ready: boolean;
}

export function usePersistedState<T>(key: string, defaultValue: T, options: UsePersistedStateOptions<T> = {}): UsePersistedStateReturn<T>;
```

## Examples

### Remember a view setting

Pick a view, then reload the page: the choice is read back from `localStorage`. `usePersistedState(key, defaultValue, options?)` returns `[value, setValue, { remove, ready }]`. `setValue` takes a value or an updater like `useState`, and `remove()` deletes the stored value so the state falls back to the default.

Values are stored as JSON; pass `serialize` / `deserialize` to change that, and throw from `deserialize` to reject a stale or hand-edited value. `ready` is `false` during static rendering and hydration (the state shows the default so the markup matches) and while an async storage such as AsyncStorage is loading. Pass `storage` for anything else with `getItem` / `setItem` / `removeItem`, for example `sessionStorage` or an MMKV adapter.

```tsx
import { Block, Button, SegmentedControl, usePersistedState } from '@plocks/ui';

const VIEWS = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
  { label: 'Table', value: 'table' },
];

export function Demo() {
  const [view, setView, { remove }] = usePersistedState('plocks-demo:view', 'grid');

  return (
    <Block align="center" gap="sm">
      <SegmentedControl data={VIEWS} value={view} onChange={setView} />
      <Button size="sm" variant="subtle" onPress={remove}>
        Reset
      </Button>
    </Block>
  );
}
```
