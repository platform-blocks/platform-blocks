import React from 'react';
import { useTheme } from '../../core/theme';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { Flex } from '../Flex';
import type { BlockquoteMetaProps } from './types';

export function BlockquoteMeta({
  date,
  rating,
  verified,
  verifiedTooltip,
  alignment = 'right',
}: BlockquoteMetaProps) {
  const theme = useTheme();

  const formatDate = (dateValue: Date | string) => {
    if (typeof dateValue === 'string') {
      return dateValue;
    }
    return dateValue.toLocaleDateString();
  };

  const renderStars = (value: number, max: number = 5) => {
    const stars = [];
    for (let i = 1; i <= max; i++) {
      stars.push(
        <Icon
          key={i}
          name="star"
          variant={i <= value ? 'filled' : 'outlined'}
          size="xs"
          color={i <= value ? theme.colors.warning[5] : theme.colors.gray[3]}
        />
      );
    }
    return stars;
  };

  return (
    <Flex 
      direction="row" 
      align="center"
      gap="sm"
      wrap="wrap"
      justify={alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'}
      style={{
        alignSelf: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Rating */}
      {rating && (
        <Flex direction="row" align="center" gap="xs">
          <Flex direction="row" gap={2}>
            {renderStars(rating.value, rating.max || 5)}
          </Flex>
          {rating.showValue && (
            <Text size="xs" colorVariant="secondary">
              {rating.value}/{rating.max || 5}
            </Text>
          )}
        </Flex>
      )}

      {/* Verification Badge */}
      {verified && (
        <Flex direction="row" align="center" gap={2}>
          <Icon
            name="check"
            size="xs"
            color={theme.colors.primary[5]}
          />
          <Text size="xs" colorVariant="primary">
            Verified
          </Text>
        </Flex>
      )}

      {/* Date — `!!` so an empty string renders nothing instead of a bare text node */}
      {!!date && (
        <Text size="xs" colorVariant="muted">
          {formatDate(date)}
        </Text>
      )}
    </Flex>
  );
}