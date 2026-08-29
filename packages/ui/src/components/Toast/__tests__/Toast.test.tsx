/**
 * @jest-environment node
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { ToastProps, ToastVariant, ToastSeverity, ToastPosition, ToastAnimationType } from '../types';
import type { ThemeColor } from '../../../core/theme/resolveColors';

// Mock imports
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('../../Icon', () => ({
  Icon: 'Icon',
}));

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    trigger: jest.fn(),
  }),
}));

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
      muted: '#9CA3AF',
      disabled: '#D1D5DB',
      onPrimary: '#FFFFFF',
    },
    fontFamily: 'System',
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16 },
  }),
}));

describe('Toast Component - Type Safety & Props Validation', () => {
  describe('ToastProps Interface', () => {
    it('should accept all valid variant values', () => {
      const variants: ToastVariant[] = ['light', 'filled', 'outline'];
      
      variants.forEach(variant => {
        const props: ToastProps = {
          variant,
          title: 'Test',
        };
        expect(props.variant).toBe(variant);
      });
    });

    it('should accept all valid color values', () => {
      const colors: ThemeColor[] = ['primary', 'secondary', 'success', 'warning', 'error', 'gray'];
      
      colors.forEach(color => {
        const props: ToastProps = {
          color,
          title: 'Test',
        };
        expect(props.color).toBe(color);
      });
    });

    it('should accept custom color strings', () => {
      const customColors = ['#FF0000', 'rgb(255, 0, 0)', 'red'];
      
      customColors.forEach(color => {
        const props: ToastProps = {
          color,
          title: 'Test',
        };
        expect(props.color).toBe(color);
      });
    });

    it('should accept all valid severity values', () => {
      const severities: ToastSeverity[] = ['info', 'success', 'warning', 'error'];
      
      severities.forEach(severity => {
        const props: ToastProps = {
          severity,
          title: 'Test',
        };
        expect(props.severity).toBe(severity);
      });
    });

    it('should accept all valid position values', () => {
      const positions: ToastPosition[] = ['top', 'bottom', 'left', 'right'];
      
      positions.forEach(position => {
        const props: ToastProps = {
          position,
          title: 'Test',
        };
        expect(props.position).toBe(position);
      });
    });

    it('should accept all valid animation types', () => {
      const animationTypes: ToastAnimationType[] = ['slide', 'fade', 'bounce', 'scale'];
      
      animationTypes.forEach(type => {
        const props: ToastProps = {
          animationConfig: { type },
          title: 'Test',
        };
        expect(props.animationConfig?.type).toBe(type);
      });
    });

    it('should accept title as string', () => {
      const props: ToastProps = {
        title: 'Test Toast',
      };
      expect(props.title).toBe('Test Toast');
    });

    it('should accept children as ReactNode', () => {
      const props: ToastProps = {
        children: <Text>Test Content</Text>,
      };
      expect(props.children).toBeDefined();
    });

    it('should accept icon as ReactNode', () => {
      const props: ToastProps = {
        icon: <View testID="custom-icon" />,
        title: 'Test',
      };
      expect(props.icon).toBeDefined();
    });

    it('should accept boolean props', () => {
      const props: ToastProps = {
        withCloseButton: true,
        loading: true,
        visible: true,
        dismissOnTap: true,
        persistent: true,
        title: 'Test',
      };
      expect(props.withCloseButton).toBe(true);
      expect(props.loading).toBe(true);
      expect(props.visible).toBe(true);
      expect(props.dismissOnTap).toBe(true);
      expect(props.persistent).toBe(true);
    });

    it('should accept callback functions', () => {
      const onClose = jest.fn();
      const onSwipeDismiss = jest.fn();
      
      const props: ToastProps = {
        onClose,
        onSwipeDismiss,
        title: 'Test',
      };
      
      expect(props.onClose).toBe(onClose);
      expect(props.onSwipeDismiss).toBe(onSwipeDismiss);
    });

    it('should accept numeric props', () => {
      const props: ToastProps = {
        animationDuration: 500,
        autoHide: 3000,
        maxWidth: 400,
        title: 'Test',
      };
      
      expect(props.animationDuration).toBe(500);
      expect(props.autoHide).toBe(3000);
      expect(props.maxWidth).toBe(400);
    });

    it('should accept actions array', () => {
      const actions = [
        { label: 'Undo', onPress: jest.fn() },
        { label: 'Dismiss', onPress: jest.fn(), color: '#FF0000' },
      ];
      
      const props: ToastProps = {
        actions,
        title: 'Test',
      };
      
      expect(props.actions).toHaveLength(2);
      expect(props.actions?.[0].label).toBe('Undo');
    });

    it('should accept animationConfig object', () => {
      const props: ToastProps = {
        animationConfig: {
          type: 'bounce',
          duration: 400,
          springConfig: {
            damping: 10,
            stiffness: 150,
            mass: 0.8,
          },
        },
        title: 'Test',
      };
      
      expect(props.animationConfig?.type).toBe('bounce');
      expect(props.animationConfig?.duration).toBe(400);
      expect(props.animationConfig?.springConfig?.damping).toBe(10);
    });

    it('should accept swipeConfig object', () => {
      const props: ToastProps = {
        swipeConfig: {
          enabled: true,
          threshold: 100,
          direction: 'horizontal',
          velocityThreshold: 600,
        },
        title: 'Test',
      };
      
      expect(props.swipeConfig?.enabled).toBe(true);
      expect(props.swipeConfig?.threshold).toBe(100);
      expect(props.swipeConfig?.direction).toBe('horizontal');
    });

    it('should accept spacing props', () => {
      const props: ToastProps = {
        m: 'md',
        p: 'lg',
        mx: 'sm',
        my: 'xl',
        title: 'Test',
      };
      
      expect(props.m).toBe('md');
      expect(props.p).toBe('lg');
    });

    it('should accept radius prop', () => {
      const props: ToastProps = {
        radius: 'lg',
        title: 'Test',
      };
      
      expect(props.radius).toBe('lg');
    });

    it('should accept style object', () => {
      const style = { backgroundColor: 'red' };
      const props: ToastProps = {
        style,
        title: 'Test',
      };
      
      expect(props.style).toBe(style);
    });

    it('should accept testID string', () => {
      const props: ToastProps = {
        testID: 'toast-component',
        title: 'Test',
      };
      
      expect(props.testID).toBe('toast-component');
    });

    it('should accept closeButtonLabel string', () => {
      const props: ToastProps = {
        closeButtonLabel: 'Dismiss notification',
        title: 'Test',
      };
      
      expect(props.closeButtonLabel).toBe('Dismiss notification');
    });

    it('should accept all props together', () => {
      const props: ToastProps = {
        variant: 'filled',
        color: 'success',
        severity: 'success',
        title: 'Success!',
        children: <Text>Operation completed</Text>,
        icon: <View />,
        withCloseButton: true,
        loading: false,
        closeButtonLabel: 'Close',
        onClose: jest.fn(),
        visible: true,
        animationDuration: 300,
        autoHide: 4000,
        position: 'top',
        testID: 'test-toast',
        actions: [{ label: 'Undo', onPress: jest.fn() }],
        dismissOnTap: false,
        maxWidth: 500,
        persistent: false,
        animationConfig: { type: 'slide' },
        swipeConfig: { enabled: true },
        onSwipeDismiss: jest.fn(),
        m: 'md',
        radius: 'lg',
      };
      
      expect(props).toBeDefined();
      expect(props.variant).toBe('filled');
      expect(props.title).toBe('Success!');
    });
  });

  describe('ToastAction Interface', () => {
    it('should accept required action properties', () => {
      const action = {
        label: 'Action',
        onPress: jest.fn(),
      };
      
      expect(action.label).toBe('Action');
      expect(action.onPress).toBeDefined();
    });

    it('should accept optional color property', () => {
      const action = {
        label: 'Action',
        onPress: jest.fn(),
        color: '#FF0000',
      };
      
      expect(action.color).toBe('#FF0000');
    });
  });

  describe('ToastAnimationConfig Interface', () => {
    it('should accept all animation config properties', () => {
      const config = {
        type: 'bounce' as ToastAnimationType,
        duration: 500,
        springConfig: {
          damping: 15,
          stiffness: 100,
          mass: 1,
        },
      };
      
      expect(config.type).toBe('bounce');
      expect(config.duration).toBe(500);
      expect(config.springConfig?.damping).toBe(15);
    });
  });

  describe('ToastSwipeConfig Interface', () => {
    it('should accept all swipe config properties', () => {
      const config = {
        enabled: true,
        threshold: 150,
        direction: 'horizontal' as const,
        velocityThreshold: 700,
      };
      
      expect(config.enabled).toBe(true);
      expect(config.threshold).toBe(150);
      expect(config.direction).toBe('horizontal');
    });
  });
});
