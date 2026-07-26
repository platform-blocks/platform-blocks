import { useCallback, useState } from 'react';
import { Block, KeyCap, Row, Text, useHotkeys } from '@platform-blocks/ui';

export default function Demo() {
  const [log, setLog] = useState<string[]>([]);

  const append = useCallback((entry: string) => {
    setLog(prev => [entry, ...prev].slice(0, 4));
  }, []);

  useHotkeys(
    [
      ['mod+b', () => append('Bold toggled')],
      ['mod+shift+p', () => append('Command palette opened')],
      ['escape', () => append('Escape pressed')],
    ],
    [append]
  );

  return (
    <Block align="flex-start">
      <Row gap="xs" wrap="wrap">
        <KeyCap keyCode="B" modifiers={['cmd']} size="sm">⌘B</KeyCap>
        <KeyCap keyCode="P" modifiers={['cmd', 'shift']} size="sm">⇧⌘P</KeyCap>
        <KeyCap keyCode="Escape" size="sm">Esc</KeyCap>
      </Row>
      {log.length ? (
        log.map((entry, index) => (
          <Text key={`${entry}-${index}`} size="sm">{entry}</Text>
        ))
      ) : (
        <Text size="sm" colorVariant="muted">No shortcuts fired yet.</Text>
      )}
    </Block>
  );
}
