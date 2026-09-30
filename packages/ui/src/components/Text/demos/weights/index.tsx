import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block gap="lg">
      <Block>
        <Text fw="light">light</Text>
        <Text fw="normal">normal</Text>
        <Text fw="medium">medium</Text>
        <Text fw="semibold">semibold</Text>
        <Text fw="bold">bold</Text>
        <Text fw="black">black</Text>
      </Block>
      <Block>
        <Text fw="100">100</Text>
        <Text fw="300">300</Text>
        <Text fw="400">400</Text>
        <Text fw="600">600</Text>
        <Text fw="700">700</Text>
        <Text fw="900">900</Text>
      </Block>
    </Block>
  );
}
