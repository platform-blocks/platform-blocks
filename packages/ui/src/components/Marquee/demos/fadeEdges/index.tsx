import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee fadeEdgeSize="15%">
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
