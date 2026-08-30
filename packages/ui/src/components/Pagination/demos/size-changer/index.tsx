import { useState } from 'react';

import { Block, Pagination, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const totalItems = 248;
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  const total = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <Block>
      <Pagination
        current={current}
        total={total}
        onChange={setCurrent}
        showTotal
        totalItems={totalItems}
        pageSize={pageSize}
        showSizeChanger
        pageSizeOptions={[10, 20, 50, 100]}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrent(1);
        }}
      />
      <Text size="xs" color="secondary">
        Page {current} of {total} · {pageSize} rows per page
      </Text>
    </Block>
  );
}
