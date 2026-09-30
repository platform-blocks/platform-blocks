import React from 'react';
import { Modal, Pressable, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { Menu, MenuDropdown, MenuItem, MenuSub } from '../Menu';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests, handleBackPress } from '../../../core/overlay/layerStack';
import { resetWarnOnce } from '../../../core/utils/logger';
import { measureElement } from '../../../core/utils/positioning-enhanced';

jest.mock('../../../core/utils/positioning-enhanced', () => {
  const actual = jest.requireActual('../../../core/utils/positioning-enhanced');
  return { ...actual, measureElement: jest.fn() };
});

const mockedMeasure = measureElement as jest.MockedFunction<typeof measureElement>;

function withOverlays(ui: React.ReactElement) {
  return (
    <OverlayProvider>
      {ui}
      <OverlayRenderer />
    </OverlayProvider>
  );
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function flatStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
  return Object.assign({}, ...(style.flat(Infinity) as object[]).filter(Boolean));
}

function collectMaxHeights(node: any, found: number[] = []): number[] {
  if (Array.isArray(node)) {
    node.forEach((child) => collectMaxHeights(child, found));
    return found;
  }
  if (!node || typeof node !== 'object') return found;
  const value = flatStyle(node.props?.style).maxHeight;
  if (typeof value === 'number') found.push(value);
  for (const child of node.children ?? []) collectMaxHeights(child, found);
  return found;
}

const renderMenu = (extraProps: Partial<React.ComponentProps<typeof Menu>> = {}, onDelete = jest.fn()) => (
  <Menu {...extraProps}>
    <Pressable testID="trigger">
      <Text>Open Menu</Text>
    </Pressable>
    <MenuDropdown>
      <MenuItem testID="menu-edit">Edit</MenuItem>
      <MenuItem testID="menu-delete" onPress={onDelete}>Delete</MenuItem>
    </MenuDropdown>
  </Menu>
);

