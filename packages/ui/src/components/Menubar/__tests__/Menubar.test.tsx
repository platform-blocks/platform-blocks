import React from 'react';
import { render } from '@testing-library/react-native';
import { Menubar } from '../Menubar';
import { Menu } from '../../Menu';
it('renders menu targets', () => {
  const view = render(<Menubar><Menubar.Menu><Menubar.Target>File</Menubar.Target><Menubar.Dropdown><Menu.Item>New</Menu.Item></Menubar.Dropdown></Menubar.Menu></Menubar>);
  expect(view.getByText('File')).toBeTruthy();
});
