import { PlatformBlocksTheme } from './types';
import { DESIGN_TOKENS } from '../design-tokens';

export const DEFAULT_THEME: PlatformBlocksTheme = {
  primaryColor: '#2563EB',
  colorScheme: 'light',

  // Integration with design tokens
  designTokens: DESIGN_TOKENS,

  colors: {
    primary: [
      '#EFF6FF',
      '#DBEAFE',
      '#BFDBFE',
      '#93C5FD',
      '#60A5FA',
      // Base sits on blue-600 rather than blue-500: white label text needs
      // 4.5:1 and only clears it from 600 down (5.17:1 vs 3.68:1). The ramp is
      // still Tailwind blue end to end, re-anchored one step darker.
      '#2563EB', // Base color — unified brand blue
      '#1D4ED8',
      '#1E40AF',
      '#1E3A8A',
      '#172554'
    ],
    secondary: [
      '#F8FAFC',
      '#F1F5F9',
      '#E2E8F0',
      '#CBD5E1',
      '#94A3B8',
      '#64748B', // neutral slate — a true secondary, not lavender
      '#475569',
      '#334155',
      '#1E293B',
      '#0F172A'
    ],
    tertiary: [
           '#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6',
      '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'

    ],  
    surface: [
      '#FFFFFF',
      '#F7F8FA',
      '#EFEFF1',
      '#E7E7E9',
      '#DFDFE1',
      '#D7D7D9',
      '#CFCFD1',
      '#C7C7C9',
      '#BFBFC1',
      '#B7B7B9'
    ],
    success: [
      '#F0FDF4',
      '#DCFCE7',
      '#BBF7D0',
      '#86EFAC',
      '#4ADE80',
      '#22C55E',
      '#16A34A',
      '#15803D',
      '#166534',
      '#14532D'
    ],
    warning: [
      '#FFFBEB',
      '#FEF3C7',
      '#FDE68A',
      '#FCD34D',
      '#FBBF24',
      '#F59E0B',
      '#D97706',
      '#B45309',
      '#92400E',
      '#78350F'
    ],
    error: [
      '#FEF2F2',
      '#FEE2E2',
      '#FECACA',
      '#FCA5A5',
      '#F87171',
      '#EF4444',
      '#DC2626',
      '#B91C1C',
      '#991B1B',
      '#7F1D1D'
    ],
    gray: [
      '#F2F2F7',
      '#E5E5EA',
      '#D1D1D6',
      '#C7C7CC',
      '#AEAEB2',
      '#8E8E93',
      '#6D6D70',
      '#48484A',
      '#3A3A3C',
      '#1C1C1E'
    ],
    highlight: [
      '#FFFEF7',
      '#FFFBEB',
      '#FEF3C7',
      '#FDE68A',
      '#FCD34D',
      '#FBBF24', // Base highlight color
      '#F59E0B',
      '#D97706',
      '#B45309',
      '#92400E'
    ],
    pink: [
      '#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6',
      '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'
    ],
    purple: [
      '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC',
      '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#581C87'
    ],
    violet: [
      '#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA',
      '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'
    ],
    cyan: [
      '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE',
      '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'
    ],
    lime: [
      '#F7FEE7', '#ECFCCB', '#D9F99D', '#BEF264', '#A3E635',
      '#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#365314'
    ],
    sky: [
      '#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8',
      '#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E'
    ],
    amber: [
      '#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24',
      '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'
    ],
    indigo: [
      '#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8',
      '#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'
    ],
    teal: [
      '#F0FDFA', '#ECFEFF', '#CCFBF1', '#99F6E4', '#5EEAD4',
      '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', '#134E4A'
    ]
  },

  text: {
    primary: '#1C1C1E',
    // Secondary carries real copy (subtitles, breadcrumb trail), so it clears
    // 4.5:1 on both the white surface and the gray page background.
    secondary: '#6E6E73',
    muted: '#8E8E93',
    disabled: '#C7C7CC',
  link: '#2563EB',
  onPrimary: '#FFFFFF'
  },

  backgrounds: {
    base: '#F7F8FA',    // faint gray page so white cards read as elevated
    subtle: '#EDEFF3',  // one step darker so subtle/ghost surfaces stay distinct from the page
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E5E7EB'
  },

  // Light mode reads elevation mainly through shadow — the fill stays white
  // from level 1 up, so a dropdown over a card doesn't turn grey.
  surfaces: {
    0: { background: '#F7F8FA', border: '#F0F1F4', shadow: 'none' },
    1: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'xs' },
    2: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'md' },
    3: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'xl' },
  },

  states: {
    focusRing: 'rgba(59,130,246,0.45)',
    textSelection: 'rgba(251, 191, 36, 0.3)', // Semi-transparent highlight[5]
    highlightText: '#B45309', // highlight[8] for good contrast
    highlightBackground: 'rgba(253, 230, 138, 0.6)' // Semi-transparent highlight[3]
  },

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

  fontSizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px'
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },

  radii: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '20px'
  },

  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)'
  },

  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '1024px',
    lg: '1280px',
    xl: '1536px'
  },

  motion: {
    easing: {
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
      easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '250ms',
      slow: '400ms'
    }
  },

  semantic: {
    accent: '#2563EB', // primary[5] — unified brand blue
    borderDefault: '#E7E7E9', // surface[3]
    borderSubtle: '#F7F8FA', // surface[1]
    surfaceElevated: '#FFFFFF', // surface[0]
    surfaceCard: '#F7F8FA', // surface[1]
    focusRing: '#60A5FA' // primary[4]
  },

  components: {},
  other: {
    zIndices: {
      header: 900,
      navbar: 800,
      footer: 500,
      overlay: 1300,
      drawer: 1200,
      skipLink: 2000
    },
    elevations: {
      header: '0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)',
      navbar: '0 0 0 1px rgba(0,0,0,0.06)',
      surface: '0 1px 3px rgba(0,0,0,0.08)',
      floating: '0 4px 12px rgba(0,0,0,0.12)'
    }
  }
};
