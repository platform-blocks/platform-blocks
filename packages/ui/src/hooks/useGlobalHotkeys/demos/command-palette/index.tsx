import { useCallback, useState } from 'react';
import { Alert, Block, Button, KeyCap, Row, useGlobalHotkeys } from '@platform-blocks/react-ui-library';

const NAMESPACE = 'hooks-command-palette';

export function Demo() {
  const [open, setOpen] = useState(false);

  const togglePalette = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  useGlobalHotkeys(NAMESPACE, ['mod+k', togglePalette]);

  return (
    <Block align="flex-start">
      <Row gap="xs" align="center">
        <KeyCap keyCode="K" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <KeyCap keyCode="K" modifiers={['cmd']} size="sm">K</KeyCap>
      </Row>
      <Button onPress={togglePalette}>{open ? 'Close palette' : 'Open palette'}</Button>
      <Alert severity={open ? 'success' : 'info'} fullWidth>
        {open ? 'Palette is open globally. Press ⌘K again to close.' : 'Palette is currently closed.'}
      </Alert>
    </Block>
  );
}
