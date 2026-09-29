import { useState } from 'react';

import { Block, Icon, Spoiler, Text } from '@platform-blocks/ui';

export function Demo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Block fullWidth>
      <Spoiler
        mah={40}
        expanded={isOpen}
        onExpandedChange={setIsOpen}
        // The control is already a button (with aria-expanded): render its
        // content only, not another pressable.
        renderControl={({ expanded }) => (
          <Block direction="row" align="center" gap="xs">
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} />
            <Text size="sm" fw="600" c="primary">
              {expanded ? 'Collapse content' : 'Expand content'}
            </Text>
          </Block>
        )}
      >
        <Block>
          <Text size="sm">Open state: {String(isOpen)}</Text>
          <Text size="sm">You can render any React node as the control.</Text>
          <Text size="sm">
            Because the component is controlled, you can track expansion analytics or sync other UI elements when content is revealed.
          </Text>
        </Block>
      </Spoiler>
    </Block>
  );
}
