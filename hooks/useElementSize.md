# useElementSize

Track an element's rendered width and height through `onLayout`, on web and native, to size children or switch layouts by the space a component actually has rather than the window.

## Metadata

- Import: `import { useElementSize } from '@plocks/ui';`
- Tags: layout, size, measure, onLayout, resize
- Docs: https://plocks.dev/hooks/useElementSize
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useElementSize/useElementSize.ts

## Definition

```ts
export interface UseElementSizeReturn extends ElementSize {
  /** Pass to the measured element's `onLayout`. Stable for the component's lifetime. */
  onLayout: (event: LayoutChangeEvent) => void;
  /** `false` until the first layout event; `width` and `height` are 0 until then. */
  measured: boolean;
}

export interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize(): UseElementSizeReturn;
```

## Examples

### Measure a container

Resize the window to watch the box's own size update. `useElementSize()` returns `{ width, height, measured, onLayout }`: pass `onLayout` to the element to measure. `measured` is `false` until the first layout event, while `width` and `height` are still 0.

On the web React Native Web backs `onLayout` with a ResizeObserver, so the size follows the element, not just the window. The returned object keeps its identity until the size changes. To also run your own `onLayout`, call both from one handler.

```tsx
import { Block, Text, useElementSize } from '@plocks/ui';

export function Demo() {
  const { width, height, onLayout } = useElementSize();

  return (
    <Block fullWidth onLayout={onLayout} bg="surface" p="xl" radius="md" align="center">
      <Text size="lg" fw="600">
        {Math.round(width)} × {Math.round(height)}
      </Text>
    </Block>
  );
}
```
