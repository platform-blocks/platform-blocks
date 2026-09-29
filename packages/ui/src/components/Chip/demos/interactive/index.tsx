import { useState } from 'react';
import { Chip, Row } from '@platform-blocks/ui';

export function Demo() {
  const [tags, setTags] = useState(['Soccer', 'Basketball', 'Tennis']);

  return (
    <Row gap={8} wrap="wrap">
      {tags.map((tag) => (
        <Chip key={tag} onRemove={() => setTags((current) => current.filter((t) => t !== tag))}>
          {tag}
        </Chip>
      ))}
    </Row>
  );
}
