import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useTitleRegistration } from '../../hooks/useTitleRegistration';
import { Block } from '../Block';
import { Text, type HTMLTextVariant } from '../Text';
import type { TitleProps } from './types';

const LEVEL_TO_TAG: Record<number, HTMLTextVariant> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

const styles = StyleSheet.create({
  root: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Shrinkable so a title longer than its container wraps instead of running
  // off the edge — narrow screens hit this with any long heading.
  titleRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 },
  text: { fontWeight: '700' },
  underline: { alignSelf: 'flex-start', minWidth: 40 },
  afterlineRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  line: { flex: 1, marginStart: 12 },
});

/**
 * A heading. `order` (1–6) sets the heading level exposed to assistive
 * technology (web: `<h1>`–`<h6>`; native: `role="heading"`) and the default
 * typography; `variant` only restyles it.
 */
export const Title = factory<{ props: TitleProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
  const {
    text,
    order = 2,
    underline = false,
    afterline = false,
    underlineColor,
    underlineStroke = 2,
    afterlineGap = 12,
    underlineOffset = 4,
    prefix = false,
    prefixVariant = 'bar',
    prefixColor,
    prefixSize = 4,
    prefixLength = 28,
    prefixGap = 12,
    prefixRadius,
    style,
    containerStyle,
    children,
    startIcon,
    endIcon,
    action, // trailing action, after the afterline
    subtitle,
    subtitleProps,
    subtitleSpacing = 8,
    variant,
    as,
    ...textProps
  } = otherProps;

  const theme = useTheme();
  const spacingStyle = useStyleProps(styleProps);
  const color = underlineColor || theme.colors.primary?.[5] || theme.text.primary;
  const headingTag = LEVEL_TO_TAG[order] || 'h2';

  // Auto-register this title with the registry for TableOfContents. An explicit
  // `id` becomes both the heading's element id and its registry id, so a link
  // target and its table-of-contents entry can't drift apart.
  const titleText = text || (typeof children === 'string' ? children : '');
  const { elementRef } = useTitleRegistration({
    text: titleText,
    order,
    id: textProps.id,
    autoRegister: !!titleText, // Only register if we have text content
  });
  const rootRef = useMergedRef(elementRef, ref);

  const lineStyle: ViewStyle = { height: underlineStroke, backgroundColor: color, borderRadius: underlineStroke / 2 };

  const renderPrefix = () => {
    if (!prefix) return null;
    if (React.isValidElement(prefix)) return prefix;
    const resolvedPrefixColor = prefixColor || color;
    if (prefixVariant === 'dot') {
      const size = prefixSize || 6;
      return (
        <View
          testID="title-prefix"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: resolvedPrefixColor,
            marginEnd: prefixGap,
          }}
        />
      );
    }
    // bar variant
    return (
      <View
        testID="title-prefix"
        style={{
          width: prefixSize,
          height: prefixLength,
          backgroundColor: resolvedPrefixColor,
          borderRadius: prefixRadius ?? prefixSize / 2,
          marginEnd: prefixGap,
        }}
      />
    );
  };

  const renderSubtitle = () => {
    if (!subtitle) return null;
    const subtitleSpacingStyle = { marginTop: subtitleSpacing };

    if (React.isValidElement(subtitle)) {
      return <View style={subtitleSpacingStyle}>{subtitle}</View>;
    }

    return (
      <Text variant="p" c="secondary" {...subtitleProps} style={[subtitleSpacingStyle, subtitleProps?.style]}>
        {subtitle}
      </Text>
    );
  };

  return (
    <View ref={rootRef} style={[styles.root, spacingStyle, containerStyle]}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          {startIcon && <Block mr={8}>{startIcon}</Block>}
          {renderPrefix()}
          <Text
            {...textProps}
            variant={variant ?? headingTag}
            // The heading level always follows `order`, whatever `variant` styles it as.
            as={as ?? headingTag}
            style={[styles.text, style]}
          >
            {text || children}
          </Text>
          {endIcon && <Block ml={8}>{endIcon}</Block>}
        </View>
        {afterline && !underline && (
          <View testID="title-afterline-inline" style={[styles.line, lineStyle]} />
        )}
        {action && <Block ml={12}>{action}</Block>}
      </View>
      {underline && (
        <View
          testID="title-underline"
          style={[styles.underline, lineStyle, { marginTop: underlineOffset }]}
        />
      )}
      {underline && afterline && (
        <View testID="title-afterline" style={[styles.afterlineRow, { marginTop: afterlineGap }]}>
          <View style={[styles.line, lineStyle]} />
        </View>
      )}
      {renderSubtitle()}
    </View>
  );
}, { displayName: 'Title' });

export default Title;

// Convenience heading aliases that inherit all Title decorative props.
// These mirror the simple Text aliases but allow underline/afterline/prefix usage directly.
type HeadingProps = Omit<TitleProps, 'order'>;

const createHeading = (order: TitleProps['order'], displayName: string) =>
  factory<{ props: HeadingProps; ref: View }>((props, ref) => <Title ref={ref} order={order} {...props} />, {
    displayName,
  });

export const Heading1 = createHeading(1, 'Heading1');
export const Heading2 = createHeading(2, 'Heading2');
export const Heading3 = createHeading(3, 'Heading3');
export const Heading4 = createHeading(4, 'Heading4');
export const Heading5 = createHeading(5, 'Heading5');
export const Heading6 = createHeading(6, 'Heading6');