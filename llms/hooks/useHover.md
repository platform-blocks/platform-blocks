# useHover

Track hover state and spread handlers that satisfy both React Native's hover props and the DOM's mouse events.

## Metadata

- Import: `import { useHover } from '@plocks/ui';`
- Tags: hover, pressable, web
- Docs: https://plocks.dev/hooks/useHover
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useHover/useHover.ts

## Definition

```ts
export type UseHoverReturn = readonly [boolean, UseHoverHandlers];

export interface UseHoverHandlers {
  /** Pointer entered the element. Wire to RN `onHoverIn` (Pressable). */
  onHoverIn: () => void;
  /** Pointer left the element. Wire to RN `onHoverOut` (Pressable). */
  onHoverOut: () => void;
  /**
   * Web-only alias for `onHoverIn`, for plain `View`s (react-native-web
   * forwards `onMouseEnter`; native ignores it).
   */
  onMouseEnter: (event?: WebMouseEvent) => void;
  /** Web-only alias for `onHoverOut`, for plain `View`s. */
  onMouseLeave: (event?: WebMouseEvent) => void;
}

export function useHover(): UseHoverReturn;
```

## Examples

### Hover state

`useHover` returns `[hovered, handlers]`. Handlers cover both RN's `onHoverIn` / `onHoverOut` and DOM's `onMouseEnter` / `onMouseLeave`, so they spread cleanly onto a `<Pressable>` or `<View>` regardless of platform. `<ListGroup.Item>` uses this hook for its hover background.

```tsx
import { Pressable } from 'react-native';
import { Block, Card, Text, useHover } from '@plocks/ui';

export function Demo() {
  const [hovered, hoverHandlers] = useHover();

  return (
    <Block align="flex-start">
      <Text size="sm" c="muted">
        Hover the card below (web only — touch devices show no hover state).
      </Text>
      <Pressable {...hoverHandlers}>
        <Card p="md" variant={hovered ? 'elevated' : 'outline'} bg={hovered ? 'primary' : undefined}>
          <Text fw={hovered ? '700' : '500'}>{hovered ? 'Hovered' : 'Hover me'}</Text>
        </Card>
      </Pressable>
    </Block>
  );
}
```
