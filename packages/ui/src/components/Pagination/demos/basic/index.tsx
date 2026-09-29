import { useState } from 'react';

import { Block, Pagination, Text } from '@platform-blocks/ui';

export function Demo() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <Block>
      <Pagination value={currentPage} total={totalPages} onChange={setCurrentPage} />
      <Text size="xs" c="secondary">
        Page {currentPage} of {totalPages}
      </Text>
    </Block>
  );
}


