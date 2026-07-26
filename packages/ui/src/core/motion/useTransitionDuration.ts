import { useReducedMotion } from './ReducedMotionProvider';

/**
 * Resolves a component's `transitionDuration` prop into the millisecond value
 * its animations should run for.
 *
 * `transitionDuration={0}` — and an active reduced-motion preference — resolve
 * to `0`, which callers must treat as "apply the end state immediately" rather
 * than "run a zero-length animation": springs ignore duration entirely, and
 * even a 0ms timing still costs a frame.
 *
 * @param transitionDuration Explicit prop value (ms). `undefined` falls back.
 * @param fallback Component default when the prop is omitted.
 */
export function useTransitionDuration(
  transitionDuration: number | undefined,
  fallback: number
): number {
  const reduced = useReducedMotion();
  if (reduced) return 0;
  if (transitionDuration == null) return Math.max(fallback, 0);
  return Math.max(transitionDuration, 0);
}

export default useTransitionDuration;
