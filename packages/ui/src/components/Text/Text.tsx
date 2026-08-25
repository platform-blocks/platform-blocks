import React from 'react';
import { Text as RNText, Platform, StyleSheet, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../../core/theme/ThemeProvider';
import { SizeValue, getFontSize, getLineHeight } from '../../core/theme/sizes';
import { SpacingProps, getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { useI18n } from '../../core/i18n';
import { useDirection } from '../../core/providers/DirectionProvider';
import { resolveTextColor } from '../../core/theme/resolveColors';

export type HTMLTextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div'
  | 'small' | 'caption' | 'strong' | 'b' | 'i' | 'em' | 'u'
  | 'sub' | 'sup' | 'mark' | 'code' | 'kbd'
  | 'blockquote' | 'cite';

export interface TextProps extends SpacingProps {
  /** Text node children. Optional if using translation via `tx`. */
  children?: React.ReactNode;
  /** Translation key (if provided, overrides children when found) */
  tx?: string;
  /** Params for translation interpolation */
  txParams?: Record<string, any>;
  /** Text variant (mirrors semantic HTML tags) */
  variant?: HTMLTextVariant;
  /** Size can be a size token or number (overrides variant fontSize) */
  size?: SizeValue;
  /** Text color (overrides theme text color) */
  color?: string;
  /** Shorthand alias for `color`. Accepts `'dimmed'`, theme palette names, `'primary.6'` syntax, or any CSS color string. */
  c?: string;
  /** Semantic color variant (overrides color prop). Supports text palette plus status colors */
  colorVariant?: 'primary' | 'secondary' | 'muted' | 'disabled' | 'link' | 'success' | 'warning' | 'error' | 'info';
  /** Font weight (supports all CSS font-weight values) */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'light' | 'black' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Line height as a multiplier (e.g., 1.5) or absolute value */
  lineHeight?: number;
  /** Letter spacing (tracking) in pixels or em units */
  tracking?: number;
  /** Convert text to uppercase */
  uppercase?: boolean;
  /** Additional styles (overrides computed styles) */
  style?: any;
  /** Custom font family (overrides theme font) */
  fontFamily?: string;
  /** Shorthand alias for `fontFamily` */
  ff?: string;
  /** For platform-specific rendering on web */
  as?: HTMLTextVariant;
  /** Whether text is selectable (default: true) */
  selectable?: boolean;
  /** Called when text is pressed */
  onPress?: () => void;
  /** Called when the text layout is calculated */
  onLayout?: (event: any) => void;
  /** Value to display (overrides children, useful for numbers) */
  value?: string | number;
  /** Maximum number of lines to display (native + web) */
  numberOfLines?: RNTextProps['numberOfLines'];
  /** Ellipsis strategy when text exceeds available space */
  ellipsizeMode?: RNTextProps['ellipsizeMode'];
  /** Element id. On web this is the DOM `id` — headings need one to be a link target. */
  id?: string;
  /** React Native alias for `id`; used when the two platforms need different values. */
  nativeID?: string;
}

const getTextStyles = (
  theme: any,
  variant: HTMLTextVariant = 'p',
  size?: SizeValue,
  weight?: TextProps['weight'],
  align: 'left' | 'center' | 'right' | 'justify' = 'left',
  color?: string,
  colorVariant?: 'primary' | 'secondary' | 'muted' | 'disabled' | 'link' | 'success' | 'warning' | 'error' | 'info',
  fontFamily?: string,
  lineHeight?: number,
  tracking?: number,
  uppercase?: boolean,
  isRTL?: boolean
) => {
  const variantFontSizes: Record<HTMLTextVariant, number> = {
    // HTML heading variants
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,

    // HTML text variants
    p: 16,
    span: 16,
    div: 16,
    small: 12,
    caption: 12,
    code: 14,
    kbd: 14,
    blockquote: 18,
    cite: 14,

    // HTML semantic variants (inherit base size, styling via weight/style)
    strong: 16,
    b: 16,
    i: 16,
    em: 16,
    u: 16,
    sub: 12,
    sup: 12,
    mark: 16
  };

  // Use size prop if provided, otherwise use variant-based size
  const fontSize = size !== undefined ? getFontSize(size) : variantFontSizes[variant as keyof typeof variantFontSizes] || 16;
  const lineHeightMultiplier = size !== undefined ? getLineHeight(size) : 1.4;
  const calculatedLineHeight = lineHeight !== undefined 
    ? (lineHeight > 3 ? lineHeight : fontSize * lineHeight) // If > 3, treat as absolute value, else as multiplier
    : fontSize * lineHeightMultiplier;

  // HTML variant styles with semantic defaults
  const variantStyles: Record<HTMLTextVariant, any> = {
    // HTML headings
    h1: { fontSize, fontWeight: '700', lineHeight: calculatedLineHeight },
    h2: { fontSize, fontWeight: '700', lineHeight: calculatedLineHeight },
    h3: { fontSize, fontWeight: '600', lineHeight: calculatedLineHeight },
    h4: { fontSize, fontWeight: '600', lineHeight: calculatedLineHeight },
    h5: { fontSize, fontWeight: '500', lineHeight: calculatedLineHeight },
    h6: { fontSize, fontWeight: '500', lineHeight: calculatedLineHeight },

    // HTML text elements
    p: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight },
    span: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight },
    div: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight },
    small: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight },
    caption: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight },

    // HTML semantic elements
    strong: { fontSize, fontWeight: '700', lineHeight: calculatedLineHeight },
    b: { fontSize, fontWeight: '700', lineHeight: calculatedLineHeight },
    i: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, fontStyle: 'italic' },
    em: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, fontStyle: 'italic' },
    u: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, textDecorationLine: 'underline' },
    sub: { fontSize, fontWeight: '400', lineHeight: fontSize * 1.2, ...(Platform.OS === 'web' ? { verticalAlign: 'sub' } : {}) },
    sup: { fontSize, fontWeight: '400', lineHeight: fontSize * 1.2, ...(Platform.OS === 'web' ? { verticalAlign: 'super' } : {}) },
    mark: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, ...(Platform.OS === 'web' ? { backgroundColor: '#ffff00' } : {}) },
    code: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, fontFamily: Platform.select({ web: 'monospace', default: 'Courier New' }) },
    kbd: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, fontFamily: Platform.select({ web: 'monospace', default: 'Courier New' }) },
    blockquote: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, fontStyle: 'italic' },
    cite: { fontSize, fontWeight: '400', lineHeight: calculatedLineHeight, fontStyle: 'italic' }
  };

  // Enhanced weight styles supporting all CSS font-weight values
  const weightStyles: Record<string, { fontWeight: string }> = {
    '100': { fontWeight: '100' },
    '200': { fontWeight: '200' },
    '300': { fontWeight: '300' },
    '400': { fontWeight: '400' },
    '500': { fontWeight: '500' },
    '600': { fontWeight: '600' },
    '700': { fontWeight: '700' },
    '800': { fontWeight: '800' },
    '900': { fontWeight: '900' },
    normal: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
    light: { fontWeight: '300' },
    black: { fontWeight: '900' }
  };

  // Handle numeric weights
  const getFontWeight = (weight: TextProps['weight']): string => {
    if (typeof weight === 'number') {
      return weight.toString();
    }
    return weightStyles[weight || 'normal']?.fontWeight || '400';
  };

  // Resolve text color with semantic variants
  const getTextColor = (): string => {
    // Direct color override: allow raw color strings AND token keys (theme.colors / theme.text)
    if (color) {
      // If matches a text token
      if ((theme.text as any)[color]) return (theme.text as any)[color];
      // If matches a color palette key (take middle shade 5 if present)
      if ((theme.colors as any)[color]) {
        const palette = (theme.colors as any)[color];
        return Array.isArray(palette) ? (palette[5] || palette[0]) : palette;
      }
      return color; // assume raw CSS color
    }
    if (colorVariant) {
      if ((theme.text as any)[colorVariant]) return (theme.text as any)[colorVariant];
      if ((theme.colors as any)[colorVariant]) {
        const palette = (theme.colors as any)[colorVariant];
        return Array.isArray(palette) ? (palette[5] || palette[0]) : palette;
      }
      if (colorVariant === 'info' && (theme.colors as any).primary) {
        const palette = (theme.colors as any).primary;
        return Array.isArray(palette) ? (palette[5] || palette[0]) : palette;
      }
    }
    return theme.text.primary;
  };

  const baseStyles = {
    fontFamily: fontFamily || theme.fontFamily,
    textAlign: align === 'left' && isRTL ? 'right' : align === 'right' && isRTL ? 'left' : align,
    color: getTextColor()
  };

  const variantStyle = variantStyles[variant as keyof typeof variantStyles] || variantStyles.p;

  return {
    ...baseStyles,
    ...variantStyle,
    // Only override fontWeight if weight prop is explicitly provided
    ...(weight !== undefined && { fontWeight: getFontWeight(weight) }),
    fontSize: size ? (typeof size === 'number' ? size : getFontSize(size)) : variantStyle.fontSize,
    lineHeight: calculatedLineHeight,
    ...(tracking !== undefined && { letterSpacing: tracking }),
    ...(uppercase && { textTransform: 'uppercase' })
  };
};

