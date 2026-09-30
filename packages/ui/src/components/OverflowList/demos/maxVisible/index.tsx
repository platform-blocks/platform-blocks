import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        data={data}
        maxVisibleItems={3}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
