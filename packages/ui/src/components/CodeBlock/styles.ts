import { StyleSheet } from 'react-native';

import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { DEFAULT_FONT_FAMILY_MONO } from '../../core/theme/defaultTheme';
import { resolveColorProp } from '../../core/theme/resolveColors';
import { resolveSurface } from '../../core/theme/surfaces';
import { resolveRadius } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { RadiusValue } from '../../core/types/base';
import type { CodeBlockColorOverrides, CodeBlockTextPalette, CodeBlockToken, CodeBlockVariant } from './types';

/** Order the `colors.text` array form maps onto, one color per token. */
const TOKEN_SEQUENCE: CodeBlockToken[] = [
  'keyword',
  'string',
  'comment',
  'number',
  'function',
  'operator',
  'punctuation',
  'tag',
  'attribute',
  'className',
];

/** Code type size. Code reads a step below body copy on every platform. */
export const CODE_FONT_SIZE = 13;
/** Line box for code — also the fixed row height the virtualized native list lays out with. */
export const CODE_LINE_HEIGHT = 18;

/** `colors` after theme tokens (`primary.6`, `muted`) are resolved to real colors. */
export type ResolvedCodeBlockColors = {
  background?: string;
  border?: string;
  text?: string;
  highlightBackground?: string;
  tokenOverrides?: Partial<Record<CodeBlockToken, string>>;
};

/** Corner rounding at the two ends of a highlighted run. */
export const HIGHLIGHT_RADIUS = 4;

/** Where a highlighted line sits in its run — the ends round, the middle does not. */
export type HighlightCorners = { isFirst: boolean; isLast: boolean };

/** Corner radii for one line of a run, so the run reads as a single block. */
export const getHighlightCornerRadii = ({ isFirst, isLast }: HighlightCorners) => ({
  borderTopLeftRadius: isFirst ? HIGHLIGHT_RADIUS : 0,
  borderTopRightRadius: isFirst ? HIGHLIGHT_RADIUS : 0,
  borderBottomLeftRadius: isLast ? HIGHLIGHT_RADIUS : 0,
  borderBottomRightRadius: isLast ? HIGHLIGHT_RADIUS : 0,
});

/**
 * A highlighted line is *painted*, never laid out: the tint adds no border,
 * padding or margin, so its code sits on exactly the same column as the lines
 * above and below it. `corners` rounds only the outer edges of a run, so lines
 * 5-9 read as one block rather than five stacked pills. Shared by the native
 * lines and the web (Prism) `lineProps`, so it is a plain object usable as
 * either a React Native style or a CSS style.
 */
export const getHighlightedLineStyle = (
  background: string,
  corners: HighlightCorners = { isFirst: true, isLast: true }
) => ({
  backgroundColor: background,
  ...getHighlightCornerRadii(corners),
});

/** Resting corner radius of the code surface — matches `radius="xl"`. */
export const DEFAULT_CODE_RADIUS: RadiusValue = 12;

/*
 * `hacker` is a costume, not a theme surface: its token colors are a fixed neon
 * code theme (see `HACKER_SYNTAX` in utils.ts), so the panel behind them has to
 * stay near-black in both color schemes or the light theme renders green on
 * white. These three colors are part of that code theme, not UI chrome.
 */
const HACKER_SURFACE = '#05070a';
const HACKER_BORDER = 'rgba(0,255,0,0.22)';
/** Plain identifiers belong to the skin too — `text.primary` is dark on this panel. */
const HACKER_TEXT = '#00ff41';

/**
 * Code-block colors name a `theme.text` role or a palette shade. Bare palette
 * names stay unresolved on purpose — a token color is a specific shade choice,
 * so `'primary'` alone is more likely a mistake than a request for shade 5.
 */
const resolveThemeColor = (theme: PlatformBlocksTheme, token?: string): string | undefined =>
  resolveColorProp(theme, token, { scopes: ['text'], shades: [] });

const resolveTextColors = (theme: PlatformBlocksTheme, palette?: CodeBlockTextPalette) => {
  if (!palette) return {};
  let baseColor: string | undefined;
  const tokenOverrides: Partial<Record<CodeBlockToken, string>> = {};

  const assign = (token: CodeBlockToken, value: string) => {
    const resolved = resolveThemeColor(theme, value) ?? value;
    tokenOverrides[token] = resolved;
    if (!baseColor) {
      baseColor = resolved;
    }
  };

  if (typeof palette === 'string') {
    const resolved = resolveThemeColor(theme, palette);
    if (resolved) {
      TOKEN_SEQUENCE.forEach((token) => {
        tokenOverrides[token] = resolved;
      });
      baseColor = resolved;
    }
    return { baseColor, tokenOverrides };
  }

  if (Array.isArray(palette)) {
    palette.forEach((value, index) => {
      if (!value) return;
      const token = TOKEN_SEQUENCE[index % TOKEN_SEQUENCE.length];
      assign(token, value);
    });
    return {
      baseColor,
      tokenOverrides: Object.keys(tokenOverrides).length ? tokenOverrides : undefined,
    };
  }

  TOKEN_SEQUENCE.forEach((token) => {
    const value = palette[token];
    if (value) assign(token, value);
  });

  return {
    baseColor,
    tokenOverrides: Object.keys(tokenOverrides).length ? tokenOverrides : undefined,
  };
};

