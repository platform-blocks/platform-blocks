import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { useTheme } from '../../core/theme';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { BrandIcon } from '../BrandIcon';
import { Flex } from '../Flex';
import type { BlockquoteSourceProps } from './types';

export function BlockquoteSource({
  source,
  alignment = 'right',
}: BlockquoteSourceProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (source.url) {
      Linking.openURL(source.url);
    }
  };

  const content = (
    <Flex
      // Right-aligned attribution keeps its marks on the outer edge, so the
      // brand icon trails the name instead of leading it.
      direction={alignment === 'right' ? 'row-reverse' : 'row'}
      align="center"
      gap="xs"
      style={{
        alignSelf: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Brand Icon */}
      {source.brand && (
        <BrandIcon
          brand={source.brand}
          size="sm"
        />
      )}

      {/* Regular Icon */}
      {source.icon && !source.brand && (
        <Icon
          name={source.icon}
          size="sm"
          color={theme.colors.gray[5]}
        />
      )}

      {/* Source Name */}
      <Text 
        size="xs"
        color="secondary"
        style={{ 
          textAlign: alignment,
          ...(source.url && { textDecorationLine: 'underline' })
        }}
      >
        {source.name}
      </Text>
    </Flex>
  );

  if (source.url) {
    return (
      <Pressable onPress={handlePress}>
        {content}
      </Pressable>
    );
  }

  return content;
}