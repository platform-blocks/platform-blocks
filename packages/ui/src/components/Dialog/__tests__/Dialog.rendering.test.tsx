import React from 'react';
import { render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

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


describe('Dialog - rendering', () => {
  it('matches snapshot for modal dialog with title and content', () => {
    const { toJSON } = render(
      <Dialog opened title="Modal Title" onClose={jest.fn()}>
        <RNText>Modal body copy</RNText>
      </Dialog>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for bottom sheet dialog without close button', () => {
    const { toJSON } = render(
      <Dialog
        opened
        title="Actions"
        variant="bottomsheet"
        closable={false}
        onClose={jest.fn()}
        bottomSheetSwipeZone="handle"
      >
        <RNText>Choose an action</RNText>
      </Dialog>
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
