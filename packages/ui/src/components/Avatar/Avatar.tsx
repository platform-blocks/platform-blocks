import React from 'react';
import { Image, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { isWeb, webStyle } from '../../core/platform';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { resolveAccentColor, resolveBg } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor } from '../../core/theme/tokens';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { resolveImageSource } from '../../utils/imageSource';
import { Indicator } from '../Indicator';
import { Text } from '../Text';
import type { AvatarProps } from './types';

type AvatarMetrics = {
  avatar: number;
  indicator: number;
  text: ComponentSize;
};

const AVATAR_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

/**
 * Avatar diameters. Avatars are media, not controls, so they keep their own
 * ladder (large avatars outgrow the control-height table); the status dot and
 * the initials' text token are derived per step.
 */
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

function pickTextSize(value: number): ComponentSize {
  if (value >= 92) return '3xl';
  if (value >= 80) return '2xl';
  if (value >= 64) return 'xl';
  if (value >= 52) return 'lg';
  if (value >= 44) return 'md';
  if (value >= 32) return 'sm';
  return 'xs';
}

function calculateNumericMetrics(value: number): AvatarMetrics {
  const ratio = value / BASE_AVATAR_METRICS.avatar;
  return {
    avatar: value,
    indicator: Math.max(4, Math.round(BASE_AVATAR_METRICS.indicator * ratio)),
    text: pickTextSize(value),
  };
}

function resolveAvatarMetrics(value: ComponentSizeValue | undefined): AvatarMetrics {
  if (typeof value === 'number') return calculateNumericMetrics(value);
  const resolved = resolveComponentSize(value, AVATAR_SIZE_SCALE, {
    allowedSizes: AVATAR_ALLOWED_SIZES,
    fallback: 'md',
  });
  return typeof resolved === 'number' ? calculateNumericMetrics(resolved) : resolved;
}

/** Initials are large, bold text: 3:1 (WCAG large text) is the bar. */
const INITIALS_MIN_CONTRAST = 3;

const NO_SELECT = webStyle({ userSelect: 'none', cursor: 'default' });

/**
 * A user's picture, initials or icon in a circle, with an optional online dot
 * and an optional name/description beside it. With `accessibilityLabel` the
 * avatar is an image with that name; otherwise it is decorative (the label
 * beside it, if any, names the person).
 */
export const Avatar = factory<{ props: AvatarProps; ref: View }>((props, ref) => {
  const {
    size = 'md',
    src,
    fallback,
    bg,
    textColor,
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
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const { avatar: avatarSize, indicator: indicatorSize, text: textSize } = resolveAvatarMetrics(size);

  const fill = (bg && resolveBg(theme, bg)) || theme.text.muted;
  const initialsColor =
    (textColor && resolveAccentColor(theme, textColor)) || onColor(theme, fill, INITIALS_MIN_CONTRAST);

  const avatarStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: fill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const accessibility = accessibilityLabel
    ? a11yProps({ role: 'img', label: accessibilityLabel, accessible: true })
    : {};
  // The picture itself never carries a separate name: the avatar (or the text beside it) does.
  const imageA11y = isWeb ? a11yProps({ hidden: true }) : { accessible: false };

  const avatar = (
    <View style={{ position: 'relative' }}>
      <View style={avatarStyle}>
        {src ? (
          <Image
            source={resolveImageSource(src)}
            style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
            {...imageA11y}
          />
        ) : typeof fallback === 'string' || fallback == null ? (
          <Text
            {...mergeSlotProps(
              {
                size: textSize,
                c: initialsColor,
                fw: 'semibold' as const,
                selectable: false,
                style: [{ textAlign: 'center' as const }, NO_SELECT],
              },
              fallbackProps
            )}
          >
            {fallback || '?'}
          </Text>
        ) : (
          fallback
        )}
      </View>
      {online ? (
        <Indicator
          size={indicatorSize}
          color={resolveAccentColor(theme, indicatorColor ?? 'success')}
          borderColor={theme.backgrounds?.surface}
          placement="bottom-right"
        />
      ) : null}
    </View>
  );

  const spacingStyle = resolveStyleProps(styleProps, theme);
  const hasText = Boolean(label || description) && showText;

  if (!hasText) {
    return (
      <View ref={ref} style={[spacingStyle, style]} testID={testID} {...accessibility}>
        {avatar}
      </View>
    );
  }

  return (
    <View ref={ref} style={[{ flexDirection: 'row', alignItems: 'center' }, spacingStyle, style]} testID={testID}>
      <View {...accessibility}>{avatar}</View>
      <View style={{ marginStart: gap, justifyContent: 'center' }}>
        {label ? (
          typeof label === 'string' ? (
            <Text {...mergeSlotProps({ size: textSize, fw: 'semibold' as const }, labelProps)}>{label}</Text>
          ) : (
            label
          )
        ) : null}
        {description ? (
          typeof description === 'string' ? (
            <Text {...mergeSlotProps({ size: textSize, c: theme.text.secondary }, descriptionProps)}>
              {description}
            </Text>
          ) : (
            description
          )
        ) : null}
      </View>
    </View>
  );
}, { displayName: 'Avatar' });
