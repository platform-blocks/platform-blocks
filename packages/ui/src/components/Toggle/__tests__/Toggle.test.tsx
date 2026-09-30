import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ToggleButton, ToggleGroup } from '../Toggle';

const mockPalette = {
  colors: {
    primary: ['#F0F5FF', '#D6E4FF', '#ADC6FF', '#85A5FF', '#597EF7', '#2F54EB', '#1D39C4', '#10239E'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
    success: ['#F0FFF4', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749'],
    warning: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309'],
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  const { DEFAULT_THEME } = jest.requireActual('../../../core/theme/defaultTheme');
  let theme: unknown;
  return {
    ...actual,
    // Built lazily: this factory runs before the module-scope palette is initialized.
    useTheme: () => (theme ??= { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, ...mockPalette.colors } }),
  };
});

jest.mock('../../Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => React.createElement(Text, props, children),
  };
});

describe('Toggle - behavior', () => {
  it('calls onPress with value for standalone button', () => {
    const handlePress = jest.fn();
    const { getByTestId } = render(
      <ToggleButton value="daily" onPress={handlePress} testID="toggle-daily">
        Daily
      </ToggleButton>
    );

    fireEvent.press(getByTestId('toggle-daily'));
    expect(handlePress).toHaveBeenCalledWith('daily');
  });

  it('does not call onPress when disabled', () => {
    const handlePress = jest.fn();
    const { getByTestId } = render(
      <ToggleButton value="daily" onPress={handlePress} disabled testID="toggle-disabled">
        Daily
      </ToggleButton>
    );

    fireEvent.press(getByTestId('toggle-disabled'));
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('drives onChange in exclusive groups', () => {
    const handleChange = jest.fn();
    const { getByTestId, rerender } = render(
      <ToggleGroup exclusive value="daily" onChange={handleChange}>
        <ToggleButton value="daily" testID="exclusive-daily">Daily</ToggleButton>
        <ToggleButton value="weekly" testID="exclusive-weekly">Weekly</ToggleButton>
      </ToggleGroup>
    );

    fireEvent.press(getByTestId('exclusive-weekly'));
    expect(handleChange).toHaveBeenCalledWith('weekly');

    handleChange.mockClear();
    rerender(
      <ToggleGroup exclusive value="weekly" onChange={handleChange}>
        <ToggleButton value="daily" testID="exclusive-daily">Daily</ToggleButton>
        <ToggleButton value="weekly" testID="exclusive-weekly">Weekly</ToggleButton>
      </ToggleGroup>
    );

    fireEvent.press(getByTestId('exclusive-weekly'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('deselects and accumulates values in multi-select mode', () => {
    const handleChange = jest.fn();
    const { getByTestId, rerender } = render(
      <ToggleGroup value={['daily']} onChange={handleChange}>
        <ToggleButton value="daily" testID="multi-daily">Daily</ToggleButton>
        <ToggleButton value="weekly" testID="multi-weekly">Weekly</ToggleButton>
      </ToggleGroup>
    );

    fireEvent.press(getByTestId('multi-weekly'));
    expect(handleChange).toHaveBeenCalledWith(['daily', 'weekly']);

    handleChange.mockClear();
    rerender(
      <ToggleGroup value={['daily', 'weekly']} onChange={handleChange}>
        <ToggleButton value="daily" testID="multi-daily">Daily</ToggleButton>
        <ToggleButton value="weekly" testID="multi-weekly">Weekly</ToggleButton>
      </ToggleGroup>
    );

    fireEvent.press(getByTestId('multi-daily'));
    expect(handleChange).toHaveBeenCalledWith(['weekly']);
  });

  it('respects required exclusive toggles by blocking deselect', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <ToggleGroup exclusive required value="daily" onChange={handleChange}>
        <ToggleButton value="daily" testID="required-daily">Daily</ToggleButton>
      </ToggleGroup>
    );

    fireEvent.press(getByTestId('required-daily'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('inherits disabled state from the group', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <ToggleGroup disabled value={['daily']} onChange={handleChange}>
        <ToggleButton value="daily" testID="group-disabled-daily">Daily</ToggleButton>
      </ToggleGroup>
    );

    fireEvent.press(getByTestId('group-disabled-daily'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports uncontrolled groups via defaultValue', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <ToggleGroup defaultValue={['daily']} onChange={handleChange}>
        <ToggleButton value="daily" testID="u-daily">Daily</ToggleButton>
        <ToggleButton value="weekly" testID="u-weekly">Weekly</ToggleButton>
      </ToggleGroup>
    );

    const fill = (id: string) => StyleSheet.flatten(getByTestId(id).props.style).backgroundColor;
    const unselectedFill = fill('u-weekly');
    expect(fill('u-daily')).not.toBe(unselectedFill);
    fireEvent.press(getByTestId('u-weekly'));
    expect(handleChange).toHaveBeenCalledWith(['daily', 'weekly']);
    // No `value` prop, so the group updated itself.
    expect(fill('u-weekly')).toBe(fill('u-daily'));
  });

  it('uses radio semantics for exclusive groups', () => {
    const group = render(
      <ToggleGroup exclusive value="left" accessibilityLabel="Alignment">
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleGroup>
    );
    expect(group.getByRole('radio', { name: 'Left', checked: true })).toBeTruthy();
    expect(group.getByRole('radio', { name: 'Right', checked: false })).toBeTruthy();
  });

  it('sizes a ToggleButton with the box props; an explicit `w` wins over `fullWidth`', () => {
    const { getByTestId } = render(<ToggleButton testID="bold" value="bold" fullWidth w={80}>B</ToggleButton>);
    expect(StyleSheet.flatten(getByTestId('bold').props.style).width).toBe(80);
  });

  it('sizes the ToggleGroup box and keeps spacing on its outer wrapper', () => {
    const { getByTestId, toJSON } = render(
      <ToggleGroup testID="group" m={12} fullWidth w={200} h={48}>
        <ToggleButton value="a">A</ToggleButton>
      </ToggleGroup>
    );
    const group = StyleSheet.flatten(getByTestId('group').props.style);
    const wrapper = StyleSheet.flatten((toJSON() as any).props.style);
    expect(group).toMatchObject({ width: 200, height: 48 });
    expect(group.marginTop).toBeUndefined();
    expect(wrapper.marginTop).toBe(12);
    expect(wrapper.width).toBeUndefined();
  });
});
