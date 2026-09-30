import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee orientation="vertical" h={120} reverse>
        {['Alpha', 'Beta', 'Gamma'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
