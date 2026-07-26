import { PlatformBlocksTheme } from './types';

export const DARK_THEME: PlatformBlocksTheme = {
  primaryColor: '#3B82F6',
  colorScheme: 'dark',

  colors: {
    primary: [
      '#172554',
      '#1E3A8A',
      '#1E40AF',
      '#1D4ED8',
      '#2563EB',
      '#3B82F6', // Base color — unified brand blue
      '#60A5FA',
      '#93C5FD',
      '#BFDBFE',
      '#DBEAFE'
    ],
    secondary: [
      '#0F172A',
      '#1E293B',
      '#334155',
      '#475569',
      '#64748B',
      '#94A3B8', // neutral slate — a true secondary, not lavender
      '#CBD5E1',
      '#E2E8F0',
      '#F1F5F9',
      '#F8FAFC'
    ],
    tertiary: [
      '#0B1A26',
      '#16334D',
      '#204D73',
      '#2B6699',
      '#357FFF',
      '#5E9CFF',
      '#85B3FF',
      '#ADD0FF',
      '#D4E6FF',
      '#EBF3FF'
    ],
    surface: [
      '#1C1C1E',
      '#2C2C2E',
      '#3A3A3C',
      '#48484A',
      '#636366',
      '#8E8E93',
      '#AEAEB2',
      '#C7C7CC',
      '#D1D1D6',
      '#E5E5EA'
    ],
    success: [
      '#052E16',
      '#14532D',
      '#166534',
      '#15803D',
      '#16A34A',
      '#22C55E', // unified green
      '#4ADE80',
      '#86EFAC',
      '#BBF7D0',
      '#DCFCE7'
    ],
    warning: [
      '#451A03',
      '#78350F',
      '#92400E',
      '#B45309',
      '#D97706',
      '#F59E0B', // unified amber
      '#FBBF24',
      '#FCD34D',
      '#FDE68A',
      '#FEF3C7'
    ],
    error: [
      '#450A0A',
      '#7F1D1D',
      '#991B1B',
      '#B91C1C',
      '#DC2626',
      '#EF4444', // unified red
      '#F87171',
      '#FCA5A5',
      '#FECACA',
      '#FEE2E2'
    ],
    gray: [
      '#0E0E11',
      '#1C1C1E',
      '#2C2C2E',
      '#3A3A3C',
      '#48484A',
      '#636366',
      '#8E8E93',
      '#AEAEB2',
      '#C7C7CC',
      '#F2F2F7'
    ],
    highlight: [
      '#1E3A5F', // Deep blue
      '#1E4976', // 
      '#1D5A8F', // 
      '#2563EB', // Bright blue
      '#3B82F6', // Primary blue
      '#60A5FA', // Light blue
      '#93C5FD', // 
      '#BFDBFE', // 
      '#DBEAFE', // 
      '#EFF6FF'  // Very light blue
    ],
    pink: [
      '#831843', '#9D174D', '#BE185D', '#DB2777', '#EC4899',
      '#F472B6', '#F9A8D4', '#FBCFE8', '#FCE7F3', '#FDF2F8'
    ],
    purple: [
      '#581C87', '#6B21A8', '#7E22CE', '#9333EA', '#A855F7',
      '#C084FC', '#D8B4FE', '#E9D5FF', '#F3E8FF', '#FAF5FF'
    ],
    violet: [
      '#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6',
      '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF'
    ],
    cyan: [
      '#164E63', '#155E75', '#0E7490', '#0891B2', '#06B6D4',
      '#22D3EE', '#67E8F9', '#A5F3FC', '#CFFAFE', '#ECFEFF'
    ],
    lime: [
      '#365314', '#3F6212', '#4D7C0F', '#65A30D', '#84CC16',
      '#A3E635', '#BEF264', '#D9F99D', '#ECFCCB', '#F7FEE7'
    ],
    sky: [
      '#0C4A6E', '#075985', '#0369A1', '#0284C7', '#0EA5E9',
      '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE', '#F0F9FF'
    ],
    amber: [
      '#78350F', '#92400E', '#B45309', '#D97706', '#F59E0B',
      '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7', '#FFFBEB'
    ],
    indigo: [
      '#312E81', '#3730A3', '#4338CA', '#4F46E5', '#6366F1',
      '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF', '#EEF2FF'
    ],
    teal: [
      '#134E4A', '#0F766E', '#0D9488', '#14B8A6', '#2DD4BF',
      '#5EEAD4', '#99F6E4', '#CCFBF1', '#ECFEFF', '#F0FDFA'
    ]
  },

  text: {
    primary: '#F2F2F7',
    onPrimary: '#F2F2F7',
    secondary: '#AEAEB2',
    muted: '#8E8E93',
    disabled: '#636366',
    link: '#3B82F6'
  },

  backgrounds: {
    base: '#0E0E11',
    subtle: '#161619',
    surface: '#1C1C1F',
    elevated: '#26262A',
    border: '#2A2A2E'
  },

  // Dark mode reads elevation through the fill getting lighter (shadows barely
  // register on a near-black page), with a hairline border doing the rest.
  surfaces: {
    0: { background: '#0E0E11', border: '#1F1F23', shadow: 'none' },
    1: { background: '#1C1C1F', border: '#2A2A2E', shadow: 'xs' },
    2: { background: '#26262A', border: '#313136', shadow: 'md' },
    3: { background: '#2F2F34', border: '#3A3A40', shadow: 'xl' },
  },

  states: {
    focusRing: 'rgba(59,130,246,0.55)',
    textSelection: 'rgba(10, 132, 255, 0.25)', // Primary blue for selection
    highlightText: '#60A5FA', // primary[4] - bright blue for good contrast on dark
    highlightBackground: 'rgba(59, 130, 246, 0.35)' // primary[5] with transparency
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
    xs: '0 1px 3px rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 3px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.2)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.4), 0 5px 10px rgba(0, 0, 0, 0.1)'
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
    accent: '#3B82F6', // primary[5] — unified brand blue
    borderDefault: '#3A3A3E', // subtle elevated border
    borderSubtle: '#2A2A2E',
    surfaceElevated: '#26262A',
    surfaceCard: '#1C1C1F',
    focusRing: '#3B82F6' // unified brand blue
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
      header: '0 1px 2px rgba(0,0,0,0.5)',
      navbar: '0 0 0 1px rgba(255,255,255,0.08)',
      surface: '0 1px 3px rgba(0,0,0,0.6)',
      floating: '0 4px 12px rgba(0,0,0,0.7)'
    }
  }
};
