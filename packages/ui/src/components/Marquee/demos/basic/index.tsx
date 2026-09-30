import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee>
        {['Design', 'Build', 'Ship', 'Learn'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
