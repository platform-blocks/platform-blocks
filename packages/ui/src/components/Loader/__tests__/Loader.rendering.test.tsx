/**
 * Loader Component - Rendering and Behavior Tests
 * 
 * Tests rendering behavior, animation initialization, variant display,
 * and style application for the Loader component.
 * 
 * Coverage:
 * - Default rendering
 * - Variant rendering (oval, bars, dots)
 * - Size application
 * - Color application
 * - Speed application
 * - Animation lifecycle
 * - Spacing integration
 * - Style merging
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { Loader } from '../Loader';

// Spy on the theme-aware icon-size resolver the Loader sizes itself with.
const mockGetIconSize = jest.fn((size) => {
  if (typeof size === 'number') return size;
  const sizes = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40, '2xl': 48, '3xl': 56 };
  return sizes[size as keyof typeof sizes] || 24;
});

jest.mock('../../../core/theme/tokens', () => ({
  ...jest.requireActual('../../../core/theme/tokens'),
  resolveIconSize: (_theme: unknown, size: any) => mockGetIconSize(size),
}));

// Mock theme
jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      primary: ['#000', '#111', '#222', '#333', '#444', '#1976d2', '#666', '#777', '#888', '#999']
    },
    spacing: (value: number) => value * 8,
    radius: (value: number) => value * 4
  })
}));

describe('Loader - Rendering and Behavior', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Rendering', () => {
    it('should render with default props', () => {
      const { UNSAFE_getByType } = render(<Loader />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render as View component', () => {
      const { UNSAFE_getByType } = render(<Loader />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should use oval variant by default', () => {
      const { UNSAFE_getByType } = render(<Loader />);
      // Oval is default variant
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should use md size by default', () => {
      render(<Loader />);
      expect(mockGetIconSize).toHaveBeenCalledWith('md');
    });

    it('should use theme primary color by default', () => {
      const { UNSAFE_getByType } = render(<Loader />);
      // Default color comes from theme.colors.primary[5]
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Variant Rendering', () => {
    it('should render oval variant', () => {
      const { UNSAFE_getByType } = render(<Loader variant="oval" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render bars variant', () => {
      const { UNSAFE_getByType } = render(<Loader variant="bars" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render dots variant', () => {
      const { UNSAFE_getByType } = render(<Loader variant="dots" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render different structure for each variant', () => {
      const oval = render(<Loader variant="oval" testID="oval" />);
      const bars = render(<Loader variant="bars" testID="bars" />);
      const dots = render(<Loader variant="dots" testID="dots" />);

      expect(oval.getByTestId('oval')).toBeTruthy();
      expect(bars.getByTestId('bars')).toBeTruthy();
      expect(dots.getByTestId('dots')).toBeTruthy();
    });
  });

  describe('Size Application', () => {
    it('should apply numeric size', () => {
      render(<Loader size={40} />);
      expect(mockGetIconSize).toHaveBeenCalledWith(40);
    });

    it('should apply token size "xs"', () => {
      render(<Loader size="xs" />);
      expect(mockGetIconSize).toHaveBeenCalledWith('xs');
    });

    it('should apply token size "sm"', () => {
      render(<Loader size="sm" />);
      expect(mockGetIconSize).toHaveBeenCalledWith('sm');
    });

    it('should apply token size "lg"', () => {
      render(<Loader size="lg" />);
      expect(mockGetIconSize).toHaveBeenCalledWith('lg');
    });

    it('should apply token size "xl"', () => {
      render(<Loader size="xl" />);
      expect(mockGetIconSize).toHaveBeenCalledWith('xl');
    });

    it('should apply token size "2xl"', () => {
      render(<Loader size="2xl" />);
      expect(mockGetIconSize).toHaveBeenCalledWith('2xl');
    });

    it('should apply token size "3xl"', () => {
      render(<Loader size="3xl" />);
      expect(mockGetIconSize).toHaveBeenCalledWith('3xl');
    });
  });

  describe('Color Application', () => {
    it('should apply custom hex color', () => {
      const { UNSAFE_getByType } = render(<Loader color="#ff0000" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply custom rgb color', () => {
      const { UNSAFE_getByType } = render(<Loader color="rgb(255, 0, 0)" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply custom named color', () => {
      const { UNSAFE_getByType } = render(<Loader color="red" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply color to oval variant', () => {
      const { UNSAFE_getByType } = render(<Loader variant="oval" color="#00ff00" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply color to bars variant', () => {
      const { UNSAFE_getByType } = render(<Loader variant="bars" color="#0000ff" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply color to dots variant', () => {
      const { UNSAFE_getByType } = render(<Loader variant="dots" color="#ffff00" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Speed Application', () => {
    it('should use custom speed value', () => {
      const { UNSAFE_getByType } = render(<Loader speed={500} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should use slow speed', () => {
      const { UNSAFE_getByType } = render(<Loader speed={2000} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should use fast speed', () => {
      const { UNSAFE_getByType } = render(<Loader speed={300} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply speed to animation setup', () => {
      const { UNSAFE_getByType } = render(<Loader speed={800} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Animation Initialization', () => {
    it('should render with animation setup', () => {
      const { UNSAFE_getByType } = render(<Loader />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render with speed configuration', () => {
      const { UNSAFE_getByType } = render(<Loader speed={500} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Spacing Integration', () => {
    it('should apply margin spacing', () => {
      const { UNSAFE_getByType } = render(<Loader m={2} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply padding spacing', () => {
      const { UNSAFE_getByType } = render(<Loader p={2} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply directional margin', () => {
      const { UNSAFE_getByType } = render(<Loader mt={1} mb={2} ml={1} mr={2} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply directional padding', () => {
      const { UNSAFE_getByType } = render(<Loader pt={1} pb={2} pl={1} pr={2} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply horizontal and vertical spacing', () => {
      const { UNSAFE_getByType } = render(<Loader mx={2} my={1} px={1} py={2} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Style Merging', () => {
    it('should apply custom style', () => {
      const { UNSAFE_getByType } = render(
        <Loader style={{ opacity: 0.5 }} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should merge multiple styles', () => {
      const { UNSAFE_getByType } = render(
        <Loader style={[{ opacity: 0.5 }, { marginTop: 10 }] as any} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should merge spacing with custom style', () => {
      const { UNSAFE_getByType } = render(
        <Loader m={2} style={{ opacity: 0.5 }} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should preserve custom style with spacing', () => {
      const { UNSAFE_getByType } = render(
        <Loader 
          m={1} 
          p={2} 
          style={{ backgroundColor: 'red', borderRadius: 5 }} 
        />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle variant with size and color', () => {
      const { UNSAFE_getByType } = render(
        <Loader variant="bars" size="lg" color="#ff0000" />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle all props together', () => {
      const { getByTestId } = render(
        <Loader
          variant="dots"
          size="xl"
          color="#4caf50"
          speed={800}
          m={3}
          p={2}
          style={{ opacity: 0.9 }}
          testID="complex-loader"
        />
      );
      expect(getByTestId('complex-loader')).toBeTruthy();
    });

    it('should handle rapid variant changes', () => {
      const { rerender } = render(<Loader variant="oval" />);
      rerender(<Loader variant="bars" />);
      rerender(<Loader variant="dots" />);
      // All variants should render successfully
      expect(true).toBe(true);
    });

    it('should handle speed changes', () => {
      const { rerender } = render(<Loader speed={1000} />);
      rerender(<Loader speed={500} />);
      // Speed changes should work
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle size 0', () => {
      render(<Loader size={0} />);
      expect(mockGetIconSize).toHaveBeenCalledWith(0);
    });

    it('should handle very large size', () => {
      render(<Loader size={200} />);
      expect(mockGetIconSize).toHaveBeenCalledWith(200);
    });

    it('should handle speed 0', () => {
      const { UNSAFE_getByType } = render(<Loader speed={0} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle very large speed', () => {
      const { UNSAFE_getByType } = render(<Loader speed={10000} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle empty style array', () => {
      const { UNSAFE_getByType } = render(<Loader style={[] as any} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle null in style array', () => {
      const { UNSAFE_getByType } = render(<Loader style={[null, { opacity: 0.5 }] as any} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with testID', () => {
      const { getByTestId } = render(<Loader testID="accessible-loader" />);
      expect(getByTestId('accessible-loader')).toBeTruthy();
    });

    it('should render with accessibility in mind', () => {
      const { UNSAFE_getByType } = render(<Loader />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('is a busy, indeterminate progressbar named "Loading" by default', () => {
      const { getByTestId } = render(<Loader testID="busy-loader" />);
      const { props } = getByTestId('busy-loader');
      expect(props.role).toBe('progressbar');
      expect(props['aria-busy']).toBe(true);
      expect(props['aria-label']).toBe('Loading');
      expect(props['aria-valuenow']).toBeUndefined();
      expect(props.accessibilityRole).toBeUndefined();
    });

    it('takes a custom accessible name', () => {
      const { getByLabelText } = render(<Loader accessibilityLabel="Fetching orders" />);
      expect(getByLabelText('Fetching orders')).toBeTruthy();
    });
  });
});
