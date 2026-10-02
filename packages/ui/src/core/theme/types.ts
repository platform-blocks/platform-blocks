import type { ComponentSize, ComponentSizeValue } from './componentSize';
import type { ControlSizeMetrics, ControlSizes } from './scales';
import type { ZIndices } from './zIndices';
import type { ThemeColor } from './resolveColors';

export type { ControlSizeMetrics, ControlSizes } from './scales';
export type { ZIndices, ZIndexLayer } from './zIndices';

// Common type aliases
export type SizeToken = ComponentSize;
export type SizeValue = ComponentSizeValue;
export type ColorValue = string;

// Enhanced spacing value that supports CSS values like 'auto'
export type SpacingValue = SizeToken | 'auto' | '0' | number;

/**
 * Elevation step. Higher levels sit closer to the viewer.
 *
 * - `0` — the page itself; things that should disappear into the background
 * - `1` — resting content sitting on the page (cards, panels, list groups)
 * - `2` — transient content floating over content (dropdowns, popovers, menus)
 * - `3` — content that takes over the screen (dialogs, sheets, toasts)
 *
 * A numeric ladder rather than named slots because elevation is inherently
 * ordered and nestable: a Surface can derive its level from the one it sits
 * inside. Note that "elevation" is expressed differently per scheme — in light
 * mode mostly by shadow, in dark mode mostly by a lighter fill, since shadows
 * are near-invisible on dark backgrounds.
 */
export type SurfaceLevel = 0 | 1 | 2 | 3;

/** Shadow tokens available on `theme.shadows`, plus the explicit opt-out. */
export type SurfaceShadowToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Built-in text roles — typography for text that *labels* a group of items
 * rather than being one of them:
 *
 * - `panelTitle` — the title of a sheet, drawer or popover that holds a list
 *   (Select / AutoComplete mobile sheet, DrawerNavigator, DataTable filters)
 * - `sectionLabel` — a group header inside a list (Menu.Label, AutoComplete
 *   groups, Spotlight groups, ControlField.Group, nested Tree headings)
 *
 * Both step back from the items they label (secondary color, one size down)
 * so a title never reads as one more option. Themes can add their own names.
 */
export type TextRoleName = 'panelTitle' | 'sectionLabel';

/**
 * One text role. Every field is optional in a theme: unset fields fall back to
 * the built-in role (`DEFAULT_TEXT_ROLES`).
 */
export interface TextRoleStyle {
  /** A `theme.text` role (`'primary'`, `'secondary'`, `'muted'`…), a palette token, `'primary.6'`, or any CSS color. */
  color?: string;
  /** Size token (`'xs'`–`'xl'`) or px. */
  fontSize?: SizeValue;
  fontWeight?: '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  /** Tracking in px. */
  letterSpacing?: number;
  uppercase?: boolean;
}

/** `theme.textRoles`: the built-in roles, partially overridable, plus any the app adds. */
export type TextRoles = Partial<Record<TextRoleName, TextRoleStyle>> & Record<string, TextRoleStyle | undefined>;

/** The resolved appearance of a single elevation step. */
export interface SurfaceToken {
  /** Background fill. */
  background: string;
  /** Hairline border color — the primary elevation cue in dark mode. */
  border: string;
  /** Default shadow token for this level. */
  shadow: SurfaceShadowToken;
}

/** The full elevation ladder, one token per level. */
export type SurfaceScale = Record<SurfaceLevel, SurfaceToken>;

// Import design tokens type
import type { DESIGN_TOKENS } from '../design-tokens';

/**
 * Margin / padding shorthand props accepted by every component.
 *
 * This is the ONE definition — `core/utils/spacing.ts` and `core/types/base.ts`
 * re-export it. It is pure spacing: the visibility props (`lightHidden`,
 * `darkHidden`, `hiddenFrom`, `visibleFrom`) live in `VisibilityProps`
 * (`core/types/base.ts`) and are implemented by the component factory.
 *
 * Horizontal props resolve to logical properties (`marginStart` / `marginEnd`,
 * `paddingStart` / `paddingEnd`), so `ml` / `pl` sit on the *leading* edge and
 * flip automatically in RTL.
 */
