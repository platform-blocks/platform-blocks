import { Badge, Block, Icon, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller
        startControlIcon={<Icon name="arrow-left" />}
        endControlIcon={<Icon name="arrow-right" />}
        showStartControl
        showEndControl
      >
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Item {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
