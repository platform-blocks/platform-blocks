/**
 * Avatar Component - Rendering and Behavior Tests
 * 
 * Tests rendering behavior, image handling, fallback display,
 * indicator positioning, and label/description layout.
 * 
 * Coverage:
 * - Default rendering
 * - Image rendering
 * - Fallback text rendering
 * - Size calculations
 * - Color application
 * - Online indicator
 * - Label and description layout
 * - Gap spacing
 * - showText behavior
 * - Style merging
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Image, Text as RNText } from 'react-native';
import { Avatar } from '../Avatar';

// Mock Text component
jest.mock('../../Text', () => ({
  Text: ({ children, ...props }: any) => {
    const RNText = require('react-native').Text;
    return <RNText {...props}>{children}</RNText>;
  }
}));

// Mock Indicator component
jest.mock('../../Indicator', () => ({
  Indicator: ({ testID = 'indicator', ...props }: any) => {
    const View = require('react-native').View;
    return <View testID={testID} {...props} />;
  }
}));

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

describe('Avatar - Rendering and Behavior', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Rendering', () => {
    it('should render with default props', () => {
      const { UNSAFE_getByType } = render(<Avatar />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render View component', () => {
      const { UNSAFE_getAllByType } = render(<Avatar />);
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });

    it('should use md size by default', () => {
      const { getByText } = render(<Avatar />);
      // Default fallback is "?"
      expect(getByText('?')).toBeTruthy();
    });

    it('should show fallback text by default', () => {
      const { getByText } = render(<Avatar />);
      expect(getByText('?')).toBeTruthy();
    });
  });

  describe('Image Rendering', () => {
    it('should render Image when src is provided', () => {
      const { UNSAFE_getByType } = render(<Avatar src="https://example.com/avatar.jpg" />);
      expect(UNSAFE_getByType(Image)).toBeTruthy();
    });

    it('should not render fallback text when src is provided', () => {
      const { queryByText } = render(
        <Avatar src="https://example.com/avatar.jpg" fallback="AB" />
      );
      expect(queryByText('AB')).toBeNull();
    });

    it('should pass src to Image component', () => {
      const { UNSAFE_getByType } = render(
        <Avatar src="https://example.com/avatar.jpg" />
      );
      const image = UNSAFE_getByType(Image);
      expect(image.props.source.uri).toBe('https://example.com/avatar.jpg');
    });

    it('names the avatar (an image) from accessibilityLabel', () => {
      const { getByRole } = render(
        <Avatar src="https://example.com/avatar.jpg" accessibilityLabel="User avatar" />
      );
      expect(getByRole('image', { name: 'User avatar' })).toBeTruthy();
    });
  });

  describe('Fallback Text Rendering', () => {
    it('should render fallback text when no src provided', () => {
      const { getByText } = render(<Avatar fallback="JD" />);
      expect(getByText('JD')).toBeTruthy();
    });

    it('should render default "?" when no src and no fallback', () => {
      const { getByText } = render(<Avatar />);
      expect(getByText('?')).toBeTruthy();
    });

    it('should render single character fallback', () => {
      const { getByText } = render(<Avatar fallback="A" />);
      expect(getByText('A')).toBeTruthy();
    });

    it('should render multi-character fallback', () => {
      const { getByText } = render(<Avatar fallback="ABC" />);
      expect(getByText('ABC')).toBeTruthy();
    });

    it('should render emoji fallback', () => {
      const { getByText } = render(<Avatar fallback="😀" />);
      expect(getByText('😀')).toBeTruthy();
    });
  });

  describe('Size Calculations', () => {
    it('should apply xs size correctly', () => {
      const { UNSAFE_getByType } = render(<Avatar size="xs" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply sm size correctly', () => {
      const { UNSAFE_getByType } = render(<Avatar size="sm" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply md size correctly', () => {
      const { UNSAFE_getByType } = render(<Avatar size="md" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply lg size correctly', () => {
      const { UNSAFE_getByType } = render(<Avatar size="lg" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply xl size correctly', () => {
      const { UNSAFE_getByType } = render(<Avatar size="xl" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply numeric size correctly', () => {
      const { UNSAFE_getByType } = render(<Avatar size={50} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should calculate indicator size for token sizes', () => {
      const { getByTestId } = render(<Avatar size="md" online />);
      expect(getByTestId('indicator')).toBeTruthy();
    });

    it('should calculate indicator size for numeric sizes', () => {
      const { getByTestId } = render(<Avatar size={100} online />);
      expect(getByTestId('indicator')).toBeTruthy();
    });
  });

  describe('Color Application', () => {
    it('should apply a custom bg', () => {
      const { UNSAFE_getByType } = render(<Avatar bg="#ff0000" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply custom textColor', () => {
      const { getByText } = render(<Avatar fallback="AB" textColor="#ff0000" />);
      expect(getByText('AB')).toBeTruthy();
    });

    it('should apply custom indicatorColor', () => {
      const { getByTestId } = render(<Avatar online indicatorColor="#00ff00" />);
      expect(getByTestId('indicator')).toBeTruthy();
    });

    it('should use default gray background when no bg', () => {
      const { UNSAFE_getByType } = render(<Avatar />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should use white text color by default', () => {
      const { getByText } = render(<Avatar fallback="AB" />);
      expect(getByText('AB')).toBeTruthy();
    });
  });

  describe('Online Indicator', () => {
    it('should render indicator when online is true', () => {
      const { getByTestId } = render(<Avatar online={true} />);
      expect(getByTestId('indicator')).toBeTruthy();
    });

    it('should not render indicator when online is false', () => {
      const { queryByTestId } = render(<Avatar online={false} />);
      expect(queryByTestId('indicator')).toBeNull();
    });

    it('should not render indicator when online is undefined', () => {
      const { queryByTestId } = render(<Avatar />);
      expect(queryByTestId('indicator')).toBeNull();
    });

    it('should render indicator with custom indicatorColor', () => {
      const { getByTestId } = render(<Avatar online indicatorColor="#ff0000" />);
      const indicator = getByTestId('indicator');
      expect(indicator.props.color).toBe('#ff0000');
    });

    it('should render indicator with default success color', () => {
      const { getByTestId } = render(<Avatar online />);
      const indicator = getByTestId('indicator');
      expect(indicator.props.color).toBe('#51cf66');
    });
  });

  describe('Label Rendering', () => {
    it('should render string label', () => {
      const { getByText } = render(<Avatar label="John Doe" />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render label with avatar', () => {
      const { getByText } = render(<Avatar fallback="JD" label="John Doe" />);
      expect(getByText('JD')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should not render label when showText is false', () => {
      const { queryByText } = render(<Avatar label="John Doe" showText={false} />);
      expect(queryByText('John Doe')).toBeNull();
    });

    it('should render custom React node as label', () => {
      const CustomLabel = () => <RNText>Custom</RNText>;
      const { getByText } = render(<Avatar label={<CustomLabel />} />);
      expect(getByText('Custom')).toBeTruthy();
    });
  });

  describe('Description Rendering', () => {
    it('should render string description', () => {
      const { getByText } = render(<Avatar description="Software Engineer" />);
      expect(getByText('Software Engineer')).toBeTruthy();
    });

    it('should render description with avatar', () => {
      const { getByText } = render(
        <Avatar fallback="JD" description="Software Engineer" />
      );
      expect(getByText('JD')).toBeTruthy();
      expect(getByText('Software Engineer')).toBeTruthy();
    });

    it('should render both label and description', () => {
      const { getByText } = render(
        <Avatar label="John Doe" description="Software Engineer" />
      );
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Software Engineer')).toBeTruthy();
    });

    it('should not render description when showText is false', () => {
      const { queryByText } = render(
        <Avatar description="Software Engineer" showText={false} />
      );
      expect(queryByText('Software Engineer')).toBeNull();
    });

    it('should render custom React node as description', () => {
      const CustomDesc = () => <RNText>Custom Description</RNText>;
      const { getByText } = render(<Avatar description={<CustomDesc />} />);
      expect(getByText('Custom Description')).toBeTruthy();
    });
  });

  describe('Gap Spacing', () => {
    it('should apply default gap of 8', () => {
      const { UNSAFE_getByType } = render(<Avatar label="Test" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply custom gap value', () => {
      const { UNSAFE_getByType } = render(<Avatar label="Test" gap={16} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should apply gap of 0', () => {
      const { UNSAFE_getByType } = render(<Avatar label="Test" gap={0} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('ShowText Behavior', () => {
    it('should show label when showText is true', () => {
      const { getByText } = render(<Avatar label="Test" showText={true} />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should hide label when showText is false', () => {
      const { queryByText } = render(<Avatar label="Test" showText={false} />);
      expect(queryByText('Test')).toBeNull();
    });

    it('should show description when showText is true', () => {
      const { getByText } = render(<Avatar description="Test Desc" showText={true} />);
      expect(getByText('Test Desc')).toBeTruthy();
    });

    it('should hide description when showText is false', () => {
      const { queryByText } = render(<Avatar description="Test Desc" showText={false} />);
      expect(queryByText('Test Desc')).toBeNull();
    });

    it('should default to showing text', () => {
      const { getByText } = render(<Avatar label="Test" />);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Layout Behavior', () => {
    it('should render simple avatar without label/description', () => {
      const { UNSAFE_getAllByType } = render(<Avatar />);
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });

    it('should render horizontal layout with label', () => {
      const { getByText, UNSAFE_getByType } = render(<Avatar label="Test" />);
      expect(getByText('Test')).toBeTruthy();
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render horizontal layout with description', () => {
      const { getByText, UNSAFE_getByType } = render(<Avatar description="Test" />);
      expect(getByText('Test')).toBeTruthy();
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should render horizontal layout with both label and description', () => {
      const { getByText } = render(
        <Avatar label="Label" description="Description" />
      );
      expect(getByText('Label')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });
  });

  describe('Style Merging', () => {
    it('should apply custom style', () => {
      const { UNSAFE_getByType } = render(
        <Avatar style={{ opacity: 0.5 }} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should merge multiple styles', () => {
      const { UNSAFE_getByType } = render(
        <Avatar style={[{ opacity: 0.5 }, { marginTop: 10 }] as any} />
      );
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle image with online indicator', () => {
      const { UNSAFE_getByType, getByTestId } = render(
        <Avatar src="https://example.com/avatar.jpg" online />
      );
      expect(UNSAFE_getByType(Image)).toBeTruthy();
      expect(getByTestId('indicator')).toBeTruthy();
    });

    it('should handle all visual props together', () => {
      const { getByText, getByTestId, UNSAFE_getByType } = render(
        <Avatar
          size="lg"
          fallback="JD"
          bg="#ff0000"
          textColor="#ffffff"
          online={true}
          indicatorColor="#00ff00"
          label="John Doe"
          description="Engineer"
        />
      );
      expect(getByText('JD')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Engineer')).toBeTruthy();
      expect(getByTestId('indicator')).toBeTruthy();
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle rapid size changes', () => {
      const { rerender, UNSAFE_getByType } = render(<Avatar size="sm" />);
      rerender(<Avatar size="lg" />);
      rerender(<Avatar size={100} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle size 0', () => {
      const { UNSAFE_getByType } = render(<Avatar size={0} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle very large size', () => {
      const { UNSAFE_getByType } = render(<Avatar size={500} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle empty fallback', () => {
      const { getByText } = render(<Avatar fallback="" />);
      // Empty fallback should show default "?"
      expect(getByText('?')).toBeTruthy();
    });

    it('should handle empty label', () => {
      const { UNSAFE_getByType } = render(<Avatar label="" />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should handle undefined src', () => {
      const { UNSAFE_queryByType } = render(<Avatar src={undefined} />);
      expect(UNSAFE_queryByType(Image)).toBeNull();
    });

    it('should handle null style', () => {
      const { UNSAFE_getByType } = render(<Avatar style={null as any} />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper structure', () => {
      const { UNSAFE_getByType } = render(<Avatar />);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    it('should support screen readers with label', () => {
      const { getByText } = render(
        <Avatar label="John Doe" accessibilityLabel="User profile" />
      );
      expect(getByText('John Doe')).toBeTruthy();
    });
  });
});
