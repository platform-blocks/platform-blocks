import { Block, Image, Row, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row align="flex-start" gap="lg" wrap="wrap">
      <Block align="center">
        <Image
          src={require('../../../../assets/images/scene-lake.png')}
          size={80}
          alt="Default"
        />
        <Text variant="small">Default</Text>
      </Block>

      <Block align="center">
        <Image
          src={require('../../../../assets/images/scene-lake.png')}
          size={80}
          rounded
          alt="Rounded"
        />
        <Text variant="small">Rounded</Text>
      </Block>

      <Block align="center">
        <Image
          src={require('../../../../assets/images/scene-lake.png')}
          size={80}
          circle
          alt="Circle"
        />
        <Text variant="small">Circle</Text>
      </Block>
    </Row>
  );
}
