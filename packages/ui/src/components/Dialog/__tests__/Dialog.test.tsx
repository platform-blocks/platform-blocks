import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text as RNText } from 'react-native';
import * as Reanimated from 'react-native-reanimated';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  RN.Modal = ({ children, ...props }: any) => React.createElement(RN.View, props, children);
  return RN;
});

// React Native Reanimated mock provided globally via jest.setup

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaInsetsContext: require('react').createContext(null),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colorScheme: 'light',
    backgrounds: {
      surface: '#FFFFFF',
      subtle: '#F8FAFC',
    },
    colors: {
      gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569'],
    },
    text: {
      primary: '#0f172a',
    },
  }),
}));

jest.mock('../../Button/Button', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    Button: ({ children, onPress, testID = 'dialog-close-btn', ...rest }: any) => (
      React.createElement(
        Pressable,
        {
          role: 'button',
          onPress,
          testID,
          ...rest,
        },
        children ?? React.createElement(Text, null, 'Close')
      )
    ),
  };
});

jest.mock('../../Text/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...rest }: any) => React.createElement(Text, rest, children),
  };
});

jest.mock('../../Icon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Icon: ({ name }: { name: string }) => React.createElement(View, { testID: `icon-${name}` }),
  };
});

import { Dialog } from '../Dialog';
import { __resetLayerStackForTests, handleBackPress } from '../../../core/overlay/layerStack';


describe('Dialog - behavior', () => {
  const renderDialog = (overrideProps: Partial<React.ComponentProps<typeof Dialog>> = {}) => (
    <Dialog
      opened
      title="System Settings"
      onClose={jest.fn()}
      {...overrideProps}
    >
      <RNText>Dialog body</RNText>
    </Dialog>
  );

  it('renders modal title and content when visible', () => {
    const { getByText } = render(renderDialog());
    expect(getByText('System Settings')).toBeTruthy();
    expect(getByText('Dialog body')).toBeTruthy();
  });

  it('sizes the panel with w / h, not the body', () => {
    const { getByTestId, getByText } = render(renderDialog({ testID: 'panel', w: 360, h: 400, p: 4 }));
    const panel = StyleSheet.flatten(getByTestId('panel').props.style);
    expect(panel.maxHeight).toBe(400);
    const body = StyleSheet.flatten(getByText('Dialog body').parent?.parent?.props.style);
    expect(body.paddingTop).toBe(4);
    expect(body.width).toBe('100%');
    expect(body.maxHeight).toBeUndefined();
  });

  it('invokes onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(renderDialog({ onClose }));

    fireEvent.press(getByTestId('dialog-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when backdrop is pressed and backdropClosable=true', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(renderDialog({ onClose, backdropClosable: true }));

    fireEvent.press(getByTestId('dialog-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses dialog timing for bottom sheet entry and exit', () => {
    const timing = jest.spyOn(Reanimated, 'withTiming');
    try {
      const { getByTestId } = render(renderDialog({ variant: 'bottomsheet' }));
      expect(timing).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 300 }));

      timing.mockClear();
      fireEvent.press(getByTestId('dialog-backdrop', { includeHiddenElements: true }));
      expect(timing).toHaveBeenCalledWith(expect.any(Number), expect.objectContaining({ duration: 220 }), expect.any(Function));
    } finally {
      timing.mockRestore();
    }
  });

  it('scales bottom sheet entry and exit with transitionDuration', () => {
    const timing = jest.spyOn(Reanimated, 'withTiming');
    try {
      const { getByTestId } = render(renderDialog({ variant: 'bottomsheet', transitionDuration: 600 }));
      expect(timing).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 600 }));

      timing.mockClear();
      fireEvent.press(getByTestId('dialog-backdrop', { includeHiddenElements: true }));
      expect(timing).toHaveBeenCalledWith(expect.any(Number), expect.objectContaining({ duration: 440 }), expect.any(Function));
    } finally {
      timing.mockRestore();
    }
  });

  it('skips bottom sheet animation when transitionDuration is zero', () => {
    const timing = jest.spyOn(Reanimated, 'withTiming');
    const spring = jest.spyOn(Reanimated, 'withSpring');
    try {
      const onClose = jest.fn();
      const { getByTestId } = render(renderDialog({ variant: 'bottomsheet', transitionDuration: 0, onClose }));
      fireEvent.press(getByTestId('dialog-backdrop', { includeHiddenElements: true }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(timing).not.toHaveBeenCalled();
      expect(spring).not.toHaveBeenCalled();
    } finally {
      timing.mockRestore();
      spring.mockRestore();
    }
  });

  it('does not render backdrop pressable when backdropClosable=false', () => {
    const { queryByTestId } = render(renderDialog({ backdropClosable: false }));
    expect(queryByTestId('dialog-backdrop', { includeHiddenElements: true })).toBeNull();
  });

  it('renders nothing when visible is false', () => {
    const { queryByText } = render(
      <Dialog opened={false} title="Hidden" onClose={jest.fn()}>
        <RNText>Should not appear</RNText>
      </Dialog>
    );

    expect(queryByText('Hidden')).toBeNull();
    expect(queryByText('Should not appear')).toBeNull();
  });

  describe('autoFocus', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('focuses the provided ref after the enter transition', () => {
      const focus = jest.fn();
      const ref = { current: { focus } } as any;

      render(renderDialog({ autoFocus: ref }));
      expect(focus).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(focus).toHaveBeenCalledTimes(1);
    });

    it('does not focus when autoFocus is omitted', () => {
      const focus = jest.fn();
      render(renderDialog());

      jest.advanceTimersByTime(300);
      expect(focus).not.toHaveBeenCalled();
    });

    it('cancels the pending focus when the dialog unmounts first', () => {
      const focus = jest.fn();
      const ref = { current: { focus } } as any;

      const { unmount } = render(renderDialog({ autoFocus: ref }));
      unmount();
      jest.advanceTimersByTime(300);

      expect(focus).not.toHaveBeenCalled();
    });
  });

  it('keeps the title but omits the close button when the dialog is not closable', () => {
    const { queryByTestId, getByText } = render(
      <Dialog opened title="System Settings" closable={false} onClose={jest.fn()}>
        <RNText>Dialog body</RNText>
      </Dialog>
    );

    expect(queryByTestId('dialog-close-btn')).toBeNull();
    expect(getByText('System Settings')).toBeTruthy();
  });

  it('labels the close button and names the dialog by its title', () => {
    const { getByTestId, getByText, UNSAFE_root } = render(renderDialog());
    expect(getByTestId('dialog-close-btn').props.accessibilityLabel).toBe('Close dialog');
    const dialog = UNSAFE_root.find((node: any) => node.props?.role === 'dialog');
    const titleId = getByText('System Settings').props.nativeID;
    expect(titleId).toBeTruthy();
    expect(dialog.props['aria-labelledby']).toBe(titleId);
  });

  describe('layer stack', () => {
    beforeEach(() => __resetLayerStackForTests());

    it('Android back closes a closable dialog', () => {
      const onClose = jest.fn();
      render(renderDialog({ onClose, transitionDuration: 0 }));
      act(() => {
        expect(handleBackPress()).toBe(true);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('a non-closable dialog swallows Android back without closing', () => {
      const onClose = jest.fn();
      render(renderDialog({ onClose, closable: false, transitionDuration: 0 }));
      act(() => {
        expect(handleBackPress()).toBe(true);
      });
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
