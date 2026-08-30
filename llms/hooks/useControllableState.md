# useControllableState

Back a value-bearing component with either a controlled `value` prop or internal state, decided by one call.

## Metadata

- Canonical name: `useControllableState`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useControllableState } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 0.11.0
- Category: state
- Tags: state, controlled, uncontrolled, forms
- Docs: https://react-ui-library.com/hooks/useControllableState
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useControllableState

## Definition

```ts
export interface UseControllableStateOptions<T> {
  /**
   * The controlled value. When this is anything other than `undefined` the
   * component is controlled: internal state is never written, and `setValue`
   * only reports the requested value through `onChange`.
   */
  value?: T;
  /**
   * Initial value used while uncontrolled. Accepts a factory, like `useState`,
   * for defaults that are expensive or must not be recomputed every render
   * (`() => new Date()`, a value read back from storage, …).
   *
   * Same caveat as `useState`: a `T` that is itself a function must be wrapped
   * in a factory, since a function argument is always treated as one.
   */
  defaultValue?: T | (() => T);
  /**
   * Value used while uncontrolled when `defaultValue` is also `undefined` —
   * the component's own "empty" value (`''`, `0`, `false`, `[]`, …).
   */
  finalValue?: T;
  /**
   * Called with every requested value, in both modes, synchronously from the
   * caller's event handler. Extra arguments passed to `setValue` are forwarded
   * after the value, so component-specific payloads survive.
   */
  onChange?: (value: T, ...payload: any[]) => void;
}

export type UseControllableStateReturn<T> = readonly [
  /** The value to render — the controlled prop, or internal state. */
  T,
  /** Request a new value. Accepts a value or an updater function. */
  (next: ControllableStateAction<T>, ...payload: any[]) => void,
  /** `true` while the `value` prop is driving the component. */
  boolean,
];

export type ControllableStateAction<T> = T | ((previous: T) => T);

export function useControllableState<T>({ value, defaultValue, finalValue, onChange, }: UseControllableStateOptions<T>): UseControllableStateReturn<T>;
```

## Examples

### Controlled and uncontrolled

`useControllableState` replaces the hand-rolled `isControlled` + `internalValue` + sync-effect trio with one call. A component is **controlled** when its `value` prop is anything other than `undefined` — the parent owns the value and the hook never writes internal state. Otherwise it is **uncontrolled**, and the hook keeps the value in `useState`, seeded from `defaultValue` (falling back to `finalValue`).

The same `StarPicker` is rendered twice below: once with only `defaultValue`, once with `value` + `onChange`.

## Signature

```ts
const [value, setValue, isControlled] = useControllableState({
  value: props.value,           // controlled value (undefined ⇒ uncontrolled)
  defaultValue: props.defaultValue,
  finalValue: 0,                // fallback when neither is provided
  onChange: props.onChange,
});
```

## Behavior

- `onChange` fires **synchronously** from your event handler in both modes — not from an effect — so callbacks land before paint.
- `setValue` accepts a value or an updater function, like `useState`. Several updater calls inside one handler compose against each other.
- Extra arguments are forwarded to `onChange` after the value: `setValue(next, { source: 'keyboard' })` calls `onChange(next, { source: 'keyboard' })`.
- `setValue` is referentially stable for the component's lifetime — safe in dependency arrays and memoized context values.
- Switching controlled → uncontrolled mid-life seeds internal state with the last controlled value so the UI holds its position. Any mode switch logs a warning in development.

## See also

- `useDisclosure` — the boolean-only case, with `open` / `close` / `toggle`
- `useDebouncedValue` — debounce a value before acting on it

```tsx
import { useState } from 'react';
import { Badge, Block, Button, Rating, Row, Text, useControllableState } from '@platform-blocks/react-ui-library';

interface StarPickerProps {
  /** Controlled value. Passing this hands ownership to the parent. */
  value?: number;
  /** Initial value while uncontrolled. */
  defaultValue?: number;
  onChange?: (value: number) => void;
}

/** One component that supports both modes — the hook decides which is active. */
function StarPicker({ value, defaultValue, onChange }: StarPickerProps) {
  const [rating, setRating, isControlled] = useControllableState({
    value,
    defaultValue,
    finalValue: 0,
    onChange
  });

  return (
    <Row gap="sm" align="center">
      <Rating value={rating} onChange={setRating} />
      <Badge variant="light" color={isControlled ? 'primary' : 'gray'}>
        {isControlled ? 'controlled' : 'uncontrolled'}
      </Badge>
    </Row>
  );
}

export function Demo() {
  const [rating, setRating] = useState(3);

  return (
    <Block gap="lg">
      <Block gap="xs">
        <Text size="sm" color="muted">No value prop — the hook keeps the rating in internal state.</Text>
        <StarPicker defaultValue={2} />
      </Block>

      <Block gap="xs">
        <Text size="sm" color="muted">A value prop — the parent owns the rating, so it can drive it too.</Text>
        <StarPicker value={rating} onChange={setRating} />
        <Row gap="sm" wrap="wrap">
          <Button size="sm" variant="outline" onPress={() => setRating(5)}>Set 5 from the parent</Button>
          <Button size="sm" variant="ghost" onPress={() => setRating(0)}>Clear</Button>
        </Row>
      </Block>
    </Block>
  );
}
```
