import { useState } from 'react';
import { Chip, Row, Text, Block } from '@plocks/ui';

const TOPICS = ['React', 'React Native', 'Expo', 'TypeScript'];

export function Demo() {
  const [selected, setSelected] = useState<string[]>(['Expo']);

  const toggle = (topic: string) =>
    setSelected((current) => (current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic]));

  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {TOPICS.map((topic) => (
          <Chip key={topic} checked={selected.includes(topic)} onChange={() => toggle(topic)}>
            {topic}
          </Chip>
        ))}
      </Row>
      <Text size="xs" c="secondary">
        Selected: {selected.join(', ') || 'none'}
      </Text>
    </Block>
  );
}
