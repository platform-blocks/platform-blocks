import React from 'react';
import { Linking, Pressable } from 'react-native';
import { useTheme } from '../../core/theme/ThemeProvider';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { Flex } from '../Flex';
import type { BlockquoteSourceProps } from './types';

export function BlockquoteSource({
  source,
  alignment = 'right',
}: BlockquoteSourceProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (source.url) {
      Linking.openURL(source.url).catch(() => {});
    }
  };

  const content = (
    <Flex
      // Right-aligned attribution keeps its marks on the outer edge, so the
      // icon trails the name instead of leading it.
      direction={alignment === 'right' ? 'row-reverse' : 'row'}
      align="center"
      gap="xs"
      style={{
        alignSelf: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {/* A registry icon by name, or the caller's own node (e.g. a BrandIcon) */}
      {typeof source.icon === 'string' ? (
        source.icon !== '' && (
          <Icon
            name={source.icon}
            size="sm"
            color={theme.text.muted}
            decorative
          />
        )
      ) : (
        source.icon
      )}

      {/* Source Name */}
      <Text 
        size="xs"
        c="secondary"
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
      <Pressable onPress={handlePress} role="link" aria-label={source.name}>
        {content}
      </Pressable>
    );
  }

  return content;
}