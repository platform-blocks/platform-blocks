# useReducedMotion

Whether animations should be reduced: the OS preference (`prefers-reduced-motion` on web, `AccessibilityInfo` on native), or the override set by the nearest `ReducedMotionProvider`. Works without a provider; when it returns `true`, jump to end states instead of animating.

## Metadata

- Import: `import { useReducedMotion } from '@plocks/ui';`
- Tags: motion, animation, accessibility, reduced-motion
- Docs: https://plocks.dev/hooks/useReducedMotion
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/motion/useReducedMotion.ts

## Definition

```ts
export function useReducedMotion(): boolean;
```

## Examples

### Respect reduced motion

`useReducedMotion()` returns a boolean: the square spins while it is `false` and snaps to its resting angle when it turns `true`. With the switch off the value follows your OS setting; switched on, it wraps the square in `<ReducedMotionProvider reducedMotion>`, the way an in-app preference would. The provider takes `true` / `false` to force the value for its subtree or `'system'` to follow the OS, and inherits its parent's setting when the prop is omitted; `PlocksProvider` mounts one from its own `reducedMotion` prop. Server rendering always reads `false`.

```tsx
import { useEffect, useState } from 'react';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Block, ReducedMotionProvider, Row, Switch, Text, useReducedMotion } from '@plocks/ui';

function SpinningSquare() {
  const reduced = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
    if (!reduced) {
      rotation.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1);
    }
    return () => cancelAnimation(rotation);
  }, [reduced, rotation]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Row gap="md" align="center">
      <Animated.View style={spinStyle}>
        <Block w={40} h={40} radius="sm" bg="primary.5" />
      </Animated.View>
      <Text size="sm">useReducedMotion(): {String(reduced)}</Text>
    </Row>
  );
}

export function Demo() {
  const [reduce, setReduce] = useState(false);

  return (
    <Block align="flex-start">
      <Switch label="Reduce motion" checked={reduce} onChange={setReduce} />
      <ReducedMotionProvider reducedMotion={reduce ? true : 'system'}>
        <SpinningSquare />
      </ReducedMotionProvider>
    </Block>
  );
}
```
