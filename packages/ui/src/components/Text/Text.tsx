import React, { useMemo } from 'react';
import {
  Text as RNText,
  StyleSheet,
  type LayoutChangeEvent,
  type Role,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { roleFromAccessibilityRole } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useI18n } from '../../core/i18n/I18nContext';
import { isWeb } from '../../core/platform/flags';
import type { WebKeyboardEvent } from '../../core/platform/webProps';
import { DEFAULT_FONT_FAMILY_MONO, DEFAULT_THEME } from '../../core/theme/defaultTheme';
import { resolveTextColor } from '../../core/theme/resolveColors';
import { getTextRole } from '../../core/theme/textRoles';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize, resolveLineHeight } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue, TextRoleName, TextRoleStyle } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';

export type HTMLTextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div'
  | 'small' | 'caption' | 'strong' | 'b' | 'i' | 'em' | 'u'
  | 'sub' | 'sup' | 'mark' | 'code' | 'kbd'
  | 'blockquote' | 'cite';

export type TextWeight =
  | 'normal' | 'medium' | 'semibold' | 'bold' | 'light' | 'black'
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | number;

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Props for `Text`. Besides its own typography props, `Text` accepts every
 * React Native `Text` prop (`role`, `aria-*`, `accessibilityLabel`,
 * `accessibilityHint`, `onLongPress`, `allowFontScaling`, …) and forwards them
 * to the underlying element. On web — where `Text` renders a semantic HTML
 * element — the web-meaningful ones are mapped: `role` / `aria-*` as-is,
 * `accessibilityLabel` → `aria-label`, `testID` → `data-testid`, `dataSet` →
 * `data-*`, `lang`, `dir`, `onKeyDown`.
 */
export interface TextProps
  extends BaseProps<TextStyle>,
    Omit<RNTextProps, 'style' | 'testID' | 'children' | 'onPress' | 'onLayout'> {
  /** Text node children. Optional if using translation via `tx`. */
  children?: React.ReactNode;
  /** Translation key (if provided, overrides children when found) */
  tx?: string;
  /** Params for translation interpolation */
  txParams?: Record<string, unknown>;
  /**
   * Text variant (mirrors semantic HTML tags). `h1`–`h6` are exposed to
   * assistive technology as headings (web: the `<h1>`–`<h6>` element; native:
   * `role="heading"`).
   */
  variant?: HTMLTextVariant;
  /**
   * A theme text role (`theme.textRoles`) — `'panelTitle'` for the title of a
   * panel that holds a list, `'sectionLabel'` for a group header inside one, or
   * a role your theme adds. Supplies color, size, weight, tracking and case;
   * `c`, `size`, `fw`, `lts` and `tt` still win over it.
   * Typography only: pair it with `role="heading"` etc. where that applies.
   */
  textRole?: TextRoleName | (string & {});
  /** Size can be a size token or number (overrides variant fontSize) */
  size?: SizeValue;
  /**
   * Text color. Accepts a `theme.text` role (`'primary'`, `'secondary'`,
   * `'muted'`, `'disabled'`, `'link'`), `'dimmed'` for the muted token, a
   * palette name (`'success'` → its readable shade), `'primary.6'` shade
   * syntax, or any CSS color string.
   */
  c?: string;
  /** Font weight (supports all CSS font-weight values) */
  fw?: TextWeight;
  /**
   * Text alignment. `left` / `right` follow React Native semantics and mirror
   * in right-to-left layouts (web: `start` / `end`).
   */
  ta?: TextAlign;
  /** Line height as a multiplier (e.g., 1.5) or absolute value (> 3) */
  lh?: number;
  /** Letter spacing (tracking) in pixels */
  lts?: number;
  /** Text transform: `'uppercase'`, `'lowercase'`, `'capitalize'`, or `'none'` (which also undoes a text role's case). */
  tt?: TextStyle['textTransform'];
  /** Font style: `'italic'` or `'normal'` (which also undoes the italic of `i` / `em` / `cite`). */
  fs?: TextStyle['fontStyle'];
  /** Text decoration: `'underline'`, `'line-through'`, `'underline line-through'`, or `'none'`. */
  td?: TextStyle['textDecorationLine'];
  /** Custom font family (overrides theme font) */
  ff?: string;
  /** Element to render on web (defaults to `variant`); also decides heading semantics. */
  as?: HTMLTextVariant;
  /** Whether text is selectable (default: true) */
  selectable?: boolean;
  /**
   * Called when text is pressed. Pressable text is exposed as a button (pass
   * `role="link"` for navigation) and, on web, is focusable and activates with
   * Enter (and Space for buttons).
   */
  onPress?: () => void;
  /** Called when the text layout is calculated */
  onLayout?: (event: LayoutChangeEvent) => void;
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

// ---------------------------------------------------------------------------
// Static style tables (built once, not per render)
// ---------------------------------------------------------------------------

const VARIANT_FONT_SIZES: Record<HTMLTextVariant, number> = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  p: 16,
  span: 16,
  div: 16,
  small: 12,
  caption: 12,
  code: 14,
  kbd: 14,
  blockquote: 18,
  cite: 14,
  strong: 16,
  b: 16,
  i: 16,
  em: 16,
  u: 16,
  sub: 12,
  sup: 12,
  mark: 16,
};

