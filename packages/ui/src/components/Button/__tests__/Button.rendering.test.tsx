/**
 * Button Component Rendering Tests
 * 
 * Tests actual component behavior, rendering, and interactions
 * using React Native Testing Library
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet, Text as RNText } from 'react-native';
import { Button } from '../Button';
import { IconButton } from '../../IconButton';

// Mock the heavy dependencies
jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    trigger: jest.fn(),
    triggerImpact: jest.fn(),
    triggerNotification: jest.fn(),
    triggerSelection: jest.fn(),
    impactLight: jest.fn(),
    impactMedium: jest.fn(),
    impactHeavy: jest.fn(),
    impactPressIn: jest.fn(),
    impactPressOut: jest.fn(),
    notificationSuccess: jest.fn(),
    notificationWarning: jest.fn(),
    notificationError: jest.fn(),
  }),
}));

/** Flattened style of a Pressable (its style may be a state function). */
const pressableStyleOf = (element: any) =>
  StyleSheet.flatten(
    typeof element.props.style === 'function' ? element.props.style({ pressed: false }) : element.props.style
  );

describe('Button Component - Rendering & Behavior', () => {
  
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================
  
  describe('Rendering', () => {
    it('should render with title prop', () => {
      const { getByText } = render(<Button title="Click me" />);
      expect(getByText('Click me')).toBeTruthy();
    });

    it('should render with children prop', () => {
      const { getByText } = render(<Button>Press here</Button>);
      expect(getByText('Press here')).toBeTruthy();
    });

    it('should render with testID', () => {
      const { getByTestId } = render(
        <Button title="Test" testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should prefer children over title', () => {
      const { getByText, queryByText } = render(
        <Button title="Title">Children</Button>
      );
      
      expect(getByText('Children')).toBeTruthy();
      expect(queryByText('Title')).toBeFalsy();
    });
  });

  // ============================================================================
  // INTERACTION TESTS
  // ============================================================================
  
  describe('User Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Press me" onPress={onPress} testID="button" />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPressIn when press starts', () => {
      const onPressIn = jest.fn();
      const { getByTestId } = render(
        <Button title="Press" onPressIn={onPressIn} testID="button" />
      );
      
      fireEvent(getByTestId('button'), 'pressIn');
      expect(onPressIn).toHaveBeenCalledTimes(1);
    });

    it('should call onPressOut when press ends', () => {
      const onPressOut = jest.fn();
      const { getByTestId } = render(
        <Button title="Press" onPressOut={onPressOut} testID="button" />
      );
      
      fireEvent(getByTestId('button'), 'pressOut');
      expect(onPressOut).toHaveBeenCalledTimes(1);
    });

    it('should call onLongPress on long press', () => {
      const onLongPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Hold" onLongPress={onLongPress} testID="button" />
      );
      
      fireEvent(getByTestId('button'), 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Disabled" disabled onPress={onPress} testID="button" />
      );
      
      // Button should not trigger onPress when disabled
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Loading" loading onPress={onPress} testID="button" />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================
  
  describe('Loading State', () => {
    it('should display loadingTitle when provided', () => {
      const { getByText, queryByText } = render(
        <Button title="Submit" loading loadingTitle="Submitting..." />
      );
      
      expect(getByText('Submitting...')).toBeTruthy();
      expect(queryByText('Submit')).toBeFalsy();
    });

    it('should hide title when loading without loadingTitle', () => {
      const { queryByText } = render(
        <Button title="Submit" loading testID="button" />
      );
      
      // Original title should not be shown
      expect(queryByText('Submit')).toBeFalsy();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Loading" loading onPress={onPress} testID="button" />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should keep the content width on every loading cycle', () => {
      const flatten = (style: any) =>
        Array.isArray(style) ? Object.assign({}, ...style.flat(9).filter(Boolean)) : style;

      const { getByTestId, rerender } = render(
        <Button title="Submit application" testID="button" />
      );

      // Layout fires once on mount with the natural content width.
      fireEvent(getByTestId('button'), 'layout', {
        nativeEvent: { layout: { width: 180, height: 40 } },
      });

      rerender(<Button title="Submit application" loading testID="button" />);
      expect(flatten(getByTestId('button').props.style).width).toBe(180);

      // Loading ends: the content width is unchanged, so no new layout event fires.
      rerender(<Button title="Submit application" testID="button" />);
      expect(flatten(getByTestId('button').props.style).width).toBeUndefined();

      // The next cycle must still freeze at the measured content width.
      rerender(<Button title="Submit application" loading testID="button" />);
      expect(flatten(getByTestId('button').props.style).width).toBe(180);
    });
  });

  // ============================================================================
  // VARIANT TESTS
  // ============================================================================
  
  describe('Visual Variants', () => {
    const variants = ['filled', 'outline', 'ghost', 'link', 'gradient', 'secondary', 'none'] as const;
    
    variants.forEach(variant => {
      it(`should render ${variant} variant`, () => {
        const { getByTestId } = render(
          <Button title={variant} variant={variant} testID="button" />
        );
        expect(getByTestId('button')).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // SIZE TESTS
  // ============================================================================
  
  describe('Size Variations', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      it(`should render ${size} size`, () => {
        const { getByTestId } = render(
          <Button title={size.toUpperCase()} size={size} testID="button" />
        );
        expect(getByTestId('button')).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // DISABLED STATE TESTS
  // ============================================================================
  
  describe('Disabled State', () => {
    it('should have disabled pressable when disabled prop is true', () => {
      const { getByTestId } = render(
        <Button title="Disabled" disabled testID="button" />
      );
      
      expect(getByTestId('button')).toBeDisabled();
    });

    it('is announced as a disabled button', () => {
      const { getByRole } = render(<Button title="Disabled" disabled />);

      expect(getByRole('button', { name: 'Disabled', disabled: true })).toBeTruthy();
    });
  });

  // ============================================================================
  // CUSTOM COLOR TESTS
  // ============================================================================
  
  describe('Custom Colors', () => {
    it('should accept a custom color', () => {
      const { getByTestId } = render(
        <Button title="Custom" color="#FF0000" testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should accept custom textColor', () => {
      const { getByTestId } = render(
        <Button title="Custom Text" textColor="#00FF00" testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should accept theme color tokens', () => {
      const { getByTestId } = render(
        <Button title="Theme Color" color="primary.6" testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================
  
  describe('Accessibility', () => {
    it('should have role="button" by default', () => {
      const { getByTestId } = render(
        <Button title="Accessible" testID="button" />
      );
      
      const button = getByTestId('button');
      expect(button.props.role).toBe('button');
    });

    it('should accept custom accessibilityLabel', () => {
      const { getByLabelText } = render(
        <Button 
          title="Submit" 
          accessibilityLabel="Submit form button"
        />
      );
      
      expect(getByLabelText('Submit form button')).toBeTruthy();
    });

    it('should accept custom accessibilityHint', () => {
      const { getByTestId } = render(
        <Button 
          title="Submit" 
          accessibilityHint="Double tap to submit"
          testID="button"
        />
      );
      
      const button = getByTestId('button');
      expect(button.props.accessibilityHint).toBe('Double tap to submit');
    });

    it('should set accessibilityHint when loading', () => {
      const { getByTestId } = render(
        <Button title="Loading" loading testID="button" />
      );
      
      const button = getByTestId('button');
      // Check that button indicates loading state through hint
      expect(button.props.accessibilityHint).toBeTruthy();
    });
  });

  // ============================================================================
  // FULL WIDTH TESTS
  // ============================================================================
  
  describe('Full Width', () => {
    it('should accept fullWidth prop', () => {
      const { getByTestId } = render(
        <Button title="Full Width" fullWidth testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  
  describe('Edge Cases', () => {
    it('should handle empty string title gracefully', () => {
      const { getByTestId } = render(
        <Button title="" testID="button" />
      );
      
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should handle both loading and disabled states', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button 
          title="Button" 
          loading 
          disabled 
          onPress={onPress} 
          testID="button" 
        />
      );
      
      const button = getByTestId('button');
      expect(button).toBeDisabled();
      expect(button).toBeBusy();
      
      // Should not call onPress
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should handle multiple event handlers', () => {
      const onPress = jest.fn();
      const onPressIn = jest.fn();
      const onPressOut = jest.fn();
      
      const { getByTestId } = render(
        <Button 
          title="Multi Events" 
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          testID="button" 
        />
      );
      
      const button = getByTestId('button');
      
      fireEvent(button, 'pressIn');
      expect(onPressIn).toHaveBeenCalledTimes(1);
      
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
      
      fireEvent(button, 'pressOut');
      expect(onPressOut).toHaveBeenCalledTimes(1);
    });

    it('should handle onLayout callback', () => {
      const onLayout = jest.fn();
      
      const { getByTestId } = render(
        <Button title="Layout" onLayout={onLayout} testID="button" />
      );
      
      const button = getByTestId('button');
      const mockEvent = { nativeEvent: { layout: { width: 100, height: 40 } } };
      
      fireEvent(button, 'layout', mockEvent);
      expect(onLayout).toHaveBeenCalledWith(mockEvent);
    });
  });

  // ============================================================================
  // ICON TESTS
  // ============================================================================
  
  describe('Icon Support', () => {
    it('should accept icon prop', () => {
      const { getByTestId } = render(
        <Button icon={<></>} testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should accept startSection with title', () => {
      const { getByText, getByTestId } = render(
        <Button title="Next" startSection={<></>} testID="button" />
      );

      expect(getByText('Next')).toBeTruthy();
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should accept endSection with title', () => {
      const { getByText, getByTestId } = render(
        <Button title="Previous" endSection={<></>} testID="button" />
      );

      expect(getByText('Previous')).toBeTruthy();
      expect(getByTestId('button')).toBeTruthy();
    });

    it('keeps the deprecated startIcon / endIcon working (with a dev warning)', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const { getByTestId } = render(
        <Button
          title="Legacy"
          startIcon={<RNText testID="legacy-start">S</RNText>}
          endIcon={<RNText testID="legacy-end">E</RNText>}
        />
      );
      expect(getByTestId('legacy-start')).toBeTruthy();
      expect(getByTestId('legacy-end')).toBeTruthy();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('`startIcon` is deprecated'));
      warn.mockRestore();
    });
  });

  // ============================================================================
  // TOOLTIP TESTS
  // ============================================================================
  
  describe('Tooltip Integration', () => {
    it('should accept tooltip prop', () => {
      const { getByTestId } = render(
        <Button title="With Tooltip" tooltip="Click here" testID="button" />
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should accept tooltipPosition prop', () => {
      const { getByTestId } = render(
        <Button
          title="Tooltip"
          tooltip="Info"
          tooltipPosition="bottom"
          testID="button"
        />
      );
      expect(getByTestId('button')).toBeTruthy();
    });
  });

  // ============================================================================
  // DEFAULT VARIANT & SIZING TESTS
  // ============================================================================

  describe('Defaults', () => {
    /** Flattened style of the Pressable, which carries fill and border. */
    const pressableStyle = (element: any) =>
      StyleSheet.flatten(
        typeof element.props.style === 'function'
          ? element.props.style({ pressed: false })
          : element.props.style
      );

    /**
     * The outer wrapper owns cross-axis sizing. It is the rendered root, several
     * views above the Pressable, so read it from the tree rather than by depth.
     */
    const wrapperStyle = (tree: any) => StyleSheet.flatten(tree?.props?.style);

    it('defaults to the neutral `default` variant rather than a primary fill', () => {
      const neutral = render(<Button title="Default" testID="button" />);
      const filled = render(<Button title="Filled" variant="filled" testID="filled" />);

      const style = pressableStyle(neutral.getByTestId('button'));
      // Neutral surface fill with a visible hairline — no accent color
      expect(style.borderWidth).toBe(1);
      expect(style.borderColor).not.toBe('transparent');
      expect(style.backgroundColor).not.toBe(
        pressableStyle(filled.getByTestId('filled')).backgroundColor
      );
    });

    it('renders the default variant explicitly the same as no variant at all', () => {
      const implicit = render(<Button title="Same" testID="implicit" />);
      const explicit = render(<Button title="Same" variant="default" testID="explicit" />);

      expect(pressableStyle(explicit.getByTestId('explicit'))).toEqual(
        pressableStyle(implicit.getByTestId('implicit'))
      );
    });

    it('still fills when the filled variant is requested', () => {
      const { getByTestId } = render(
        <Button title="Filled" variant="filled" testID="button" />
      );

      const style = pressableStyle(getByTestId('button'));
      expect(style.backgroundColor).not.toBe('transparent');
    });

    it('hugs its content instead of stretching to the parent width', () => {
      const { toJSON } = render(<Button title="Hug" testID="button" />);

      expect(wrapperStyle(toJSON()).alignItems).toBe('flex-start');
    });

    it('stretches when fullWidth, an explicit width, or a flex value is given', () => {
      const full = render(<Button title="Full" fullWidth />);
      expect(wrapperStyle(full.toJSON()).alignItems).toBe('stretch');

      const fixed = render(<Button title="Fixed" w={240} />);
      expect(wrapperStyle(fixed.toJSON()).alignItems).toBe('stretch');

      const flexed = render(<Button title="Flexed" style={{ flex: 1 }} />);
      expect(wrapperStyle(flexed.toJSON()).alignItems).toBe('stretch');
    });

    it('routes alignSelf to the wrapper so the parent still positions the button', () => {
      const { getByTestId, toJSON } = render(
        <Button title="Centered" style={{ alignSelf: 'center' }} testID="button" />
      );

      expect(wrapperStyle(toJSON()).alignSelf).toBe('center');
      // …and not left behind on the Pressable, where it would do nothing
      expect(pressableStyle(getByTestId('button')).alignSelf).toBeUndefined();
    });

    it('sizes the width on the wrapper and the height and fill on the Pressable', () => {
      const { getByTestId, toJSON } = render(
        <Button title="Sized" w={240} maw={300} h={60} bg="#ff0000" m="md" testID="button" />
      );
      const wrapper = wrapperStyle(toJSON());
      const pressable = pressableStyle(getByTestId('button'));

      expect(wrapper).toMatchObject({ width: 240, maxWidth: 300 });
      expect(wrapper.marginTop).toBeDefined();
      expect(pressable).toMatchObject({ height: 60, backgroundColor: '#ff0000' });
      // Each value lands once.
      expect(pressable.width).toBeUndefined();
      expect(pressable.maxWidth).toBeUndefined();
      expect(wrapper.height).toBeUndefined();
      expect(wrapper.backgroundColor).toBeUndefined();
    });

    it('lets an explicit `w` win over `fullWidth`', () => {
      const { toJSON } = render(<Button title="Both" fullWidth w={200} />);
      expect(wrapperStyle(toJSON()).width).toBe(200);
    });
  });

  // ============================================================================
  // ACCESSIBLE NAME / SIZING CONTRACT
  // ============================================================================

  describe('Accessible name', () => {
    it('derives the name from nested text children instead of a generic literal', () => {
      const { getByTestId } = render(
        <Button testID="button">
          <RNText>Save changes</RNText>
        </Button>
      );
      expect(getByTestId('button')).toHaveAccessibleName('Save changes');
    });

    it('leaves the name unset when the content has no text', () => {
      const { getByTestId } = render(
        <Button testID="button">
          <></>
        </Button>
      );
      expect(getByTestId('button')).not.toHaveAccessibleName();
    });

    it('names an icon-only button by its tooltip', () => {
      const { getByRole } = render(<Button icon={<RNText>*</RNText>} tooltip="Settings" />);
      expect(getByRole('button', { name: 'Settings' })).toBeTruthy();
    });

    it('does not report a stray selected state', () => {
      const { getByRole } = render(<Button title="Plain" />);
      expect(getByRole('button', { name: 'Plain' })).not.toBeSelected();
    });
  });

  describe('Sizing', () => {
    it('renders radius="full" as a true pill at every size', () => {
      for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
        const { getByTestId, unmount } = render(<Button title="Pill" radius="full" size={size} testID="button" />);
        const style = pressableStyleOf(getByTestId('button'));
        expect(style.borderRadius).toBeGreaterThanOrEqual((style.height as number) / 2);
        unmount();
      }
    });

    it('is exactly as tall as an IconButton of the same size', () => {
      for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
        const button = render(<Button title="Text" size={size} testID="button" />);
        const icon = render(<IconButton icon="heart" accessibilityLabel="Like" size={size} testID="icon" />);
        const buttonStyle = pressableStyleOf(button.getByTestId('button'));
        const iconStyle = pressableStyleOf(icon.getByTestId('icon'));
        expect(iconStyle.height).toBe(buttonStyle.height);
        expect(iconStyle.width).toBe(buttonStyle.height);
        button.unmount();
        icon.unmount();
      }
      expect(pressableStyleOf(render(<Button title="md" testID="md" />).getByTestId('md')).height).toBe(40);
    });
  });
});
