import React from 'react';
import {
  Linking,
  Text as RNText,
  type GestureResponderEvent,
  type TextStyle,
  type StyleProp,
} from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { isWeb, webProps, webStyle } from '../../core/platform';
import { resolveColorProp } from '../../core/theme/resolveColors';
import type { SizeValue } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize } from '../../core/theme/tokens';
import type { BaseProps, ColorProp } from '../../core/types/base';
import { devError } from '../../core/utils/logger';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useHover } from '../../hooks/useHover';
import type { PassthroughAccessibilityProps } from '../Button/types';

export interface LinkProps
  extends BaseProps<TextStyle>,
    PassthroughAccessibilityProps {
  /** Link text content */
  children: React.ReactNode;
  /** Destination URL. On web the link is a real `<a href>` (middle-click, open in new tab, …). */
  href?: string;
  /** Custom press handler (overrides navigating to `href`) */
  onPress?: () => void;
  /** Size of the link text (default: 'lg' = 16px to match the Text component) */
  size?: SizeValue;
  /** Palette token, `'primary.6'` shade syntax, CSS color, or `'inherit'` */
  c?: ColorProp | 'inherit';
  /** Link variant */
  variant?: 'default' | 'subtle' | 'hover-underline';
  /** Whether the link is disabled */
  disabled?: boolean;
  /**
   * An external link: opens in a new tab on web (`target="_blank"`,
   * `rel="noopener noreferrer"`), shows a ↗ indicator, and is announced as
   * opening in a new tab.
   */
  external?: boolean;
  /** Additional text style (merged after `style`) */
  textStyle?: StyleProp<TextStyle>;
  /** Accessible name (defaults to the link text) */
  accessibilityLabel?: string;
  /** Whether this link opens in a new tab/window (web only) */
  target?: '_blank' | '_self';
  /** Label appended to the accessible name of links that open in a new tab. @default 'opens in a new tab' */
  newTabLabel?: string;
  /** Custom font family (overrides theme font) */
  ff?: string;
}

const UNDERLINE: TextStyle = { textDecorationLine: 'underline' };
const NO_UNDERLINE: TextStyle = { textDecorationLine: 'none' };

/**
 * A text link. Rendered as text, so it flows inline inside a paragraph
 * (`<Text>Read the <Link href="…">docs</Link></Text>`); on web it is a real
 * anchor. `external` links open in a new tab and say so to screen readers.
 * The ref is the underlying Text.
 */
export const Link = factory<{ props: LinkProps; ref: RNText }>((props, ref) => {
  const {
    children,
    href,
    onPress,
    size = 'lg',
    c: color = 'primary',
    variant = 'default',
    disabled = false,
    external = false,
    style,
    textStyle,
    accessibilityLabel,
    target = '_self',
    newTabLabel = 'opens in a new tab',
    ff: fontFamily,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps, otherProps: a11yRest } = extractStyleProps(rest);
  const [hovered, hoverHandlers] = useHover();
  const opensNewTab = external || target === '_blank';

  // Link text sits on a surface, so it takes the readable shade (6) rather than
  // the fill base — through the *palette*, not the `theme.text` roles:
  // `color="primary"` on a link has to stay the brand blue, not body copy.
  const textColor =
    color === 'inherit'
      ? undefined
      : disabled
        ? theme.text.disabled
        : (resolveColorProp(theme, color, { shades: [6, 5] }) ?? theme.text.link);

  const linkStyle: TextStyle = {
    fontSize: resolveFontSize(theme, size),
    fontFamily: fontFamily ?? theme.fontFamily,
    ...(textColor ? { color: textColor } : null),
    ...(disabled ? { opacity: 0.6 } : null),
  };
  // Underline always for `default`; on hover for every variant (web).
  const underline = variant === 'default' || (hovered && !disabled) ? UNDERLINE : NO_UNDERLINE;

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
    if (onPress) {
      // On web the anchor would also navigate; the custom handler replaces that.
      if (isWeb && href) event.preventDefault();
      onPress();
      return;
    }
    // Web: the anchor navigates natively (keeps middle-click, modifier keys…).
    if (!isWeb && href) {
      Linking.openURL(href).catch((err) => {
        devError('Failed to open URL:', href, err);
      });
    }
  };

  const text = getNodeText(children);
  const baseLabel = accessibilityLabel ?? (opensNewTab ? text : undefined);
  const label = opensNewTab && baseLabel ? `${baseLabel} (${newTabLabel})` : baseLabel;

  return (
    <RNText
      ref={ref}
      testID={testID}
      {...a11yProps({ role: 'link', label, disabled })}
      {...a11yRest}
      disabled={disabled}
      onPress={handlePress}
      {...webProps({
        href: disabled ? undefined : href,
        hrefAttrs: opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : undefined,
        onMouseEnter: hoverHandlers.onMouseEnter,
        onMouseLeave: hoverHandlers.onMouseLeave,
      })}
      style={[
        linkStyle,
        underline,
        webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
        resolveStyleProps(styleProps, theme),
        style,
        textStyle,
      ]}
    >
      {children}
      {external ? (
        // The arrow is decoration; the accessible name already says "opens in a new tab".
        <RNText {...(isWeb ? a11yProps({ hidden: true }) : { accessibilityElementsHidden: true })}> ↗</RNText>
      ) : null}
    </RNText>
  );
}, { displayName: 'Link' });
