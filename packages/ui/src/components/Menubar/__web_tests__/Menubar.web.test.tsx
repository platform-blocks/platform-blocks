import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Menubar } from '../Menubar';
import { Menu } from '../../Menu';
const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => { Element.prototype.getBoundingClientRect = () => ({ x: 20, y: 40, top: 40, left: 20, right: 220, bottom: 80, width: 200, height: 40, toJSON: () => ({}) }) as DOMRect; });
afterAll(() => { Element.prototype.getBoundingClientRect = originalRect; });
it('switches menus with horizontal arrows from the dropdown', async () => {
  render(<PlocksProvider><Menubar><Menubar.Menu><Menubar.Target>File</Menubar.Target><Menubar.Dropdown><Menu.Item>New</Menu.Item></Menubar.Dropdown></Menubar.Menu><Menubar.Menu><Menubar.Target>Edit</Menubar.Target><Menubar.Dropdown><Menu.Item>Undo</Menu.Item></Menubar.Dropdown></Menubar.Menu></Menubar></PlocksProvider>);
  expect(screen.getByRole('menubar')).toBeTruthy();
  fireEvent.click(screen.getByRole('menuitem', { name: 'File' }));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 150)); });
  fireEvent.keyDown(screen.getByRole('menuitem', { name: 'New' }), { key: 'ArrowRight' });
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 150)); });
  expect(screen.getByRole('menuitem', { name: 'Undo' })).toBeTruthy();
});
