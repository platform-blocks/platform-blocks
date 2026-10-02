# useOverlayApi

Open, update and close overlays imperatively in the nearest `OverlayProvider` (`PlocksProvider` mounts one along with its renderer): `openOverlay(config)` returns an id for `updateOverlay` and `closeOverlay`, and `closeAllOverlays` clears them all. `useOverlays()` returns the configs currently open; both hooks throw outside a provider.

## Metadata

- Import: `import { useOverlayApi } from '@plocks/ui';`
- Tags: overlay, imperative, portal
- Docs: https://plocks.dev/hooks/useOverlayApi
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/providers/OverlayProvider.tsx

## Definition

```ts
export function useOverlayApi(): OverlayApiValue;
```

## Examples

### Open imperatively

`openOverlay` takes the `content` plus an `anchor`, the `{ x, y, width, height }` viewport point its top-left corner is placed at, and returns the overlay's id. The renderer doesn't measure or flip, so work the coordinates out yourself (here with `measureElement`) or use `useFloating`, which does it for you. By default the overlay closes on Escape and outside press (`closeOnEscape`, `closeOnClickOutside`), `anchorNode` keeps presses on the trigger from counting as outside, and `onClose` runs after every close; on native it opens in a transparent React Native `Modal` whose backdrop catches outside taps, and on web it is `position: fixed`. An overlay outlives the component that opened it, so close it on unmount.

```tsx
import { useRef, useState } from 'react';
import type { View } from 'react-native';
import { Block, Button, Text, measureElement, useOverlayApi } from '@plocks/ui';

export function Demo() {
  const { openOverlay, closeOverlay } = useOverlayApi();
  const triggerRef = useRef<View>(null);
  const [overlayId, setOverlayId] = useState<string | null>(null);

  const open = async () => {
    const rect = await measureElement(triggerRef);
    const id = openOverlay({
      anchor: { x: rect.x, y: rect.y + rect.height + 8, width: 0, height: 0 },
      anchorNode: triggerRef.current,
      content: (
        <Block p="md" radius="md" bg="elevated" shadow="md">
          <Text fw="600">Overlay</Text>
        </Block>
      ),
      onClose: () => setOverlayId(null),
    });
    setOverlayId(id);
  };

  return (
    <Button ref={triggerRef} onPress={() => (overlayId ? closeOverlay(overlayId) : open())}>
      {overlayId ? 'Close overlay' : 'Open overlay'}
    </Button>
  );
}
```
