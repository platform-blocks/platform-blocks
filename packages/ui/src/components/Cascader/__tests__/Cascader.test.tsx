import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Cascader } from '../Cascader';
it('renders its labelled field', () => {
  const view = render(<Cascader label="Location" data={[{ value: 'paris', label: 'Paris' }]} />);
  expect(view.getByText('Location')).toBeTruthy();
});
it('selects a path by touch in the native sheet', () => {
  const onChange = jest.fn();
  const view = render(<Cascader label="Location" data={[{ value: 'europe', label: 'Europe', children: [{ value: 'paris', label: 'Paris' }] }]} onChange={onChange} />);
  fireEvent.press(view.getByText('Select…'));
  fireEvent.press(view.getByText('Europe / Paris'));
  expect(onChange).toHaveBeenCalledWith(['europe', 'paris'], expect.any(Array));
});
