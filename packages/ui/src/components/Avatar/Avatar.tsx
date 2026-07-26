import React from 'react';
import { View, ViewStyle, Image, StyleSheet, Platform } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import type { AvatarProps } from './types';
import { Indicator } from '../Indicator';
import { mergeSlotProps } from '../../core/utils';
import { resolveImageSource } from '../../utils/imageSource';

type AvatarMetrics = {
  avatar: number;
  indicator: number;
  text: ComponentSize;
};

const AVATAR_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const AVATAR_SIZE_SCALE: Record<ComponentSize, AvatarMetrics> = {
  xs: { avatar: 24, indicator: 6, text: 'xs' },
  sm: { avatar: 32, indicator: 8, text: 'xs' },
  md: { avatar: 40, indicator: 10, text: 'sm' },
  lg: { avatar: 48, indicator: 12, text: 'md' },
  xl: { avatar: 64, indicator: 16, text: 'lg' },
  '2xl': { avatar: 80, indicator: 20, text: 'xl' },
  '3xl': { avatar: 96, indicator: 24, text: '2xl' },
};

const BASE_AVATAR_METRICS = AVATAR_SIZE_SCALE.md;

function resolveAvatarMetrics(value: ComponentSizeValue | undefined): AvatarMetrics {
  if (typeof value === 'number') {
    return calculateNumericMetrics(value);
  }

  const resolved = resolveComponentSize(value, AVATAR_SIZE_SCALE, {
    allowedSizes: AVATAR_ALLOWED_SIZES,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return calculateNumericMetrics(resolved);
  }

  return resolved;
}

function calculateNumericMetrics(value: number): AvatarMetrics {
  const ratio = value / BASE_AVATAR_METRICS.avatar;
  const indicator = Math.max(4, Math.round(BASE_AVATAR_METRICS.indicator * ratio));
  const text = pickTextSize(value);

  return {
    avatar: value,
    indicator,
    text,
  };
}

function pickTextSize(value: number): ComponentSize {
  if (value >= 92) return '3xl';
  if (value >= 80) return '2xl';
  if (value >= 64) return 'xl';
  if (value >= 52) return 'lg';
  if (value >= 44) return 'md';
  if (value >= 32) return 'sm';
  return 'xs';
}

export function Avatar({
  size = 'md',
  src,
  fallback,
  backgroundColor,
  textColor = 'white',
  online,
  indicatorColor,
  style,
  accessibilityLabel,
  label,
  description,
  gap = 8,
  showText = true,
  fallbackProps,
  labelProps,
  descriptionProps,
}: AvatarProps) {
  const theme = useTheme();

  const { avatar: avatarSize, indicator: indicatorSize, text: textSize } = resolveAvatarMetrics(size);

  const avatarStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: backgroundColor || theme.colors.gray[5],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };


  const containerStyle: ViewStyle = {
    position: 'relative',
    ...StyleSheet.flatten(style),
  };

  const content = (
    <View style={containerStyle}>
      <View style={avatarStyle}>
        {src ? (
          <Image
            source={resolveImageSource(src)}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }}
            accessibilityLabel={accessibilityLabel}
          />
        ) : typeof fallback === 'string' || fallback == null ? (
          <Text
            {...mergeSlotProps(
              {
                size: textSize,
                color: textColor,
                weight: 'semibold' as const,
                selectable: false,
                style: {
                  textAlign: 'center' as const,
                  ...(Platform.OS === 'web' && { userSelect: 'none' as any, cursor: 'default' as any }),
                },
              },
              fallbackProps,
            )}
          >
            {fallback || '?'}
          </Text>
        ) : (
          fallback
        )}
      </View>
      {online && (
        <Indicator
          size={indicatorSize}
          color={indicatorColor || theme.colors.success[5]}
          borderColor={theme.colors.gray[0]}
          placement="bottom-right"
        />
      )}
    </View>
  );

  if (label || description) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {content}
        {showText && (
          <View style={{ marginLeft: gap, justifyContent: 'center' }}>
            {label && (
              typeof label === 'string' ? (
                <Text
                  {...mergeSlotProps(
                    { size: textSize, weight: 'semibold' as const },
                    labelProps,
                  )}
                >
                  {label}
                </Text>
              ) : label
            )}
            {description && (
              typeof description === 'string' ? (
                <Text
                  {...mergeSlotProps(
                    { size: textSize, color: theme.colors.gray[6] },
                    descriptionProps,
                  )}
                >
                  {description}
                </Text>
              ) : description
            )}
          </View>
        )}
      </View>
    );
  }

  return content;
}
