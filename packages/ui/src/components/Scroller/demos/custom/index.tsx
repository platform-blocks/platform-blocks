import { Badge, Block, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller scrollAmount={300} controlSize="lg" showEndControl>
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Item {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
