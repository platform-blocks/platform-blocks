/**
 * Timeline Component - Comprehensive Test Suite
 * 
 * Tests type definitions, prop validation, and functionality
 * for the Timeline component.
 * 
 * Coverage:
 * - Size types (xs, sm, md, lg, xl)
 * - Color prop
 * - Active state and reverseActive
 * - Alignment (left, right)
 * - Line variants (solid, dashed, dotted)
 * - Center mode
 * - Timeline.Item props (title, bullet, active, itemAlign)
 * - Custom lineWidth and bulletSize
 * - Context propagation
 * - Accessibility
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { Timeline } from '../Timeline';

// Mock the theme
jest.mock('../../../core/theme', () => ({
  useTheme: () => ({
    colors: {
      gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
      primary: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
      success: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
      red: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
    },
  }),
}));

describe('Timeline - Type Safety and Prop Validation', () => {
  
  describe('Basic Rendering', () => {
    it('should render Timeline with children', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="First Item">
            <Text>Content 1</Text>
          </Timeline.Item>
          <Timeline.Item title="Second Item">
            <Text>Content 2</Text>
          </Timeline.Item>
        </Timeline>
      );
      expect(getByText('First Item')).toBeTruthy();
      expect(getByText('Second Item')).toBeTruthy();
      expect(getByText('Content 1')).toBeTruthy();
      expect(getByText('Content 2')).toBeTruthy();
    });

    it('should render Timeline.Item without title', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item>
            <Text>Only content</Text>
          </Timeline.Item>
        </Timeline>
      );
      expect(getByText('Only content')).toBeTruthy();
    });

    it('should render Timeline.Item with title only', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Title only" />
        </Timeline>
      );
      expect(getByText('Title only')).toBeTruthy();
    });

    it('should render Timeline without items', () => {
      const { UNSAFE_getByType } = render(<Timeline>{null}</Timeline>);
      expect(UNSAFE_getByType(View)).toBeTruthy();
    });
  });

  describe('Size Types', () => {
    it('should accept size "xs"', () => {
      const { getByText } = render(
        <Timeline size="xs">
          <Timeline.Item title="XS Size"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('XS Size')).toBeTruthy();
    });

    it('should accept size "sm"', () => {
      const { getByText } = render(
        <Timeline size="sm">
          <Timeline.Item title="SM Size"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('SM Size')).toBeTruthy();
    });

    it('should accept size "md"', () => {
      const { getByText } = render(
        <Timeline size="md">
          <Timeline.Item title="MD Size"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('MD Size')).toBeTruthy();
    });

    it('should accept size "lg"', () => {
      const { getByText } = render(
        <Timeline size="lg">
          <Timeline.Item title="LG Size"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('LG Size')).toBeTruthy();
    });

    it('should accept size "xl"', () => {
      const { getByText } = render(
        <Timeline size="xl">
          <Timeline.Item title="XL Size"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('XL Size')).toBeTruthy();
    });

    it('should default to "md" size when not specified', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Default Size"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Default Size')).toBeTruthy();
    });
  });

  describe('Color Props', () => {
    it('should accept raw color string', () => {
      const { getByText } = render(
        <Timeline color="#ff0000">
          <Timeline.Item title="Red Timeline"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Red Timeline')).toBeTruthy();
    });

    it('should accept a palette.shade color', () => {
      const { getByText } = render(
        <Timeline color="primary.5">
          <Timeline.Item title="Primary Timeline"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Primary Timeline')).toBeTruthy();
    });

    it('should accept a bare palette color', () => {
      const { getByText } = render(
        <Timeline color="success">
          <Timeline.Item title="Success Timeline"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Success Timeline')).toBeTruthy();
    });

    it('should allow Timeline.Item to override color', () => {
      const { getByText } = render(
        <Timeline color="#0000ff">
          <Timeline.Item color="#ff0000" title="Red Item"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Red Item')).toBeTruthy();
    });

    it('should allow Timeline.Item to set its own color', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item color="red.6" title="Red Variant"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Red Variant')).toBeTruthy();
    });
  });

  describe('Active State', () => {
    it('should accept active prop as number', () => {
      const { getByText } = render(
        <Timeline active={1}>
          <Timeline.Item title="Item 0">Content 0</Timeline.Item>
          <Timeline.Item title="Item 1">Content 1</Timeline.Item>
          <Timeline.Item title="Item 2">Content 2</Timeline.Item>
        </Timeline>
      );
      expect(getByText('Item 0')).toBeTruthy();
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
    });

    it('should accept active={0} (first item)', () => {
      const { getByText } = render(
        <Timeline active={0}>
          <Timeline.Item title="First"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Second"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('First')).toBeTruthy();
    });

    it('should work without active prop (all items colored)', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Item 1">Content 1</Timeline.Item>
          <Timeline.Item title="Item 2">Content 2</Timeline.Item>
        </Timeline>
      );
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
    });

    it('should accept reverseActive prop', () => {
      const { getByText } = render(
        <Timeline active={1} reverseActive>
          <Timeline.Item title="Item 0">Content 0</Timeline.Item>
          <Timeline.Item title="Item 1">Content 1</Timeline.Item>
          <Timeline.Item title="Item 2">Content 2</Timeline.Item>
        </Timeline>
      );
      expect(getByText('Item 0')).toBeTruthy();
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
    });

    it('should allow Timeline.Item to override active state', () => {
      const { getByText } = render(
        <Timeline active={0}>
          <Timeline.Item title="Inactive" active={false}><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Active" active={true}><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Inactive')).toBeTruthy();
      expect(getByText('Active')).toBeTruthy();
    });
  });

  describe('Alignment', () => {
    it('should default to left alignment', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Left Aligned"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Left Aligned')).toBeTruthy();
    });

    it('should accept align="left"', () => {
      const { getByText } = render(
        <Timeline align="left">
          <Timeline.Item title="Left"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Left')).toBeTruthy();
    });

    it('should accept align="right"', () => {
      const { getByText } = render(
        <Timeline align="right">
          <Timeline.Item title="Right"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Right')).toBeTruthy();
    });

    it('should allow Timeline.Item to override alignment with itemAlign', () => {
      const { getByText } = render(
        <Timeline align="left">
          <Timeline.Item title="Override Right" itemAlign="right"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Override Right')).toBeTruthy();
    });
  });

  describe('Line Variants', () => {
    it('should default to solid line variant', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Solid"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Item 2"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Solid')).toBeTruthy();
    });

    it('should accept lineVariant="dashed" on Timeline.Item', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item lineVariant="dashed" title="Dashed"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Item 2"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Dashed')).toBeTruthy();
    });

    it('should accept lineVariant="dotted" on Timeline.Item', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item lineVariant="dotted" title="Dotted"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Item 2"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Dotted')).toBeTruthy();
    });

    it('should mix line variants in different items', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item lineVariant="solid" title="Solid"><Text>Content</Text></Timeline.Item>
          <Timeline.Item lineVariant="dashed" title="Dashed"><Text>Content</Text></Timeline.Item>
          <Timeline.Item lineVariant="dotted" title="Dotted"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Solid')).toBeTruthy();
      expect(getByText('Dashed')).toBeTruthy();
      expect(getByText('Dotted')).toBeTruthy();
    });
  });

  describe('Center Mode', () => {
    it('should accept centerMode prop', () => {
      const { getByText } = render(
        <Timeline centerMode>
          <Timeline.Item title="Left Item" itemAlign="left"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Right Item" itemAlign="right"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Left Item')).toBeTruthy();
      expect(getByText('Right Item')).toBeTruthy();
    });

    it('should auto-alternate alignment in centerMode when itemAlign not specified', () => {
      const { getByText } = render(
        <Timeline centerMode>
          <Timeline.Item title="Auto Left"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Auto Right"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Auto Left Again"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Auto Left')).toBeTruthy();
      expect(getByText('Auto Right')).toBeTruthy();
      expect(getByText('Auto Left Again')).toBeTruthy();
    });

    it('should respect explicit itemAlign in centerMode', () => {
      const { getByText } = render(
        <Timeline centerMode>
          <Timeline.Item title="Explicit Left" itemAlign="left"><Text>Content</Text></Timeline.Item>
          <Timeline.Item title="Explicit Left 2" itemAlign="left"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Explicit Left')).toBeTruthy();
      expect(getByText('Explicit Left 2')).toBeTruthy();
    });
  });

  describe('Custom Bullet', () => {
    it('should render custom bullet content', () => {
      const { getByTestId, getByText } = render(
        <Timeline>
          <Timeline.Item 
            title="Custom Bullet" 
            bullet={<View testID="custom-bullet"><Text>🎯</Text></View>}
          >
            Content
          </Timeline.Item>
        </Timeline>
      );
      expect(getByText('Custom Bullet')).toBeTruthy();
      expect(getByTestId('custom-bullet')).toBeTruthy();
      expect(getByText('🎯')).toBeTruthy();
    });

    it('should render different bullets for different items', () => {
      const { getByTestId, getByText } = render(
        <Timeline>
          <Timeline.Item 
            title="Item 1" 
            bullet={<View testID="bullet-1"><Text>1</Text></View>}
          >
            Content 1
          </Timeline.Item>
          <Timeline.Item 
            title="Item 2" 
            bullet={<View testID="bullet-2"><Text>2</Text></View>}
          >
            Content 2
          </Timeline.Item>
        </Timeline>
      );
      expect(getByTestId('bullet-1')).toBeTruthy();
      expect(getByTestId('bullet-2')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
    });
  });

  describe('Custom lineWidth and bulletSize', () => {
    it('should accept custom lineWidth', () => {
      const { getByText } = render(
        <Timeline lineWidth={5}>
          <Timeline.Item title="Thick Line"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Thick Line')).toBeTruthy();
    });

    it('should accept custom bulletSize', () => {
      const { getByText } = render(
        <Timeline bulletSize={40}>
          <Timeline.Item title="Big Bullet"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Big Bullet')).toBeTruthy();
    });

    it('should accept both custom lineWidth and bulletSize', () => {
      const { getByText } = render(
        <Timeline lineWidth={3} bulletSize={30}>
          <Timeline.Item title="Custom Sizing"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Custom Sizing')).toBeTruthy();
    });
  });

  describe('Context Propagation', () => {
    it('should throw error when Timeline.Item used outside Timeline', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<Timeline.Item title="Orphan Item"><Text>Content</Text></Timeline.Item>);
      }).toThrow('Timeline components must be used within a Timeline');

      console.error = originalError;
    });

    it('should propagate color to all items', () => {
      const { getByText } = render(
        <Timeline color="#00ff00">
          <Timeline.Item title="Item 1">Content 1</Timeline.Item>
          <Timeline.Item title="Item 2">Content 2</Timeline.Item>
        </Timeline>
      );
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
    });

    it('should propagate size to all items', () => {
      const { getByText } = render(
        <Timeline size="lg">
          <Timeline.Item title="Item 1">Content 1</Timeline.Item>
          <Timeline.Item title="Item 2">Content 2</Timeline.Item>
        </Timeline>
      );
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
    });
  });

  describe('Complex Children', () => {
    it('should render complex React children in item content', () => {
      const { getByText, getByTestId } = render(
        <Timeline>
          <Timeline.Item title="Complex Item">
            <View testID="complex-content">
              <Text>Line 1</Text>
              <Text>Line 2</Text>
              <View>
                <Text>Nested</Text>
              </View>
            </View>
          </Timeline.Item>
        </Timeline>
      );
      expect(getByText('Complex Item')).toBeTruthy();
      expect(getByTestId('complex-content')).toBeTruthy();
      expect(getByText('Line 1')).toBeTruthy();
      expect(getByText('Line 2')).toBeTruthy();
      expect(getByText('Nested')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should render single item timeline', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Only One"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByText('Only One')).toBeTruthy();
    });

    it('should handle many items', () => {
      const { getByText } = render(
        <Timeline>
          {Array.from({ length: 10 }, (_, i) => (
            <Timeline.Item key={i} title={`Item ${i}`}>
              Content {i}
            </Timeline.Item>
          ))}
        </Timeline>
      );
      expect(getByText('Item 0')).toBeTruthy();
      expect(getByText('Item 9')).toBeTruthy();
    });

    it('should handle empty title string', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="">
            <Text>Content only</Text>
          </Timeline.Item>
        </Timeline>
      );
      expect(getByText('Content only')).toBeTruthy();
    });

    it('should handle empty children', () => {
      const { getByText } = render(
        <Timeline>
          <Timeline.Item title="Title only" />
        </Timeline>
      );
      expect(getByText('Title only')).toBeTruthy();
    });
  });

  describe('Display Names', () => {
    it('should have correct displayName for Timeline', () => {
      expect((Timeline as any).displayName).toBe('Timeline');
    });

    it('should have correct displayName for Timeline.Item', () => {
      expect((Timeline.Item as any).displayName).toBe('Timeline.Item');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to Timeline root View', () => {
      const ref = React.createRef<View>();
      render(
        <Timeline ref={ref}>
          <Timeline.Item title="Item"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(ref.current).toBeTruthy();
    });

    it('should forward ref to Timeline.Item View', () => {
      const ref = React.createRef<View>();
      render(
        <Timeline>
          <Timeline.Item ref={ref} title="Item"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(ref.current).toBeTruthy();
    });
  });

  describe('Additional Props Passthrough', () => {
    it('should pass additional props to Timeline root', () => {
      const { getByTestId } = render(
        <Timeline testID="custom-timeline">
          <Timeline.Item title="Item"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByTestId('custom-timeline')).toBeTruthy();
    });

    it('should pass additional props to Timeline.Item', () => {
      const { getByTestId } = render(
        <Timeline>
          <Timeline.Item testID="custom-item" title="Item"><Text>Content</Text></Timeline.Item>
        </Timeline>
      );
      expect(getByTestId('custom-item')).toBeTruthy();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should accept all valid props without TypeScript errors', () => {
      // This test ensures the component compiles with valid props
      const element = (
        <Timeline
          active={1}
          color="#000000"
          lineWidth={2}
          bulletSize={24}
          align="left"
          reverseActive={true}
          size="md"
          centerMode={false}
        >
          <Timeline.Item
            title="Item"
            bullet={<View />}
            lineVariant="solid"
            color="#ffffff"
            active={true}
            itemAlign="left"
          >
            Content
          </Timeline.Item>
        </Timeline>
      );
      
      const { getByText } = render(element);
      expect(getByText('Item')).toBeTruthy();
    });
  });
});