/** Resolves the public `colors` prop into concrete colors, once per theme change. */
export const resolveCodeBlockColors = (
  theme: PlatformBlocksTheme,
  overrides?: CodeBlockColorOverrides
): ResolvedCodeBlockColors => {
  if (!overrides) return {};
  const resolved: ResolvedCodeBlockColors = {};

  if (overrides.background) {
    resolved.background = resolveThemeColor(theme, overrides.background);
  }

  if (overrides.border) {
    resolved.border = resolveThemeColor(theme, overrides.border);
  }

  if (overrides.highlight?.background) {
    resolved.highlightBackground = resolveThemeColor(theme, overrides.highlight.background);
  }

  const textConfig = resolveTextColors(theme, overrides.text);
  if (textConfig.baseColor) {
    resolved.text = textConfig.baseColor;
  }
  if (textConfig.tokenOverrides) {
    resolved.tokenOverrides = textConfig.tokenOverrides;
  }

  return resolved;
};

/**
 * The code surface color, resolved in one place: the styles need it to paint,
 * and the syntax palette needs it to measure token contrast against.
 *
 * Code reads as a recessed well inside whatever contains it, which is exactly
 * what `backgrounds.subtle` is for; a terminal drops one step further to the
 * bottom of the elevation ladder. Both follow a custom theme instead of pinning
 * the panel to a slate palette the rest of the UI never uses.
 */
export const resolveCodeSurface = (
  theme: PlatformBlocksTheme,
  variant: CodeBlockVariant,
  overrides: ResolvedCodeBlockColors = {}
): string => {
  if (overrides.background) return overrides.background;
  if (variant === 'hacker') return HACKER_SURFACE;
  if (variant === 'terminal') return resolveSurface(theme, 0).background;
  return theme.backgrounds?.subtle ?? resolveSurface(theme, 0).background;
};

/** Hairline around the code surface — the theme's own border, or the skin's. */
export const resolveCodeBorder = (
  theme: PlatformBlocksTheme,
  variant: CodeBlockVariant,
  overrides: ResolvedCodeBlockColors = {}
): string => {
  if (overrides.border) return overrides.border;
  if (variant === 'hacker') return HACKER_BORDER;
  return theme.backgrounds?.border ?? resolveSurface(theme, 1).border;
};

/**
 * Color for code no syntax rule claims. Plain code reads at full text contrast
 * in both modes — the syntax palette does the de-emphasizing (comments,
 * punctuation), not the base color.
 */
export const resolveCodeTextColor = (
  theme: PlatformBlocksTheme,
  variant: CodeBlockVariant,
  overrides: ResolvedCodeBlockColors = {}
): string => overrides.text ?? (variant === 'hacker' ? HACKER_TEXT : theme.text.primary);

/** The code font: a caller's `ff`, else the theme's monospace stack. */
export const resolveCodeFontFamily = (theme: PlatformBlocksTheme, custom?: string): string =>
  custom || theme.fontFamilyMono || DEFAULT_FONT_FAMILY_MONO;

/**
 * The block's style sheet, cached per theme and per (primitive) argument set —
 * so a block that re-renders with the same inputs gets the same objects back,
 * and hook dependencies on `styles` stay stable.
 */
export const getCodeBlockStyles = createThemedStyles(
  (
    theme: PlatformBlocksTheme,
    fullWidth: boolean,
    variant: CodeBlockVariant,
    backgroundColor: string,
    borderColor: string,
    textColor: string,
    fontFamily: string,
    radius: RadiusValue,
    withBorder: boolean
  ) =>
    StyleSheet.create({
      container: {
        marginBottom: 20,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        width: fullWidth ? '100%' : undefined,
      },
      codeBlock: {
        width: '100%',
        position: 'relative',
        padding: variant === 'terminal' ? 14 : 16,
        paddingEnd: 0,
        borderRadius: resolveRadius(theme, radius),
        borderWidth: withBorder ? 1 : 0,
        borderColor,
        backgroundColor,
        overflow: 'hidden',
      },
      title: {
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 8,
        color: theme.text.secondary,
      },
      codeText: {
        fontFamily,
        fontSize: CODE_FONT_SIZE,
        lineHeight: CODE_LINE_HEIGHT,
        color: textColor,
      },
      // Title bar above the code well: one step up the ladder from the recessed
      // code surface, so the two read as separate parts of the same panel.
      headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: resolveSurface(theme, 1).background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderTopStartRadius: 8,
        borderTopEndRadius: 8,
        borderWidth: 1,
        borderColor,
        marginBottom: 4,
      },
      inlineTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      },
    })
);

export type CodeBlockStyles = ReturnType<typeof getCodeBlockStyles>;
