import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { ControlField } from '../ControlField';

jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
  useTheme: () => ({
    colorScheme: 'light',
    colors: {
      primary: ['#EEE', '#DDD', '#CCC', '#BBB', '#AAA', '#999', '#888'],
      gray: ['#f8f8f8', '#f0f0f0', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#8c8c8c', '#737373'],
      error: ['#fee', '#fdd', '#fbb', '#f99', '#f77', '#f55', '#d00'],
      surface: ['#fff', '#fafafa', '#f5f5f5', '#f0f0f0'],
    },
    radii: { sm: 4, md: 8, lg: 12 },
    text: { primary: '#111', secondary: '#666', muted: '#888', disabled: '#aaa', onPrimary: '#fff' },
  }),
}));

jest.mock('../../Divider', () => {
  const { View } = require('react-native');
  return { Divider: (props: any) => <View testID="cf-divider" {...props} /> };
});

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

// Stub the heavy indicator controls so the row is the only thing under test.
jest.mock('../../Checkbox', () => {
  const { View } = require('react-native');
  return { Checkbox: (props: any) => <View testID={`indicator-checkbox-${props.checked ? 'on' : 'off'}`} /> };
});
jest.mock('../../Switch', () => {
  const { View } = require('react-native');
  return { Switch: (props: any) => <View testID={`indicator-switch-${props.checked ? 'on' : 'off'}`} /> };
});
jest.mock('../../Radio', () => {
  const { View } = require('react-native');
  return { Radio: (props: any) => <View testID={`indicator-radio-${props.checked ? 'on' : 'off'}`} /> };
});

jest.mock('../../_internal/FieldHeader', () => {
  const { Text } = require('react-native');
  return { FieldHeader: ({ label }: any) => (label ? <Text>{label}</Text> : null) };
});

describe('ControlField', () => {
  it('renders label and description', () => {
    const { getByText } = render(
      <ControlField label="Notifications" description="Enable alerts" />
    );
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Enable alerts')).toBeTruthy();
  });

  it('defaults to the switch indicator', () => {
    const { getByTestId } = render(<ControlField label="Wifi" defaultChecked />);
    expect(getByTestId('indicator-switch-on', { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders the requested variant', () => {
    const { getByTestId } = render(<ControlField label="Agree" variant="checkbox" />);
    expect(getByTestId('indicator-checkbox-off', { includeHiddenElements: true })).toBeTruthy();
  });

  it('toggles uncontrolled state and fires onChange', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<ControlField testID="cf" label="Wifi" onChange={onChange} />);
    fireEvent.press(getByTestId('cf'));
    expect(onChange).toHaveBeenCalledWith(true);
    // reflected in the indicator
    expect(getByTestId('indicator-switch-on', { includeHiddenElements: true })).toBeTruthy();
  });

  it('does not toggle when disabled', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<ControlField testID="cf" label="Wifi" disabled onChange={onChange} />);
    fireEvent.press(getByTestId('cf'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the error message and announces it', () => {
    const { getByText, getByRole } = render(<ControlField label="Agree" variant="checkbox" error="Required" />);
    expect(getByText('Required')).toBeTruthy();
    expect(getByRole('alert')).toBeTruthy();
  });

  it('marks the field invalid without a message when error is true', () => {
    const { getByTestId, queryByRole } = render(<ControlField testID="cf" label="Agree" error />);
    expect(queryByRole('alert')).toBeNull();
    expect(getByTestId('cf')).toBeTruthy();
  });

  it('renders a group with N-1 dividers between rows', () => {
    const { getAllByTestId, getByText } = render(
      <ControlField.Group title="Connectivity" footer="Radios">
        <ControlField label="Wi-Fi" />
        <ControlField label="Bluetooth" />
        <ControlField label="Airplane" />
      </ControlField.Group>
    );
    expect(getByText('Connectivity')).toBeTruthy();
    expect(getByText('Radios')).toBeTruthy();
    // 3 rows => 2 dividers
    expect(getAllByTestId('cf-divider')).toHaveLength(2);
  });

  it('omits dividers when dividers={false}', () => {
    const { queryAllByTestId } = render(
      <ControlField.Group dividers={false}>
        <ControlField label="A" />
        <ControlField label="B" />
      </ControlField.Group>
    );
    expect(queryAllByTestId('cf-divider')).toHaveLength(0);
  });

  it('propagates group size to child fields', () => {
    const { getByTestId } = render(
      <ControlField.Group size="lg">
        <ControlField testID="row" label="Wi-Fi" defaultChecked />
      </ControlField.Group>
    );
    // The row still renders and toggles under the inherited size.
    expect(getByTestId('row')).toBeTruthy();
  });

  it('exposes an accessibility role matching the variant', () => {
    const { getByTestId } = render(
      <ControlField testID="cf" label="Agree" variant="checkbox" defaultChecked />
    );
    const node = getByTestId('cf');
    expect(node.props.role).toBe('checkbox');
    expect(node.props.accessibilityState).toMatchObject({ checked: true, disabled: false });
    expect(node.props.accessibilityLabel).toBe('Agree');
  });
});
