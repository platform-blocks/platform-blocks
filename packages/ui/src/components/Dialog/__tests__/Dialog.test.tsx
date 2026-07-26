import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import * as ReactNative from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  RN.Modal = ({ children, ...props }: any) => React.createElement(RN.View, props, children);
  return RN;
});

// React Native Reanimated mock provided globally via jest.setup

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../../hooks/useHotkeys', () => ({
  useEscapeKey: jest.fn(),
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
          accessibilityRole: 'button',
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

jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
  width: 1024,
  height: 768,
  scale: 2,
  fontScale: 2,
});

describe('Dialog - behavior', () => {
  const renderDialog = (overrideProps: Partial<React.ComponentProps<typeof Dialog>> = {}) => (
    <Dialog
      visible
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

  it('invokes onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(renderDialog({ onClose }));

    fireEvent.press(getByTestId('dialog-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when backdrop is pressed and backdropClosable=true', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(renderDialog({ onClose, backdropClosable: true }));

    fireEvent.press(getByTestId('dialog-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render backdrop pressable when backdropClosable=false', () => {
    const { queryByTestId } = render(renderDialog({ backdropClosable: false }));
    expect(queryByTestId('dialog-backdrop')).toBeNull();
  });

  it('renders nothing when visible is false', () => {
    const { queryByText } = render(
      <Dialog visible={false} title="Hidden" onClose={jest.fn()}>
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

  it('omits header and close button when dialog is not closable', () => {
    const { queryByTestId, queryByText } = render(
      <Dialog visible title="System Settings" closable={false} onClose={jest.fn()}>
        <RNText>Dialog body</RNText>
      </Dialog>
    );

    expect(queryByTestId('dialog-close-btn')).toBeNull();
    expect(queryByText('System Settings')).toBeNull();
  });
});
