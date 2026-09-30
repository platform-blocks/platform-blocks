import { Badge, Block, OverflowList } from '@plocks/ui';

const data = ['Home', 'Library', 'Projects', 'Design', 'Components', 'Current'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={320}
        data={data}
        collapseFrom="start"
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => <Badge>+{hidden.length} more</Badge>}
      />
    </Block>
  );
}
