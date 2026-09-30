import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Stub the presentational children so the test focuses on AutoComplete's own
// keyboard/commit logic (and doesn't depend on deep SVG/icon rendering under the
// native jest environment).
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
  const { Text } = require('react-native');
  return { Highlight: ({ children }: any) => <Text>{children}</Text> };
});
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { AutoComplete } from '../AutoComplete';

// These tests lock in the freeSolo "press Enter to add a tag, then keep typing"
// behavior. On RN Web a single-line TextInput blurs itself on Enter unless the
// event's default is prevented, which used to kick the user out of the field
// after adding each chip. The component now (a) calls preventDefault on the
// freeSolo commit and (b) opts the input out of blur-on-submit for freeSolo.
//
// Note: jest runs in the native RN environment, so RN Web's actual blur can't
// be exercised here. We assert the contract our fix controls instead: the
// event default is prevented and the input carries blurOnSubmit={false}.

const renderAutoComplete = (props: Record<string, unknown> = {}) =>
  render(
    <OverlayProvider>
      <AutoComplete
        data={[]}
        useModal={false}
        testID="ac-input"
        {...props}
      />
    </OverlayProvider>
  );

const pressEnter = (input: any) => {
  const preventDefault = jest.fn();
  fireEvent(input, 'keyPress', { nativeEvent: { key: 'Enter' }, preventDefault });
  return preventDefault;
};

describe('AutoComplete freeSolo Enter behavior', () => {
  it('commits the typed value and clears the field in multiSelect', () => {
    const onSelect = jest.fn();
    const onChangeText = jest.fn();
    const { getByTestId } = renderAutoComplete({
      freeSolo: true,
      multiSelect: true,
      value: 'kiwi',
      onSelect,
      onChangeText,
    });

    pressEnter(getByTestId('ac-input'));

    expect(onSelect).toHaveBeenCalledWith({ label: 'kiwi', value: 'kiwi' });
    // Field is cleared so the next tag can be typed immediately.
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('prevents the default submit so the input keeps focus', () => {
    const { getByTestId } = renderAutoComplete({
      freeSolo: true,
      multiSelect: true,
      value: 'kiwi',
      onSelect: jest.fn(),
    });

    const input = getByTestId('ac-input');
    // freeSolo opts out of RN's blur-on-submit...
    expect(input.props.blurOnSubmit).toBe(false);
    // ...and the commit prevents the event default (which triggers the web blur).
    const preventDefault = pressEnter(input);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('keeps the submitted text for single-select freeSolo', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderAutoComplete({
      freeSolo: true,
      value: 'kiwi',
      onSelect: jest.fn(),
      onChangeText,
    });

    pressEnter(getByTestId('ac-input'));

    // Single-select must not blank the field (that would clear the value).
    expect(onChangeText).not.toHaveBeenCalledWith('');
  });

  it('leaves blur-on-submit at the default when not freeSolo', () => {
    const { getByTestId } = renderAutoComplete({ value: 'kiwi' });
    expect(getByTestId('ac-input').props.blurOnSubmit).toBeUndefined();
  });

  it('ignores Enter when the query is empty', () => {
    const onSelect = jest.fn();
    const { getByTestId } = renderAutoComplete({
      freeSolo: true,
      multiSelect: true,
      value: '',
      onSelect,
    });

    const preventDefault = pressEnter(getByTestId('ac-input'));

    expect(onSelect).not.toHaveBeenCalled();
    // Nothing committed → default submit is left untouched.
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
