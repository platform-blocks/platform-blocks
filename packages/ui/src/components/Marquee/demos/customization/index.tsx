import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee duration={12000} gap="xl" repeat={5}>
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
