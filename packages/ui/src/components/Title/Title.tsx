import React from 'react';
import { View } from 'react-native';
import { useMergedRef } from '../../core/utils';
import { Text, type TextProps } from '../Text';
import type { TitleProps } from './types';
import { useTheme } from '../../core/theme';
import { Block } from '../Block';
import { useTitleRegistration } from '../../hooks/useTitleRegistration';
import { useDirection } from '../../core/providers/DirectionProvider';

const levelToVariant: Record<number, TextProps['variant']> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

export const Title = React.forwardRef<View, TitleProps>(({
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
  action, // right action button to the very right of the screen - after the afterline
  subtitle,
  subtitleProps,
  subtitleSpacing = 8,
  ...textProps
}, ref) => {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const color = underlineColor || theme.colors.primary?.[5] || theme.text.primary;
  const variant = levelToVariant[order] || 'h2';

  // Auto-register this title with the registry for TableOfContents. An explicit
  // `id` becomes both the heading's element id and its registry id, so a link
  // target and its table-of-contents entry can't drift apart.
  const titleText = text || (typeof children === 'string' ? children : '');
  const { elementRef } = useTitleRegistration({
    text: titleText,
    order,
    id: (textProps as { id?: string }).id,
    autoRegister: !!titleText, // Only register if we have text content
  });

  const resolvedPrefixColor = prefixColor || color;
  const renderPrefix = () => {
    if (!prefix) return null;
    if (React.isValidElement(prefix)) return prefix;
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
            ...(isRTL ? { marginLeft: prefixGap } : { marginRight: prefixGap })
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
          borderRadius: prefixRadius ?? (prefixSize / 2),
          ...(isRTL ? { marginLeft: prefixGap } : { marginRight: prefixGap })
        }}
      />
    );
  };

  // Build underline element
  const Underline = underline ? (
    <View
      testID="title-underline"
      style={{
        height: underlineStroke,
        backgroundColor: color,
        marginTop: underlineOffset,
        borderRadius: underlineStroke / 2,
        alignSelf: 'flex-start',
        minWidth: 40,
      }}
    />
  ) : null;

  // Afterline layout: text + flexible line filling rest
  const Afterline = afterline ? (
    <View testID="title-afterline" style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: underline ? afterlineGap : 4 }}>
      <View style={{ 
        flex: 1, 
        height: underlineStroke, 
        backgroundColor: color, 
        borderRadius: underlineStroke / 2, 
        ...(isRTL ? { marginRight: 12 } : { marginLeft: 12 })
      }} />
    </View>
  ) : null;

  const renderSubtitle = () => {
    if (!subtitle) return null;

    const spacingStyle = { marginTop: subtitleSpacing };

    if (React.isValidElement(subtitle)) {
      return (
        <View style={spacingStyle}>
          {subtitle}
        </View>
      );
    }

    return (
      <Text
        variant="p"
        colorVariant="secondary"
        {...subtitleProps}
        style={[spacingStyle, subtitleProps?.style]}
      >
        {subtitle}
      </Text>
    );
  };

  return (
    <View ref={useMergedRef(elementRef, ref)} style={[{ width: '100%' }, containerStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* shrinkable so a title longer than its container wraps instead of
            running off the edge — narrow screens hit this with any long heading */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexShrink: 1,
          minWidth: 0,
          // flex: action ? 1 : undefined
        }}>
          {startIcon && <Block mr={8}>{startIcon}</Block>}
          {renderPrefix()}
          <Text
            variant={variant}
            {...textProps}
            style={[{ fontWeight: '700' }, style]}
          >
            {text || children}
          </Text>
          {endIcon && <Block ml={8}>{endIcon}</Block>}
        </View>
        {afterline && !underline && (
          <View
            testID="title-afterline-inline"
            style={{ 
              flex: 1, 
              height: underlineStroke, 
              backgroundColor: color, 
              borderRadius: underlineStroke / 2,
              ...(isRTL ? { marginRight: 12 } : { marginLeft: 12 })
            }}
          />
        )}
        {action && <Block ml={12}>{action}</Block>}
      </View>
      {underline && Underline}
      {underline && afterline && Afterline}
      {renderSubtitle()}
    </View>
  );
});

Title.displayName = 'Title';

export default Title;

// Convenience heading aliases that inherit all Title decorative props.
// These mirror the simple Text aliases but allow underline/afterline/prefix usage directly.
type HeadingProps = Omit<TitleProps, 'order'>;

const createHeading = (order: TitleProps['order'], displayName: string) => {
  const Heading = React.forwardRef<View, HeadingProps>((props, ref) => (
    <Title ref={ref} order={order} {...props} />
  ));
  Heading.displayName = displayName;
  return Heading;
};

export const Heading1 = createHeading(1, 'Heading1');
export const Heading2 = createHeading(2, 'Heading2');
export const Heading3 = createHeading(3, 'Heading3');
export const Heading4 = createHeading(4, 'Heading4');
export const Heading5 = createHeading(5, 'Heading5');
export const Heading6 = createHeading(6, 'Heading6');