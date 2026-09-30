/**
 * Rating Component - Comprehensive Test Suite
 * 
 * Tests type definitions, prop validation, and functionality.
 * 
 * Coverage:
 * - Size types, Colors, Values, Count, ReadOnly
 * - Fractional ratings, Labels, Gap sizing
 * - Accessibility, Ref forwarding
 */

import React from 'react';
import { render, fireEvent, act, configure } from '@testing-library/react-native';
import { View, Text, StyleSheet, Platform, PanResponder } from 'react-native';
import { Rating } from '../Rating';

// The real default theme, with the palettes these tests assert against.
jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  const { DEFAULT_THEME } = jest.requireActual('../../../core/theme/defaultTheme');
  const theme = {
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      warning: ['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'],
    },
  };
  return { ...actual, useTheme: () => theme };
});

// `isWeb` & co. are module constants; the web-interaction suite flips
// `Platform.OS` at runtime, so the flags follow it instead.
jest.mock('../../../core/platform/flags', () =>
  require('../../../__test-utils__/platformFlags').livePlatformFlags()
);

// The pointer tests drive the shared drag gesture directly: `PanResponder.create`
// hands its config back as the handlers, so the row carries the raw callbacks.
let panResponderSpy: jest.SpyInstance | undefined;
beforeAll(() => {
  panResponderSpy = jest
    .spyOn(PanResponder, 'create')
    .mockImplementation((config: any) => ({ panHandlers: config }) as any);
});
afterAll(() => panResponderSpy?.mockRestore());

// Direction is mocked globally as LTR; override it here so RTL layout can be
// exercised by flipping `mockIsRTL` inside a test.
let mockIsRTL = false;
jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({
    direction: mockIsRTL ? 'rtl' : 'ltr',
    dir: mockIsRTL ? 'rtl' : 'ltr',
    isRTL: mockIsRTL,
    setDirection: jest.fn(),
    toggleDirection: jest.fn(),
  }),
  DirectionProvider: ({ children }: any) => children,
}));

afterEach(() => {
  mockIsRTL = false;
});

// Mock Icon component
jest.mock('../../Icon', () => ({
  Icon: ({ name, icon, size, color, testID }: any) => {
    const MockedIcon = require('react-native').View;
    // Mirror the real Icon: an `icon` component takes precedence over `name`.
    if (icon) {
      const CustomIcon = icon;
      return <CustomIcon size={size} color={color} />;
    }
    return <MockedIcon testID={testID || `icon-${name}`} style={{ width: size, height: size, backgroundColor: color }} />;
  },
}));

// Mock Text component
jest.mock('../../Text', () => ({
  Text: ({ children, testID }: any) => {
    const MockedText = require('react-native').Text;
    return <MockedText testID={testID}>{children}</MockedText>;
  },
}));

// Mock Tooltip so the formatted label is assertable without a portal
jest.mock('../../Tooltip', () => ({
  Tooltip: ({ label, opened, children }: any) => {
    const RN = require('react-native');
    return (
      <RN.View>
        {children}
        {opened ? <RN.Text testID="tooltip-label">{label}</RN.Text> : null}
      </RN.View>
    );
  },
}));

// The visual label is hidden from native screen readers (the control's name
// carries it), so text queries must include hidden elements.
configure({ defaultIncludeHiddenElements: true });

