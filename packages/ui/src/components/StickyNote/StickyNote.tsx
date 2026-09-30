import React from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { resolveBg } from '../../core/theme/resolveColors';
import { resolveShadow } from '../../core/theme/shadow';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { StickyNoteProps } from './types';

const PAPER_COLORS: Record<string, string> = {
  yellow: '#FFF1A8',
  pink: '#FFD5DE',
  blue: '#CFEAFF',
  green: '#DDF3BE',
  purple: '#E9DDFC',
};

/** A small paper note for reminders, ideas, and pinboard layouts. */
export const StickyNote = factory<{ props: StickyNoteProps; ref: View }>((allProps, ref) => {
  const { bg, ...propsWithoutBg } = allProps;
  const { styleProps, otherProps } = extractStyleProps(propsWithoutBg);
  const {
    children,
    title,
    footer,
    color = 'yellow',
    size = 220,
    rotation = 0,
    onPress,
    disabled = false,
    style,
    testID,
    ...rest
  } = otherProps;
  const theme = useTheme();
  const paper = resolveBg(theme, bg) ?? PAPER_COLORS[color] ?? resolveBg(theme, color) ?? PAPER_COLORS.yellow;
  const ink = onColor(theme, paper);
  const spacingStyle = useStyleProps(styleProps);
  const noteStyle: ViewStyle = {
    width: size,
    minHeight: size,
    paddingHorizontal: 18,
    paddingTop: 27,
    paddingBottom: 18,
    borderRadius: 3,
    backgroundColor: paper,
    transform: [{ rotate: `${rotation}deg` }],
    opacity: disabled ? 0.5 : 1,
  };
  const content = (
    <>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 9, backgroundColor: 'rgba(0,0,0,0.055)' }}
      />
      {title ? (
        <Text style={{ color: ink, fontSize: 17, fontWeight: '700', lineHeight: 23, marginBottom: 10 }}>
          {title}
        </Text>
      ) : null}
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={{ color: ink, fontSize: 15, lineHeight: 22 }}>{children}</Text>
      ) : children}
      {footer != null ? (
        <View style={{ marginTop: 'auto', paddingTop: 16 }}>
          {typeof footer === 'string' || typeof footer === 'number' ? (
            <Text style={{ color: ink, fontSize: 12, opacity: 0.7 }}>{footer}</Text>
          ) : footer}
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        {...rest}
        {...a11yProps({ role: 'button', disabled })}
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        style={({ pressed }) => [noteStyle, resolveShadow(theme, 'md'), spacingStyle, pressed && { opacity: 0.8 }, style]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View ref={ref} {...rest} testID={testID} style={[noteStyle, resolveShadow(theme, 'md'), spacingStyle, style]}>
      {content}
    </View>
  );
}, { displayName: 'StickyNote' });
