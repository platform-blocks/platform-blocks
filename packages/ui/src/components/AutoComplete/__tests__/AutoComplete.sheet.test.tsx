/**
 * AutoComplete's mobile presentation (native / small screens): the field opens
 * the shared centered DropdownSheet, with its own input and list.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { FieldHandle } from '../../../core/types/base';
import { AutoComplete } from '../AutoComplete';
import type { AutoCompleteOption } from '../types';

jest.mock('../../Icon', () => {
  const { View } = require('react-native');
  return { Icon: () => <View /> };
});

const data: AutoCompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

const a11yState = (node: { props: Record<string, unknown> }) =>
  (node.props.accessibilityState as { selected?: boolean } | undefined) ?? {};

describe('AutoComplete — sheet presentation', () => {
  it('opens the sheet from the field and selects from it', () => {
    const onSelect = jest.fn();
    const onChangeText = jest.fn();
    render(
      <AutoComplete
        label="Fruit"
        data={data}
        useModal
        minSearchLength={1}
        testID="ac"
        onSelect={onSelect}
        onChangeText={onChangeText}
        displayProperty="label"
      />
    );

    fireEvent(screen.getByTestId('ac'), 'focus');
    // The sheet has its own labelled input and the full list.
    expect(screen.getByTestId('ac-sheet-input')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(3);

    fireEvent.changeText(screen.getByTestId('ac-sheet-input'), 'ban');
    expect(screen.getAllByRole('option').map((node) => node.props.accessibilityLabel ?? '')).toHaveLength(1);

    fireEvent.press(screen.getByText('Banana'));
    expect(onSelect).toHaveBeenCalledWith(data[1]);
    expect(onChangeText).toHaveBeenLastCalledWith('Banana');
    expect(screen.queryByTestId('ac-sheet-input')).toBeNull();
  });

  it('keeps the sheet open for multi-select picks', () => {
    const onSelect = jest.fn();
    render(
      <AutoComplete label="Fruit" data={data} useModal multiSelect selectedValues={[data[0]]} testID="ac" onSelect={onSelect} />
    );
    fireEvent(screen.getByTestId('ac'), 'focus');
    const apple = screen.getAllByRole('option')[0];
    expect(a11yState(apple).selected).toBe(true);

    fireEvent.press(screen.getAllByText('Banana')[0]);
    expect(onSelect).toHaveBeenCalledWith(data[1]);
    expect(screen.getByTestId('ac-sheet-input')).toBeTruthy();
  });

  it('closes from the labelled close button', () => {
    render(<AutoComplete label="Fruit" data={data} useModal testID="ac" />);
    fireEvent(screen.getByTestId('ac'), 'focus');
    fireEvent.press(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('ac-sheet-input')).toBeNull();
  });

  it('shows the minimum-length hint until enough is typed', () => {
    render(<AutoComplete label="Fruit" data={data} useModal showSuggestionsOnFocus={false} minSearchLength={2} testID="ac" />);
    fireEvent(screen.getByTestId('ac'), 'focus');
    expect(screen.getByText('Type 2 or more characters to search')).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('ac-sheet-input'), 'zz');
    expect(screen.getByText('No suggestions found')).toBeTruthy();
  });
});

describe('AutoComplete — field', () => {
  it('is a combobox input wired to the field label and error', () => {
    render(<AutoComplete label="Fruit" data={data} error="Required" useModal={false} testID="ac" />);
    const input = screen.getByTestId('ac');
    expect(input.props.role).toBe('combobox');
    expect(input.props['aria-label']).toBe('Fruit');
    expect(input.props.accessibilityHint).toBe('Required');
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('exposes a FieldHandle ref that clears the query', () => {
    const ref = React.createRef<FieldHandle>();
    const onChangeText = jest.fn();
    render(<AutoComplete ref={ref} label="Fruit" data={data} defaultValue="app" onChangeText={onChangeText} testID="ac" />);
    expect(screen.getByTestId('ac').props.value).toBe('app');
    ref.current?.clear?.();
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('commits a free-form value on Enter with freeSolo', () => {
    const onSelect = jest.fn();
    render(<AutoComplete data={[]} freeSolo value="Kiwi Fruit" onSelect={onSelect} useModal={false} testID="ac" />);
    fireEvent(screen.getByTestId('ac'), 'keyPress', { nativeEvent: { key: 'Enter' }, preventDefault: jest.fn() });
    expect(onSelect).toHaveBeenCalledWith({ label: 'Kiwi Fruit', value: 'kiwi-fruit' });
  });

  it('calls onEnter when Enter commits nothing', () => {
    const onEnter = jest.fn();
    render(<AutoComplete data={data} value="x" onEnter={onEnter} useModal={false} testID="ac" />);
    fireEvent(screen.getByTestId('ac'), 'keyPress', { nativeEvent: { key: 'Enter' } });
    expect(onEnter).toHaveBeenCalled();
  });
});
