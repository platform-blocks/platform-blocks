import { Block, Card, Image, Row, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Image Shapes</Text>
      <Row gap={24} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Block style={{ alignItems: 'center' }}>
          <Image 
            src={require('../../../../assets/images/scene-lake.png')}
            size={80}
            alt="Default"
          />
          <Text size="sm" mt={8}>Default</Text>
        </Block>
        
        <Block style={{ alignItems: 'center' }}>
          <Image 
            src={require('../../../../assets/images/scene-lake.png')}
            size={80}
            rounded
            alt="Rounded"
          />
          <Text size="sm" mt={8}>Rounded</Text>
        </Block>
        
        <Block style={{ alignItems: 'center' }}>
          <Image 
            src={require('../../../../assets/images/scene-lake.png')}
            size={80}
            circle
            alt="Circle"
          />
          <Text size="sm" mt={8}>Circle</Text>
        </Block>
      </Row>
      <Text size="sm" color="gray.6" mt={16}>
        Shape variations: default, rounded corners, and circular
      </Text>
    </Card>
  );
}