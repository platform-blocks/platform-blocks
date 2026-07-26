import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { Avatar } from '../Avatar';
import { Flex } from '../Flex';
import type { BlockquoteAuthorProps } from './types';

export function BlockquoteAuthor({
  author,
  alignment = 'right',
}: BlockquoteAuthorProps) {
  const isCentered = alignment === 'center';
  // On the right side the avatar trails the name so the portrait hugs the
  // outer edge and the text stays flush against the quote it belongs to.
  const direction = isCentered ? 'column' : alignment === 'right' ? 'row-reverse' : 'row';

  const avatar = author.avatar || author.avatarFallback ? (
    <Avatar
      src={author.avatar}
      fallback={author.avatarFallback || author.name.charAt(0)}
      size="md"
    />
  ) : null;

  return (
    <Flex
      direction={direction}
      align="center"
      gap="sm"
      style={{ alignSelf: isCentered ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start' }}
    >
      {/* Avatar */}
      {avatar}

      {/* Author Details */}
      <View style={{
        alignItems: isCentered ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
        flexShrink: 1,
      }}>
        {/* Name */}
        <Text
          weight="semibold"
          size="sm"
          style={{ textAlign: alignment }}
        >
          {author.name}
        </Text>

        {/* Title */}
        {!!author.title && (
          <Text
            size="xs"
            colorVariant="secondary"
            style={{ textAlign: alignment }}
          >
            {author.title}
          </Text>
        )}

        {/* Organization */}
        {!!author.organization && (
          <Text
            size="xs"
            colorVariant="muted"
            style={{ textAlign: alignment }}
          >
            {author.organization}
          </Text>
        )}
      </View>
    </Flex>
  );
}
