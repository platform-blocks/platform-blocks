import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ContextMenu } from '../ContextMenu';
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

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

const ITEMS = [
  { id: 'copy', label: 'Copy', onSelect: jest.fn() },
  { id: 'rename', label: 'Rename', disabled: true },
  { id: 'delete', label: 'Delete', danger: true },
];

function renderMenu(props: Partial<React.ComponentProps<typeof ContextMenu>> = {}) {
  return render(
    <OverlayProvider>
      <ContextMenu items={ITEMS} longPressDelay={10} {...props}>
        {(triggerProps) => (
          <Pressable testID="area" {...triggerProps}>
            <Text>Long-press me</Text>
          </Pressable>
        )}
      </ContextMenu>
      <OverlayRenderer />
    </OverlayProvider>
  );
}

describe('ContextMenu', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    resetWarnOnce();
    mockedMeasure.mockImplementation((ref: any) => {
      const node = ref?.current;
      if (node && typeof node.measure === 'function' && !node._nativeTag && !node.props) {
        return new Promise((resolve) => node.measure((_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => resolve({ x: pageX, y: pageY, width, height })));
      }
      return Promise.resolve({ x: 20, y: 100, width: 200, height: 40 });
    });
  });

  it('opens on long press and selects an item', async () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const { getByTestId, queryByText, getByText } = renderMenu({ onOpen, onClose });
    fireEvent(getByTestId('area'), 'pressIn', { nativeEvent: { pageX: 40, pageY: 60 } });
    await settle();
    fireEvent(getByTestId('area'), 'pressOut');
    await settle();
    expect(getByText('Copy')).toBeTruthy();
    expect(onOpen).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Copy'));
    await settle();
    expect(ITEMS[0].onSelect).toHaveBeenCalledTimes(1);
    expect(queryByText('Copy')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a released press before the delay does not open it', async () => {
    const { getByTestId, queryByText } = renderMenu({ longPressDelay: 200 });
    fireEvent(getByTestId('area'), 'pressIn', { nativeEvent: { pageX: 40, pageY: 60 } });
    fireEvent(getByTestId('area'), 'pressOut');
    await settle();
    await settle();
    expect(queryByText('Copy')).toBeNull();
  });

  it('screen-reader actions open it', async () => {
    const { getByTestId, getByText } = renderMenu();
    const area = getByTestId('area');
    expect(area.props.accessibilityActions.map((a: { name: string }) => a.name)).toContain('longpress');
    fireEvent(area, 'accessibilityAction', { nativeEvent: { actionName: 'longpress' } });
    await settle();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('`opened` is canonical; `open` still works (deprecated)', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const legacy = renderMenu({ open: true });
    await settle();
    expect(legacy.getByText('Copy')).toBeTruthy();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('`open` is deprecated'));
    legacy.unmount();
    warn.mockRestore();

    const canonical = renderMenu({ opened: true, position: { x: 10, y: 10 } });
    await settle();
    expect(canonical.getByText('Copy')).toBeTruthy();
  });

  it('Android back closes it', async () => {
    const { queryByText } = renderMenu({ defaultOpened: true });
    await settle();
    expect(queryByText('Copy')).toBeTruthy();
    act(() => {
      handleBackPress();
    });
    await settle();
    expect(queryByText('Copy')).toBeNull();
  });
});
