import React, { useState } from 'react';
import { Flex, Text, ColorSwatch } from '@platform-blocks/ui';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function Demo() {
  const [selectedColor, setSelectedColor] = useState<string>('#FF6B6B');

  return (
    <Flex direction="column" gap={16} p={16} style={{ maxWidth: 400 }}>
      <Text weight="semibold" size="md">Basic Color Swatches</Text>
      
      <Flex direction="column" gap={8}>
        <Text size="sm">Click to select a color:</Text>
        <Flex direction="row" gap={8} wrap="wrap">
          {colors.map(color => (
            <ColorSwatch
              key={color}
              color={color}
              size={40}
              selected={selectedColor === color}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </Flex>
        <Text size="xs" color="secondary">
          Selected: {selectedColor}
        </Text>
      </Flex>

      <Flex direction="column" gap={8}>
        <Text size="sm">Different sizes:</Text>
        <Flex direction="row" gap={8} align="center">
          <ColorSwatch color="#FF6B6B" size={24} />
          <ColorSwatch color="#4ECDC4" size={32} />
          <ColorSwatch color="#45B7D1" size={48} />
          <ColorSwatch color="#96CEB4" size={64} />
        </Flex>
      </Flex>

      <Flex direction="column" gap={8}>
        <Text size="sm">Without borders:</Text>
        <Flex direction="row" gap={8}>
          {colors.slice(0, 5).map(color => (
            <ColorSwatch
              key={color}
              color={color}
              size={32}
              showBorder={false}
            />
          ))}
        </Flex>
      </Flex>

      <Flex direction="column" gap={8}>
        <Text size="sm">Disabled state:</Text>
        <Flex direction="row" gap={8}>
          {colors.slice(0, 3).map(color => (
            <ColorSwatch
              key={color}
              color={color}
              size={32}
              disabled
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}