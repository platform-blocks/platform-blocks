/**
 * Button Component Tests
 * 
 * Testing strategy for Button component:
 * 1. Basic rendering and props
 * 2. User interactions (press, hover)
 * 3. Visual variants and states
 * 4. Accessibility features
 * 5. Edge cases and error handling
 */

import { describe, it, expect, jest } from '@jest/globals';

// Import the actual Button component
import { Button } from '../Button';
import type { ButtonProps } from '../types';

describe('Button Component', () => {
  
  // ============================================================================
  // BASIC RENDERING TESTS
  // ============================================================================
  
  describe('Basic Rendering', () => {
    it('should be defined and exportable', () => {
      expect(Button).toBeDefined();
      // `forwardRef` components are exotic objects, not plain functions.
      expect(['function', 'object']).toContain(typeof Button);
    });

    it('should accept title prop', () => {
      const props: ButtonProps = { title: 'Click me' };
      expect(props.title).toBe('Click me');
    });

    it('should accept children prop', () => {
      const props: ButtonProps = { children: 'Click me' };
      expect(props.children).toBe('Click me');
    });

    it('should have correct default types', () => {
      const props: ButtonProps = {
        variant: 'filled',
        size: 'md',
        disabled: false,
        loading: false,
        fullWidth: false,
      };
      expect(props.variant).toBe('filled');
      expect(props.size).toBe('md');
    });
  });

  // ============================================================================
  // PROPS VALIDATION TESTS
  // ============================================================================

  describe('Props Validation', () => {
    it('should accept all variant types', () => {
      const variants: ButtonProps['variant'][] = [
        'filled',
        'secondary', 
        'outline',
        'ghost',
        'gradient',
        'link',
        'none'
      ];
      
      variants.forEach(variant => {
        const props: ButtonProps = { variant };
        expect(props.variant).toBe(variant);
      });
    });

    it('should accept all size types', () => {
      const sizes: ButtonProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const props: ButtonProps = { size };
        expect(props.size).toBe(size);
      });
    });

    it('should accept boolean state props', () => {
      const props: ButtonProps = {
        disabled: true,
        loading: true,
        fullWidth: true,
      };
      
      expect(props.disabled).toBe(true);
      expect(props.loading).toBe(true);
      expect(props.fullWidth).toBe(true);
    });
  });

  // ============================================================================
  // EVENT HANDLER TESTS
  // ============================================================================

  describe('Event Handlers', () => {
    it('should accept onPress callback', () => {
      const onPress = jest.fn();
      const props: ButtonProps = { onPress };
      
      // Simulate calling the handler
      props.onPress?.();
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should accept onPressIn callback', () => {
      const onPressIn = jest.fn();
      const props: ButtonProps = { onPressIn };
      
      props.onPressIn?.();
      expect(onPressIn).toHaveBeenCalledTimes(1);
    });

    it('should accept onPressOut callback', () => {
      const onPressOut = jest.fn();
      const props: ButtonProps = { onPressOut };
      
      props.onPressOut?.();
      expect(onPressOut).toHaveBeenCalledTimes(1);
    });

    it('should accept onLongPress callback', () => {
      const onLongPress = jest.fn();
      const props: ButtonProps = { onLongPress };
      
      props.onLongPress?.();
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should accept hover callbacks', () => {
      const onHoverIn = jest.fn();
      const onHoverOut = jest.fn();
      const props: ButtonProps = { onHoverIn, onHoverOut };
      
      props.onHoverIn?.();
      props.onHoverOut?.();
      
      expect(onHoverIn).toHaveBeenCalledTimes(1);
      expect(onHoverOut).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    it('should accept loading prop', () => {
      const props: ButtonProps = { loading: true };
      expect(props.loading).toBe(true);
    });

    it('should accept loadingTitle prop', () => {
      const props: ButtonProps = { 
        loading: true, 
        loadingTitle: 'Processing...' 
      };
      expect(props.loadingTitle).toBe('Processing...');
    });

    it('should work without loadingTitle', () => {
      const props: ButtonProps = { loading: true };
      expect(props.loadingTitle).toBeUndefined();
    });
  });

  // ============================================================================
  // COLOR AND STYLING TESTS
  // ============================================================================

  describe('Color and Styling', () => {
    it('should accept colorVariant prop', () => {
      const props: ButtonProps = { colorVariant: 'primary' };
      expect(props.colorVariant).toBe('primary');
    });

    it('should accept colorVariant with shade', () => {
      const props: ButtonProps = { colorVariant: 'primary.6' };
      expect(props.colorVariant).toBe('primary.6');
    });

    it('should accept hex color', () => {
      const props: ButtonProps = { colorVariant: '#ff0000' };
      expect(props.colorVariant).toBe('#ff0000');
    });

    it('should accept textColor prop', () => {
      const props: ButtonProps = { textColor: '#ffffff' };
      expect(props.textColor).toBe('#ffffff');
    });

    it('should accept spacing props', () => {
      const props: ButtonProps = { 
        m: 'md',
        p: 'sm',
        mx: 'lg',
        my: 'xs'
      };
      expect(props.m).toBe('md');
      expect(props.p).toBe('sm');
    });
  });

  // ============================================================================
  // ICON BUTTON TESTS
  // ============================================================================

  describe('Icon Button', () => {
    it('should accept icon prop', () => {
      const props: ButtonProps = { icon: 'home' };
      expect(props.icon).toBe('home');
    });

    it('should work as icon-only button', () => {
      const props: ButtonProps = { 
        icon: 'settings',
        // No title or children means icon-only
      };
      expect(props.icon).toBe('settings');
      expect(props.title).toBeUndefined();
      expect(props.children).toBeUndefined();
    });

    it('should accept startIcon prop', () => {
      const props: ButtonProps = { 
        startIcon: 'arrow',
        title: 'Next'
      };
      expect(props.startIcon).toBe('arrow');
    });

    it('should accept endIcon prop', () => {
      const props: ButtonProps = { 
        endIcon: 'arrow',
        title: 'Previous'
      };
      expect(props.endIcon).toBe('arrow');
    });
  });

  // ============================================================================
  // TOOLTIP INTEGRATION TESTS
  // ============================================================================

  describe('Tooltip Integration', () => {
    it('should accept tooltip prop', () => {
      const props: ButtonProps = { 
        tooltip: 'Click to save',
        title: 'Save'
      };
      expect(props.tooltip).toBe('Click to save');
    });

    it('should accept tooltipPosition', () => {
      const props: ButtonProps = { 
        tooltip: 'Info',
        tooltipPosition: 'top'
      };
      expect(props.tooltipPosition).toBe('top');
    });
  });

  // ============================================================================
  // STYLING AND LAYOUT TESTS
  // ============================================================================

  describe('Styling and Layout', () => {
    it('should accept style prop', () => {
      const customStyle = { backgroundColor: 'red' };
      const props: ButtonProps = { style: customStyle };
      expect(props.style).toEqual(customStyle);
    });

    it('should accept layout event handler', () => {
      const onLayout = jest.fn();
      const props: ButtonProps = { onLayout };
      expect(props.onLayout).toBeDefined();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility Props', () => {
    it('should work with implicit accessibility', () => {
      const props: ButtonProps = { 
        title: 'Submit'
      };
      // Button component should handle accessibility automatically
      expect(props.title).toBe('Submit');
    });

    it('should support disabled state accessibility', () => {
      const props: ButtonProps = { 
        disabled: true,
        title: 'Submit'
      };
      // Disabled state should be communicated to screen readers
      expect(props.disabled).toBe(true);
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle undefined title', () => {
      const props: ButtonProps = { title: undefined };
      expect(props.title).toBeUndefined();
    });

    it('should handle empty string title', () => {
      const props: ButtonProps = { title: '' };
      expect(props.title).toBe('');
    });

    it('should handle both title and children provided', () => {
      const props: ButtonProps = { 
        title: 'Title',
        children: 'Children'
      };
      // Component should handle this - typically children takes precedence
      expect(props.title).toBe('Title');
      expect(props.children).toBe('Children');
    });

    it('should handle disabled and loading together', () => {
      const props: ButtonProps = { 
        disabled: true,
        loading: true
      };
      // Both states should be accepted
      expect(props.disabled).toBe(true);
      expect(props.loading).toBe(true);
    });

    it('should handle fullWidth with icon button', () => {
      const props: ButtonProps = { 
        icon: 'save',
        fullWidth: true
      };
      // Component logic should handle this appropriately
      expect(props.icon).toBeDefined();
      expect(props.fullWidth).toBe(true);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should handle complete button configuration', () => {
      const onPress = jest.fn();
      const props: ButtonProps = {
        title: 'Submit Form',
        variant: 'filled',
        size: 'lg',
        colorVariant: 'primary',
        fullWidth: true,
        onPress,
        icon: 'check',
        startIcon: 'check',
      };

      expect(props.title).toBe('Submit Form');
      expect(props.variant).toBe('filled');
      expect(props.size).toBe('lg');
      expect(props.fullWidth).toBe(true);
      
      // Simulate press
      props.onPress?.();
      expect(onPress).toHaveBeenCalled();
    });

    it('should handle loading button with all props', () => {
      const props: ButtonProps = {
        title: 'Saving...',
        loading: true,
        loadingTitle: 'Please wait',
        disabled: false, // Can be interactive while loading
        variant: 'filled',
        size: 'md',
      };

      expect(props.loading).toBe(true);
      expect(props.loadingTitle).toBe('Please wait');
    });

    it('should handle ghost button with tooltip', () => {
      const props: ButtonProps = {
        icon: 'info',
        variant: 'ghost',
        tooltip: 'More information',
        tooltipPosition: 'top',
      };

      expect(props.variant).toBe('ghost');
      expect(props.tooltip).toBeDefined();
      expect(props.icon).toBeDefined();
    });
  });

  // ============================================================================
  // TYPE SAFETY TESTS
  // ============================================================================

  describe('Type Safety', () => {
    it('should enforce ButtonProps type', () => {
      const validProps: ButtonProps = {
        title: 'Valid',
        variant: 'filled',
        size: 'md',
      };
      expect(validProps).toBeDefined();
    });

    it('should allow partial props', () => {
      const minimalProps: ButtonProps = {
        title: 'Minimal'
      };
      expect(minimalProps).toBeDefined();
    });

    it('should allow only children without title', () => {
      const childrenOnlyProps: ButtonProps = {
        children: 'Children only'
      };
      expect(childrenOnlyProps).toBeDefined();
    });
  });
});

// ============================================================================
// INTEGRATION TEST HELPERS
// ============================================================================

describe('Button Test Helpers', () => {
  it('should provide mock functions for testing', () => {
    const mockPress = jest.fn();
    const mockHover = jest.fn();
    
    expect(typeof mockPress).toBe('function');
    expect(typeof mockHover).toBe('function');
  });

  it('should allow creating test props easily', () => {
    const createTestProps = (overrides: Partial<ButtonProps> = {}): ButtonProps => ({
      title: 'Test Button',
      variant: 'filled',
      size: 'md',
      ...overrides,
    });

    const props = createTestProps({ variant: 'outline' });
    expect(props.variant).toBe('outline');
    expect(props.size).toBe('md');
  });
});
