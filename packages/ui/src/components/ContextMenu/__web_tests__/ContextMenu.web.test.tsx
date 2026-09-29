import React from 'react';
import { View, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { ContextMenu } from '../ContextMenu';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 220, bottom: 140, width: 200, height: 100, toJSON: () => ({}) } as DOMRect;
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

const onCopy = jest.fn();
const ITEMS = [
  { id: 'copy', label: 'Copy', onSelect: onCopy },
  { id: 'delete', label: 'Delete', danger: true },
];

function Area() {
  return (
    <OverlayProvider>
      <ContextMenu items={ITEMS}>
        {(triggerProps) => (
          <View {...triggerProps} tabIndex={0} accessibilityLabel="File" role="group">
            <Text>report.pdf</Text>
          </View>
        )}
      </ContextMenu>
      <OverlayRenderer />
    </OverlayProvider>
  );
}

describe('ContextMenu (react-native-web DOM)', () => {
  it('opens on right-click as role="menu" with menuitems, focused on the first item', async () => {
    render(<Area />);
    const area = screen.getByRole('group', { name: 'File' });
    expect(area.getAttribute('aria-haspopup')).toBe('menu');
    fireEvent.contextMenu(area, { clientX: 60, clientY: 80 });
    await settle();
    const menu = screen.getByRole('menu', { name: 'Context menu' });
    expect(menu).toBeTruthy();
    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['Copy', 'Delete']);
    expect(document.activeElement).toBe(items[0]);

    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
  });

  it('opens from the keyboard with Shift+F10 and closes with Escape, returning focus', async () => {
    render(<Area />);
    const area = screen.getByRole('group', { name: 'File' });
    act(() => area.focus());
    fireEvent.keyDown(area, { key: 'F10', shiftKey: true });
    await settle();
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(area);
  });

  it('selecting an item runs it and closes', async () => {
    render(<Area />);
    fireEvent.contextMenu(screen.getByRole('group', { name: 'File' }), { clientX: 60, clientY: 80 });
    await settle();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    await settle();
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