export interface SpacingProps {
  /** Margin on all sides */
  m?: SpacingValue;
  /** Margin top */
  mt?: SpacingValue;
  /** Margin on the trailing edge (right in LTR, left in RTL) */
  mr?: SpacingValue;
  /** Margin bottom */
  mb?: SpacingValue;
  /** Margin on the leading edge (left in LTR, right in RTL) */
  ml?: SpacingValue;
  /** Margin horizontal (both inline edges) */
  mx?: SpacingValue;
  /** Margin vertical (top and bottom) */
  my?: SpacingValue;

  /** Padding on all sides */
  p?: SpacingValue;
  /** Padding top */
  pt?: SpacingValue;
  /** Padding on the trailing edge (right in LTR, left in RTL) */
  pr?: SpacingValue;
  /** Padding bottom */
  pb?: SpacingValue;
  /** Padding on the leading edge (left in LTR, right in RTL) */
  pl?: SpacingValue;
  /** Padding horizontal (both inline edges) */
  px?: SpacingValue;
  /** Padding vertical (top and bottom) */
  py?: SpacingValue;
}

/**
 * A size for the box props: px, a percentage, `'auto'`, `'full'` (100%), or —
 * on web — any CSS length (`'50vw'`, `'calc(100% - 2rem)'`).
 */
export type DimensionProp = number | 'auto' | 'full' | `${number}%` | (string & {});

/**
 * Box props — the size, background and opacity of a component's root, set on
 * the same element as the spacing props. Every public component takes them
 * (through `BaseProps`).
 */
export interface BoxProps {
  /** Width */
  w?: DimensionProp;
  /** Height */
  h?: DimensionProp;
  /** Minimum width */
  miw?: DimensionProp;
  /** Maximum width */
  maw?: DimensionProp;
  /** Minimum height */
  mih?: DimensionProp;
  /** Maximum height */
  mah?: DimensionProp;
  /**
   * Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`,
   * `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade
   * syntax, or any CSS color.
   */
  bg?: ThemeColor;
  /** Opacity, `0`–`1` */
  opacity?: number;
}

/** Spacing + box props: every style shorthand a component root accepts. */
export type StyleProps = SpacingProps & BoxProps;

/** Semantic background & surface colors (`theme.backgrounds`). */
export interface ThemeBackgrounds {
  /** Main app/page background */
  base: string;
  /** Subtle background sections (stripes, alternate rows) */
  subtle: string;
  /** Standard surface (cards, containers) */
  surface: string;
  /** Elevated surface (modals, popovers) */
  elevated: string;
  /** Border / hairline color for separators */
  border: string;
  /** Border that must stay visible: input frames, dividers between controls. */
  borderStrong: string;
  /** Row / item hover fill. Translucent in the built-in themes so it works at every elevation. */
  hover: string;
  /** Row / item pressed fill. */
  pressed: string;
  /** Selected row / item fill. */
  selected: string;
  /** Disabled control fill. */
  disabled: string;
  /** Highlighted (`<mark>`) text background; readable under `text.primary`. */
  mark: string;
  /**
   * Modal backdrop behind dialogs, drawers, sheets and lightboxes — a
   * translucent color (its alpha is the dimming strength). Optional in
   * overrides; filled from the built-in theme of the same scheme.
   */
  scrim: string;
}

/** Background roles — optional in overrides, filled from the built-in theme of the same scheme. */
export type ThemeBackgroundRole = keyof ThemeBackgrounds;

export interface PlocksTheme {
  /** Primary color used for buttons, links, etc. */
  primaryColor: string;

  /** Color scheme */
  colorScheme: 'light' | 'dark';

  /** Design tokens for consistent styling */
  designTokens?: typeof DESIGN_TOKENS;

  /** Colors palette */
  colors: {
    primary: string[];
    secondary: string[];
    tertiary: string[];
    surface: string[];
    success: string[];
    warning: string[];
    error: string[];
    gray: string[];
    highlight: string[];
    pink?: string[];
    purple?: string[];
    violet?: string[];
    cyan?: string[];
    lime?: string[];
    sky?: string[];
    amber?: string[];
    indigo?: string[];
    teal?: string[];
  };

  /** Semantic text colors */
  text: {
    /** Primary text color (high contrast) */
    primary: string;
    /** Secondary text color (medium contrast) */
    secondary: string;
    /** Muted text color (low contrast) */
    muted: string;
    /** Disabled text color (very low contrast) */
    disabled: string;
    /** Link text color (typically primary color) */
    link: string;
    /** Text color intended for use on top of primary[5] backgrounds */
    onPrimary?: string;
  };

  /** Semantic background & surface colors */
  backgrounds: ThemeBackgrounds;

