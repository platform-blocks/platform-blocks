import { Block, Divider, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block align="center" wrap="wrap" direction="row" h={100}>
      <Text variant="p">Home</Text>
      <Divider orientation="vertical" />
      <Text variant="p">Fixtures</Text>
      <Divider orientation="vertical" color="primary" />
      <Text variant="p">Standings</Text>
      <Divider orientation="vertical" label="Live" color="warning" />
      <Text variant="p">Highlights</Text>
    </Block>
  );
}
