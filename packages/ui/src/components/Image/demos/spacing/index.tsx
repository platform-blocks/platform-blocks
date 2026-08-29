import { View } from 'react-native';
import { Block, Card, Image, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Universal Spacing Props</Text>
      <Block>
        
        {/* Auto margin example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Auto Margin Example</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Centered image"
              w={100}
              h={100}
              m="auto"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m="auto" should be centered
          </Text>
        </View>

        {/* Theme spacing example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Theme Spacing Values</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with theme spacing"
              w={80}
              h={80}
              m="lg"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m="lg" using theme spacing
          </Text>
        </View>

        {/* Numeric spacing example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Numeric Spacing Values</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with numeric spacing"
              w={60}
              h={60}
              m={20}
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m={`{20}`} using numeric spacing
          </Text>
        </View>

        {/* Zero margin example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Zero Margin Example</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with zero margin"
              w={60}
              h={60}
              m="0"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m="0" should have no margin
          </Text>
        </View>

        {/* Mixed spacing props example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Mixed Spacing Props</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with mixed spacing"
              w={80}
              h={80}
              mx="auto"
              my="md"
              p="sm"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with mx="auto", my="md", p="sm"
          </Text>
        </View>
        
      </Block>
    </Card>
  );
}