import { useState } from 'react';
import { Block, Pagination, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  const [page, setPage] = useState(3);

  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" color="secondary">{size}</Text>
          <Pagination current={page} total={8} onChange={setPage} size={size} />
        </Block>
      ))}
    </Block>
  );
}