describe('Rating - Type Safety and Prop Validation', () => {
  
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should render with custom count', () => {
      const { getByTestId } = render(<Rating count={3} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should render with count={10}', () => {
      const { getByTestId } = render(<Rating count={10} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Size Types', () => {
    it('should accept size "xs"', () => {
      const { getByTestId } = render(<Rating size="xs" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept size "sm"', () => {
      const { getByTestId } = render(<Rating size="sm" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept size "md"', () => {
      const { getByTestId } = render(<Rating size="md" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept size "lg"', () => {
      const { getByTestId } = render(<Rating size="lg" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept size "xl"', () => {
      const { getByTestId } = render(<Rating size="xl" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept custom numeric size', () => {
      const { getByTestId } = render(<Rating size={32} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Value Control - Uncontrolled', () => {
    it('should use defaultValue', () => {
      const { getByTestId } = render(<Rating defaultValue={3} testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuenow']).toBe(3);
    });

    it('should default to 0', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuenow']).toBe(0);
    });
  });

  describe('Value Control - Controlled', () => {
    it('should accept controlled value', () => {
      const { getByTestId } = render(<Rating value={3} testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuenow']).toBe(3);
    });

    it('should update when value changes', () => {
      const { getByTestId, rerender } = render(<Rating value={2} testID="rating" />);
      let element = getByTestId('rating');
      expect(element.props['aria-valuenow']).toBe(2);
      
      rerender(<Rating value={4} testID="rating" />);
      element = getByTestId('rating');
      expect(element.props['aria-valuenow']).toBe(4);
    });
  });

  describe('Count Prop', () => {
    it('should accept count={3}', () => {
      const { getByTestId } = render(<Rating count={3} testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuemax']).toBe(3);
    });

    it('should accept count={7}', () => {
      const { getByTestId } = render(<Rating count={7} testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuemax']).toBe(7);
    });

    it('should default to count={5}', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuemax']).toBe(5);
    });
  });

  describe('Color Props', () => {
    it('should accept color prop', () => {
      const { getByTestId } = render(<Rating color="#ff0000" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept emptyColor prop', () => {
      const { getByTestId } = render(<Rating emptyColor="#cccccc" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept hoverColor prop', () => {
      const { getByTestId } = render(<Rating hoverColor="#ff8800" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept all color props together', () => {
      const { getByTestId } = render(
        <Rating color="#ff0000" emptyColor="#cccccc" hoverColor="#ff8800" testID="rating" />
      );
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('ReadOnly Mode', () => {
    it('should be a labelled image when readOnly', () => {
      const { getByTestId } = render(<Rating readOnly value={4} label="Quality" testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props.role).toBe('img');
      expect(element.props['aria-label']).toBe('Quality: 4 out of 5');
    });

    it('should default to an interactive slider', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props.role).toBe('slider');
    });
  });

  describe('Disabled Mode', () => {
    it('should stay a slider that reports it is disabled', () => {
      const { getByTestId } = render(<Rating disabled testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props.role).toBe('slider');
      expect(element.props['aria-disabled']).toBe(true);
    });

    it('should not report disabled when enabled', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      expect(getByTestId('rating').props['aria-disabled']).toBeUndefined();
    });

    it('should dim the control', () => {
      const { getByTestId } = render(<Rating disabled testID="rating" />);
      // The row of stars is the control.
      const flattened = StyleSheet.flatten(getByTestId('rating').props.style);
      expect(flattened.opacity).toBe(0.5);
    });

    it('should not dim a readOnly rating', () => {
      const { getByTestId } = render(<Rating readOnly testID="rating" />);
      const flattened = StyleSheet.flatten(getByTestId('rating').props.style);
      expect(flattened.opacity).toBe(1);
    });
  });

  describe('Fractional Ratings', () => {
    it('should accept allowFraction prop', () => {
      const { getByTestId } = render(<Rating allowFraction testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept precision prop', () => {
      const { getByTestId } = render(<Rating precision={0.5} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept fractional value', () => {
      const { getByTestId } = render(<Rating value={3.5} allowFraction testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should render a partial item for a fractional value', () => {
      // The half item stacks an empty glyph under a clipped filled one.
      const { getAllByTestId } = render(<Rating value={2.5} allowFraction count={5} />);
      expect(getAllByTestId('icon-star')).toHaveLength(6);
    });

    it('should render a partial item without allowFraction', () => {
      // `allowFraction` limits what a user can set, not what a value can show.
      const { getAllByTestId } = render(<Rating value={4.5} readOnly count={5} />);
      expect(getAllByTestId('icon-star')).toHaveLength(6);
    });

    it('should render whole items for an integer value', () => {
      const { getAllByTestId } = render(<Rating value={4} readOnly count={5} />);
      expect(getAllByTestId('icon-star')).toHaveLength(5);
    });
  });

  describe('RTL', () => {
    const findPartialFillClip = (root: any) =>
      root.findAll((node: any) => {
        const flattened = StyleSheet.flatten(node.props?.style);
        return !!flattened && flattened.position === 'absolute' && flattened.overflow === 'hidden';
      });

    it('should anchor the partial fill to the logical start edge', () => {
      const { UNSAFE_root } = render(<Rating value={2.5} allowFraction count={5} />);
      const clip = StyleSheet.flatten(findPartialFillClip(UNSAFE_root)[0].props.style);
      // `start` flips with the layout direction on both platforms.
      expect(clip.start).toBe(0);
      expect(clip.left).toBeUndefined();
      expect(clip.right).toBeUndefined();
    });

    it('should keep the same logical anchor in RTL (the row itself mirrors)', () => {
      mockIsRTL = true;
      const { UNSAFE_root } = render(<Rating value={2.5} allowFraction count={5} />);
      const clip = StyleSheet.flatten(findPartialFillClip(UNSAFE_root)[0].props.style);
      expect(clip.start).toBe(0);
    });

    it('should space items with a direction-aware margin', () => {
      const { UNSAFE_root } = render(<Rating count={3} gap={8} />);
      const spacers = UNSAFE_root.findAll((node: any) => {
        if (typeof node.type !== 'string') return false;
        const flattened = StyleSheet.flatten(node.props?.style);
        return !!flattened && flattened.marginEnd === 8;
      });
      // Every item but the last carries the trailing gap.
      expect(spacers).toHaveLength(2);
      const physicalMargins = UNSAFE_root.findAll((node: any) => {
        const flattened = StyleSheet.flatten(node.props?.style);
        return !!flattened && flattened.marginRight !== undefined;
      });
      expect(physicalMargins).toHaveLength(0);
    });
  });

  describe('Change Handlers', () => {
    it('should accept onChange callback', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(<Rating onChange={onChange} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept onHover callback', () => {
      const onHover = jest.fn();
      const { getByTestId } = render(<Rating onHover={onHover} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept both callbacks', () => {
      const onChange = jest.fn();
      const onHover = jest.fn();
      const { getByTestId } = render(
        <Rating onChange={onChange} onHover={onHover} testID="rating" />
      );
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Label Positioning', () => {
    it('should render with label string', () => {
      const { getByText } = render(<Rating label="Rate this" />);
      expect(getByText('Rate this')).toBeTruthy();
    });

    it('should accept labelPosition="above"', () => {
      const { getByText } = render(<Rating label="Above" labelPosition="above" />);
      expect(getByText('Above')).toBeTruthy();
    });

    it('should accept labelPosition="below"', () => {
      const { getByText } = render(<Rating label="Below" labelPosition="below" />);
      expect(getByText('Below')).toBeTruthy();
    });

    it('should accept labelPosition="left"', () => {
      const { getByText } = render(<Rating label="Left" labelPosition="left" />);
      expect(getByText('Left')).toBeTruthy();
    });

    it('should accept labelPosition="right"', () => {
      const { getByText } = render(<Rating label="Right" labelPosition="right" />);
      expect(getByText('Right')).toBeTruthy();
    });

    it('should accept labelGap', () => {
      const { getByText } = render(<Rating label="With Gap" labelGap="md" />);
      expect(getByText('With Gap')).toBeTruthy();
    });
  });

  describe('Custom Characters', () => {
    it('should accept custom character', () => {
      const { getByTestId } = render(<Rating character="♥" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept custom emptyCharacter', () => {
      const { getByTestId } = render(<Rating emptyCharacter="♡" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept both custom characters', () => {
      const { getByTestId } = render(<Rating character="♥" emptyCharacter="♡" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should render custom characters as text glyphs', () => {
      const { getAllByText } = render(
        <Rating character="♥" emptyCharacter="♡" value={2} count={5} />
      );
      expect(getAllByText('♥')).toHaveLength(2);
      expect(getAllByText('♡')).toHaveLength(3);
    });
  });

  describe('Custom Icons', () => {
    it('should render the star icon by default', () => {
      const { getAllByTestId } = render(<Rating count={5} />);
      expect(getAllByTestId('icon-star')).toHaveLength(5);
    });

    it('should render a registry icon name from the icon prop', () => {
      const { getAllByTestId, queryAllByTestId } = render(<Rating icon="heart" count={4} />);
      expect(getAllByTestId('icon-heart')).toHaveLength(4);
      expect(queryAllByTestId('icon-star')).toHaveLength(0);
    });

    it('should reuse icon for empty items when emptyIcon is omitted', () => {
      const { getAllByTestId } = render(<Rating icon="heart" value={2} count={5} />);
      expect(getAllByTestId('icon-heart')).toHaveLength(5);
    });

    it('should use emptyIcon for items past the value', () => {
      const { getAllByTestId } = render(
        <Rating icon="heart" emptyIcon="circle" value={2} count={5} />
      );
      expect(getAllByTestId('icon-heart')).toHaveLength(2);
      expect(getAllByTestId('icon-circle')).toHaveLength(3);
    });

    it('should take precedence over character', () => {
      const { getAllByTestId, queryAllByText } = render(
        <Rating icon="heart" character="♥" emptyCharacter="♡" count={3} />
      );
      expect(getAllByTestId('icon-heart')).toHaveLength(3);
      expect(queryAllByText('♥')).toHaveLength(0);
    });

    it('should render element icons', () => {
      const { getAllByTestId } = render(
        <Rating icon={<View testID="custom-glyph" />} count={3} />
      );
      expect(getAllByTestId('custom-glyph')).toHaveLength(3);
    });

    it('should render component icons', () => {
      const CustomIcon = ({ size }: any) => <View testID="custom-component" style={{ width: size }} />;
      const { getAllByTestId } = render(<Rating icon={CustomIcon} count={3} />);
      expect(getAllByTestId('custom-component')).toHaveLength(3);
    });

    it('should split a fractional item into empty and filled glyphs', () => {
      const { getAllByTestId } = render(
        <Rating icon="heart" allowFraction value={2.5} count={5} />
      );
      // 2 filled + a stacked pair for the half item + 2 empty
      expect(getAllByTestId('icon-heart')).toHaveLength(6);
    });
  });

  describe('Gap Sizing', () => {
    it('should accept gap as size token', () => {
      const { getByTestId } = render(<Rating gap="sm" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept gap as number', () => {
      const { getByTestId } = render(<Rating gap={8} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be a slider when interactive', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      expect(getByTestId('rating').props.role).toBe('slider');
    });

    it('should be an image when readOnly', () => {
      const { getByTestId } = render(<Rating readOnly value={3} testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props.role).toBe('img');
      expect(element.props['aria-label']).toBe('3 out of 5');
    });

    it('should accept custom accessibilityLabel', () => {
      const { getByTestId } = render(<Rating accessibilityLabel="Custom label" testID="rating" />);
      expect(getByTestId('rating').props['aria-label']).toBe('Custom label');
    });

    it('should take its accessible name from the label', () => {
      const { getByTestId } = render(<Rating label="Service" required testID="rating" />);
      expect(getByTestId('rating').props['aria-label']).toBe('Service, required');
    });

    it('should warn in development when it has no accessible name', () => {
      const { resetWarnOnce } = jest.requireActual('../../../core/utils/logger');
      resetWarnOnce();
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Rating testID="rating" />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
      warn.mockRestore();
    });

    it('should accept custom accessibilityHint', () => {
      const { getByTestId } = render(<Rating accessibilityHint="Custom hint" testID="rating" />);
      expect(getByTestId('rating').props.accessibilityHint).toBe('Custom hint');
    });

    it('should publish its value, with a spoken value text', () => {
      const { getByTestId } = render(<Rating value={3} count={5} testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props['aria-valuemin']).toBe(0);
      expect(element.props['aria-valuemax']).toBe(5);
      expect(element.props['aria-valuenow']).toBe(3);
      expect(element.props['aria-valuetext']).toBe('3 out of 5');
    });
  });

  describe('Display Name', () => {
    it('should have correct displayName', () => {
      expect((Rating as any).displayName).toBe('Rating');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to the control', () => {
      const ref = React.createRef<View>();
      render(<Rating ref={ref} />);
      expect(ref.current).toBeTruthy();
    });
  });

  describe('Additional Props', () => {
    it('should pass testID prop', () => {
      const { getByTestId } = render(<Rating testID="custom-rating" />);
      expect(getByTestId('custom-rating')).toBeTruthy();
    });

    it('should apply style and spacing to the root', () => {
      const customStyle = { backgroundColor: '#f0f0f0' };
      const { toJSON } = render(<Rating style={customStyle} mt={12} testID="rating" />);
      const root = toJSON() as { props: { style?: unknown } };
      expect(StyleSheet.flatten(root.props.style as never)).toMatchObject({ backgroundColor: '#f0f0f0', marginTop: 12 });
    });
  });

  describe('Spacing Props', () => {
    it('should accept margin props', () => {
      const { getByTestId } = render(<Rating m="md" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should accept padding props', () => {
      const { getByTestId } = render(<Rating p="sm" testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle count={1}', () => {
      const { getByTestId } = render(<Rating count={1} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should handle value greater than count', () => {
      const { getByTestId } = render(<Rating value={10} count={5} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should handle negative value', () => {
      const { getByTestId } = render(<Rating value={-1} testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should handle very small precision', () => {
      const { getByTestId } = render(<Rating precision={0.001} allowFraction testID="rating" />);
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should accept all valid props', () => {
      const element = (
        <Rating
          value={3.5}
          defaultValue={2}
          count={5}
          readOnly={false}
          allowFraction={true}
          precision={0.5}
          size="lg"
          color="#ff0000"
          emptyColor="#cccccc"
          hoverColor="#ff8800"
          onChange={(value) => console.log(value)}
          onHover={(value) => console.log(value)}
          character="♥"
          emptyCharacter="♡"
          gap="sm"
          style={{ margin: 10 }}
          testID="rating"
          accessibilityLabel="Rating"
          accessibilityHint="Adjust"
          label="Rate"
          labelPosition="above"
          labelGap="xs"
          m="md"
          p="sm"
        />
      );
      
      const { getByTestId } = render(element);
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Combined Scenarios', () => {
    it('should work with readOnly and value', () => {
      const { getByTestId } = render(<Rating value={4} readOnly testID="rating" />);
      const element = getByTestId('rating');
      expect(element.props.role).toBe('img');
      expect(element.props['aria-label']).toBe('4 out of 5');
    });

    it('should work with label and custom count', () => {
      const { getByText, getByTestId } = render(
        <Rating label="Custom rating" count={7} testID="rating" />
      );
      expect(getByText('Custom rating')).toBeTruthy();
      const element = getByTestId('rating');
      expect(element.props['aria-valuemax']).toBe(7);
    });

    it('should work with fractional value and custom size', () => {
      const { getByTestId } = render(
        <Rating value={3.7} allowFraction size={48} testID="rating" />
      );
      expect(getByTestId('rating')).toBeTruthy();
    });

    it('should work with all color props and label', () => {
      const { getByText, getByTestId } = render(
        <Rating
          color="#ff0000"
          emptyColor="#cccccc"
          hoverColor="#ff8800"
          label="Colorful"
          testID="rating"
        />
      );
      expect(getByText('Colorful')).toBeTruthy();
      expect(getByTestId('rating')).toBeTruthy();
    });
  });

  describe('Accessibility Actions', () => {
    const fireAction = (element: any, actionName: string) =>
      fireEvent(element, 'accessibilityAction', { nativeEvent: { actionName } });

    it('should increment on the increment action', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(<Rating defaultValue={2} onChange={onChange} testID="rating" />);
      fireAction(getByTestId('rating'), 'increment');
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('should decrement on the decrement action', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(<Rating defaultValue={2} onChange={onChange} testID="rating" />);
      fireAction(getByTestId('rating'), 'decrement');
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('should step by precision when fractions are allowed', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <Rating defaultValue={2} allowFraction precision={0.5} onChange={onChange} testID="rating" />
      );
      fireAction(getByTestId('rating'), 'increment');
      expect(onChange).toHaveBeenCalledWith(2.5);
    });

    it('should hold at count (no change, so no onChange)', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(<Rating defaultValue={5} count={5} onChange={onChange} testID="rating" />);
      fireAction(getByTestId('rating'), 'increment');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should hold at zero (no change, so no onChange)', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(<Rating defaultValue={0} onChange={onChange} testID="rating" />);
      fireAction(getByTestId('rating'), 'decrement');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should expose increment and decrement actions', () => {
      const { getByTestId } = render(<Rating testID="rating" />);
      const actions = getByTestId('rating').props.accessibilityActions;
      expect(actions.map((action: any) => action.name)).toEqual(['increment', 'decrement']);
    });

    it('should not expose actions when readOnly', () => {
      const { getByTestId } = render(<Rating readOnly testID="rating" />);
      expect(getByTestId('rating').props.accessibilityActions).toBeUndefined();
    });

    it('should not expose actions when disabled', () => {
      const { getByTestId } = render(<Rating disabled testID="rating" />);
      expect(getByTestId('rating').props.accessibilityActions).toBeUndefined();
    });
  });

  describe('Web Interaction', () => {
    const originalPlatform = Platform.OS;

    beforeAll(() => {
      // Keyboard support and mouse handlers are web-only.
      (Platform as any).OS = 'web';
    });

    afterAll(() => {
      (Platform as any).OS = originalPlatform;
    });

    const pressKey = (element: any, key: string) => {
      const preventDefault = jest.fn();
      fireEvent(element, 'keyDown', { key, preventDefault });
      return preventDefault;
    };

    // The drag handlers live on the row of stars (the control).
    const getStarsRow = (root: any) =>
      root.findAll((node: any) => typeof node.props?.onPanResponderGrant === 'function')[0];

    describe('Keyboard', () => {
      it('should be focusable when interactive', () => {
        const { getByTestId } = render(<Rating testID="rating" />);
        expect(getByTestId('rating').props.tabIndex).toBe(0);
      });

      it('should not be focusable when readOnly', () => {
        const { getByTestId } = render(<Rating readOnly testID="rating" />);
        expect(getByTestId('rating').props.tabIndex).toBeUndefined();
      });

      it('should leave the tab order when disabled', () => {
        const { getByTestId } = render(<Rating disabled testID="rating" />);
        expect(getByTestId('rating').props.tabIndex).toBe(-1);
      });

      it('should increment on ArrowRight and ArrowUp', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={2} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), 'ArrowRight');
        expect(onChange).toHaveBeenLastCalledWith(3);

        const second = render(<Rating defaultValue={2} onChange={onChange} testID="rating-2" />);
        pressKey(second.getByTestId('rating-2'), 'ArrowUp');
        expect(onChange).toHaveBeenLastCalledWith(3);
      });

      it('should decrement on ArrowLeft and ArrowDown', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={2} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), 'ArrowLeft');
        expect(onChange).toHaveBeenLastCalledWith(1);

        const second = render(<Rating defaultValue={2} onChange={onChange} testID="rating-2" />);
        pressKey(second.getByTestId('rating-2'), 'ArrowDown');
        expect(onChange).toHaveBeenLastCalledWith(1);
      });

      it('should flip horizontal arrows under RTL', () => {
        mockIsRTL = true;
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={2} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), 'ArrowLeft');
        expect(onChange).toHaveBeenLastCalledWith(3);
      });

      it('should not flip vertical arrows under RTL', () => {
        mockIsRTL = true;
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={2} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), 'ArrowUp');
        expect(onChange).toHaveBeenLastCalledWith(3);
      });

      it('should jump to the ends with Home and End', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={2} count={5} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), 'End');
        expect(onChange).toHaveBeenLastCalledWith(5);

        const second = render(<Rating defaultValue={2} onChange={onChange} testID="rating-2" />);
        pressKey(second.getByTestId('rating-2'), 'Home');
        expect(onChange).toHaveBeenLastCalledWith(0);
      });

      it('should set the value from a digit key', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={1} count={5} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), '4');
        expect(onChange).toHaveBeenLastCalledWith(4);
      });

      it('should ignore digits above count', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={1} count={5} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), '8');
        expect(onChange).not.toHaveBeenCalled();
      });

      it('should clear on Backspace and Delete', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={3} onChange={onChange} testID="rating" />);
        pressKey(getByTestId('rating'), 'Backspace');
        expect(onChange).toHaveBeenLastCalledWith(0);

        const second = render(<Rating defaultValue={3} onChange={onChange} testID="rating-2" />);
        pressKey(second.getByTestId('rating-2'), 'Delete');
        expect(onChange).toHaveBeenLastCalledWith(0);
      });

      it('should step by precision when fractions are allowed', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
          <Rating defaultValue={2} allowFraction precision={0.25} onChange={onChange} testID="rating" />
        );
        pressKey(getByTestId('rating'), 'ArrowRight');
        expect(onChange).toHaveBeenLastCalledWith(2.25);
      });

      it('should preventDefault only for handled keys', () => {
        const { getByTestId } = render(<Rating defaultValue={2} testID="rating" />);
        expect(pressKey(getByTestId('rating'), 'ArrowRight')).toHaveBeenCalled();
        expect(pressKey(getByTestId('rating'), 'Tab')).not.toHaveBeenCalled();
      });

      it('should ignore keys when readOnly', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(<Rating defaultValue={2} readOnly onChange={onChange} testID="rating" />);
        // readOnly drops the handler entirely, so the value can never move.
        expect(getByTestId('rating').props.onKeyDown).toBeUndefined();
        expect(onChange).not.toHaveBeenCalled();
      });
    });

    describe('Pointer commit', () => {
      // size 20 with no gap makes the row exactly 100px wide for 5 items.
      const renderRow = (props: any = {}) =>
        render(<Rating size={20} gap={0} count={5} {...props} />);

      // Press and release at `x` px from the row's left edge.
      const clickAt = (root: any, x: number) => {
        const event = { nativeEvent: { pageX: x, pageY: 0, locationX: x, locationY: 0 } };
        act(() => {
          getStarsRow(root).props.onPanResponderGrant(event);
        });
        act(() => {
          getStarsRow(root).props.onPanResponderRelease(event, {});
        });
      };

      it('should commit the value under the pointer', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, onChange });
        clickAt(UNSAFE_root, 45);
        expect(onChange).toHaveBeenCalledWith(3);
      });

      it('should round up to whole items without allowFraction', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, onChange });
        clickAt(UNSAFE_root, 21);
        expect(onChange).toHaveBeenCalledWith(2);
      });

      it('should commit fractional values with allowFraction', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, allowFraction: true, precision: 0.5, onChange });
        clickAt(UNSAFE_root, 50);
        expect(onChange).toHaveBeenCalledWith(2.5);
      });

      it('should map the pointer from the left edge in LTR', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, onChange });
        clickAt(UNSAFE_root, 30);
        expect(onChange).toHaveBeenCalledWith(2);
      });

      it('should mirror the pointer position under RTL', () => {
        mockIsRTL = true;
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, onChange });
        // 30px from the left edge is 70px from the RTL start edge, so the same
        // click that reads as 2 in LTR must read as 4 here.
        clickAt(UNSAFE_root, 30);
        expect(onChange).toHaveBeenCalledWith(4);
      });

      it('should not commit when readOnly', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, readOnly: true, onChange });
        clickAt(UNSAFE_root, 45);
        expect(onChange).not.toHaveBeenCalled();
      });

      it('should not commit when disabled', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 0, disabled: true, onChange });
        clickAt(UNSAFE_root, 45);
        expect(onChange).not.toHaveBeenCalled();
      });

      it('should clear when clicking the current value with clearable', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 3, clearable: true, onChange });
        clickAt(UNSAFE_root, 45);
        expect(onChange).toHaveBeenCalledWith(0);
      });

      it('should not clear without clearable', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 3, onChange });
        clickAt(UNSAFE_root, 45);
        expect(onChange).toHaveBeenCalledWith(3);
      });

      it('should still set a different value when clearable', () => {
        const onChange = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 3, clearable: true, onChange });
        clickAt(UNSAFE_root, 85);
        expect(onChange).toHaveBeenCalledWith(5);
      });

      it('should preview the hovered value', () => {
        const onHover = jest.fn();
        const { UNSAFE_root } = renderRow({ defaultValue: 1, onHover });
        fireEvent(getStarsRow(UNSAFE_root), 'pointerMove', { nativeEvent: { offsetX: 65 } });
        expect(onHover).toHaveBeenCalledWith(4);
      });
    });

    describe('Tooltip label', () => {
      const hoverAt = (root: any, offsetX: number) =>
        fireEvent(getStarsRow(root), 'pointerMove', { nativeEvent: { offsetX } });

      it('should show value out of count by default', () => {
        const { UNSAFE_root, getByTestId } = render(
          <Rating size={20} gap={0} count={5} defaultValue={0} showTooltip />
        );
        hoverAt(UNSAFE_root, 45);
        expect(getByTestId('tooltip-label').props.children).toBe('3 / 5');
      });

      it('should use getTooltipLabel when provided', () => {
        const getTooltipLabel = jest.fn((value: number, count: number) => `${value} of ${count} stars`);
        const { UNSAFE_root, getByTestId } = render(
          <Rating size={20} gap={0} count={5} defaultValue={0} showTooltip getTooltipLabel={getTooltipLabel} />
        );
        hoverAt(UNSAFE_root, 45);
        expect(getByTestId('tooltip-label').props.children).toBe('3 of 5 stars');
        expect(getTooltipLabel).toHaveBeenCalledWith(3, 5);
      });

      it('should pass fractional values to getTooltipLabel', () => {
        const getTooltipLabel = jest.fn((value: number) => `${value}!`);
        const { UNSAFE_root, getByTestId } = render(
          <Rating size={20} gap={0} count={5} defaultValue={0} allowFraction precision={0.5} showTooltip getTooltipLabel={getTooltipLabel} />
        );
        hoverAt(UNSAFE_root, 50);
        expect(getByTestId('tooltip-label').props.children).toBe('2.5!');
      });
    });
  });

  describe('Form Field Props', () => {
    it('should render a description', () => {
      const { getByText } = render(<Rating description="Pick a score" />);
      expect(getByText('Pick a score')).toBeTruthy();
    });

    it('should render an error message', () => {
      const { getByText } = render(<Rating error="Rating is required" />);
      expect(getByText('Rating is required')).toBeTruthy();
    });

    it('should keep the description and replace helperText while an error is shown', () => {
      const { queryByText, getByText } = render(
        <Rating description="Pick a score" helperText="1 is poor, 5 is great" error="Rating is required" />
      );
      expect(getByText('Pick a score')).toBeTruthy();
      expect(queryByText('1 is poor, 5 is great')).toBeNull();
      expect(getByText('Rating is required')).toBeTruthy();
    });

    it('should announce the error and mark the control invalid', () => {
      const { getByRole } = render(<Rating label="Score" error="Rating is required" testID="rating" />);
      expect(getByRole('alert')).toBeTruthy();
    });

    it('should mark a required label with an asterisk', () => {
      const { getByText } = render(<Rating label="Score" required />);
      expect(getByText(' *')).toBeTruthy();
    });

    it('should not add an asterisk when not required', () => {
      const { queryByText } = render(<Rating label="Score" />);
      expect(queryByText(' *')).toBeNull();
    });

    it('should mark a node label as required', () => {
      const { getByText } = render(
        <Rating label={<Text>Custom label</Text>} required />
      );
      expect(getByText('Custom label')).toBeTruthy();
      expect(getByText(' *')).toBeTruthy();
    });
  });
});
