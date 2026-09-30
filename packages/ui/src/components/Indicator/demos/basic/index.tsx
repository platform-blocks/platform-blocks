import { Avatar, Block, Indicator } from '@plocks/ui';

export function Demo() {
  return (
    <Block position="relative">
      <Avatar size="lg" fallback="JS" />
      <Indicator size="md" accessibilityLabel="Online" />
    </Block>
  );
}
