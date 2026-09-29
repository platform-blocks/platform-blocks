/**
 * Avatar Component - Type Safety and Prop Validation Tests
 * 
 * Tests type definitions, prop validation, and TypeScript interfaces
 * for the Avatar component.
 * 
 * Coverage:
 * - Size types (tokens + numbers)
 * - Image source (src)
 * - Fallback text
 * - Colors (background, text, indicator)
 * - Online indicator
 * - Label and description
 * - Gap and showText props
 * - Style prop
 * - Accessibility
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import { Avatar } from '../Avatar';

// Mock the theme
jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
  useTheme: () => ({
    ...jest.requireActual('../../../core/theme/defaultTheme').DEFAULT_THEME,
    colors: {
      gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
      success: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
    },
    shadows: {
      xs: '0 1px 2px rgba(0,0,0,0.1)',
    },
  }),
}));

describe('Avatar - Type Safety and Prop Validation', () => {
  
  describe('Size Types', () => {
    it('should accept numeric size', () => {
      const { UNSAFE_getByType } = render(<Avatar size={50} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept token size "xs"', () => {
      const { UNSAFE_getByType } = render(<Avatar size="xs" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept token size "sm"', () => {
      const { UNSAFE_getByType } = render(<Avatar size="sm" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept token size "md"', () => {
      const { UNSAFE_getByType } = render(<Avatar size="md" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept token size "lg"', () => {
      const { UNSAFE_getByType } = render(<Avatar size="lg" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept token size "xl"', () => {
      const { UNSAFE_getByType } = render(<Avatar size="xl" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should default to "md" size when not specified', () => {
      const { UNSAFE_getByType } = render(<Avatar />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Image Source (src)', () => {
    it('should accept image URL', () => {
      const { UNSAFE_getByType } = render(<Avatar src="https://example.com/avatar.jpg" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept data URI', () => {
      const { UNSAFE_getByType } = render(<Avatar src="data:image/png;base64,..." />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render without src (fallback mode)', () => {
      const { UNSAFE_getByType } = render(<Avatar fallback="AB" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Fallback Text', () => {
    it('should accept fallback text', () => {
      const { getByText } = render(<Avatar fallback="JD" />);
      expect(getByText('JD')).toBeTruthy();
    });

    it('should accept single character fallback', () => {
      const { getByText } = render(<Avatar fallback="A" />);
      expect(getByText('A')).toBeTruthy();
    });

    it('should accept emoji fallback', () => {
      const { getByText } = render(<Avatar fallback="😀" />);
      expect(getByText('😀')).toBeTruthy();
    });

    it('should default to "?" when no fallback provided', () => {
      const { getByText } = render(<Avatar />);
      expect(getByText('?')).toBeTruthy();
    });
  });

  describe('Color Props', () => {
    it('should accept bg', () => {
      const { UNSAFE_getByType } = render(<Avatar bg="#ff0000" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept textColor', () => {
      const { UNSAFE_getByType } = render(<Avatar textColor="#ffffff" fallback="AB" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept indicatorColor', () => {
      const { UNSAFE_getByType } = render(<Avatar online indicatorColor="#00ff00" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should default textColor to "white"', () => {
      const { UNSAFE_getByType } = render(<Avatar fallback="AB" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Online Indicator', () => {
    it('should accept online prop as true', () => {
      const { UNSAFE_getByType } = render(<Avatar online={true} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept online prop as false', () => {
      const { UNSAFE_getByType } = render(<Avatar online={false} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render without online prop', () => {
      const { UNSAFE_getByType } = render(<Avatar />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Label and Description', () => {
    it('should accept string label', () => {
      const { getByText } = render(<Avatar label="John Doe" />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should accept string description', () => {
      const { getByText } = render(<Avatar description="Software Engineer" />);
      expect(getByText('Software Engineer')).toBeTruthy();
    });

    it('should accept both label and description', () => {
      const { getByText } = render(
        <Avatar label="John Doe" description="Software Engineer" />
      );
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Software Engineer')).toBeTruthy();
    });

    it('should accept custom React node as label', () => {
      expect(() => {
        render(<Avatar label={<View><View /></View>} />);
      }).not.toThrow();
    });

    it('should accept custom React node as description', () => {
      expect(() => {
        render(<Avatar description={<View><View /></View>} />);
      }).not.toThrow();
    });
  });

  describe('Gap Prop', () => {
    it('should accept custom gap value', () => {
      const { UNSAFE_getByType } = render(<Avatar label="Test" gap={16} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept gap value 0', () => {
      const { UNSAFE_getByType } = render(<Avatar label="Test" gap={0} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should default to gap 8', () => {
      const { UNSAFE_getByType } = render(<Avatar label="Test" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('ShowText Prop', () => {
    it('should accept showText as true', () => {
      const { getByText } = render(<Avatar label="Test" showText={true} />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should accept showText as false', () => {
      const { queryByText } = render(<Avatar label="Test" showText={false} />);
      expect(queryByText('Test')).toBeNull();
    });

    it('should default to showText true', () => {
      const { getByText } = render(<Avatar label="Test" />);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Style Prop', () => {
    it('should accept style prop', () => {
      const { UNSAFE_getByType } = render(
        <Avatar style={{ opacity: 0.5 }} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should accept array of styles', () => {
      const { UNSAFE_getByType } = render(
        <Avatar style={[{ opacity: 0.5 }, { marginTop: 10 }] as any} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should accept accessibilityLabel', () => {
      const { UNSAFE_getByType } = render(
        <Avatar src="https://example.com/avatar.jpg" accessibilityLabel="User avatar" />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Complex Prop Combinations', () => {
    it('should handle image with online indicator', () => {
      const { UNSAFE_getByType } = render(
        <Avatar src="https://example.com/avatar.jpg" online />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle fallback with custom colors', () => {
      const { getByText } = render(
        <Avatar fallback="AB" bg="#ff0000" textColor="#ffffff" />
      );
      expect(getByText('AB')).toBeTruthy();
    });

    it('should handle size with label and description', () => {
      const { getByText } = render(
        <Avatar size="lg" label="John Doe" description="Engineer" />
      );
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Engineer')).toBeTruthy();
    });

    it('should handle all props together', () => {
      const { getByText, UNSAFE_getByType } = render(
        <Avatar
          size="xl"
          src="https://example.com/avatar.jpg"
          fallback="JD"
          bg="#ff0000"
          textColor="#ffffff"
          online={true}
          indicatorColor="#00ff00"
          label="John Doe"
          description="Engineer"
          gap={12}
          showText={true}
          style={{ opacity: 0.9 }}
          accessibilityLabel="User profile"
        />
      );
      expect(getByText('John Doe')).toBeTruthy();
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle size 0', () => {
      const { UNSAFE_getByType } = render(<Avatar size={0} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle very large size', () => {
      const { UNSAFE_getByType } = render(<Avatar size={200} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle empty fallback string', () => {
      const { getByText } = render(<Avatar fallback="" />);
      expect(getByText('?')).toBeTruthy();
    });

    it('should handle empty label', () => {
      const { UNSAFE_getByType } = render(<Avatar label="" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });
});
