# useHover

Track hover state and spread handlers that satisfy both React Native's hover props and the DOM's mouse events.

## Metadata

- Canonical name: `useHover`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useHover } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: interaction
- Tags: hover, pressable, web
- Docs: https://react-ui-library.com/hooks/useHover
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useHover

## Definition

```ts
export type UseHoverReturn = readonly [boolean, UseHoverHandlers];

export interface UseHoverHandlers {
  /** Pointer entered the element. Wire to RN `onHoverIn` / `onMouseEnter`. */
  onHoverIn: () => void;
  /** Pointer left the element. Wire to RN `onHoverOut` / `onMouseLeave`. */
  onHoverOut: () => void;
  /** Web-only alias for `onHoverIn`. */
  onMouseEnter: () => void;
  /** Web-only alias for `onHoverOut`. */
  onMouseLeave: () => void;
}

export function useHover(): UseHoverReturn;
```

## Examples

### Hover state

`useHover` returns `[hovered, handlers]`. Handlers cover both RN's `onHoverIn` / `onHoverOut` and DOM's `onMouseEnter` / `onMouseLeave`, so they spread cleanly onto a `<Pressable>` or `<View>` regardless of platform. `<ListGroup.Item>` uses this hook for its hover background.

```tsx
import { Pressable } from 'react-native';
import { Block, Card, Text, useHover } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [hovered, hoverHandlers] = useHover();

  return (
    <Block align="flex-start">
      <Text size="sm" color="muted">
        Hover the card below (web only — touch devices show no hover state).
      </Text>
      <Pressable {...hoverHandlers}>
        <Card p="md" variant={hovered ? 'elevated' : 'outline'} bg={hovered ? 'primary' : undefined}>
          <Text weight={hovered ? '700' : '500'}>{hovered ? 'Hovered' : 'Hover me'}</Text>
        </Card>
      </Pressable>
    </Block>
  );
}
```
