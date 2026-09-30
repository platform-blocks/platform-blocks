import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TreeSelect } from '../TreeSelect';
it('renders the field label', () => {
  const view = render(<TreeSelect label="Food" data={[{ id: 'apple', label: 'Apple' }]} />);
  expect(view.getByText('Food')).toBeTruthy();
});
it('opens and selects a leaf by touch', () => {
  const onChange = jest.fn();
  const view = render(<TreeSelect label="Food" data={[{ id: 'apple', label: 'Apple' }]} onChange={onChange} />);
  fireEvent.press(view.getByText('Select…'));
  fireEvent.press(view.getByText('Apple'));
  expect(onChange).toHaveBeenCalledWith('apple');
});
