import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { HoverCard } from '../HoverCard';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests, handleBackPress } from '../../../core/overlay/layerStack';
import { resolveSurface } from '../../../core/theme/surfaces';
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
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

function withOverlays(ui: React.ReactElement) {
  return (
    <OverlayProvider>
      {ui}
      <OverlayRenderer />
    </OverlayProvider>
  );
}

const renderCard = (props: Partial<React.ComponentProps<typeof HoverCard>> = {}) =>
  render(withOverlays(
    <HoverCard
      testID="card"
      target={<Pressable testID="target"><Text>Trigger</Text></Pressable>}
      {...props}
    >
      <Text>Card body</Text>
    </HoverCard>
  ));

describe('HoverCard', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    mockedMeasure.mockResolvedValue({ x: 20, y: 100, width: 120, height: 32 });
  });

  it('puts the handlers on the target itself (no extra pressable wrapper)', () => {
    const { getByTestId, UNSAFE_root } = renderCard({ trigger: 'click' });
    expect(getByTestId('target')).toBeTruthy();
    const pressables = UNSAFE_root.findAll(
      (node: any) => typeof node.type === 'string' && typeof node.props?.onClick === 'function'
    );
    // Only the target is interactive.
    expect(pressables.length).toBeLessThanOrEqual(1);
  });

  it('sizes the card with w, not the wrapper', async () => {
    const { getByTestId } = renderCard({ trigger: 'click', w: 240 });
    expect(StyleSheet.flatten(getByTestId('card').props.style).width).toBeUndefined();
    fireEvent.press(getByTestId('target'));
    await settle();
    expect(StyleSheet.flatten(getByTestId('card-card').props.style)).toMatchObject({ minWidth: 240, maxWidth: 240 });
  });

  it('click trigger: a press toggles the card', async () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const { getByTestId, queryByText } = renderCard({ trigger: 'click', onOpen, onClose });
    fireEvent.press(getByTestId('target'));
    await settle();
    expect(queryByText('Card body')).toBeTruthy();
    expect(onOpen).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('target'));
    await settle();
    expect(queryByText('Card body')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hover trigger falls back to press on native, and opens on focus', async () => {
    const { getByTestId, queryByText } = renderCard({ openDelay: 0 });
    fireEvent(getByTestId('target'), 'focus');
    await settle();
    expect(queryByText('Card body')).toBeTruthy();
    fireEvent(getByTestId('target'), 'blur');
    await settle();
    expect(queryByText('Card body')).toBeNull();

    fireEvent.press(getByTestId('target'));
    await settle();
    expect(queryByText('Card body')).toBeTruthy();
  });

  it('Android back closes it; disabled never opens', async () => {
    const { getByTestId, queryByText } = renderCard({ trigger: 'click' });
    fireEvent.press(getByTestId('target'));
    await settle();
    act(() => {
      handleBackPress();
    });
    await settle();
    expect(queryByText('Card body')).toBeNull();

    const disabled = renderCard({ trigger: 'click', disabled: true });
    fireEvent.press(disabled.getAllByTestId('target')[0]);
    await settle();
    expect(disabled.queryAllByText('Card body')).toHaveLength(0);
  });

  it('paints the card on elevation level 2 and honours controlled `opened`', async () => {
    const { getByText } = renderCard({ opened: true });
    await settle();
    let node: any = getByText('Card body');
    let background: unknown;
    while (node && background === undefined) {
      background = StyleSheet.flatten(node.props?.style)?.backgroundColor;
      node = node.parent;
    }
    expect(background).toBe(resolveSurface(DEFAULT_THEME, 2).background);
  });
});