// Helper function to convert React Native styles to web CSS
const convertToWebStyles = (rnStyles: any): React.CSSProperties => {
  if (!rnStyles) return {};

  // Flatten the styles. Use StyleSheet.flatten (not Object.assign) so that
  // NESTED style arrays are merged recursively — callers routinely pass
  // `style={[a, [b, c]]}` (e.g. Chip/Badge wrap their label as
  // `[textStyles, textStyle]` and pass it as one element of the outer array).
  // A shallow Object.assign would spread such a nested array by numeric index
  // and silently drop its `color`/`fontSize`/etc., causing bugs like
  // white-on-white text on web. StyleSheet.flatten handles arbitrary nesting.
  const flatStyles = StyleSheet.flatten(rnStyles) || {};

  // Convert React Native style properties to web CSS properties
  const webStyles: React.CSSProperties = {};

  Object.keys(flatStyles).forEach(key => {
    const value = flatStyles[key];

    switch (key) {
      case 'fontWeight':
        webStyles.fontWeight = value;
        break;
      case 'fontSize':
        webStyles.fontSize = typeof value === 'number' ? `${value}px` : value;
        break;
      case 'lineHeight':
        webStyles.lineHeight = typeof value === 'number' ? `${value}px` : value;
        break;
      case 'textAlign':
        webStyles.textAlign = value;
        break;
      case 'color':
        webStyles.color = value;
        break;
      case 'fontFamily':
        webStyles.fontFamily = value;
        break;
      case 'fontStyle':
        webStyles.fontStyle = value;
        break;
      case 'textDecorationLine':
        webStyles.textDecoration = value;
        break;
      case 'backgroundColor':
        webStyles.backgroundColor = value;
        break;
      case 'letterSpacing':
        webStyles.letterSpacing = typeof value === 'number' ? `${value}px` : value;
        break;
      case 'textTransform':
        webStyles.textTransform = value;
        break;
      default:
        // For other properties, pass them through if they're valid CSS
        if (typeof value === 'string' || typeof value === 'number') {
          (webStyles as any)[key] = value;
        }
        break;
    }
  });

  return webStyles;
};

