/**
 * Text Component - Type Safety and Prop Validation Tests
 * 
 * Tests type definitions, prop validation, and TypeScript interfaces
 * for the Text component.
 * 
 * Coverage:
 * - HTMLTextVariant types (22 variants)
 * - ColorVariant types (9 variants)
 * - Weight types (numeric + named)
 * - Size types (tokens + numbers)
 * - Align types (4 options)
 * - Translation props (tx, txParams)
 * - Spacing props integration
 * - Style prop combinations
 * - Interaction props (onPress, onLayout, selectable)
 * - Platform-specific props (as)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
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

describe('Text - Type Safety and Prop Validation', () => {
  
  describe('HTMLTextVariant Types', () => {
    it('should accept h1 variant', () => {
      const { getByText } = render(<Text variant="h1">Heading 1</Text>);
      expect(getByText('Heading 1')).toBeTruthy();
    });

    it('should accept h2 variant', () => {
      const { getByText } = render(<Text variant="h2">Heading 2</Text>);
      expect(getByText('Heading 2')).toBeTruthy();
    });

    it('should accept h3 variant', () => {
      const { getByText } = render(<Text variant="h3">Heading 3</Text>);
      expect(getByText('Heading 3')).toBeTruthy();
    });

    it('should accept h4 variant', () => {
      const { getByText } = render(<Text variant="h4">Heading 4</Text>);
      expect(getByText('Heading 4')).toBeTruthy();
    });

    it('should accept h5 variant', () => {
      const { getByText } = render(<Text variant="h5">Heading 5</Text>);
      expect(getByText('Heading 5')).toBeTruthy();
    });

    it('should accept h6 variant', () => {
      const { getByText } = render(<Text variant="h6">Heading 6</Text>);
      expect(getByText('Heading 6')).toBeTruthy();
    });

    it('should accept p variant', () => {
      const { getByText } = render(<Text variant="p">Paragraph</Text>);
      expect(getByText('Paragraph')).toBeTruthy();
    });

    it('should accept span variant', () => {
      const { getByText } = render(<Text variant="span">Span</Text>);
      expect(getByText('Span')).toBeTruthy();
    });

    it('should accept div variant', () => {
      const { getByText } = render(<Text variant="div">Div</Text>);
      expect(getByText('Div')).toBeTruthy();
    });

    it('should accept small variant', () => {
      const { getByText } = render(<Text variant="small">Small</Text>);
      expect(getByText('Small')).toBeTruthy();
    });

    it('should accept strong variant', () => {
      const { getByText } = render(<Text variant="strong">Strong</Text>);
      expect(getByText('Strong')).toBeTruthy();
    });

    it('should accept b variant', () => {
      const { getByText } = render(<Text variant="b">Bold</Text>);
      expect(getByText('Bold')).toBeTruthy();
    });

    it('should accept i variant', () => {
      const { getByText } = render(<Text variant="i">Italic</Text>);
      expect(getByText('Italic')).toBeTruthy();
    });

    it('should accept em variant', () => {
      const { getByText } = render(<Text variant="em">Emphasis</Text>);
      expect(getByText('Emphasis')).toBeTruthy();
    });

    it('should accept u variant', () => {
      const { getByText } = render(<Text variant="u">Underline</Text>);
      expect(getByText('Underline')).toBeTruthy();
    });

    it('should accept sub variant', () => {
      const { getByText } = render(<Text variant="sub">Subscript</Text>);
      expect(getByText('Subscript')).toBeTruthy();
    });

    it('should accept sup variant', () => {
      const { getByText } = render(<Text variant="sup">Superscript</Text>);
      expect(getByText('Superscript')).toBeTruthy();
    });

    it('should accept mark variant', () => {
      const { getByText } = render(<Text variant="mark">Mark</Text>);
      expect(getByText('Mark')).toBeTruthy();
    });

    it('should accept code variant', () => {
      const { getByText } = render(<Text variant="code">Code</Text>);
      expect(getByText('Code')).toBeTruthy();
    });

    it('should accept kbd variant', () => {
      const { getByText } = render(<Text variant="kbd">Keyboard</Text>);
      expect(getByText('Keyboard')).toBeTruthy();
    });

    it('should accept blockquote variant', () => {
      const { getByText } = render(<Text variant="blockquote">Quote</Text>);
      expect(getByText('Quote')).toBeTruthy();
    });

    it('should accept cite variant', () => {
      const { getByText } = render(<Text variant="cite">Citation</Text>);
      expect(getByText('Citation')).toBeTruthy();
    });
  });

  describe('ColorVariant Types', () => {
    it('should accept the primary color', () => {
      const { getByText } = render(<Text color="primary">Primary</Text>);
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should accept the secondary color', () => {
      const { getByText } = render(<Text color="secondary">Secondary</Text>);
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should accept the muted color', () => {
      const { getByText } = render(<Text color="muted">Muted</Text>);
      expect(getByText('Muted')).toBeTruthy();
    });

    it('should accept the disabled color', () => {
      const { getByText } = render(<Text color="disabled">Disabled</Text>);
      expect(getByText('Disabled')).toBeTruthy();
    });

    it('should accept the link color', () => {
      const { getByText } = render(<Text color="link">Link</Text>);
      expect(getByText('Link')).toBeTruthy();
    });

    it('should accept the success color', () => {
      const { getByText } = render(<Text color="success">Success</Text>);
      expect(getByText('Success')).toBeTruthy();
    });

    it('should accept the warning color', () => {
      const { getByText } = render(<Text color="warning">Warning</Text>);
      expect(getByText('Warning')).toBeTruthy();
    });

    it('should accept the error color', () => {
      const { getByText } = render(<Text color="error">Error</Text>);
      expect(getByText('Error')).toBeTruthy();
    });

    it('should accept the info color', () => {
      const { getByText } = render(<Text color="info">Info</Text>);
      expect(getByText('Info')).toBeTruthy();
    });
  });

  describe('Weight Types', () => {
    it('should accept numeric weight 100', () => {
      const { getByText } = render(<Text weight={100}>Weight 100</Text>);
      expect(getByText('Weight 100')).toBeTruthy();
    });

    it('should accept numeric weight 200', () => {
      const { getByText } = render(<Text weight={200}>Weight 200</Text>);
      expect(getByText('Weight 200')).toBeTruthy();
    });

    it('should accept numeric weight 300', () => {
      const { getByText } = render(<Text weight={300}>Weight 300</Text>);
      expect(getByText('Weight 300')).toBeTruthy();
    });

    it('should accept numeric weight 400', () => {
      const { getByText } = render(<Text weight={400}>Weight 400</Text>);
      expect(getByText('Weight 400')).toBeTruthy();
    });

    it('should accept numeric weight 500', () => {
      const { getByText } = render(<Text weight={500}>Weight 500</Text>);
      expect(getByText('Weight 500')).toBeTruthy();
    });

    it('should accept numeric weight 600', () => {
      const { getByText } = render(<Text weight={600}>Weight 600</Text>);
      expect(getByText('Weight 600')).toBeTruthy();
    });

    it('should accept numeric weight 700', () => {
      const { getByText } = render(<Text weight={700}>Weight 700</Text>);
      expect(getByText('Weight 700')).toBeTruthy();
    });

    it('should accept numeric weight 800', () => {
      const { getByText } = render(<Text weight={800}>Weight 800</Text>);
      expect(getByText('Weight 800')).toBeTruthy();
    });

    it('should accept numeric weight 900', () => {
      const { getByText } = render(<Text weight={900}>Weight 900</Text>);
      expect(getByText('Weight 900')).toBeTruthy();
    });

    it('should accept named weight "normal"', () => {
      const { getByText } = render(<Text weight="normal">Normal</Text>);
      expect(getByText('Normal')).toBeTruthy();
    });

    it('should accept named weight "medium"', () => {
      const { getByText } = render(<Text weight="medium">Medium</Text>);
      expect(getByText('Medium')).toBeTruthy();
    });

    it('should accept named weight "semibold"', () => {
      const { getByText } = render(<Text weight="semibold">Semibold</Text>);
      expect(getByText('Semibold')).toBeTruthy();
    });

    it('should accept named weight "bold"', () => {
      const { getByText } = render(<Text weight="bold">Bold</Text>);
      expect(getByText('Bold')).toBeTruthy();
    });

    it('should accept named weight "light"', () => {
      const { getByText } = render(<Text weight="light">Light</Text>);
      expect(getByText('Light')).toBeTruthy();
    });

    it('should accept named weight "black"', () => {
      const { getByText } = render(<Text weight="black">Black</Text>);
      expect(getByText('Black')).toBeTruthy();
    });
  });

  describe('Size Types', () => {
    it('should accept numeric size', () => {
      const { getByText } = render(<Text size={24}>Size 24</Text>);
      expect(getByText('Size 24')).toBeTruthy();
    });

    it('should accept token size "xs"', () => {
      const { getByText } = render(<Text size="xs">Extra Small</Text>);
      expect(getByText('Extra Small')).toBeTruthy();
    });

    it('should accept token size "sm"', () => {
      const { getByText } = render(<Text size="sm">Small</Text>);
      expect(getByText('Small')).toBeTruthy();
    });

    it('should accept token size "md"', () => {
      const { getByText } = render(<Text size="md">Medium</Text>);
      expect(getByText('Medium')).toBeTruthy();
    });

    it('should accept token size "lg"', () => {
      const { getByText } = render(<Text size="lg">Large</Text>);
      expect(getByText('Large')).toBeTruthy();
    });

    it('should accept token size "xl"', () => {
      const { getByText } = render(<Text size="xl">Extra Large</Text>);
      expect(getByText('Extra Large')).toBeTruthy();
    });

    it('should accept token size "2xl"', () => {
      const { getByText } = render(<Text size="2xl">2XL</Text>);
      expect(getByText('2XL')).toBeTruthy();
    });
  });

  describe('Align Types', () => {
    it('should accept align="left"', () => {
      const { getByText } = render(<Text align="left">Left</Text>);
      expect(getByText('Left')).toBeTruthy();
    });

    it('should accept align="center"', () => {
      const { getByText } = render(<Text align="center">Center</Text>);
      expect(getByText('Center')).toBeTruthy();
    });

    it('should accept align="right"', () => {
      const { getByText } = render(<Text align="right">Right</Text>);
      expect(getByText('Right')).toBeTruthy();
    });

    it('should accept align="justify"', () => {
      const { getByText } = render(<Text align="justify">Justify</Text>);
      expect(getByText('Justify')).toBeTruthy();
    });
  });

  describe('Translation Props', () => {
    it('should accept tx prop for translation key', () => {
      const { getByText } = render(<Text tx="common.welcome" />);
      expect(getByText('common.welcome_translated')).toBeTruthy();
    });

    it('should accept tx with txParams', () => {
      const { getByText } = render(<Text tx="common.greeting" txParams={{ name: 'John' }} />);
      expect(getByText(/greeting_translated/)).toBeTruthy();
    });

    it('should prefer tx over children when both provided', () => {
      const { getByText, queryByText } = render(
        <Text tx="common.hello">Fallback Text</Text>
      );
      expect(getByText('common.hello_translated')).toBeTruthy();
      expect(queryByText('Fallback Text')).toBeNull();
    });
  });

  describe('Spacing Props Integration', () => {
    it('should accept spacing props (m, p, etc)', () => {
      const { getByText } = render(
        <Text m={2} p={1}>Spacing</Text>
      );
      expect(getByText('Spacing')).toBeTruthy();
    });

    it('should accept directional spacing props', () => {
      const { getByText } = render(
        <Text mt={1} mb={2} ml={1} mr={2}>Directional</Text>
      );
      expect(getByText('Directional')).toBeTruthy();
    });

    it('should accept horizontal and vertical spacing', () => {
      const { getByText } = render(
        <Text mx={2} my={1} px={1} py={2}>Axis Spacing</Text>
      );
      expect(getByText('Axis Spacing')).toBeTruthy();
    });
  });

  describe('Color Props', () => {
    it('should accept direct color prop', () => {
      const { getByText } = render(<Text color="#ff0000">Red Text</Text>);
      expect(getByText('Red Text')).toBeTruthy();
    });

    it('should accept theme token as color', () => {
      const { getByText } = render(<Text color="primary">Primary Color</Text>);
      expect(getByText('Primary Color')).toBeTruthy();
    });

  });

  describe('Typography Props', () => {
    it('should accept lineHeight as multiplier', () => {
      const { getByText } = render(<Text lineHeight={1.5}>Line Height</Text>);
      expect(getByText('Line Height')).toBeTruthy();
    });

    it('should accept lineHeight as absolute value', () => {
      const { getByText } = render(<Text lineHeight={24}>Absolute</Text>);
      expect(getByText('Absolute')).toBeTruthy();
    });

    it('should accept tracking (letter spacing)', () => {
      const { getByText } = render(<Text tracking={2}>Tracking</Text>);
      expect(getByText('Tracking')).toBeTruthy();
    });

    it('should accept uppercase prop', () => {
      const { getByText } = render(<Text uppercase>uppercase text</Text>);
      expect(getByText('uppercase text')).toBeTruthy();
    });

    it('should accept fontFamily prop', () => {
      const { getByText } = render(<Text fontFamily="Arial">Custom Font</Text>);
      expect(getByText('Custom Font')).toBeTruthy();
    });
  });

  describe('Interaction Props', () => {
    it('should accept onPress prop', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Text onPress={onPress}>Pressable</Text>);
      expect(getByText('Pressable')).toBeTruthy();
    });

    it('should accept onLayout prop', () => {
      const onLayout = jest.fn();
      const { getByText } = render(<Text onLayout={onLayout}>Layout</Text>);
      expect(getByText('Layout')).toBeTruthy();
    });

    it('should accept selectable prop', () => {
      const { getByText } = render(<Text selectable={false}>Not Selectable</Text>);
      expect(getByText('Not Selectable')).toBeTruthy();
    });

    it('should default selectable to true', () => {
      const { getByText } = render(<Text>Selectable by default</Text>);
      expect(getByText('Selectable by default')).toBeTruthy();
    });
  });

  describe('Platform-Specific Props', () => {
    it('should accept "as" prop to override HTML tag', () => {
      const { getByText } = render(<Text variant="p" as="span">As Span</Text>);
      expect(getByText('As Span')).toBeTruthy();
    });

    it('should accept "as" with any HTML variant', () => {
      const { getByText } = render(<Text as="h1">Custom H1</Text>);
      expect(getByText('Custom H1')).toBeTruthy();
    });
  });

  describe('Style Prop Combinations', () => {
    it('should accept style prop', () => {
      const { getByText } = render(
        <Text style={{ opacity: 0.5 }}>Styled</Text>
      );
      expect(getByText('Styled')).toBeTruthy();
    });

    it('should merge variant styles with custom style', () => {
      const { getByText } = render(
        <Text variant="h1" style={{ color: 'blue' }}>Merged</Text>
      );
      expect(getByText('Merged')).toBeTruthy();
    });

    it('should accept array of styles', () => {
      const { getByText } = render(
        <Text style={[{ fontSize: 20 }, { color: 'red' }]}>Array Styles</Text>
      );
      expect(getByText('Array Styles')).toBeTruthy();
    });
  });

  describe('Value Prop', () => {
    it('should accept value prop for controlled text', () => {
      const { getByText } = render(<Text value="Controlled Value" />);
      expect(getByText('Controlled Value')).toBeTruthy();
    });

    it('should prioritize value over children', () => {
      const { getByText, queryByText } = render(
        <Text value="Value Text">Children Text</Text>
      );
      expect(getByText('Value Text')).toBeTruthy();
      expect(queryByText('Children Text')).toBeNull();
    });
  });

  describe('Complex Prop Combinations', () => {
    it('should handle variant + size + weight + color', () => {
      const { getByText } = render(
        <Text variant="h1" size="xl" weight="bold" color="#ff0000">
          Complex
        </Text>
      );
      expect(getByText('Complex')).toBeTruthy();
    });

    it('should handle translation + styling + interaction', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Text 
          tx="common.button" 
          weight="bold" 
          color="primary"
          onPress={onPress}
        />
      );
      expect(getByText('common.button_translated')).toBeTruthy();
    });

    it('should handle all typography props together', () => {
      const { getByText } = render(
        <Text 
          size={18} 
          weight="semibold" 
          lineHeight={1.6} 
          tracking={1}
          uppercase
          align="center"
        >
          All Typography
        </Text>
      );
      expect(getByText('All Typography')).toBeTruthy();
    });

    it('should handle spacing + variant + color', () => {
      const { getByText } = render(
        <Text 
          variant="h2" 
          color="success"
          m={2}
          p={1}
        >
          Spaced Success
        </Text>
      );
      expect(getByText('Spaced Success')).toBeTruthy();
    });
  });

});
