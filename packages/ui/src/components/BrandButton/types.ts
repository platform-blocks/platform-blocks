import { ButtonProps } from '../Button';
import { UniversalSystemProps } from '../../core/utils/universalSimple';
import { resolveBrandName, type BrandName, type DeprecatedBrandName } from '../BrandIcon';

/**
 * Any brand the icon registry knows, plus the pre-rebrand `twitter` alias.
 * Widened from a hand-kept list so badge-only brands (`google-play`,
 * `soundcloud`, …) are addressable from the same component.
 */
export type BrandPlatform = BrandName | DeprecatedBrandName | 'twitter';

export interface BrandConfig {
  /** Canonical registry name of the mark to render */
  icon: BrandName;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

export interface BrandButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'color' | 'lightHidden' | 'darkHidden' | 'hiddenFrom' | 'visibleFrom'>, UniversalSystemProps {
  /** The brand/platform to style the button for */
  brand: BrandPlatform;
  /** Position of the brand icon */
  iconPosition?: 'left' | 'right';
  /** Icon variant: 'full' for multi-color, 'mono' for single-color outline */
  iconVariant?: 'full' | 'mono';
  /** Override the default brand icon */
  icon?: React.ReactNode;
  /** Button text. Omit when rendering a store badge. */
  title?: string;
  /** Override icon color (overrides brand default colors) */
  color?: string;
  /**
   * Badge lead-in line, e.g. "Download on the" / "Listen on". Supplying this or
   * `secondaryText` switches the component to the two-line store-badge layout,
   * where `variant`, `loading`, `fullWidth` and the spacing props do not apply.
   */
  primaryText?: string;
  /** Badge headline, e.g. "App Store" / "Spotify" */
  secondaryText?: string;
  /** Badge shell background (badge layout only) */
  backgroundColor?: string;
  /** Badge shell border color (badge layout only) */
  borderColor?: string;
  /** Force the badge's dark-mode styling instead of following the theme */
  darkMode?: boolean;
}

type BrandColors = Omit<BrandConfig, 'icon'>;

/** Every brand in the icon registry gets a fill + text color for filled variants. */
export const brandColors: Record<BrandName, BrandColors> = {
  google: { backgroundColor: '#4285F4', textColor: '#FFFFFF' },
  'google-play': { backgroundColor: '#01875F', textColor: '#FFFFFF' },
  'galaxy-store': { backgroundColor: '#6D4DFF', textColor: '#FFFFFF' },
  facebook: { backgroundColor: '#1877F2', textColor: '#FFFFFF' },
  discord: { backgroundColor: '#5865F2', textColor: '#FFFFFF' },
  android: { backgroundColor: '#3DDC84', textColor: '#FFFFFF' },
  apple: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  'apple-podcasts': { backgroundColor: '#8A2EFF', textColor: '#FFFFFF' },
  'app-store': { backgroundColor: '#0D96F6', textColor: '#FFFFFF' },
  'app-gallery': { backgroundColor: '#D70010', textColor: '#FFFFFF' },
  openai: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  chrome: { backgroundColor: '#4285F4', textColor: '#FFFFFF' },
  'chrome-web-store': { backgroundColor: '#5F6368', textColor: '#FFFFFF' },
  spotify: { backgroundColor: '#1DB954', textColor: '#FFFFFF' },
  github: { backgroundColor: '#181717', textColor: '#FFFFFF' },
  x: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  microsoft: { backgroundColor: '#0078D4', textColor: '#FFFFFF' },
  linkedin: { backgroundColor: '#0A66C2', textColor: '#FFFFFF' },
  slack: { backgroundColor: '#4A154B', textColor: '#FFFFFF' },
  youtube: { backgroundColor: '#FF0000', textColor: '#FFFFFF' },
  'youtube-music': { backgroundColor: '#FF0000', textColor: '#FFFFFF' },
  mastercard: { backgroundColor: '#EB001B', textColor: '#FFFFFF' },
  visa: { backgroundColor: '#1A1F71', textColor: '#FFFFFF' },
  reddit: { backgroundColor: '#FF5700', textColor: '#FFFFFF' },
  amazon: { backgroundColor: '#000000', textColor: '#FFFFFF', borderColor: '#000000' },
  'amazon-appstore': { backgroundColor: '#0C65F5', textColor: '#FFFFFF' },
  'amazon-music': { backgroundColor: '#0C47D8', textColor: '#FFFFFF' },
  twitch: { backgroundColor: '#9146FF', textColor: '#FFFFFF' },
  tiktok: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  npm: { backgroundColor: '#CB3837', textColor: '#FFFFFF' },
  paypal: { backgroundColor: '#003087', textColor: '#FFFFFF' },
  'apple-music': { backgroundColor: '#FA243C', textColor: '#FFFFFF' },
  soundcloud: { backgroundColor: '#FF5500', textColor: '#FFFFFF' },
  whatsapp: { backgroundColor: '#25D366', textColor: '#FFFFFF' },
  telegram: { backgroundColor: '#26A5E4', textColor: '#FFFFFF' },
  signal: { backgroundColor: '#3A76F0', textColor: '#FFFFFF' },
  meta: { backgroundColor: '#0082FB', textColor: '#FFFFFF' },
  discover: { backgroundColor: '#FF6000', textColor: '#FFFFFF' },
  amex: { backgroundColor: '#006FCF', textColor: '#FFFFFF' },
  messenger: { backgroundColor: '#0084FF', textColor: '#FFFFFF' },
  instagram: { backgroundColor: '#E4405F', textColor: '#FFFFFF' },
  zoom: { backgroundColor: '#0B5CFF', textColor: '#FFFFFF' },
  typescript: { backgroundColor: '#3178C6', textColor: '#FFFFFF' },
  css: { backgroundColor: '#663399', textColor: '#FFFFFF' },
};

/** The bird-era blue is kept for `twitter` rather than inheriting X's black. */
const LEGACY_BRAND_CONFIGS: Record<'twitter', BrandConfig> = {
  twitter: { icon: 'x', backgroundColor: '#1DA1F2', textColor: '#FFFFFF' },
};

const FALLBACK_BRAND_COLORS: BrandColors = { backgroundColor: '#000000', textColor: '#FFFFFF' };

/**
 * Resolves a brand — canonical, deprecated camelCase, or `twitter` — onto the
 * mark to render and the colors that go with it.
 */
export const resolveBrandConfig = (brand: BrandPlatform): BrandConfig => {
  const legacy = LEGACY_BRAND_CONFIGS[brand as 'twitter'];
  if (legacy) return legacy;

  const icon = resolveBrandName(brand as BrandName);
  return { icon, ...(brandColors[icon] ?? FALLBACK_BRAND_COLORS) };
};
