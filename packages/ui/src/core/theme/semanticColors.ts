import type { PlatformBlocksTheme } from './types';

type SemanticSource = {
  colors?: Partial<Pick<PlatformBlocksTheme['colors'], 'primary'>>;
  backgrounds?: Partial<PlatformBlocksTheme['backgrounds']>;
  states?: PlatformBlocksTheme['states'];
  primaryColor?: string;
};

/**
 * Builds the deprecated `theme.semantic` aliases from the roles they alias, so
 * the two can never drift apart. Components read the roles directly.
 *
 * @deprecated `theme.semantic` exists only for back-compat.
 */
export function deriveSemanticColors(source: SemanticSource): PlatformBlocksTheme['semantic'] {
  const backgrounds = source.backgrounds ?? {};
  const accent = source.colors?.primary?.[5] ?? source.primaryColor ?? '#2563EB';
  const border = backgrounds.border ?? 'rgba(0, 0, 0, 0.08)';
  return {
    accent,
    borderDefault: backgrounds.borderStrong ?? border,
    borderSubtle: border,
    surfaceElevated: backgrounds.elevated ?? backgrounds.surface ?? '#FFFFFF',
    surfaceCard: backgrounds.surface ?? '#FFFFFF',
    focusRing: source.states?.focusRing ?? accent,
  };
}
