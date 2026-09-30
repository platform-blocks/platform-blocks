import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee pauseOnHover>
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
