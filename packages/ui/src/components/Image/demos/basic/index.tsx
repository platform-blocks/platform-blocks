import { Block, Card, Text } from '@platform-blocks/ui';
import { Image } from '../../Image';

export default function BasicImageDemo() {
  return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Basic Image Usage</Text>
      <Block>
        <Image 
          src={require('../../../../assets/images/scene-mountains.png')}
          alt="Mountain landscape"
          w={300}
          h={200}
        />
        <Text size="sm" color="gray.6">
          A simple image with specified dimensions
        </Text>
      </Block>
    </Card>
  );
}