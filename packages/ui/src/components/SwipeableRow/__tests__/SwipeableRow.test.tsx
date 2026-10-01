import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { SwipeableRow } from '../SwipeableRow';

describe('SwipeableRow', () => {
  it('provides a visible action path and closes it after activation', () => {
    const onPress = jest.fn();
    render(<SwipeableRow endActions={[{ key: 'delete', label: 'Delete', onPress }]}><Text>Message</Text></SwipeableRow>);
    fireEvent.press(screen.getByLabelText('Show row actions'));
    fireEvent.press(screen.getByLabelText('Delete'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('Delete')).toBeNull();
    expect(screen.getByText('Message')).toBeTruthy();
  });
});
