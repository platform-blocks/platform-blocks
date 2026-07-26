import { useState } from 'react';

import { Block, Pagination, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [page1, setPage1] = useState(10);
  const [page2, setPage2] = useState(15);
  const [page3, setPage3] = useState(25);

  return (
    <Block>
      <Block>
        <Pagination
          current={page1}
          total={30}
          onChange={setPage1}
          showFirst
          showPrevNext
          siblings={2}
          boundaries={2}
        />
        <Text size="xs" colorVariant="secondary">
          Includes first and last buttons. Page {page1} of 30.
        </Text>
      </Block>

      <Block>
        <Pagination
          current={page2}
          total={40}
          onChange={setPage2}
          showPrevNext
          siblings={1}
          boundaries={1}
        />
        <Text size="xs" colorVariant="secondary">
          Minimal navigation with prev/next only. Page {page2} of 40.
        </Text>
      </Block>

      <Block>
        <Pagination
          current={page3}
          total={50}
          onChange={setPage3}
          showPrevNext
          siblings={0}
          boundaries={1}
          size="sm"
        />
        <Text size="xs" colorVariant="secondary">
          Compact layout with tight siblings. Page {page3} of 50.
        </Text>
      </Block>
    </Block>
  );
}


