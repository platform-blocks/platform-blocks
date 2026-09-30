import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ActionBar } from '../ActionBar';
it('shows actions and closes from its button', () => {
  const onClose = jest.fn();
  const view = render(<ActionBar opened onClose={onClose} withinPortal={false}><ActionBar.Divider /><ActionBar.CloseButton /></ActionBar>);
  fireEvent.press(view.getByLabelText('Close'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
