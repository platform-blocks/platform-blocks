export const PRESETS = [
  { label: 'Docs', value: 'https://platform-blocks.com' },
  { label: 'Support', value: 'mailto:support@platform-blocks.com' },
  { label: 'SMS', value: 'sms:+1234567890?body=Go Blocks!' }
] as const;

export const SIZES = [144, 168, 192] as const;
export const ERROR_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export const MODULE_SHAPES = ['square', 'rounded', 'diamond'] as const;
