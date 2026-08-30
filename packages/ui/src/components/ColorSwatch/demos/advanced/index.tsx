import { useState } from 'react';
import { Flex, Text, ColorSwatch } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [selectedColor, setSelectedColor] = useState<string>('#E74C3C');

  return (
    <Flex direction="column" gap={20} p={16} >
      <Flex direction="column" gap={8}>
        <Text size="sm">Grayscale palette:</Text>
        <Flex direction="row" gap={2}>
          {[
            '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
            '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'
          ].map(color => (
            <ColorSwatch
              key={color}
              color={color}
              borderRadius={2}
              selected={selectedColor === color}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </Flex>
      </Flex>

      <Flex direction="column" gap={8}>
        <Text size="sm">Large display swatch:</Text>
        <Flex direction="row" align="center" gap={16}>
          <ColorSwatch 
            color={selectedColor} 
            size={80} 
            borderRadius={8}
            showCheckmark={false}
          />
          <Flex direction="column" gap={4}>
            <Text weight="semibold">{selectedColor}</Text>
            <Text size="xs" color="secondary">Click any swatch above to change</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}