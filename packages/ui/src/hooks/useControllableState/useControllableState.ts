import { useCallback, useRef, useState } from 'react';

/** A next-value or an updater function, mirroring `useState`'s setter argument. */
export type ControllableStateAction<T> = T | ((previous: T) => T);

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

const isUpdater = <T,>(next: ControllableStateAction<T>): next is (previous: T) => T =>
  typeof next === 'function';

const resolveInitial = <T,>(defaultValue: T | (() => T) | undefined, finalValue: T | undefined): T =>
  (defaultValue !== undefined
    ? typeof defaultValue === 'function'
      ? (defaultValue as () => T)()
      : defaultValue
    : finalValue) as T;

/** `__DEV__` is a Metro global; guard it so web/SSR bundles don't blow up. */
const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

/**
 * Single source of truth for the controlled / uncontrolled split that every
 * value-bearing component needs. Replaces the hand-rolled
 * `isControlled` + `internalValue` + sync-effect trio.
 *
 * Semantics (deliberately synchronous, matching the rest of this library):
 * - Controlled (`value !== undefined`): `setValue` writes nothing locally and
 *   calls `onChange`. The parent owns the value; if it ignores `onChange`,
 *   nothing moves — which is the point of controlled mode.
 * - Uncontrolled: `setValue` writes internal state **and** calls `onChange` in
 *   the same tick, so handlers fire before paint rather than in an effect.
 * - Switching controlled → uncontrolled seeds internal state with the last
 *   controlled value, so the UI holds its position instead of snapping back to
 *   `defaultValue`. Switching modes at all logs a warning in `__DEV__`.
 *
 * `setValue` is referentially stable for the lifetime of the component, so it
 * is safe in dependency arrays and in memoized context values.
 *
 * @example Uncontrolled with a default
 * const [value, setValue] = useControllableState({
 *   value: props.value,
 *   defaultValue: props.defaultValue,
 *   finalValue: '',
 *   onChange: props.onChange,
 * });
 *
 * @example Updater form
 * setValue((previous) => previous + 1);
 *
 * @example Extra payload forwarded to onChange
 * setValue(nextDate, { source: 'calendar' });
 */
export function useControllableState<T>({
  value,
  defaultValue,
  finalValue,
  onChange,
}: UseControllableStateOptions<T>): UseControllableStateReturn<T> {
  const isControlled = value !== undefined;

  // Lazy initializer, so a `defaultValue` factory runs exactly once.
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(() =>
    resolveInitial(defaultValue, finalValue),
  );

  const resolved = (isControlled ? value : uncontrolledValue) as T;

  // "Latest value" refs so `setValue` can stay referentially stable. These are
  // assignments of already-derived render output, so they are idempotent under
  // StrictMode's double render.
  const resolvedRef = useRef<T>(resolved);
  const isControlledRef = useRef(isControlled);
  const onChangeRef = useRef(onChange);

  // Mode flips are a React anti-pattern but happen in real apps (a value that
  // starts as `undefined` and arrives from a fetch). Seed internal state with
  // the last controlled value — read `resolvedRef` *before* it is refreshed
  // below, since this render's `resolved` is already the stale internal one.
  const wasControlledRef = useRef(isControlled);
  if (wasControlledRef.current !== isControlled) {
    const leavingControlled = wasControlledRef.current && !isControlled;
    wasControlledRef.current = isControlled;

    if (IS_DEV) {
      console.warn(
        `[platform-blocks] A component switched from ${
          isControlled ? 'uncontrolled to controlled' : 'controlled to uncontrolled'
        }. Decide on one mode for the lifetime of the component: pass \`value\` for controlled, or \`defaultValue\` for uncontrolled.`,
      );
    }

    if (leavingControlled) {
      // Render-phase state update: React discards this render and immediately
      // re-runs with the seeded value, so nothing stale reaches the screen.
      setUncontrolledValue(resolvedRef.current);
    }
  }

  resolvedRef.current = resolved;
  isControlledRef.current = isControlled;
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: ControllableStateAction<T>, ...payload: any[]) => {
      const nextValue = isUpdater(next) ? next(resolvedRef.current) : next;

      // Advance the ref immediately so several updater calls inside one event
      // handler compose against each other rather than the pre-event value.
      resolvedRef.current = nextValue;

      if (!isControlledRef.current) {
        setUncontrolledValue(nextValue);
      }

      onChangeRef.current?.(nextValue, ...payload);
    },
    [],
  );

  return [resolved, setValue, isControlled] as const;
}
