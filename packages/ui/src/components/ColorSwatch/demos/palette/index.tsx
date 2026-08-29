import React, { useState } from 'react';
import { Flex, Text, ColorSwatch } from '@platform-blocks/ui';

export function Demo() {
  const [selectedColor, setSelectedColor] = useState<string>('#E74C3C');

  const colorPalettes = {
    'Material Colors': [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
      '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000'
    ],
    'Pastel Colors': [
      '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
      '#C5B3FF', '#FFB3E6', '#FFD1DC', '#E6E6FA', '#F0E68C'
    ],
    'Dark Colors': [
      '#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7',
      '#1ABC9C', '#16A085', '#27AE60', '#229954', '#E74C3C'
    ]
  };

  return (
    <Flex direction="column" gap={20} p={16} style={{ maxWidth: 600 }}>
      <Text weight="semibold" size="md">Color Palette Builder</Text>
      
      <Flex direction="column" gap={8}>
        <Text size="sm">Selected Color: {selectedColor}</Text>
        <ColorSwatch 
          color={selectedColor} 
          size={60} 
          borderRadius={8}
          showCheckmark={false}
        />
      </Flex>

      {Object.entries(colorPalettes).map(([paletteName, colors]) => (
        <Flex key={paletteName} direction="column" gap={8}>
          <Text weight="medium" size="sm">{paletteName}</Text>
          <Flex direction="row" gap={6} wrap="wrap">
            {colors.map(color => (
              <ColorSwatch
                key={color}
                color={color}
                size={32}
                selected={selectedColor === color}
                onPress={() => setSelectedColor(color)}
                borderRadius={paletteName === 'Pastel Colors' ? 16 : 4}
              />
            ))}
          </Flex>
        </Flex>
      ))}

      <Flex direction="column" gap={8}>
        <Text weight="medium" size="sm">Custom Styles Examples</Text>
        <Flex direction="row" gap={12} wrap="wrap">
          <Flex direction="column" gap={4} align="center">
            <ColorSwatch 
              color={selectedColor} 
              size={40} 
              borderRadius={20}
              borderWidth={3}
              borderColor="#FFD700"
            />
            <Text size="xs">Round Gold</Text>
          </Flex>

          <Flex direction="column" gap={4} align="center">
            <ColorSwatch 
              color={selectedColor} 
              size={40} 
              showBorder={false}
              showCheckmark={false}
            />
            <Text size="xs">No Border</Text>
          </Flex>

          <Flex direction="column" gap={4} align="center">
            <ColorSwatch 
              color={selectedColor} 
              size={40} 
              borderRadius={0}
              checkmarkColor="#FFD700"
            />
            <Text size="xs">Square</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}