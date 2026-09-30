import React from 'react';
import { Pressable, View, type Role } from 'react-native';

import { factory } from '../../core/factory/factory';
import { isWeb } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveIconSize } from '../../core/theme/tokens';
import type { SizeToken } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { BlockquoteAttribution } from './BlockquoteAttribution';
import { getBlockquoteStyles, QUOTE_ICON_STEP } from './styles';
import type { BlockquoteProps } from './types';

/**
 * react-native-web renders `role="blockquote"` as a `<blockquote>` element;
 * native has no quote role, so the container is a plain view there.
 */
const BLOCKQUOTE_ROLE = (isWeb ? 'blockquote' : undefined) as Role | undefined;

/**
 * A quotation with optional attribution (author, source, rating, date). On web
 * it renders a `<blockquote>`; with `onPress` the whole quote is a button.
 */
export const Blockquote = factory<{ props: BlockquoteProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const {
    children,
    variant = 'default',
    size = 'md',
    color,
    quoteIcon = 'quote',
    quoteIconPosition = 'top-left',
    quoteIconSize = 'lg',
    author,
    links,
    date,
    rating,
    source,
    verified,
    verifiedTooltip,
    alignment = 'left',
    attributionAlignment,
    border = false,
    shadow = false,
    style,
    onPress,
    testID,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const spacingStyle = useStyleProps(styleProps);
  const resolvedQuoteIconSize =
    typeof quoteIconSize === 'number'
      ? quoteIconSize
      : resolveIconSize(theme, QUOTE_ICON_STEP[quoteIconSize as SizeToken] ?? 'lg');
  const styles = getBlockquoteStyles(
    theme,
    variant,
    size,
    alignment,
    border,
    shadow,
    color,
    resolvedQuoteIconSize,
    quoteIconPosition
  );

  const hasAttribution = Boolean(author || date || rating || source || verified);
  // Attribution reads as a signature: it hugs the trailing edge unless the quote
  // itself is centered (featured hero), where a centered signature balances it.
  const resolvedAttributionAlignment = attributionAlignment ?? (alignment === 'center' ? 'center' : 'right');

  const renderQuoteIcon = () => {
    if (quoteIconPosition === 'none') return null;

    const positionStyle =
      quoteIconPosition === 'top-left'
        ? styles.quoteIconTopLeft
        : quoteIconPosition === 'top-center'
          ? styles.quoteIconTopCenter
          : quoteIconPosition === 'bottom-right'
            ? styles.quoteIconBottomRight
            : undefined;

    const iconElement = React.isValidElement(quoteIcon) ? (
      quoteIcon
    ) : (
      <Icon
        name={typeof quoteIcon === 'string' ? quoteIcon : 'quote'}
        size={resolvedQuoteIconSize}
        // The glyph is the default variant's only accent, so it carries the
        // primary tint instead of receding like the other variants.
        color={variant === 'default' ? theme.colors.primary[5] : theme.text.muted}
        style={styles.quoteIcon}
        variant="filled"
        decorative
      />
    );

    return (
      // Decorative: the quote marks are implied by the blockquote itself.
      <View style={[styles.quoteIconContainer, positionStyle]} aria-hidden importantForAccessibility="no-hide-descendants">
        {iconElement}
      </View>
    );
  };

  const body = (
    <>
      {(quoteIconPosition === 'top-left' || quoteIconPosition === 'top-center') && renderQuoteIcon()}

      <View style={styles.content}>
        <Text style={styles.quoteText}>{children}</Text>
        {quoteIconPosition === 'bottom-right' && renderQuoteIcon()}
      </View>

      {hasAttribution && (
        <BlockquoteAttribution
          author={author}
          date={date}
          rating={rating}
          source={source}
          links={links}
          verified={verified}
          verifiedTooltip={verifiedTooltip}
          alignment={resolvedAttributionAlignment}
        />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        role="button"
        {...rest}
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [styles.container, spacingStyle, style, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View ref={ref} role={BLOCKQUOTE_ROLE} {...rest} testID={testID} style={[styles.container, spacingStyle, style]}>
      {body}
    </View>
  );
}, { displayName: 'Blockquote' });
