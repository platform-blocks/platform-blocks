import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Stub the presentational children so the test focuses on which colors reach
// `Highlight` (and doesn't depend on deep SVG/icon rendering under the native
// jest environment). `Highlight` itself is stubbed to surface `highlightProps`
// as inspectable props on a plain View.
jest.mock('../../Icon', () => {
  const { View } = require('react-native');
  return { Icon: (props: any) => <View {...props} /> };
});
jest.mock('../../Loader', () => {
  const { View } = require('react-native');
  return { Loader: (props: any) => <View {...props} /> };
});
jest.mock('../../Chip', () => {
  const { View } = require('react-native');
  return { Chip: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});
jest.mock('../../Highlight', () => {
  const { View, Text } = require('react-native');
  return {
    Highlight: ({ children, highlightProps }: any) => (
      <View testID="highlight" highlightColor={highlightProps?.color} highlightStyle={highlightProps?.style}>
        <Text>{children}</Text>
      </View>
    ),
  };
});
jest.mock('../../MenuItemButton', () => {
  const { View } = require('react-native');
  return { MenuItemButton: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});
jest.mock('../../ListGroup', () => {
  const { View } = require('react-native');
  return {
    ListGroup: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    ListGroupDivider: (props: any) => <View {...props} />,
  };
});
jest.mock('../../_internal/FieldHeader', () => {
  const { Text } = require('react-native');
  return { FieldHeader: ({ label }: any) => <Text>{label}</Text> };
});
jest.mock('../../../core/components/ClearButton', () => {
  const { View } = require('react-native');
  return { ClearButton: (props: any) => <View {...props} /> };
});

import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { AutoComplete } from '../AutoComplete';

const data = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
];

// Focusing with an empty query opens the full list synchronously, mounting the
// suggestion rows (and their `Highlight`) without going through the debounced
// search. The stubbed Highlight renders whether or not there's a query, so the
// color plumbing is observable either way.
const openSuggestions = (props: Record<string, unknown> = {}) => {
  const utils = render(
    <OverlayProvider>
      <AutoComplete
        data={data}
        showSuggestionsOnFocus
        useModal={false}
        usePortal={false}
        testID="ac-input"
        {...props}
      />
    </OverlayProvider>
  );
  fireEvent(utils.getByTestId('ac-input'), 'focus');
  return utils;
};

describe('AutoComplete highlight colors', () => {
  it('defaults the match color to the primary ramp', () => {
    const { getAllByTestId } = openSuggestions();

    const [first] = getAllByTestId('highlight');
    expect(first.props.highlightColor).toBe(DEFAULT_THEME.colors.primary[6]);
    expect(first.props.highlightStyle.backgroundColor).toBe('transparent');
  });

  it('applies highlightColor and highlightBackgroundColor overrides', () => {
    const { getAllByTestId } = openSuggestions({
      highlightColor: '#B45309',
      highlightBackgroundColor: '#FEF3C7',
    });

    for (const node of getAllByTestId('highlight')) {
      expect(node.props.highlightColor).toBe('#B45309');
      expect(node.props.highlightStyle.backgroundColor).toBe('#FEF3C7');
    }
  });

  it('leaves disabled options on the muted text color with no tint', () => {
    const { getAllByTestId } = openSuggestions({
      data: [{ label: 'Apple', value: 'apple', disabled: true }],
      highlightColor: '#B45309',
      highlightBackgroundColor: '#FEF3C7',
    });

    const [first] = getAllByTestId('highlight');
    expect(first.props.highlightColor).toBe(DEFAULT_THEME.text.disabled);
    expect(first.props.highlightStyle.backgroundColor).toBe('transparent');
  });
});
