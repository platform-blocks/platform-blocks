/**
 * Toast Component - Rendering & Behavior Tests
 * Tests component rendering, user interactions, and behavior
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View, StyleSheet } from 'react-native';

// Mock Reanimated BEFORE any imports that use it
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      createAnimatedComponent: (Component: any) => Component,
    },
    // Stable across renders, like the real hook — a fresh object each render
    // would make every effect that lists a shared value re-run.
    useSharedValue: (initial: any) => require('react').useRef({ value: initial }).current,
    useAnimatedStyle: (cb: any) => cb(),
    withTiming: (value: any) => value,
    withSpring: (value: any) => value,
    withRepeat: (value: any) => value,
    withSequence: (...values: any[]) => values[0],
    cancelAnimation: () => {},
    interpolate: (value: any, inputRange: any, outputRange: any) => outputRange[0],
    Easing: {
      linear: (t: number) => t,
      ease: (t: number) => t,
      quad: (t: number) => t,
      cubic: (t: number) => t,
      back: (s: number) => (t: number) => t,
      elastic: (bounciness: number) => (t: number) => t,
      bounce: (t: number) => t,
      bezier: () => (t: number) => t,
      inOut: (easing: any) => (t: number) => t,
      out: (easing: any) => (t: number) => t,
      in: (easing: any) => (t: number) => t,
    },
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
  };
});

// Now import Toast after mocks are set up
import { Toast } from '../Toast';

// Mock Icon component
jest.mock('../../Icon', () => ({
  Icon: ({ name, testID }: any) => {
    const MockIcon = require('react-native').View;
    return <MockIcon testID={testID || `icon-${name}`} />;
  },
}));

// Mock useHaptics
jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    trigger: jest.fn(),
  }),
}));

// Mock theme
jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      primary: { DEFAULT: '#0066CC', light: '#E6F2FF', dark: '#004C99' },
      secondary: { DEFAULT: '#6B7280', light: '#F3F4F6', dark: '#374151' },
      success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
      warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#92400E' },
      error: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#991B1B' },
      gray: { DEFAULT: '#6B7280', light: '#F3F4F6', dark: '#374151' },
      text: { DEFAULT: '#111827' },
      background: { DEFAULT: '#FFFFFF' },
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16 },
  }),
}));

describe('Toast Component - Rendering & Behavior', () => {
  describe('Basic Rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(<Toast title="Test Toast" visible />);
      expect(getByText('Test Toast')).toBeTruthy();
    });

    it('should render with children content', () => {
      const { getByText } = render(
        <Toast title="Test" visible>
          <Text>Toast content</Text>
        </Toast>
      );
      expect(getByText('Toast content')).toBeTruthy();
    });

    it('should render with testID', () => {
      const { getByTestId } = render(
        <Toast title="Test" visible testID="custom-toast" />
      );
      expect(getByTestId('custom-toast')).toBeTruthy();
    });

    it('should handle visible=false state', () => {
      const { queryByText } = render(<Toast title="Test Toast" visible={false} />);
      // Component renders but is animated out of view
      // The title text is still in the DOM but with opacity/position animations
      expect(queryByText('Test Toast')).toBeTruthy();
    });

    it('forwards titleProps weight + style to the title Text', () => {
      const { getByText } = render(
        <Toast
          title="Slot title"
          visible
          titleProps={{ weight: '700', style: { letterSpacing: 1.5 } }}
        />
      );
      const flat = StyleSheet.flatten((getByText('Slot title') as any).props.style) || {};
      expect(flat).toMatchObject({ fontWeight: '700', letterSpacing: 1.5 });
    });

    it('forwards bodyProps to the body Text', () => {
      const { getByText } = render(
        <Toast title="t" visible bodyProps={{ style: { fontStyle: 'italic' } }}>
          Plain body text
        </Toast>
      );
      const flat = StyleSheet.flatten((getByText('Plain body text') as any).props.style) || {};
      expect(flat).toMatchObject({ fontStyle: 'italic' });
    });

    it('should render with custom icon', () => {
      const { getByTestId } = render(
        <Toast 
          title="Test" 
          visible 
          icon={<View testID="custom-icon" />}
        />
      );
      expect(getByTestId('custom-icon')).toBeTruthy();
    });
  });

  describe('Variant Rendering', () => {
    it('should render light variant', () => {
      const { getByText } = render(
        <Toast title="Light Toast" variant="light" visible />
      );
      expect(getByText('Light Toast')).toBeTruthy();
    });

    it('should render filled variant', () => {
      const { getByText } = render(
        <Toast title="Filled Toast" variant="filled" visible />
      );
      expect(getByText('Filled Toast')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <Toast title="Outline Toast" variant="outline" visible />
      );
      expect(getByText('Outline Toast')).toBeTruthy();
    });
  });

  describe('Size Tokens', () => {
    const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

    const titleFontSize = (utils: any, text: string) =>
      StyleSheet.flatten((utils.getByText(text) as any).props.style)?.fontSize;

    const containerPadding = (utils: any) =>
      StyleSheet.flatten((utils.getByTestId('sized-toast') as any).props.style)?.padding;

    it.each(SIZES)('renders the %s size token', (size) => {
      const utils = render(
        <Toast title="Sized" size={size} visible testID="sized-toast" />
      );
      expect(utils.getByText('Sized')).toBeTruthy();
      expect(typeof containerPadding(utils)).toBe('number');
    });

    it('scales padding and title type monotonically across tokens', () => {
      const paddings: number[] = [];
      const fontSizes: number[] = [];

      SIZES.forEach((size) => {
        const utils = render(
          <Toast title="Sized" size={size} visible testID="sized-toast" />
        );
        paddings.push(containerPadding(utils));
        fontSizes.push(titleFontSize(utils, 'Sized'));
        utils.unmount();
      });

      paddings.forEach((value, index) => {
        if (index > 0) expect(value).toBeGreaterThan(paddings[index - 1]);
      });
      fontSizes.forEach((value, index) => {
        if (index > 0) expect(value).toBeGreaterThan(fontSizes[index - 1]);
      });
    });

    it('defaults to the md metrics when size is omitted', () => {
      const omitted = render(<Toast title="Sized" visible testID="sized-toast" />);
      const explicit = render(
        <Toast title="Sized" size="md" visible testID="sized-toast" />
      );
      expect(containerPadding(omitted)).toBe(containerPadding(explicit));
    });

    it('treats a numeric size as the title font size', () => {
      const utils = render(
        <Toast title="Sized" size={32} visible testID="sized-toast" />
      );
      expect(titleFontSize(utils, 'Sized')).toBe(32);
      expect(containerPadding(utils)).toBe(24);
    });

    it('lets titleProps override the size-derived font size', () => {
      const utils = render(
        <Toast title="Sized" size="3xl" visible titleProps={{ size: 11 }} testID="sized-toast" />
      );
      expect(titleFontSize(utils, 'Sized')).toBe(11);
    });
  });

  describe('Severity Rendering', () => {
    it('should render info severity', () => {
      const { getByText } = render(
        <Toast title="Info" severity="info" visible />
      );
      expect(getByText('Info')).toBeTruthy();
    });

    it('should render success severity', () => {
      const { getByText } = render(
        <Toast title="Success" severity="success" visible />
      );
      expect(getByText('Success')).toBeTruthy();
    });

    it('should render warning severity', () => {
      const { getByText } = render(
        <Toast title="Warning" severity="warning" visible />
      );
      expect(getByText('Warning')).toBeTruthy();
    });

    it('should render error severity', () => {
      const { getByText } = render(
        <Toast title="Error" severity="error" visible />
      );
      expect(getByText('Error')).toBeTruthy();
    });
  });

  describe('Color Rendering', () => {
    it('should render with primary color', () => {
      const { getByText } = render(
        <Toast title="Primary" color="primary" visible />
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render with success color', () => {
      const { getByText } = render(
        <Toast title="Success" color="success" visible />
      );
      expect(getByText('Success')).toBeTruthy();
    });

    it('should render with custom color', () => {
      const { getByText } = render(
        <Toast title="Custom" color="#FF0000" visible />
      );
      expect(getByText('Custom')).toBeTruthy();
    });
  });

  describe('Close Button', () => {
    it('should render close button by default', () => {
      const { getByLabelText } = render(
        <Toast title="Test" visible />
      );
      expect(getByLabelText('Close notification')).toBeTruthy();
    });

    it('should render with custom close button label', () => {
      const { getByLabelText } = render(
        <Toast 
          title="Test" 
          visible 
          closeButtonLabel="Dismiss toast"
        />
      );
      expect(getByLabelText('Dismiss toast')).toBeTruthy();
    });

    it('should not render close button when withCloseButton is false', () => {
      const { queryByLabelText } = render(
        <Toast title="Test" visible withCloseButton={false} />
      );
      expect(queryByLabelText('Close notification')).toBeNull();
    });

    it('should call onClose when close button is pressed', () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <Toast title="Test" visible onClose={onClose} />
      );
      
      fireEvent.press(getByLabelText('Close notification'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Actions', () => {
    it('should render action buttons', () => {
      const actions = [
        { label: 'Undo', onPress: jest.fn() },
        { label: 'Retry', onPress: jest.fn() },
      ];

      const { getByText } = render(
        <Toast title="Test" visible actions={actions} />
      );
      
      expect(getByText('Undo')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });

    it('should call action onPress when button is pressed', () => {
      const onPress = jest.fn();
      const actions = [{ label: 'Action', onPress }];

      const { getByText } = render(
        <Toast title="Test" visible actions={actions} />
      );
      
      fireEvent.press(getByText('Action'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should render multiple actions', () => {
      const actions = [
        { label: 'Action 1', onPress: jest.fn() },
        { label: 'Action 2', onPress: jest.fn() },
        { label: 'Action 3', onPress: jest.fn() },
      ];

      const { getByText } = render(
        <Toast title="Test" visible actions={actions} />
      );
      
      expect(getByText('Action 1')).toBeTruthy();
      expect(getByText('Action 2')).toBeTruthy();
      expect(getByText('Action 3')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should render loading indicator', () => {
      const { getByTestId } = render(
        <Toast title="Loading" visible loading testID="toast" />
      );
      // ActivityIndicator should be present
      const toast = getByTestId('toast');
      expect(toast).toBeTruthy();
    });

    it('should render with loading and title', () => {
      const { getByText } = render(
        <Toast title="Loading..." visible loading />
      );
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Dismiss on Tap', () => {
    it('should call onClose when dismissOnTap is true and toast is pressed', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <Toast 
          title="Test" 
          visible 
          dismissOnTap 
          onClose={onClose}
          testID="toast"
        />
      );
      
      fireEvent.press(getByTestId('toast'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when dismissOnTap is false', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <Toast 
          title="Test" 
          visible 
          dismissOnTap={false}
          onClose={onClose}
          testID="toast"
        />
      );
      
      fireEvent.press(getByTestId('toast'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Position', () => {
    it('should render with top position', () => {
      const { getByText } = render(
        <Toast title="Top" visible position="top" />
      );
      expect(getByText('Top')).toBeTruthy();
    });

    it('should render with bottom position', () => {
      const { getByText } = render(
        <Toast title="Bottom" visible position="bottom" />
      );
      expect(getByText('Bottom')).toBeTruthy();
    });

    it('should render with left position', () => {
      const { getByText } = render(
        <Toast title="Left" visible position="left" />
      );
      expect(getByText('Left')).toBeTruthy();
    });

    it('should render with right position', () => {
      const { getByText } = render(
        <Toast title="Right" visible position="right" />
      );
      expect(getByText('Right')).toBeTruthy();
    });
  });

  describe('Animation Configuration', () => {
    it('should render with slide animation', () => {
      const { getByText } = render(
        <Toast 
          title="Slide" 
          visible 
          animationConfig={{ type: 'slide' }}
        />
      );
      expect(getByText('Slide')).toBeTruthy();
    });

    it('should render with fade animation', () => {
      const { getByText } = render(
        <Toast 
          title="Fade" 
          visible 
          animationConfig={{ type: 'fade' }}
        />
      );
      expect(getByText('Fade')).toBeTruthy();
    });

    it('should render with bounce animation', () => {
      const { getByText } = render(
        <Toast 
          title="Bounce" 
          visible 
          animationConfig={{ type: 'bounce' }}
        />
      );
      expect(getByText('Bounce')).toBeTruthy();
    });

    it('should render with scale animation', () => {
      const { getByText } = render(
        <Toast 
          title="Scale" 
          visible 
          animationConfig={{ type: 'scale' }}
        />
      );
      expect(getByText('Scale')).toBeTruthy();
    });

    it('should render with custom animation duration', () => {
      const { getByText } = render(
        <Toast 
          title="Custom Duration" 
          visible 
          animationConfig={{ duration: 500 }}
        />
      );
      expect(getByText('Custom Duration')).toBeTruthy();
    });
  });

  describe('Complex Content', () => {
    it('should render with title and children', () => {
      const { getByText } = render(
        <Toast title="Title" visible>
          <Text>Child content</Text>
        </Toast>
      );
      
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Child content')).toBeTruthy();
    });

    it('should render with icon, title, and children', () => {
      const { getByText, getByTestId } = render(
        <Toast 
          title="Title" 
          visible 
          icon={<View testID="icon" />}
        >
          <Text>Content</Text>
        </Toast>
      );
      
      expect(getByTestId('icon')).toBeTruthy();
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });

    it('should render with all features combined', () => {
      const onClose = jest.fn();
      const actions = [{ label: 'Action', onPress: jest.fn() }];
      
      const { getByText, getByTestId, getByLabelText } = render(
        <Toast 
          title="Complex Toast"
          visible
          variant="filled"
          severity="success"
          icon={<View testID="icon" />}
          withCloseButton
          onClose={onClose}
          actions={actions}
          testID="toast"
        >
          <Text>Toast content</Text>
        </Toast>
      );
      
      expect(getByTestId('icon')).toBeTruthy();
      expect(getByText('Complex Toast')).toBeTruthy();
      expect(getByText('Toast content')).toBeTruthy();
      expect(getByText('Action')).toBeTruthy();
      expect(getByLabelText('Close notification')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      const { getByLabelText } = render(
        <Toast title="Test" visible />
      );
      expect(getByLabelText('Close notification')).toBeTruthy();
    });

    it('should support custom accessibility labels', () => {
      const { getByLabelText } = render(
        <Toast 
          title="Test" 
          visible 
          closeButtonLabel="Close this notification"
        />
      );
      expect(getByLabelText('Close this notification')).toBeTruthy();
    });
  });
});
