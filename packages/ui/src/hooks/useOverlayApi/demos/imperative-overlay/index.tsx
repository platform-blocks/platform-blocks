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