type FontWeight = NonNullable<TextStyle['fontWeight']>;

const VARIANT_FONT_WEIGHTS: Partial<Record<HTMLTextVariant, FontWeight>> = {
  h1: '700',
  h2: '700',
  h3: '600',
  h4: '600',
  h5: '500',
  h6: '500',
  strong: '700',
  b: '700',
};

const ITALIC: TextStyle = { fontStyle: 'italic' };

/** Theme-independent extras per variant (mark / code / kbd are theme-dependent, see below). */
const VARIANT_EXTRAS: Partial<Record<HTMLTextVariant, TextStyle>> = {
  i: ITALIC,
  em: ITALIC,
  blockquote: ITALIC,
  cite: ITALIC,
  u: { textDecorationLine: 'underline' },
  // `verticalAlign: 'sub' | 'super'` is CSS-only.
  ...(isWeb
    ? {
        sub: { verticalAlign: 'sub' } as unknown as TextStyle,
        sup: { verticalAlign: 'super' } as unknown as TextStyle,
      }
    : {}),
};

const NAMED_WEIGHTS: Record<string, FontWeight> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  light: '300',
  black: '900',
};

function resolveFontWeight(weight: TextWeight): FontWeight {
  if (typeof weight === 'number') return String(weight) as FontWeight;
  return NAMED_WEIGHTS[weight] ?? (/^[1-9]00$/.test(weight) ? (weight as FontWeight) : '400');
}

const HEADING_TAGS: ReadonlySet<string> = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const HTML_TAGS: ReadonlySet<string> = new Set<HTMLTextVariant>([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'div', 'small', 'caption', 'strong', 'b', 'i', 'em', 'u',
  'sub', 'sup', 'mark', 'code', 'kbd', 'blockquote', 'cite',
]);

interface TextStyleInput {
  variant: HTMLTextVariant;
  role: TextRoleStyle | undefined;
  size: SizeValue | undefined;
  weight: TextWeight | undefined;
  align: TextAlign;
  color: string | undefined;
  fontFamily: string | undefined;
  lineHeight: number | undefined;
  tracking: number | undefined;
  textTransform: TextStyle['textTransform'];
  fontStyle: TextStyle['fontStyle'];
  textDecorationLine: TextStyle['textDecorationLine'];
}

