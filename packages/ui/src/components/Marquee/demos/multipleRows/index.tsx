import { Badge, Block, Marquee } from '@plocks/ui';

const labels = ['Alpha', 'Beta', 'Gamma', 'Delta'];
export function Demo() {
  return (
    <Block fullWidth>
      <Marquee>
        {labels.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
      <Marquee reverse mt="sm">
        {labels.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
