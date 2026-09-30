import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={320}
        data={data}
        maxRows={2}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
