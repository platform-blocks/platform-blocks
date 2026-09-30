import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../../Button';
import { ComboboxPopover } from '../ComboboxPopover';
it('opens from its target', () => {
  const view = render(<ComboboxPopover data={['Apple', 'Banana']}><ComboboxPopover.Target><Button>Choose</Button></ComboboxPopover.Target></ComboboxPopover>);
  fireEvent.press(view.getByText('Choose'));
  expect(view.getByText('Apple')).toBeTruthy();
});
it('selects by touch and reports the new value', () => {
  const onChange = jest.fn();
  const view = render(<ComboboxPopover data={['Apple', 'Banana']} onChange={onChange}><ComboboxPopover.Target><Button>Choose</Button></ComboboxPopover.Target></ComboboxPopover>);
  fireEvent.press(view.getByText('Choose'));
  fireEvent.press(view.getByText('Banana'));
  expect(onChange).toHaveBeenCalledWith('Banana', expect.objectContaining({ value: 'Banana' }));
});
