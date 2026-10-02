import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { FloatingActions } from '../FloatingActions';

describe('FloatingActions', () => {
  it('opens a labelled action, runs it, and closes the dial', () => {
    const onPress = jest.fn();
    const onChange = jest.fn();
    render(<FloatingActions actions={[{ key: 'save', icon: 'check', accessibilityLabel: 'Save item', onPress }]} onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('Open actions'));
    expect(screen.getByLabelText('Save item')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Save item'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([true, false]);
    expect(screen.queryByLabelText('Save item')).toBeNull();
  });
});
