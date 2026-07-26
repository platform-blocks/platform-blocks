---
title: Controlled and uncontrolled
category: basics
order: 10
tags: [controlled, uncontrolled, state]
status: stable
since: 0.11.0
hidden: false
---

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
