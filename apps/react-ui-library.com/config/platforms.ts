import type { BrandName } from '@platform-blocks/react-ui-library';

// Available brand icons (must match BrandName keys from the registry)
export const AVAILABLE_BRANDS: BrandName[] = [
  'google', 'google-play', 'facebook', 'discord', 'android', 'apple', 'app-store', 'chrome',
  'spotify', 'github', 'x', 'microsoft', 'linkedin', 'slack', 'youtube',
  'youtube-music', 'openai', 'reddit', 'amazon', 'twitch', 'mastercard', 'visa', 'tiktok',
  'paypal', 'apple-music', 'whatsapp', 'telegram', 'signal', 'meta',
  'discover', 'amex', 'zoom',
];

// Tag configuration for better maintainability
export const TAG_CONFIG = {
  'Supported': { color: 'success', variant: 'filled' },
  'In Progress': { color: 'info', variant: 'subtle' },
  'Experimental': { color: 'warning', variant: 'subtle' },
  'Beta': { color: 'secondary', variant: 'subtle' },
  'Coming Soon': { color: 'gray', variant: 'outline' }
} as const;

export type TagType = keyof typeof TAG_CONFIG;

// Platform support matrix, rendered as cards on Getting Started. These used to
// carry a `route` to a per-platform page; those pages are gone, so the entries
// are display-only now.
export const PLATFORMS = [
  {
    key: 'ios',
    label: 'iOS',
    brand: 'apple' as const,
    note: 'iOS 26+',
    description: 'Native views on iPhone and iPad, with platform haptics, gestures, and safe areas handled for you',
    tags: ['Supported'] as TagType[]
  },
  {
    key: 'android',
    label: 'Android',
    brand: 'android' as const,
    note: 'API 36+',
    description: 'Native Android rendering with edge-to-edge layouts and the same component API as every platform',
    tags: ['Supported'] as TagType[]
  },
  {
    key: 'web',
    label: 'Web',
    brand: 'chrome' as const,
    note: 'Modern browsers',
    description: 'Progressive web apps with responsive design',
    tags: ['Supported'] as TagType[]
  },
];

// Helper function for rendering tag chips
export const getTagConfig = (tag: TagType) => TAG_CONFIG[tag];