/** The typography style for one prop combination. Pure; memoized by the caller. */
function buildTextStyle(theme: PlatformBlocksTheme, input: TextStyleInput): TextStyle {
  const { variant, role, weight, align, fontFamily, lineHeight } = input;
  // Explicit props win over the text role, which wins over the variant.
  const size = input.size ?? role?.fontSize;
  const color = input.color ?? resolveTextColor(theme, role?.color);
  const tracking = input.tracking ?? role?.letterSpacing;
  const textTransform = input.textTransform ?? (role?.uppercase ? 'uppercase' : undefined);

  const fontSize = size !== undefined ? resolveFontSize(theme, size) : VARIANT_FONT_SIZES[variant] ?? 16;
  const defaultLineHeight = size !== undefined ? resolveLineHeight(theme, size) : fontSize * 1.4;
  const resolvedLineHeight =
    lineHeight !== undefined
      ? lineHeight > 3
        ? lineHeight // absolute px
        : fontSize * lineHeight // multiplier
      : defaultLineHeight;

  const style: TextStyle = {
    fontFamily: fontFamily || theme.fontFamily,
    textAlign: align,
    color: color ?? theme.text?.primary,
    fontSize,
    fontWeight: role?.fontWeight ?? VARIANT_FONT_WEIGHTS[variant] ?? '400',
    lineHeight: resolvedLineHeight,
  };

  const extras = VARIANT_EXTRAS[variant];
  if (extras) Object.assign(style, extras);

  if (variant === 'mark') {
    // Readable under text.primary in both schemes.
    style.backgroundColor = theme.backgrounds?.mark ?? DEFAULT_THEME.backgrounds.mark;
  } else if ((variant === 'code' || variant === 'kbd') && !fontFamily) {
    style.fontFamily = theme.fontFamilyMono ?? DEFAULT_FONT_FAMILY_MONO;
  }

  if (weight !== undefined) style.fontWeight = resolveFontWeight(weight);
  if (tracking !== undefined) style.letterSpacing = tracking;
  if (textTransform) style.textTransform = textTransform;
  // After the variant extras, so `fs="normal"` / `td="none"` can undo `<Italic>` / `<Underline>`.
  if (input.fontStyle) style.fontStyle = input.fontStyle;
  if (input.textDecorationLine) style.textDecorationLine = input.textDecorationLine;

  return style;
}

// ---------------------------------------------------------------------------
// Web helpers
// ---------------------------------------------------------------------------

/** React Native style keys that have a different name (or no equivalent) in CSS. */
const WEB_STYLE_KEY_MAP: Record<string, string | readonly string[]> = {
  marginStart: 'marginInlineStart',
  marginEnd: 'marginInlineEnd',
  paddingStart: 'paddingInlineStart',
  paddingEnd: 'paddingInlineEnd',
  marginHorizontal: ['marginInlineStart', 'marginInlineEnd'],
  marginVertical: ['marginTop', 'marginBottom'],
  paddingHorizontal: ['paddingInlineStart', 'paddingInlineEnd'],
  paddingVertical: ['paddingTop', 'paddingBottom'],
  textDecorationLine: 'textDecoration',
};

const PX_KEYS: ReadonlySet<string> = new Set(['fontSize', 'lineHeight', 'letterSpacing']);

/**
 * Flattens React Native text styles into a CSS style object for the semantic
 * HTML element `Text` renders on web. `StyleSheet.flatten` merges nested arrays
 * (`style={[a, [b, c]]}`) recursively.
 */
function toWebStyle(rnStyles: unknown): Record<string, string | number> {
  const flat = (StyleSheet.flatten(rnStyles as TextStyle) ?? {}) as Record<string, unknown>;
  const web: Record<string, string | number> = {};

  for (const key of Object.keys(flat)) {
    const value = flat[key];
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const mapped = WEB_STYLE_KEY_MAP[key];
    if (typeof mapped === 'string') {
      web[mapped] = value;
    } else if (mapped) {
      for (const cssKey of mapped) web[cssKey] = value;
    } else if (PX_KEYS.has(key) && typeof value === 'number') {
      web[key] = `${value}px`;
    } else if (key === 'textAlign') {
      // RN mirrors left/right in RTL; CSS does that with start/end.
      web[key] = value === 'left' ? 'start' : value === 'right' ? 'end' : value;
    } else {
      web[key] = value;
    }
  }

  return web;
}

// HTML host tags that are valid *inline* children of a <p>. Anything else
// (div, section, RN/platform-blocks components that render a View, …) forces
// the enclosing Text to render as a <div> instead of a <p>.
const INLINE_HOST_TAGS: ReadonlySet<string> = new Set([
  'span', 'b', 'i', 'em', 'strong', 'code', 'a', 'img', 'br', 'sub', 'sup',
  'mark', 'u', 'cite', 'kbd', 'small', 'label', 'abbr', 'q', 's', 'del',
  'ins', 'time', 'var', 'samp', 'wbr', 'bdi', 'bdo',
]);