describe('Menu', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    resetWarnOnce();
    mockedMeasure.mockResolvedValue({ x: 20, y: 100, width: 160, height: 40 });
  });

  it('renders inline (no OverlayProvider) and never throws', () => {
    const { getByTestId, queryByText, getByText } = render(renderMenu());
    expect(queryByText('Edit')).toBeNull();
    fireEvent.press(getByTestId('trigger'));
    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('opens through the overlay renderer and runs + closes on item press', async () => {
    const onDelete = jest.fn();
    const onClose = jest.fn();
    const { getByTestId, queryByText, getByText } = render(withOverlays(renderMenu({ onClose }, onDelete)));

    fireEvent.press(getByTestId('trigger'));
    await settle();
    expect(getByText('Delete')).toBeTruthy();
    const trigger = getByTestId('trigger');
    expect(trigger.props['aria-expanded'] ?? trigger.props.accessibilityState?.expanded).toBe(true);

    fireEvent.press(getByText('Delete'));
    await settle();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByText('Delete')).toBeNull();
  });

  it('gives items role="menuitem" and the dropdown role="menu"', async () => {
    const { getByTestId, UNSAFE_root } = render(withOverlays(renderMenu()));
    fireEvent.press(getByTestId('trigger'));
    await settle();
    const menus = UNSAFE_root.findAll((node: any) => node.props?.role === 'menu' && typeof node.type === 'string');
    expect(menus.length).toBeGreaterThan(0);
    const items = UNSAFE_root.findAll((node: any) => node.props?.role === 'menuitem' && typeof node.type === 'string');
    expect(items.length).toBe(2);
  });

  it('does not open when disabled', async () => {
    const { getByTestId, queryByText } = render(withOverlays(renderMenu({ disabled: true })));
    fireEvent.press(getByTestId('trigger'));
    await settle();
    expect(queryByText('Edit')).toBeNull();
  });

  it('honours controlled `opened`', async () => {
    const { queryByText, rerender } = render(withOverlays(renderMenu({ opened: true })));
    await settle();
    expect(queryByText('Edit')).toBeTruthy();
    rerender(withOverlays(renderMenu({ opened: false })));
    await settle();
    expect(queryByText('Edit')).toBeNull();
  });

  it('Android back closes the menu', async () => {
    const { getByTestId, queryByText } = render(withOverlays(renderMenu()));
    fireEvent.press(getByTestId('trigger'));
    await settle();
    expect(queryByText('Edit')).toBeTruthy();

    act(() => {
      expect(handleBackPress()).toBe(true);
    });
    await settle();
    expect(queryByText('Edit')).toBeNull();
  });

  it('caps the rendered list at maxH', async () => {
    const { getByTestId, toJSON } = render(withOverlays(
      <Menu mah={150}>
        <Pressable testID="trigger"><Text>Open</Text></Pressable>
        <MenuDropdown>
          {Array.from({ length: 20 }, (_, i) => <MenuItem key={i}>{`Item ${i}`}</MenuItem>)}
        </MenuDropdown>
      </Menu>
    ));
    fireEvent.press(getByTestId('trigger'));
    await settle();
    const heights = collectMaxHeights(toJSON());
    expect(heights).toContain(150);
    expect(heights).not.toContain(300);
  });

  it('sizes the dropdown with w / mah, never the root', async () => {
    const { getByTestId } = render(withOverlays(
      <Menu testID="root" w={220} mah={150} m={4}>
        <Pressable testID="trigger"><Text>Open</Text></Pressable>
        <MenuDropdown testID="dropdown">
          <MenuItem>Edit</MenuItem>
          <MenuSub label="Share" testID="share" w={260} mah={120}>
            <MenuItem>Copy link</MenuItem>
          </MenuSub>
        </MenuDropdown>
      </Menu>
    ));
    const root = flatStyle(getByTestId('root').props.style);
    expect(root.marginTop).toBe(4);
    expect(root.width).toBeUndefined();
    expect(root.maxHeight).toBeUndefined();
    fireEvent.press(getByTestId('trigger'));
    await settle();
    expect(flatStyle(getByTestId('dropdown').props.style).width).toBe(220);
    const share = flatStyle(getByTestId('share').props.style);
    expect(share.width).not.toBe(260);
    expect(share.maxHeight).not.toBe(120);
  });

  it('opens a context menu on long press (native)', async () => {
    const { getByTestId, getByText } = render(withOverlays(renderMenu({ trigger: 'contextmenu' })));
    fireEvent(getByTestId('trigger'), 'longPress', { nativeEvent: { pageX: 40, pageY: 60 } });
    await settle();
    expect(getByText('Edit')).toBeTruthy();
  });

  it('renders a submenu inside the parent menu\'s native Modal (nested host), not a second root Modal', async () => {
    const { getByTestId, getByText, UNSAFE_root } = render(withOverlays(
      <Menu>
        <Pressable testID="trigger"><Text>Open</Text></Pressable>
        <MenuDropdown>
          <MenuItem>Rename</MenuItem>
          <MenuSub label="Share" testID="share">
            <MenuItem>Copy link</MenuItem>
          </MenuSub>
        </MenuDropdown>
      </Menu>
    ));
    fireEvent.press(getByTestId('trigger'));
    await settle();
    fireEvent.press(getByTestId('share'));
    await settle();
    const copy = getByText('Copy link');
    const modals = UNSAFE_root.findAll((node: any) => node.type === Modal);
    expect(modals).toHaveLength(1);
    let node: any = copy;
    let insideModal = false;
    while (node) {
      if (node.type === Modal) insideModal = true;
      node = node.parent;
    }
    expect(insideModal).toBe(true);
  });

  it('exposes typed compound members', () => {
    expect(Menu.Item).toBe(MenuItem);
    expect(Menu.Dropdown).toBe(MenuDropdown);
    expect(Menu.Sub).toBeDefined();
  });
});
