import { Block, Card, Image, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small">m="auto"</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Centered image"
            w={100}
            h={100}
            m="auto"
          />
        </Card>
      </Block>

      <Block>
        <Text variant="small">m="lg"</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Image with theme spacing"
            w={80}
            h={80}
            m="lg"
          />
        </Card>
      </Block>

      <Block>
        <Text variant="small">m={'{20}'}</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Image with numeric spacing"
            w={60}
            h={60}
            m={20}
          />
        </Card>
      </Block>

      <Block>
        <Text variant="small">mx="auto" my="md"</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Image with axis spacing"
            w={80}
            h={80}
            mx="auto"
            my="md"
          />
        </Card>
      </Block>
    </Block>
  );
}
