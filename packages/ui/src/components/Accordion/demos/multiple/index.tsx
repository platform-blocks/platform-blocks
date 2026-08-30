import { useState } from 'react';
import { Accordion } from '@platform-blocks/react-ui-library';
import { knowledgeBase } from '../data';

export function Demo() {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['collaboration']);

  return (
    <Accordion
      type="multiple"
      expanded={expandedKeys}
      onExpandedChange={setExpandedKeys}
      items={knowledgeBase}
    />
  );
}
