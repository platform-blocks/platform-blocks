import { useState } from 'react';

import { Block, Pagination, Text } from '@plocks/ui';

export function Demo() {
  const [defaultPage, setDefaultPage] = useState(5);
  const [outlinePage, setOutlinePage] = useState(5);
  const [subtlePage, setSubtlePage] = useState(5);

  return (
    <Block>
      <Block>
        <Pagination value={defaultPage} total={15} onChange={setDefaultPage} variant="default" />
        <Text size="xs" c="secondary">
          Default variant keeps the control fully filled. Page {defaultPage} of 15.
        </Text>
      </Block>

      <Block>
        <Pagination value={outlinePage} total={15} onChange={setOutlinePage} variant="outline" />
        <Text size="xs" c="secondary">
          Outline keeps the surface quiet while the active page gets a stroke. Page {outlinePage} of 15.
        </Text>
      </Block>

      <Block>
        <Pagination value={subtlePage} total={15} onChange={setSubtlePage} variant="subtle" />
        <Text size="xs" c="secondary">
          Subtle removes backgrounds for tinted surfaces. Page {subtlePage} of 15.
        </Text>
      </Block>
    </Block>
  );
}