const containsPlatformText = (node: React.ReactNode): boolean => {
  return React.Children.toArray(node).some(child => {
    if (React.isValidElement(child)) {
      const childType: any = child.type;
      if (childType?.__PLATFORM_BLOCKS_TEXT__ === true) {
        return true;
      }
      const childProps: any = child.props;
      if (childProps?.children) {
        return containsPlatformText(childProps.children);
      }
    }
    return false;
  });
};

// HTML host tags that are valid *inline* children of a <p>. Anything else
// (div, section, RN/platform-blocks components that render a View, …) forces
// the enclosing Text to render as a <div> instead of a <p>.
const INLINE_HOST_TAGS = new Set([
  'span', 'b', 'i', 'em', 'strong', 'code', 'a', 'img', 'br', 'sub', 'sup',
  'mark', 'u', 'cite', 'kbd', 'small', 'label', 'abbr', 'q', 's', 'del',
  'ins', 'time', 'var', 'samp', 'wbr', 'bdi', 'bdo',
]);

/**
 * Check if children contain block-level elements that would render as <div>
 * (or otherwise be invalid) inside a <p> on web. We can't reliably reach the
 * <View> a component renders internally (it isn't exposed via props.children)
 * and component displayNames aren't stable, so we treat *any* component child
 * as potentially block-level. This is safe: a downgraded <div> is still forced
 * to `display: inline` below, so inline flow is preserved either way.
 */
