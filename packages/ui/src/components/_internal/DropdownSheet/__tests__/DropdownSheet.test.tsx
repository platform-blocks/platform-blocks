import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { DropdownSheet } from '../DropdownSheet';
import { Popover } from '../../../Popover';
import { __resetLayerStackForTests, handleBackPress, handleModalRequestClose } from '../../../../core/overlay/layerStack';
import { measureElement } from '../../../../core/utils/positioning-enhanced';

jest.mock('../../../../core/utils/positioning-enhanced', () => {
  const actual = jest.requireActual('../../../../core/utils/positioning-enhanced');
  return { ...actual, measureElement: jest.fn() };
});

const mockedMeasure = measureElement as jest.MockedFunction<typeof measureElement>;

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function renderSheet(props: Partial<React.ComponentProps<typeof DropdownSheet>> = {}) {
  const onClose = jest.fn();
  const utils = render(
    <DropdownSheet opened onClose={onClose} title="Choose a color" testID="sheet" {...props}>
      {props.children ?? <Text>Swatches</Text>}
    </DropdownSheet>
  );
  return { ...utils, onClose };
}

describe('DropdownSheet', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    mockedMeasure.mockResolvedValue({ x: 20, y: 100, width: 160, height: 40 });
  });

  it('renders a modal dialog named by its title', () => {
    const { getByTestId, getByText } = renderSheet();
    const card = getByTestId('sheet-content');
    expect(card.props.role).toBe('dialog');
    expect(card.props['aria-label']).toBe('Choose a color');
    expect(card.props.accessibilityViewIsModal).toBe(true);
    expect(getByText('Swatches')).toBeTruthy();
  });

  it('closes from the labelled close button and the backdrop', () => {
    const { getByTestId, onClose } = renderSheet({ closeButtonLabel: 'Done' });
    const close = getByTestId('sheet-close');
    expect(close.props['aria-label'] ?? close.props.accessibilityLabel).toBe('Done');
    fireEvent.press(close);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('sheet-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('keeps the backdrop press inert with closeOnBackdropPress={false}', () => {
    const { getByTestId, onClose } = renderSheet({ closeOnBackdropPress: false });
    fireEvent.press(getByTestId('sheet-backdrop', { includeHiddenElements: true }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('routes Android back (Modal onRequestClose) through the layer stack', () => {
    const { onClose } = renderSheet();
    act(() => {
      handleModalRequestClose();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('swallows Android back without closing when closeOnEscape is false', () => {
    const { onClose } = renderSheet({ closeOnEscape: false });
    act(() => {
      expect(handleBackPress()).toBe(true);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hosts floating content opened inside it, which closes first on back', async () => {
    const { getByTestId, queryByText, onClose } = renderSheet({
      children: (
        <Popover>
          <Popover.Target>
            <Pressable testID="inner-trigger"><Text>More</Text></Pressable>
          </Popover.Target>
          <Popover.Dropdown>
            <Text>Inner popover</Text>
          </Popover.Dropdown>
        </Popover>
      ),
    });
    fireEvent.press(getByTestId('inner-trigger'));
    await settle();
    expect(queryByText('Inner popover')).toBeTruthy();

    act(() => {
      handleBackPress();
    });
    await settle();
    expect(queryByText('Inner popover')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders nothing visible when closed', () => {
    const { queryByText } = renderSheet({ opened: false });
    expect(queryByText('Swatches')).toBeNull();
  });
});
