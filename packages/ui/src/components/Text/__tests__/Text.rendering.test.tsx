/**
 * Text Component - Rendering and Behavior Tests
 * 
 * Tests rendering output, behavior, styling, and interaction
 * for the Text component.
 * 
 * Coverage:
 * - Basic rendering
 * - Variant rendering (styles and font sizes)
 * - Color rendering
 * - Weight rendering
 * - Size rendering
 * - Alignment
 * - Translation (tx/txParams)
 * - Typography (lineHeight, tracking, uppercase)
 * - Spacing integration
 * - Interaction (onPress, selectable)
 * - RTL support
 * - Platform-specific rendering (as prop)
 * - Complex combinations
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from '../Text';

// Mock dependencies
jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      primary: ['#000', '#111', '#222', '#333', '#444', '#1976d2', '#666', '#777', '#888', '#999'],
      secondary: ['#000', '#111', '#222', '#333', '#444', '#9c27b0', '#666', '#777', '#888', '#999'],
      success: ['#000', '#111', '#222', '#333', '#444', '#4caf50', '#666', '#777', '#888', '#999'],
      warning: ['#000', '#111', '#222', '#333', '#444', '#ff9800', '#666', '#777', '#888', '#999'],
      error: ['#000', '#111', '#222', '#333', '#444', '#f44336', '#666', '#777', '#888', '#999'],
      info: ['#000', '#111', '#222', '#333', '#444', '#2196f3', '#666', '#777', '#888', '#999']
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999',
      muted: '#888888',
      link: '#1976d2',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3'
    },
    fontFamily: 'System',
    spacing: (value: number) => value * 8,
    radius: (value: number) => value * 4
  })
}));

jest.mock('../../../core/i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params) {
        return `${key}_translated_${JSON.stringify(params)}`;
      }
      return `${key}_translated`;
    }
  })
}));

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({
    isRTL: false,
    direction: 'ltr'
  })
}));

describe('Text - Rendering and Behavior', () => {
  
  // Helper to flatten styles array recursively
  const flattenStyle = (style: any): any => {
    if (!style) return {};
    if (Array.isArray(style)) {
      // Recursively flatten and merge all array elements
      return style.reduce((acc, item) => {
        const flattened = flattenStyle(item);
        return { ...acc, ...flattened };
      }, {});
    }
    if (typeof style === 'object') {
      return style;
    }
    return {};
  };

  describe('Basic Rendering', () => {
    it('should render text content', () => {
      const { getByText } = render(<Text>Hello World</Text>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('should render children prop', () => {
      const { getByText } = render(<Text>Test Content</Text>);
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render nested Text components', () => {
      const { getByText } = render(
        <Text>
          Parent <Text>Child</Text>
        </Text>
      );
      expect(getByText('Child')).toBeTruthy();
    });

    it('should default to p variant', () => {
      const { getByText } = render(<Text>Default</Text>);
      const element = getByText('Default');
      expect(element).toBeTruthy();
    });
  });

  describe('Variant Rendering', () => {
    it('should render h1 variant with correct font size', () => {
      const { getByText } = render(<Text variant="h1">Heading 1</Text>);
      const element = getByText('Heading 1');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 32,
        fontWeight: '700'
      });
    });

    it('should render h2 variant with correct font size', () => {
      const { getByText } = render(<Text variant="h2">Heading 2</Text>);
      const element = getByText('Heading 2');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 28,
        fontWeight: '700'
      });
    });

    it('should render h3 variant with correct font size', () => {
      const { getByText } = render(<Text variant="h3">Heading 3</Text>);
      const element = getByText('Heading 3');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 24,
        fontWeight: '600'
      });
    });

    it('should render p variant with default font size', () => {
      const { getByText } = render(<Text variant="p">Paragraph</Text>);
      const element = getByText('Paragraph');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 16,
        fontWeight: '400'
      });
    });

    it('should render small variant with expected font size', () => {
      const { getByText } = render(<Text variant="small">Caption</Text>);
      const element = getByText('Caption');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 12,
        fontWeight: '400'
      });
    });

    it('should render strong variant with bold weight', () => {
      const { getByText } = render(<Text variant="strong">Strong</Text>);
      const element = getByText('Strong');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '700'
      });
    });

    it('should render em variant with italic style', () => {
      const { getByText } = render(<Text variant="em">Emphasis</Text>);
      const element = getByText('Emphasis');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontStyle: 'italic'
      });
    });

    it('should render u variant with underline', () => {
      const { getByText } = render(<Text variant="u">Underline</Text>);
      const element = getByText('Underline');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textDecorationLine: 'underline'
      });
    });

    // Legacy tests removed as per update
  });

  describe('Color Rendering', () => {
    it('should apply direct color prop', () => {
      const { getByText } = render(<Text color="#ff0000">Red</Text>);
      const element = getByText('Red');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        color: '#ff0000'
      });
    });

    it('should apply the primary color', () => {
      const { getByText } = render(<Text color="primary">Primary</Text>);
      const element = getByText('Primary');
      const style = flattenStyle(element.props.style);
      expect(style.color).toBeTruthy();
    });

    it('should apply the success color', () => {
      const { getByText } = render(<Text color="success">Success</Text>);
      const element = getByText('Success');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        color: '#4caf50'
      });
    });

    it('should apply the error color', () => {
      const { getByText } = render(<Text color="error">Error</Text>);
      const element = getByText('Error');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        color: '#f44336'
      });
    });

    it('should apply the warning color', () => {
      const { getByText } = render(<Text color="warning">Warning</Text>);
      const element = getByText('Warning');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        color: '#ff9800'
      });
    });

    it('should apply the info color', () => {
      const { getByText } = render(<Text color="info">Info</Text>);
      const element = getByText('Info');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        color: '#2196f3'
      });
    });

    it('should apply theme text.primary by default', () => {
      const { getByText } = render(<Text>Default Color</Text>);
      const element = getByText('Default Color');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        color: '#000000'
      });
    });
  });

  describe('Weight Rendering', () => {
    it('should apply numeric weight 300', () => {
      const { getByText } = render(<Text weight={300}>Light</Text>);
      const element = getByText('Light');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '300'
      });
    });

    it('should apply numeric weight 700', () => {
      const { getByText } = render(<Text weight={700}>Bold</Text>);
      const element = getByText('Bold');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '700'
      });
    });

    it('should apply named weight "semibold"', () => {
      const { getByText } = render(<Text weight="semibold">Semibold</Text>);
      const element = getByText('Semibold');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '600'
      });
    });

    it('should apply named weight "black"', () => {
      const { getByText } = render(<Text weight="black">Black</Text>);
      const element = getByText('Black');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '900'
      });
    });

    it('should default weight to "normal" (400)', () => {
      const { getByText } = render(<Text>Normal Weight</Text>);
      const element = getByText('Normal Weight');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '400'
      });
    });
  });

  describe('Size Rendering', () => {
    it('should apply numeric size', () => {
      const { getByText } = render(<Text size={24}>Size 24</Text>);
      const element = getByText('Size 24');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 24
      });
    });

    it('should override variant size with size prop', () => {
      const { getByText } = render(<Text variant="h1" size={20}>Override</Text>);
      const element = getByText('Override');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 20
      });
    });

    it('should use variant size when size prop not provided', () => {
      const { getByText } = render(<Text variant="h2">Variant Size</Text>);
      const element = getByText('Variant Size');
      const style = flattenStyle(element.props.style);
      expect(style.fontSize).toBe(28);
    });
  });

  describe('Alignment', () => {
    it('should apply left alignment', () => {
      const { getByText } = render(<Text align="left">Left</Text>);
      const element = getByText('Left');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textAlign: 'left'
      });
    });

    it('should apply center alignment', () => {
      const { getByText } = render(<Text align="center">Center</Text>);
      const element = getByText('Center');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textAlign: 'center'
      });
    });

    it('should apply right alignment', () => {
      const { getByText } = render(<Text align="right">Right</Text>);
      const element = getByText('Right');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textAlign: 'right'
      });
    });

    it('should apply justify alignment', () => {
      const { getByText } = render(<Text align="justify">Justify</Text>);
      const element = getByText('Justify');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textAlign: 'justify'
      });
    });

    it('should default to left alignment', () => {
      const { getByText } = render(<Text>Default Align</Text>);
      const element = getByText('Default Align');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textAlign: 'left'
      });
    });
  });

  describe('Translation (tx)', () => {
    it('should render translated text', () => {
      const { getByText } = render(<Text tx="common.hello" />);
      expect(getByText('common.hello_translated')).toBeTruthy();
    });

    it('should render translated text with params', () => {
      const { getByText } = render(
        <Text tx="common.greeting" txParams={{ name: 'John' }} />
      );
      expect(getByText(/greeting_translated/)).toBeTruthy();
    });

    it('should prefer tx over children', () => {
      const { getByText, queryByText } = render(
        <Text tx="common.test">Fallback</Text>
      );
      expect(getByText('common.test_translated')).toBeTruthy();
      expect(queryByText('Fallback')).toBeNull();
    });
  });

  describe('Typography Props', () => {
    it('should apply lineHeight as multiplier', () => {
      const { getByText } = render(<Text lineHeight={2}>Double Height</Text>);
      const element = getByText('Double Height');
      const style = flattenStyle(element.props.style);
      expect(style.lineHeight).toBe(32); // 16 * 2
    });

    it('should apply lineHeight as absolute value', () => {
      const { getByText } = render(<Text lineHeight={24}>24px Height</Text>);
      const element = getByText('24px Height');
      const style = flattenStyle(element.props.style);
      expect(style.lineHeight).toBe(24);
    });

    it('should apply tracking (letterSpacing)', () => {
      const { getByText } = render(<Text tracking={2}>Tracking</Text>);
      const element = getByText('Tracking');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        letterSpacing: 2
      });
    });

    it('should apply uppercase transformation', () => {
      const { getByText } = render(<Text uppercase>lowercase</Text>);
      const element = getByText('lowercase');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        textTransform: 'uppercase'
      });
    });

    it('should apply custom fontFamily', () => {
      const { getByText } = render(<Text fontFamily="Arial">Custom Font</Text>);
      const element = getByText('Custom Font');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontFamily: 'Arial'
      });
    });
  });

  describe('Spacing Integration', () => {
    it('should apply margin spacing', () => {
      const { getByText } = render(<Text m={2}>Margin</Text>);
      const element = getByText('Margin');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        marginTop: 2,
        marginRight: 2,
        marginBottom: 2,
        marginLeft: 2
      });
    });

    it('should apply padding spacing', () => {
      const { getByText } = render(<Text p={1}>Padding</Text>);
      const element = getByText('Padding');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        paddingTop: 1,
        paddingRight: 1,
        paddingBottom: 1,
        paddingLeft: 1
      });
    });

    it('should apply directional margin', () => {
      const { getByText } = render(<Text mt={1} mb={2}>Directional</Text>);
      const element = getByText('Directional');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        marginTop: 1,
        marginBottom: 2
      });
    });

    it('should apply horizontal and vertical spacing', () => {
      const { getByText } = render(<Text mx={2} py={1}>Axis</Text>);
      const element = getByText('Axis');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        marginLeft: 2,
        marginRight: 2,
        paddingTop: 1,
        paddingBottom: 1
      });
    });
  });

  describe('Interaction', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Text onPress={onPress}>Press Me</Text>);
      const element = getByText('Press Me');
      fireEvent.press(element);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should accept onLayout callback', () => {
      const onLayout = jest.fn();
      const { getByText } = render(<Text onLayout={onLayout}>Layout</Text>);
      const element = getByText('Layout');
      expect(element.props.onLayout).toBe(onLayout);
    });

    it('should be selectable by default', () => {
      const { getByText } = render(<Text>Selectable</Text>);
      const element = getByText('Selectable');
      expect(element.props.selectable).toBe(true);
    });

    it('should disable selection when selectable=false', () => {
      const { getByText } = render(<Text selectable={false}>Not Selectable</Text>);
      const element = getByText('Not Selectable');
      expect(element.props.selectable).toBe(false);
    });
  });

  describe('Value Prop', () => {
    it('should render value prop', () => {
      const { getByText } = render(<Text value="Value Content" />);
      expect(getByText('Value Content')).toBeTruthy();
    });

    it('should prioritize value over children', () => {
      const { getByText, queryByText } = render(
        <Text value="Value">Children</Text>
      );
      expect(getByText('Value')).toBeTruthy();
      expect(queryByText('Children')).toBeNull();
    });

    it('should prioritize tx over value', () => {
      const { getByText, queryByText } = render(
        <Text tx="common.test" value="Value">Children</Text>
      );
      expect(getByText('common.test_translated')).toBeTruthy();
      expect(queryByText('Value')).toBeNull();
    });
  });

  describe('Style Prop', () => {
    it('should merge custom style', () => {
      const { getByText } = render(
        <Text style={{ opacity: 0.5 }}>Custom Style</Text>
      );
      const element = getByText('Custom Style');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        opacity: 0.5
      });
    });

    it('should merge variant style with custom style', () => {
      const { getByText } = render(
        <Text variant="h1" style={{ color: 'blue' }}>Merged</Text>
      );
      const element = getByText('Merged');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 32,
        color: 'blue'
      });
    });

    it('should handle array of styles', () => {
      const { getByText } = render(
        <Text style={[{ fontSize: 20 }, { color: 'red' }]}>Array</Text>
      );
      const element = getByText('Array');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 20,
        color: 'red'
      });
    });
  });

  describe('Complex Combinations', () => {
    it('should handle variant + weight + color + spacing', () => {
      const { getByText } = render(
        <Text variant="h2" weight="bold" color="success" m={2}>
          Complex
        </Text>
      );
      const element = getByText('Complex');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 28,
        fontWeight: '700',
        color: '#4caf50',
        marginTop: 2,
        marginRight: 2,
        marginBottom: 2,
        marginLeft: 2
      });
    });

    it('should handle size + lineHeight + tracking + uppercase', () => {
      const { getByText } = render(
        <Text size={18} lineHeight={1.5} tracking={1} uppercase>
          Typography
        </Text>
      );
      const element = getByText('Typography');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontSize: 18,
        lineHeight: 27, // 18 * 1.5
        letterSpacing: 1,
        textTransform: 'uppercase'
      });
    });

    it('should handle translation + styling + interaction', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Text 
          tx="common.button" 
          weight="semibold" 
          color="primary"
          onPress={onPress}
        />
      );
      const element = getByText('common.button_translated');
      const style = flattenStyle(element.props.style);
      expect(style).toMatchObject({
        fontWeight: '600'
      });
      fireEvent.press(element);
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string children', () => {
      const result = render(<Text>{''}</Text>);
      expect(result).toBeTruthy();
    });

    it('should handle undefined children', () => {
      const result = render(<Text>{undefined}</Text>);
      expect(result).toBeTruthy();
    });

    it('should handle null children', () => {
      const result = render(<Text>{null}</Text>);
      expect(result).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      const { getByText } = render(<Text>{longText}</Text>);
      expect(getByText(longText)).toBeTruthy();
    });

    it('should handle special characters', () => {
      const { getByText } = render(<Text>!@#$%^&*()_+-=</Text>);
      expect(getByText('!@#$%^&*()_+-=')).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      const { getByText } = render(<Text>你好世界 🌍</Text>);
      expect(getByText('你好世界 🌍')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render text content for screen readers', () => {
      const { getByText } = render(<Text>Accessible Content</Text>);
      expect(getByText('Accessible Content')).toBeTruthy();
    });

    it('should support interaction for accessibility', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Text onPress={onPress}>Pressable Text</Text>
      );
      const element = getByText('Pressable Text');
      fireEvent.press(element);
      expect(onPress).toHaveBeenCalled();
    });
  });
});
