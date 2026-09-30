import { useRef, useState } from 'react';
import type { View } from 'react-native';
import { Badge, Block, Button, LayerScope, Text, useLayer } from '@plocks/ui';
import type { LayerDismissReason } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const [reason, setReason] = useState<LayerDismissReason | null>(null);
  const triggerRef = useRef<View>(null);
  const panelRef = useRef<View>(null);

  const { id } = useLayer({
    active: opened,
    onDismiss: (why) => {
      setReason(why);
      setOpened(false);
    },
    closeOnOutsidePress: true,
    containerRef: panelRef,
    outsidePressIgnoreRefs: [triggerRef],
  });

  const toggle = () => {
    setReason(null);
    setOpened((current) => !current);
  };

  return (
    <Block align="flex-start">
      <Button ref={triggerRef} onPress={toggle}>
        {opened ? 'Close panel' : 'Open panel'}
      </Button>

      {opened ? (
        <LayerScope id={id}>
          <Block ref={panelRef} p="md" radius="md" bg="elevated" shadow="md" miw={220}>
            <Text fw="600">Panel</Text>
          </Block>
        </LayerScope>
      ) : null}

      {reason ? <Badge variant="light">{reason}</Badge> : null}
    </Block>
  );
}
