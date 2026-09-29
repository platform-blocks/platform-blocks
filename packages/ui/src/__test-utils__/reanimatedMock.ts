/**
 * The react-native-reanimated stand-in for the native (react-test-renderer)
 * tests. jest.setup.cjs installs it for every test file:
 *
 *   jest.mock('react-native-reanimated', () => require('./src/__test-utils__/reanimatedMock'));
 *
 * Animations finish at once — `withTiming(to)` is just `to`, and completion
 * callbacks fire synchronously with `finished: true` — but shared values behave
 * like the real ones: `useSharedValue` returns the same object for the life of
 * the component, `.value` / `get()` / `set()` read and write it, and
 * `useAnimatedReaction` re-evaluates when a shared value is written.
 *
 * A test that needs different behavior spreads this module and overrides the
 * parts it cares about (`__esModule` is non-enumerable, so a spread drops it;
 * without it `import Animated from 'react-native-reanimated'` breaks):
 *
 *   jest.mock('react-native-reanimated', () => ({
 *     ...require('../../../__test-utils__/reanimatedMock'),
 *     __esModule: true,
 *     withTiming: (value: unknown) => value, // never reports completion
 *   }));
 *
 * (react-native-web tests run the real library; see jest.web.config.cjs.)
 */
import React from 'react';
import { View } from 'react-native';

type Listener<T> = (value: T) => void;
type Updater<T> = (current: T) => T;
type AnimationCallback = (finished?: boolean) => void;
type StyleRecord = Record<string, unknown>;

/** Reanimated 4's `SharedValue` surface. */
export interface MockSharedValue<T> {
  value: T;
  get(): T;
  set(next: T | Updater<T>): void;
  addListener(listenerId: number, listener: Listener<T>): void;
  removeListener(listenerId: number): void;
  modify(modifier?: Updater<T>, forceUpdate?: boolean): void;
}

/** Re-evaluates the mounted `useAnimatedReaction`s; notified after every shared value write. */
const reactionRunners = new Set<() => void>();

/** A shared value outside a component (reanimated's `makeMutable`). */
export function makeMutable<T>(initial: T): MockSharedValue<T> {
  let current = initial;
  const listeners = new Map<number, Listener<T>>();
  const write = (next: T) => {
    current = next;
    listeners.forEach((listener) => listener(next));
    reactionRunners.forEach((run) => run());
  };
  return {
    get value() {
      return current;
    },
    set value(next: T) {
      write(next);
    },
    get: () => current,
    set: (next) => write(typeof next === 'function' ? (next as Updater<T>)(current) : next),
    addListener: (listenerId, listener) => {
      listeners.set(listenerId, listener);
    },
    removeListener: (listenerId) => {
      listeners.delete(listenerId);
    },
    modify: (modifier) => {
      if (modifier) write(modifier(current));
    },
  };
}

/** Stable for the component's lifetime, like the real hook. */
export function useSharedValue<T>(initial: T): MockSharedValue<T> {
  const ref = React.useRef<MockSharedValue<T> | null>(null);
  if (ref.current === null) ref.current = makeMutable(initial);
  return ref.current;
}

/**
 * Runs `react(current, previous)` on mount and then whenever `prepare()`'s
 * result changes — checked after every commit and after every shared value
 * write. (The real hook re-runs when one of the shared values `prepare` reads
 * changes; the mock can't see which ones it reads, so it compares results.)
 */
export function useAnimatedReaction<T>(
  prepare: () => T,
  react: (current: T, previous: T | null) => void,
  _dependencies?: React.DependencyList
): void {
  const handlers = React.useRef({ prepare, react });
  const previous = React.useRef<{ value: T } | null>(null);
  const running = React.useRef(false);

  const run = React.useCallback(() => {
    // A reaction that writes a shared value would otherwise re-enter itself.
    if (running.current) return;
    running.current = true;
    try {
      const current = handlers.current.prepare();
      const last = previous.current;
      if (last === null || !Object.is(current, last.value)) {
        previous.current = { value: current };
        handlers.current.react(current, last === null ? null : last.value);
      }
    } finally {
      running.current = false;
    }
  }, []);

  // After every commit: pick up the latest closures, then re-evaluate.
  React.useEffect(() => {
    handlers.current = { prepare, react };
    run();
  });

  React.useEffect(() => {
    reactionRunners.add(run);
    return () => {
      reactionRunners.delete(run);
    };
  }, [run]);
}

/**
 * Reads the style factory lazily, whenever a property is read (i.e. when the
 * style is flattened), so it reflects shared values written after render.
 */
export function useAnimatedStyle(updater: () => StyleRecord | undefined): StyleRecord {
  return new Proxy<StyleRecord>(
    {},
    {
      get: (_target, prop) => (updater() || {})[prop as string],
      ownKeys: () => Reflect.ownKeys(updater() || {}),
      getOwnPropertyDescriptor: (_target, prop) => {
        const latest = updater() || {};
        return prop in latest
          ? { configurable: true, enumerable: true, value: latest[prop as string] }
          : undefined;
      },
    }
  );
}

export function withTiming<T>(value: T, _config?: unknown, callback?: AnimationCallback): T {
  callback?.(true);
  return value;
}

export function withSpring<T>(value: T, _config?: unknown, callback?: AnimationCallback): T {
  callback?.(true);
  return value;
}

export const withDelay = <T>(_delay: number, value: T): T => value;
export const withRepeat = <T>(value: T): T => value;
export const withSequence = <T>(...values: T[]): T => values[0];
export const cancelAnimation = (_sharedValue?: unknown): void => {};

/** The first output value: animations are pinned to their start in tests. */
export const interpolate = (_value: number, _inputRange: readonly number[], outputRange: readonly number[]): number =>
  outputRange[0];
export const interpolateColor = (
  _value: number,
  _inputRange: readonly number[],
  outputRange: readonly string[]
): string => outputRange[0];

export const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
} as const;

type EasingFunction = (t: number) => number;
const linear: EasingFunction = (t) => t;
const easingFactory = (..._args: unknown[]): EasingFunction => linear;

export const Easing = {
  linear,
  ease: linear,
  quad: linear,
  cubic: linear,
  bounce: linear,
  back: easingFactory,
  elastic: easingFactory,
  bezier: easingFactory,
  inOut: easingFactory,
  out: easingFactory,
  in: easingFactory,
};

/** No Worklets Babel plugin in native tests, so nothing is a worklet. */
export const isWorkletFunction = (_value: unknown): boolean => false;

export const runOnJS = <F>(fn: F): F => fn;
export const runOnUI = <F>(fn: F): F => fn;

const Animated = {
  View,
  Text: View,
  ScrollView: View,
  createAnimatedComponent: <C>(component: C): C => component,
};

export default Animated;
