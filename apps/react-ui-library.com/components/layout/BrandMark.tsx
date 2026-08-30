import React from 'react';
import { View } from 'react-native';
import { Text } from '@platform-blocks/react-ui-library';

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4F46E5',
        transform: [{ rotate: '-4deg' }],
      }}
    >
      <Text
        color="white"
        weight="bold"
        family="mono"
        style={{
          fontSize: Math.round(size * 0.48),
          lineHeight: Math.round(size * 0.58),
          transform: [{ rotate: '4deg' }],
        }}
      >
        {'</>'}
      </Text>
    </View>
  );
}
