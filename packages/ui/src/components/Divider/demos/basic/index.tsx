import { Block, Divider, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Text variant="p" weight="medium">
        Q1 Highlights
      </Text>
      <Text variant="p">Revenue grew 12% year over year.</Text>
      <Divider />
      <Text variant="p">Customer retention improved across every region.</Text>
      <Divider variant="dashed" />
      <Text variant="p">Product roadmap updates will ship next quarter.</Text>
    </Block>
  );
}


