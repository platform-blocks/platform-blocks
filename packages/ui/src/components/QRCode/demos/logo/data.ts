export const LOGO_EXAMPLES = [
  {
    label: 'Rounded modules',
    value: 'https://platform-blocks.com/events/media-day',
    moduleShape: 'rounded' as const,
    cornerRadius: 0.4,
    logo: {
      uri: require('../../../../assets/logo-mark.png'),
      size: 56,
      borderRadius: 12
    }
  },
  {
    label: 'Square modules',
    value: 'https://platform-blocks.com/support/app',
    moduleShape: 'square' as const,
    cornerRadius: undefined,
    logo: {
      uri: require('../../../../assets/logo-mark.png'),
      size: 48,
      borderRadius: 8
    }
  }
] as const;