/**
 * Whether children contain something that can't sit inside a `<p>`. We can't
 * reach the element a component renders internally, so *any* component child
 * (a nested `Text` — which may itself be a `<p>` or heading —, a View, an Icon…)
 * counts as block-level. This one walk covers nested headings and nested
 * paragraphs too, since both are components. A downgraded `<div>` is still
 * `display: inline`, so inline flow is preserved either way.
 */
function containsBlockElement(node: React.ReactNode): boolean {
  // Fast path for the common case: plain text.
  if (node == null || typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') return false;
  return React.Children.toArray(node).some((child) => {
    if (!React.isValidElement(child)) return false; // strings / numbers are inline
    const childType = child.type;
    const childChildren = (child.props as { children?: React.ReactNode }).children;

    if (typeof childType === 'string') {
      if (!INLINE_HOST_TAGS.has(childType)) return true;
      return childChildren ? containsBlockElement(childChildren) : false;
    }
    if (childType === React.Fragment) {
      return childChildren ? containsBlockElement(childChildren) : false;
    }
    return true;
  });
}

/** `dataSet={{ fooBar: 1 }}` → `{ 'data-foo-bar': 1 }` (what react-native-web renders). */
function dataSetToAttributes(dataSet: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!dataSet) return out;
  for (const key of Object.keys(dataSet)) {
    const value = dataSet[key];
    if (value === undefined) continue;
    out[`data-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`] = value;
  }
  return out;
}

