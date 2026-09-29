import { Avatar, Block, Indicator } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block position="relative">
      <Avatar size="lg" fallback="JS" />
      <Indicator size="md" accessibilityLabel="Online" />
    </Block>
  );
}
