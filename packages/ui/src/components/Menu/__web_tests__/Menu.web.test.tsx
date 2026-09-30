import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Menu } from '../Menu';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

// jsdom has no layout; give every element a box so the positioner can place
// the menu (an unmeasurable anchor keeps it closed).
const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 180, bottom: 80, width: 160, height: 40, toJSON: () => ({}) } as DOMRect;
  };
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalRect;
});

beforeEach(() => __resetLayerStackForTests());

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function withOverlays(ui: React.ReactElement) {
  return (
    <OverlayProvider>
      {ui}
      <OverlayRenderer />
    </OverlayProvider>
  );
}

function Actions({ onRename = jest.fn(), ...props }: Partial<React.ComponentProps<typeof Menu>> & { onRename?: () => void }) {
  return (
    <Menu {...props}>
      <Pressable role="button" accessibilityLabel="Actions">
        <Text>Actions</Text>
      </Pressable>
      <Menu.Dropdown>
        <Menu.Item onPress={onRename}>Rename</Menu.Item>
        <Menu.Item disabled>Archive</Menu.Item>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item>Delete</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

const menuItem = (name: string) => screen.getByRole('menuitem', { name });

async function openWithClick(name = 'Actions') {
  const trigger = screen.getByRole('button', { name });
  act(() => trigger.focus());
  fireEvent.click(trigger);
  await settle();
  return trigger;
}

describe('Menu (react-native-web DOM)', () => {
  it('wires the trigger (aria-haspopup / aria-expanded / aria-controls) to a role="menu" of menuitems', async () => {
    render(withOverlays(<Actions />));
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await openWithClick();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const menu = screen.getByRole('menu');
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(menuItem('Archive').getAttribute('aria-disabled')).toBe('true');
    // Menu items are not tab stops; arrow keys move between them.
    expect(menuItem('Rename').getAttribute('tabindex')).toBe('-1');
  });

  it('focuses the first item on open, moves with the arrow keys (skipping disabled, looping) and supports typeahead', async () => {
    render(withOverlays(<Actions />));
    await openWithClick();
    expect(document.activeElement).toBe(menuItem('Rename'));

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItem('Duplicate'));
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toBe(menuItem('Delete'));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItem('Rename'));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(menuItem('Delete'));
    fireEvent.keyDown(document.activeElement!, { key: 'd' });
    expect(document.activeElement).toBe(menuItem('Duplicate'));
  });

  it('ArrowUp on the trigger opens the menu on its last item', async () => {
    render(withOverlays(<Actions />));
    const trigger = screen.getByRole('button', { name: 'Actions' });
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    await settle();
    expect(document.activeElement).toBe(menuItem('Delete'));
  });

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const onClose = jest.fn();
    render(withOverlays(<Actions onClose={onClose} />));
    const trigger = await openWithClick();

    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('activating an item runs it, closes the menu and restores focus', async () => {
    const onRename = jest.fn();
    render(withOverlays(<Actions onRename={onRename} />));
    const trigger = await openWithClick();

    fireEvent.click(menuItem('Rename'));
    await settle();
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab closes the menu (menus are not in the tab sequence)', async () => {
    render(withOverlays(<Actions />));
    await openWithClick();
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    await settle();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens a submenu with ArrowRight and closes only it with ArrowLeft / Escape', async () => {
    render(withOverlays(
      <Menu>
        <Pressable role="button" accessibilityLabel="Actions"><Text>Actions</Text></Pressable>
        <Menu.Dropdown>
          <Menu.Item>Rename</Menu.Item>
          <Menu.Sub label="Share">
            <Menu.Item>Copy link</Menu.Item>
            <Menu.Item>Email</Menu.Item>
          </Menu.Sub>
        </Menu.Dropdown>
      </Menu>
    ));
    await openWithClick();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    const share = menuItem('Share');
    expect(document.activeElement).toBe(share);
    expect(share.getAttribute('aria-haspopup')).toBe('menu');
    expect(share.getAttribute('aria-expanded')).toBe('false');

    fireEvent.keyDown(share, { key: 'ArrowRight' });
    await settle();
    expect(share.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    expect(document.activeElement).toBe(menuItem('Copy link'));

    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    await settle();
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement).toBe(menuItem('Share'));

    fireEvent.keyDown(menuItem('Share'), { key: 'ArrowRight' });
    await settle();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await settle();
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement).toBe(menuItem('Share'));
  });
});
