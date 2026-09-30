export type { PlocksTheme, PlocksThemeOverride } from './types';
export type { SurfaceLevel, SurfaceScale, SurfaceToken, SurfaceShadowToken } from './types';
export {
  resolveSurface,
  resolveSurfaceBackground,
  surfaceInteractionTint,
  clampSurfaceLevel,
  SURFACE_LEVELS,
} from './surfaces';
export type { SurfaceInteractionState } from './surfaces';
export { DEFAULT_TEXT_ROLES, getTextRole, resolveTextRole } from './textRoles';
export type { TextRoleName, TextRoleStyle, TextRoles } from './types';
export { DEFAULT_THEME } from './defaultTheme';
export { DARK_THEME } from './darkTheme';
export {
  mergeTheme,
  createTheme,
  normalizeTheme,
  getBuiltInTheme,
  resolveThemeForScheme,
  isThemePair,
} from './utils';
export type {
  PlocksThemePair,
  ThemeBackgrounds,
  ThemeBackgroundRole,
  ControlSizes,
  ControlSizeMetrics,
  ZIndices,
  ZIndexLayer,
} from './types';
export {
  resolveSpacing,
  resolveRadius,
  resolveFontSize,
  resolveLineHeight,
  resolveIconSize,
  getControlSize,
  stepDown,
  getBreakpoints,
  onColor,
  parsePx,
  BREAKPOINT_KEYS,
} from './tokens';
export type { BreakpointValues, BreakpointKey, RadiusInput } from './tokens';
export { DEFAULT_Z_INDICES, getZIndex } from './zIndices';
export {
  applyColorSchemeMarker,
  getColorSchemeScript,
  COLOR_SCHEME_ATTRIBUTE,
  COLOR_SCHEME_STORAGE_KEY,
  LIGHT_SCHEME_CLASS,
  DARK_SCHEME_CLASS,
} from './colorSchemeMarker';
export type { ColorSchemeMarkerOptions, ColorSchemeScriptOptions } from './colorSchemeMarker';
export { breakpointsFromTheme } from './breakpoints';
export { ThemeScope, useTheme, useOptionalTheme } from './ThemeProvider';
export { CSSVariables, createCSSVariablesStylesheet } from './CSSVariables';
export { useColorScheme } from './useColorScheme';
export {
  resolveColorProp,
  resolveTextColor,
  resolveBg,
  resolveAccentColor,
  resolveLineColor,
} from './resolveColors';
export type { ColorScope, ResolveColorOptions, ThemeColor, ThemeColorToken } from './resolveColors';
export { semanticIcons } from './semanticIcons';
export type { SemanticIconRole } from './semanticIcons';
export type { ColorScheme } from './useColorScheme';
export type { ThemeScopeProps } from './ThemeProvider';
export * from './colorUtils';
export * from './variantRoles';
export * from './sizes';
export * from './componentSize';
export * from './radius';
export * from './shadow';
export * from './cssVariableTheme';