const NO_SELECT = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Text = factory<{ props: TextProps; ref: RNText }>(
  (allProps, ref) => {
    const { styleProps, otherProps } = extractStyleProps(allProps);
    const {
      children,
      tx,
      txParams,
      variant = 'p',
      textRole,
      size,
      fw,
      ta = 'left',
      c,
      lh,
      lts,
      tt,
      fs,
      td,
      style,
      ff,
      as,
      selectable = true,
      onPress,
      onLayout,
      value,
      numberOfLines,
      ellipsizeMode,
      id,
      nativeID,
      testID,
      role,
      accessibilityRole,
      disabled,
      ...rest
    } = otherProps;

    const theme = useTheme();
    const { t } = useI18n();

    const elementId = id ?? nativeID;
    const resolvedColor = useMemo(() => resolveTextColor(theme, c), [theme, c]);
    const roleStyle = useMemo(() => (textRole ? getTextRole(theme, textRole) : undefined), [theme, textRole]);

    const textStyle = useMemo(
      () =>
        buildTextStyle(theme, {
          variant,
          role: roleStyle,
          size,
          weight: fw,
          align: ta,
          color: resolvedColor,
          fontFamily: ff,
          lineHeight: lh,
          tracking: lts,
          textTransform: tt,
          fontStyle: fs,
          textDecorationLine: td,
        }),
      [theme, variant, roleStyle, size, fw, ta, resolvedColor, ff, lh, lts, tt, fs, td]
    );
    const spacingStyle = useStyleProps(styleProps);

    const content = tx && t ? t(tx, txParams) : value !== undefined && value !== null ? value : children;

    // Semantics follow the element actually rendered (`as` wins over `variant`).
    const semanticTag = as || variant;
    const isHeading = HEADING_TAGS.has(semanticTag);
    const pressable = !!onPress && !disabled;
    const consumerRole = role ?? (roleFromAccessibilityRole(accessibilityRole) as Role | undefined);

    // ---------------------------------------------------------------- web
    if (isWeb && HTML_TAGS.has(semanticTag)) {
      // `<caption>` is only valid inside a <table>; the typography variant renders a <span>.
      let htmlTag: string = semanticTag === 'caption' ? 'span' : semanticTag;
      // A <p> can't contain block elements (or nested <p>/<h*>): fall back to <div>.
      if (htmlTag === 'p' && containsBlockElement(children)) htmlTag = 'div';

      const styleArray = Array.isArray(style) ? style : [style];
      const hasDisplayOverride = styleArray.some((item) => {
        const entry = item as Record<string, unknown> | null | undefined;
        return !!entry && typeof entry === 'object' && (entry.display !== undefined || entry.whiteSpace !== undefined);
      });

      const isBlockTag = HEADING_TAGS.has(htmlTag) || htmlTag === 'p';
      const webStyle: Record<string, string | number> = {
        // Reset browser margins on headings/paragraphs first, so margins from
        // style props or `style` still apply.
        ...(isBlockTag ? { margin: 0 } : null),
        ...toWebStyle([textStyle, spacingStyle, style]),
        // Inline by default unless the caller controls display / white-space.
        ...(hasDisplayOverride ? null : { display: 'inline' }),
      };

      if (!selectable) Object.assign(webStyle, NO_SELECT);

      if (numberOfLines === 1) {
        webStyle.whiteSpace = 'nowrap';
        webStyle.overflow = 'hidden';
        if (ellipsizeMode === 'tail' || ellipsizeMode === undefined) webStyle.textOverflow = 'ellipsis';
      } else if (typeof numberOfLines === 'number' && numberOfLines > 1) {
        // Multi-line clamp with the -webkit-box idiom, matching native `numberOfLines`.
        webStyle.display = '-webkit-box';
        webStyle.WebkitBoxOrient = 'vertical';
        webStyle.WebkitLineClamp = String(numberOfLines);
        webStyle.overflow = 'hidden';
      }

      if (onPress) webStyle.cursor = pressable ? 'pointer' : 'default';

      const webRole: string | undefined =
        consumerRole ?? (onPress && !isHeading ? 'button' : undefined);

      const domProps: Record<string, unknown> = {
        className: 'platform-blocks-text',
        style: webStyle,
      };
      // Only attach when a consumer actually forwarded one — an explicit
      // `ref: null` would otherwise show up as a prop on the host element.
      if (ref) domProps.ref = ref;
      if (elementId) domProps.id = elementId;
      if (testID) domProps['data-testid'] = testID;
      if (webRole) domProps.role = webRole;

      const {
        accessibilityLabel,
        dataSet,
        lang,
        dir,
        onKeyDown: consumerKeyDown,
        onMouseEnter,
        onMouseLeave,
      } = rest;
      if (accessibilityLabel !== undefined) domProps['aria-label'] = accessibilityLabel;
      Object.assign(domProps, dataSetToAttributes(dataSet));
      if (lang) domProps.lang = lang;
      if (dir) domProps.dir = dir;
      if (onMouseEnter) domProps.onMouseEnter = onMouseEnter;
      if (onMouseLeave) domProps.onMouseLeave = onMouseLeave;
      // Consumer ARIA wins over the mapped `accessibilityLabel`.
      for (const key of Object.keys(rest)) {
        if (key.startsWith('aria-')) {
          const ariaValue = (rest as Record<string, unknown>)[key];
          if (ariaValue !== undefined) domProps[key] = ariaValue;
        }
      }

      if (onPress) {
        if (disabled) {
          domProps['aria-disabled'] = true;
        } else {
          domProps.onClick = onPress;
          domProps.tabIndex = 0;
        }
      }
      if (pressable || consumerKeyDown) {
        domProps.onKeyDown = (event: WebKeyboardEvent) => {
          consumerKeyDown?.(event);
          if (!pressable || event.defaultPrevented) return;
          const activates = event.key === 'Enter' || ((event.key === ' ' || event.key === 'Spacebar') && webRole === 'button');
          if (activates) {
            event.preventDefault();
            onPress?.();
          }
        };
      }

      return React.createElement(htmlTag, domProps, content);
    }

    // ------------------------------------------------------------- native
    const nativeRole: Role | undefined =
      consumerRole ?? (isHeading ? 'heading' : pressable ? 'button' : undefined);

    return (
      <RNText
        {...rest}
        ref={ref}
        nativeID={elementId}
        testID={testID}
        role={nativeRole}
        // A legacy role without an ARIA equivalent (`text`, `keyboardkey`) stays as-is.
        accessibilityRole={consumerRole ? undefined : accessibilityRole}
        style={[textStyle, spacingStyle, style]}
        selectable={selectable}
        onPress={onPress}
        disabled={disabled}
        onLayout={onLayout}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
      >
        {content}
      </RNText>
    );
  },
  { displayName: 'Text' }
);
