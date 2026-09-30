import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../../Button';
import { Menu } from '../Menu';
it('toggles a checkbox item and selects a radio item', () => {
  const changed = jest.fn();
  const view = render(<Menu><Button>Open</Button><Menu.Dropdown><Menu.CheckboxItem defaultChecked={false} onChange={changed}>Pin</Menu.CheckboxItem><Menu.RadioGroup defaultValue="a"><Menu.RadioItem value="a">A</Menu.RadioItem><Menu.RadioItem value="b">B</Menu.RadioItem></Menu.RadioGroup></Menu.Dropdown></Menu>);
  fireEvent.press(view.getByText('Open'));
  fireEvent.press(view.getByText('Pin'));
  expect(changed).toHaveBeenCalledWith(true);
  fireEvent.press(view.getByText('B'));
  expect(view.getByText('B')).toBeTruthy();
});
