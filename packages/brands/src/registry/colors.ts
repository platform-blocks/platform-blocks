import type { BrandName } from './icons';

/** A brand's fill, text and (optional) border color, as used by filled BrandButtons. */
export interface BrandColors {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

/** Every brand in the icon registry gets a fill + text color for filled variants. */
export const brandColors: Record<BrandName, BrandColors> = {
  google: { backgroundColor: '#4285F4', textColor: '#FFFFFF' },
  'google-play': { backgroundColor: '#01875F', textColor: '#FFFFFF' },
  'galaxy-store': { backgroundColor: '#6D4DFF', textColor: '#FFFFFF' },
  facebook: { backgroundColor: '#1877F2', textColor: '#FFFFFF' },
  discord: { backgroundColor: '#5865F2', textColor: '#FFFFFF' },
  android: { backgroundColor: '#3DDC84', textColor: '#FFFFFF' },
  apple: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  'apple-podcasts': { backgroundColor: '#832BC1', textColor: '#FFFFFF' },
  'app-store': { backgroundColor: '#0D96F6', textColor: '#FFFFFF' },
  'app-gallery': { backgroundColor: '#D70010', textColor: '#FFFFFF' },
  anthropic: { backgroundColor: '#D97757', textColor: '#FFFFFF' },
  openai: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  chrome: { backgroundColor: '#4285F4', textColor: '#FFFFFF' },
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
  threads: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  bluesky: { backgroundColor: '#1185FE', textColor: '#FFFFFF' },
  pinterest: { backgroundColor: '#BD081C', textColor: '#FFFFFF' },
  snapchat: { backgroundColor: '#FFFC00', textColor: '#000000' },
  wechat: { backgroundColor: '#07C160', textColor: '#FFFFFF' },
  reddit: { backgroundColor: '#FF5700', textColor: '#FFFFFF' },
  amazon: { backgroundColor: '#000000', textColor: '#FFFFFF', borderColor: '#000000' },
  'amazon-music': { backgroundColor: '#0c6cb3', textColor: '#FFFFFF' },
  twitch: { backgroundColor: '#9146FF', textColor: '#FFFFFF' },
  tiktok: { backgroundColor: '#000000', textColor: '#FFFFFF' },
  expo: { backgroundColor: '#000020', textColor: '#FFFFFF' },
  react: { backgroundColor: '#61DAFB', textColor: '#000000' },
  nodejs: { backgroundColor: '#5FA04E', textColor: '#FFFFFF' },
  npm: { backgroundColor: '#CB3837', textColor: '#FFFFFF' },
  stripe: { backgroundColor: '#635BFF', textColor: '#FFFFFF' },
  'apple-pay': { backgroundColor: '#000000', textColor: '#FFFFFF' },
  'google-pay': { backgroundColor: '#000000', textColor: '#FFFFFF' },
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

/** Colors for a name the registry doesn't know (only reachable from untyped callers). */
export const FALLBACK_BRAND_COLORS: BrandColors = { backgroundColor: '#000000', textColor: '#FFFFFF' };
