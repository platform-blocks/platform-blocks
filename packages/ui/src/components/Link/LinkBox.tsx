import React from 'react';
import { Linking, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { isWeb } from '../../core/platform';
import { devError } from '../../core/utils/logger';

export interface LinkBoxProps {
  href: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Handles ordinary navigation. Modified browser clicks retain their native behavior. */
  onNavigate?: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
}

const WEB_STYLE = {
  display: 'flex' as const,
  flexDirection: 'column' as const,
  color: 'inherit',
  textDecoration: 'none' as const,
  cursor: 'pointer' as const,
};

/** A block-level link that can wrap cards and other views while keeping a real web anchor. */
export function LinkBox({ href, children, style, accessibilityLabel, onNavigate, onHoverIn, onHoverOut }: LinkBoxProps) {
  if (isWeb) {
    return React.createElement('a', {
      href,
      'aria-label': accessibilityLabel,
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!onNavigate || event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onNavigate();
      },
      onMouseEnter: onHoverIn,
      onMouseLeave: onHoverOut,
      style: { ...WEB_STYLE, ...(StyleSheet.flatten(style) as object) },
    }, children);
  }

  return (
    <Pressable
      onPress={() => {
        if (onNavigate) onNavigate();
        else Linking.openURL(href).catch((error) => devError('Failed to open URL:', href, error));
      }}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      style={style}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}
