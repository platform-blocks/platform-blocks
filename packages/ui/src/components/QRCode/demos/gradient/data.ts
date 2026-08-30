import type { PlatformBlocksTheme } from '@platform-blocks/react-ui-library';

/**
 * Built from the theme rather than hard-coded hexes, so the gradients follow the
 * active palette — hence a factory instead of a plain constant.
 */
export const createGradientExamples = (theme: PlatformBlocksTheme) => [
  {
    label: 'Linear blend',
    value: 'https://react-ui-library.com/linear',
    gradient: {
      from: theme.colors.primary[6],
      to: theme.colors.highlight[5],
      type: 'linear' as const,
      rotation: 45
    },
    moduleShape: 'rounded' as const,
    cornerRadius: 0.4
  },
  {
    label: 'Radial bloom',
    value: 'https://react-ui-library.com/radial',
    gradient: {
      from: theme.colors.success[5],
      to: theme.colors.primary[4],
      type: 'radial' as const
    },
    moduleShape: 'diamond' as const,
    cornerRadius: undefined
  }
];
