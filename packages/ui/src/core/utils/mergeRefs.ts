import { useRef } from 'react';
import type { MutableRefObject, Ref } from 'react';

/**
 * Assign one value to any number of refs — callback refs, object refs, or
 * `null`/`undefined` slots. Used when a component keeps an internal ref to its
 * root node and still has to honor the ref its consumer forwarded in.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(value);
        return;
      }
      (ref as MutableRefObject<T | null>).current = value;
    });
  };
}

/**
 * Memoized {@link mergeRefs}. Keeps the composed callback stable while the
 * individual refs are unchanged, so React doesn't detach and re-attach the
 * node on every render.
 *
 * @example
 * const Component = forwardRef<View, Props>((props, ref) => {
 *   const internalRef = useRef<View>(null);
 *   return <View ref={useMergedRef(internalRef, ref)} />;
 * });
 */
export function useMergedRef<T>(...refs: Array<Ref<T> | undefined>) {
  // Memoized on the refs themselves (a variable-length list, which a hook
  // dependency array can't express): a new callback only when one changes.
  const cache = useRef<{ refs: Array<Ref<T> | undefined>; merged: (value: T | null) => void } | null>(null);
  let cached = cache.current;
  if (
    !cached ||
    cached.refs.length !== refs.length ||
    cached.refs.some((ref, index) => !Object.is(ref, refs[index]))
  ) {
    cached = { refs, merged: mergeRefs(...refs) };
    cache.current = cached;
  }
  return cached.merged;
}
