import { Badge, Block, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller>
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Badge {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
