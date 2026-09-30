import React from 'react';
import { Text as RNText, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Title, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from '../Title';

const mockTheme = {
  colors: {
    primary: ['#004', '#005', '#006', '#007', '#008', '#009'],
  },
  text: {
    primary: '#111111',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
  useTheme: () => mockTheme,
}));

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

const mockUseTitleRegistration = {
  elementRef: jest.fn(),
};

jest.mock('../../../hooks/useTitleRegistration', () => ({
  useTitleRegistration: jest.fn(() => mockUseTitleRegistration),
}));

jest.mock('../../Block', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockBlock = ({ children, ...rest }: any) => (
    <View {...rest}>{children}</View>
  );
  return { Block: MockBlock };
});

jest.mock('../../Text', () => {
  const React = require('react');
  const { Text: RNTextNative } = require('react-native');
  const MockText = jest.fn(({ children, ...rest }) => (
    <RNTextNative {...rest}>{children}</RNTextNative>
  ));
  (MockText as any).displayName = 'MockText';
  return { Text: MockText };
});

const { useTitleRegistration } = require('../../../hooks/useTitleRegistration') as {
  useTitleRegistration: jest.Mock;
};
const { Text: MockText } = require('../../Text') as { Text: jest.Mock };

describe('Title', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers the title text and maps the order to the correct variant', () => {
    render(<Title text="Overview" order={3} />);

    expect(useTitleRegistration).toHaveBeenCalledWith(expect.objectContaining({
      text: 'Overview',
      order: 3,
      autoRegister: true,
    }));

    const titleTextProps = MockText.mock.calls[0]?.[0];
    expect(titleTextProps?.variant).toBe('h3');
    expect(titleTextProps?.children).toBe('Overview');
  });

  it('renders custom prefix, icons, and action content', () => {
    const { getByTestId, getByText } = render(
      <Title
        text="Settings"
        prefix={<View testID="custom-prefix" />}
        startIcon={<RNText testID="start-icon">S</RNText>}
        endIcon={<RNText testID="end-icon">E</RNText>}
        action={<RNText testID="action" accessibilityRole="button">Edit</RNText>}
      />
    );

    expect(getByTestId('custom-prefix')).toBeTruthy();
    expect(getByTestId('start-icon')).toBeTruthy();
    expect(getByTestId('end-icon')).toBeTruthy();
    expect(getByTestId('action')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders built-in prefix, underline, afterline, and subtitle when configured', () => {
    const { getByTestId, getByText } = render(
      <Title
        text="Docs"
        prefix
        prefixVariant="dot"
        underline
        afterline
        subtitle="More details"
      />
    );

    expect(getByTestId('title-prefix')).toBeTruthy();
    expect(getByTestId('title-underline')).toBeTruthy();
    expect(getByTestId('title-afterline')).toBeTruthy();
    expect(getByText('More details')).toBeTruthy();
  });
});

describe('Heading aliases', () => {
  const cases = [
    { name: 'Heading1', Component: Heading1, order: 1 },
    { name: 'Heading2', Component: Heading2, order: 2 },
    { name: 'Heading3', Component: Heading3, order: 3 },
    { name: 'Heading4', Component: Heading4, order: 4 },
    { name: 'Heading5', Component: Heading5, order: 5 },
    { name: 'Heading6', Component: Heading6, order: 6 },
  ] as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(cases)('$name forwards order $order to Title', ({ Component, order }) => {
    render(<Component text={`Heading ${order}`} />);

    expect(useTitleRegistration).toHaveBeenCalledWith(expect.objectContaining({
      order,
    }));

    const lastCall = MockText.mock.calls[MockText.mock.calls.length - 1];
    const props = lastCall?.[0];
    expect(props?.variant).toBe(`h${order}`);
  });
});