const containsBlockElement = (node: React.ReactNode): boolean => {
  return React.Children.toArray(node).some(child => {
    if (!React.isValidElement(child)) return false; // strings / numbers are inline
    const childType: any = child.type;
    const childProps: any = child.props;

    // Host element (string tag): inline tags are fine but still recurse into
    // their children; every other tag (div, p, section, …) is block-level.
    if (typeof childType === 'string') {
      if (!INLINE_HOST_TAGS.has(childType)) return true;
      return childProps?.children ? containsBlockElement(childProps.children) : false;
    }

    // Fragments carry no element of their own — inspect their children.
    if (childType === React.Fragment) {
      return childProps?.children ? containsBlockElement(childProps.children) : false;
    }

    // Any component (RN View/Pressable, platform-blocks Flex/Card/Icon/Image/
    // Loader/Text, custom demo components, …) may render a block-level box.
    return true;
  });
};

export const Text = React.forwardRef<RNText, TextProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const {
    children,
    tx,
    txParams,
    variant = 'p',
    size,
    weight,
    align = 'left',
    color,
    c,
    colorVariant,
    lineHeight,
    tracking,
    uppercase,
    style,
    fontFamily,
    ff,
    as,
    selectable = true,
    onPress,
    onLayout,
    value,
    numberOfLines,
    ellipsizeMode,
    id,
    nativeID
  } = otherProps as any;

  const elementId = id ?? nativeID;

  const theme = useTheme();
  const { t } = useI18n();
  const { isRTL } = useDirection();

  // // Only use i18n if tx prop is provided
  // let t: ((key: string, params?: Record<string, any>) => string) | undefined;
  // try {
  //   if (tx) {
  //     const i18n = useI18n();
  //     t = i18n.t;
  //   }
  // } catch (error) {
  //   // I18n not available, will use children instead
  //   console.warn('I18n not available for Text component, using children prop');
  // }

  // `c` shorthand: resolve through shared theme helper so
  // values like 'dimmed', 'primary', 'primary.6' work identically across
  // Text, Block, Card, etc. `c` wins over `color` if both are passed.
  const resolvedColor = c
    ? resolveTextColor(theme, c) ?? c
    : color;
  const textStyles = getTextStyles(theme, variant, size, weight, align, resolvedColor, colorVariant, ff ?? fontFamily, lineHeight, tracking, uppercase, isRTL);
  const spacingStyles = getSpacingStyles(spacingProps);
  const content = 
  (tx && t )
  ? t(tx, txParams) 
  : value ? value :
  children;

  // Determine if children contain heading-level Text components to avoid invalid <h*> inside <p>
  let htmlTag = as || variant;
  if (Platform.OS === 'web' && htmlTag === 'p') {
    const headingVariants = new Set(['h1','h2','h3','h4','h5','h6']);
    const hasHeadingChild = React.Children.toArray(children).some(ch => {
      if (React.isValidElement(ch)) {
        const propsAny: any = ch.props; // runtime inspection only
        const v = propsAny?.variant;
        if (typeof v === 'string' && headingVariants.has(v)) return true;
      }
      return false;
    });
    if (hasHeadingChild) {
      // Switch to div to prevent <h*> inside <p> DOM nesting warning / hydration error
      htmlTag = 'div';
    }
    if (htmlTag === 'p' && containsPlatformText(children)) {
      // Avoid nested paragraphs when Text components are nested
      htmlTag = 'div';
    }
    if (htmlTag === 'p' && containsBlockElement(children)) {
      // Avoid <div> inside <p> when children contain View, Pressable, etc.
      htmlTag = 'div';
    }
  }

  // Platform-specific rendering
  if (Platform.OS === 'web' && isHTMLVariant(htmlTag)) {
    const styleArray = Array.isArray(style) ? style : [style];
    const hasDisplayOverride = styleArray.some((item) => item && (((item as any).display !== undefined) || ((item as any).whiteSpace !== undefined)));

    const webStyles = convertToWebStyles([
      textStyles,
      spacingStyles,
      style,
      // default to inline unless caller explicitly requests display/whitespace behavior
      ...(hasDisplayOverride ? [] : [{ display: 'inline' }]),
    ]);

    // Handle text selection for web
    if (!selectable) {
      webStyles.userSelect = 'none';
      webStyles.WebkitUserSelect = 'none';
      webStyles.MozUserSelect = 'none';
      webStyles.msUserSelect = 'none';
    }

    // Reset default browser margins for heading elements
    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(htmlTag);
    if (isHeading && !spacingStyles.margin && !spacingStyles.marginTop && !spacingStyles.marginBottom) {
      webStyles.margin = 0;
    }

    const webExtraStyles: Record<string, any> = {};
    if (numberOfLines === 1) {
      webExtraStyles.whiteSpace = 'nowrap';
      webExtraStyles.overflow = 'hidden';
      if (ellipsizeMode === 'tail' || ellipsizeMode === undefined) {
        webExtraStyles.textOverflow = 'ellipsis';
      }
    } else if (typeof numberOfLines === 'number' && numberOfLines > 1) {
      // Multi-line clamp: RNText's `numberOfLines` truncates after N lines on
      // native, but the web path renders a plain HTML element that would
      // otherwise wrap unbounded. Reproduce the clamp with the -webkit-box
      // line-clamp idiom (widely supported) so web matches native.
      webExtraStyles.display = '-webkit-box';
      webExtraStyles.WebkitBoxOrient = 'vertical';
      webExtraStyles.WebkitLineClamp = String(numberOfLines);
      webExtraStyles.overflow = 'hidden';
    }

    return React.createElement(
      htmlTag as string,
      {
        // Only attach when a consumer actually forwarded one — an explicit
        // `ref: null` would otherwise show up as a prop on the host element.
        ...(ref ? { ref } : {}),
        ...(elementId ? { id: elementId } : {}),
        style: { ...webStyles, ...webExtraStyles },
        className: 'platform-blocks-text', // Optional: for CSS targeting
        onClick: onPress, // Handle onPress for web
        ...(onPress && { style: { ...webStyles, ...webExtraStyles, cursor: 'pointer' } })
      },
  content
    );
  }

  // Fallback to React Native Text for mobile or non-HTML variants
  return (
    <RNText
      ref={ref}
      nativeID={elementId}
      style={[textStyles, spacingStyles, style]}
      selectable={selectable}
      onPress={onPress}
      onLayout={onLayout}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
  {content}
    </RNText>
  );
});

Text.displayName = 'Text';
(Text as any).__PLATFORM_BLOCKS_TEXT__ = true;

// Helper function to check if variant is a valid HTML tag
const isHTMLVariant = (variant: any): variant is HTMLTextVariant => {
  const htmlTags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'div', 'small', 'caption', 'strong', 'b', 'i', 'em', 'u',
    'sub', 'sup', 'mark', 'code', 'kbd', 'blockquote', 'cite'
  ];
  return htmlTags.includes(variant);
};
