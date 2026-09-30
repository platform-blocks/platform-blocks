import { Badge, Block, HoverCard, OverflowList, Text } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
export function Demo() {
  return (
    <Block fullWidth>
      <OverflowList
        maw={280}
        data={data}
        renderItem={(item) => <Badge>{item}</Badge>}
        renderOverflow={(hidden) => (
          <HoverCard target={<Badge>+{hidden.length} more</Badge>}>
            {hidden.map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          </HoverCard>
        )}
      />
    </Block>
  );
}