  /**
   * The literal colors behind `text`, `backgrounds` and `surfaces` when those
   * have been rewritten to CSS `var()` references for the web — see
   * `withCssVariableColors`. Code that *measures* color (contrast math,
   * compositing) has to read through here, because `var(--x)` has no luminance.
   * Absent on themes that were never rewritten, where the tokens are already
   * literal; `literalText` / `literalBackgrounds` handle both cases.
   */
  literalColors?: {
    text: PlocksTheme['text'];
    backgrounds: PlocksTheme['backgrounds'];
    surfaces?: SurfaceScale;
  };

  /**
   * Elevation ladder consumed by `Surface` (and, through it, Card, Menu,
   * Popover, Dialog…). Optional: themes that omit it get a ladder derived
   * from `backgrounds`, so existing custom themes keep working.
   */
  surfaces?: SurfaceScale;

  /**
   * Typography for titles and group labels (see `TextRoleName`), read through
   * `resolveTextRole` and `Text`'s `textRole` prop. Optional and per-field:
   * a theme that sets only `sectionLabel: { uppercase: false }` keeps the
   * built-in color, size and weight.
   */
  textRoles?: TextRoles;

  /** Semantic interactive state colors */
  states?: {
    focusRing?: string; // outline / ring color for focusable elements
    textSelection?: string; // text selection background color
    highlightText?: string; // color for highlighting matching text in autocomplete/search
    highlightBackground?: string; // background color for highlighted text
  };

  /** Font family */
  fontFamily: string;

  /**
   * Monospace font family (code, kbd, tabular numbers). Defaults per platform:
   * iOS `Menlo`, Android `monospace`, web `ui-monospace, SFMono-Regular, …`.
   */
  fontFamilyMono: string;

  /**
   * The control-size table used by Button, IconButton, Input and every other
   * fixed-height control — read it through `getControlSize(theme, size)`.
   */
  controlSizes: ControlSizes;

  /** Stacking layers for overlays and sticky chrome — read through `getZIndex(theme, layer)`. */
  zIndices: ZIndices;

  /** Font sizes - extended with new size system */
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };

  /** Spacing values - extended with new size system */
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };

  /** Border radius values - extended with new size system */
  radii: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };

  /** Shadows */
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  /** Breakpoints for responsive design */
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  /** Motion tokens for animations */
  motion: {
    /** Easing functions */
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      spring: string;
    };
    /** Duration tokens */
    duration: {
      instant: string;
      fast: string;
      normal: string;
      slow: string;
    };
  };

  /** Component default props and styles (override point) */
  components: Record<string, ComponentTokenOverride>;

  /** Any additional custom theme properties (see `PlocksThemeOther`) */
  other: PlocksThemeOther;
}

/**
 * The app's own values carried on `theme.other`. Open-ended by default; augment
 * it to type your keys:
 *
 * ```ts
 * declare module '@plocks/ui' {
 *   interface PlocksThemeOther {
 *     brandGradient: string[];
 *   }
 * }
 * ```
 */
export interface PlocksThemeOther {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- app-owned extension bag read directly by consumers (`theme.other.brand` as a style value); `unknown` would force a cast at every read. Augment the interface for precise types.
  [key: string]: any;
}

/**
 * A partial theme: every top-level key is optional, and `backgrounds` roles,
 * `controlSizes` and `zIndices` are partial too. Missing values are filled from
 * the built-in theme of the same color scheme by `mergeTheme` / `normalizeTheme`.
 */
export type PlocksThemeOverride = Partial<
  Omit<PlocksTheme, 'backgrounds' | 'controlSizes' | 'zIndices' | 'fontFamilyMono'>
> & {
  backgrounds?: Partial<ThemeBackgrounds>;
  controlSizes?: Partial<Record<SizeToken, Partial<ControlSizeMetrics>>>;
  zIndices?: Partial<ZIndices>;
  fontFamilyMono?: string;
};

/**
 * Separate overrides for each color scheme, accepted by `PlocksProvider`'s
 * `theme` prop so a custom theme keeps light/dark switching. Each side is merged
 * onto the built-in theme of that scheme; a missing side uses the built-in theme.
 */
export interface PlocksThemePair {
  light?: PlocksThemeOverride;
  dark?: PlocksThemeOverride;
}

// Generic token override shape for any component
export interface ComponentTokenOverride {
  defaults?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  sizes?: Record<string, unknown>;
  // Additional arbitrary extension buckets
  [key: string]: unknown;
}
