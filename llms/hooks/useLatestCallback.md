# useLatestCallback

Wrap a callback in a function whose identity never changes but always calls the latest version, so effects, timers and subscriptions that call it don't restart when an inline handler changes.

## Metadata

- Import: `import { useLatestCallback } from '@plocks/ui';`
- Tags: callbacks, effects, stable-identity
- Docs: https://plocks.dev/hooks/useLatestCallback
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/hooks/useLatestCallback.ts

## Definition

```ts
export function useLatestCallback<Args extends unknown[], R>(fn: ((...args: Args) => R) | undefined): (...args: Args) => R | undefined;
```

## Examples

### Stable handler, latest state

The interval is set up once, yet each tick adds the step selected right now: `tick` keeps one identity while always calling the latest closure. `useLatestCallback(fn)` returns `(...args) => ReturnType<fn> | undefined` and accepts `undefined` (the call is then a no-op), which suits optional callback props such as `onComplete`. The latest `fn` is stored in a layout effect after each commit, so call the returned function from effects and event handlers, never during render.

```tsx
import { useEffect, useState } from 'react';
import { Block, SegmentedControl, Text, useLatestCallback } from '@plocks/ui';

const STEPS = [
  { label: '+1', value: '1' },
  { label: '+5', value: '5' },
  { label: '+10', value: '10' },
];

export function Demo() {
  const [step, setStep] = useState('1');
  const [count, setCount] = useState(0);

  const tick = useLatestCallback(() => setCount((c) => c + Number(step)));

  // `tick` never changes identity, so the interval is created once.
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <Block align="center">
      <Text size="xl" fw="700">
        {count}
      </Text>
      <SegmentedControl data={STEPS} value={step} onChange={setStep} />
    </Block>
  );
}
```
