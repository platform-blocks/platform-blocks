import { useState } from 'react';

import { Block, Pagination, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <Block>
      <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
      <Text size="xs" color="secondary">
        Page {currentPage} of {totalPages}
      </Text>
    </Block>
  );
}


