import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { Tooltip } from '../Tooltip';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests, handleBackPress } from '../../../core/overlay/layerStack';
import { DEFAULT_Z_INDICES } from '../../../core/theme/zIndices';
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

function findStyleUp(node: any, key: string): unknown {
  let current = node;
  while (current) {
    const value = StyleSheet.flatten(current.props?.style)?.[key];
    if (value !== undefined) return value;
    current = current.parent;
  }
  return undefined;
}

describe('Tooltip', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    mockedMeasure.mockResolvedValue({ x: 20, y: 100, width: 120, height: 32 });
  });

  it('shows the label when the trigger is pressed (inline without a provider)', () => {
    const { getByText, queryByText } = render(
      <Tooltip label="Helpful tip">
        <Text>Trigger</Text>
      </Tooltip>
    );
    expect(queryByText('Helpful tip')).toBeNull();
    fireEvent.press(getByText('Trigger'));
    expect(getByText('Helpful tip')).toBeTruthy();
    // Press toggles on native.
    fireEvent.press(getByText('Trigger'));
    expect(queryByText('Helpful tip')).toBeNull();
  });

  it('shows on focus by default and hides on blur', () => {
    const { getByTestId, queryByText } = render(
      <Tooltip label="Keyboard tip">
        <Pressable testID="trigger"><Text>Trigger</Text></Pressable>
      </Tooltip>
    );
    fireEvent(getByTestId('trigger'), 'focus');
    expect(queryByText('Keyboard tip')).toBeTruthy();
    fireEvent(getByTestId('trigger'), 'blur');
    expect(queryByText('Keyboard tip')).toBeNull();
  });

  it('can opt out of focus', () => {
    const { getByTestId, queryByText } = render(
      <Tooltip label="Tip" events={{ focus: false }}>
        <Pressable testID="trigger"><Text>Trigger</Text></Pressable>
      </Tooltip>
    );
    fireEvent(getByTestId('trigger'), 'focus');
    expect(queryByText('Tip')).toBeNull();
  });

  it('gives native screen readers the label as the trigger hint', () => {
    const { getByTestId } = render(
      <Tooltip label="Copies the link">
        <Pressable testID="trigger"><Text>Copy</Text></Pressable>
      </Tooltip>
    );
    expect(getByTestId('trigger').props.accessibilityHint).toBe('Copies the link');
  });

  it('adds no hint when the trigger is already named by the tooltip text', () => {
    const { getByTestId } = render(
      <Tooltip label="Copy link">
        <Pressable testID="trigger" accessibilityLabel="copy  link"><Text>⧉</Text></Pressable>
      </Tooltip>
    );
    expect(getByTestId('trigger').props.accessibilityHint).toBeUndefined();
  });

  it('respects the controlled opened prop', () => {
    const { getByText, queryByText, rerender } = render(
      <Tooltip label="Controlled" opened>
        <Text>Target</Text>
      </Tooltip>
    );
    expect(getByText('Controlled')).toBeTruthy();
    rerender(
      <Tooltip label="Controlled" opened={false}>
        <Text>Target</Text>
      </Tooltip>
    );
    expect(queryByText('Controlled')).toBeNull();
  });

  it('never shows when disabled or without a label', () => {
    const { queryByText } = render(
      <Tooltip label="Hidden" opened disabled>
        <Text>Target</Text>
      </Tooltip>
    );
    expect(queryByText('Hidden')).toBeNull();
  });

  it('lets long labels wrap, and clamps with lineClamp', () => {
    const { getByText, rerender } = render(
      <Tooltip label="A label far longer than the bubble can show on one line" opened>
        <Text>Target</Text>
      </Tooltip>
    );
    expect(getByText('A label far longer than the bubble can show on one line').props.numberOfLines).toBeUndefined();
    rerender(
      <Tooltip label="Truncate me" opened lineClamp={1}>
        <Text>Target</Text>
      </Tooltip>
    );
    expect(getByText('Truncate me').props.numberOfLines).toBe(1);
  });

  it('applies `w` as a fixed bubble width', () => {
    const { getByText } = render(
      <Tooltip label="Long copy" opened w={160} withArrow position="bottom">
        <Text>Target</Text>
      </Tooltip>
    );
    expect(findStyleUp(getByText('Long copy'), 'width')).toBe(160);
  });

  it('renders in the tooltip layer with role="tooltip" through the overlay renderer', async () => {
    const { getByText } = render(
      <OverlayProvider>
        <Tooltip label="Layered" opened>
          <Pressable testID="trigger"><Text>Target</Text></Pressable>
        </Tooltip>
        <OverlayRenderer />
      </OverlayProvider>
    );
    await settle();
    const labelNode = getByText('Layered');
    let node: any = labelNode;
    let role: unknown;
    while (node && !role) {
      role = node.props?.role;
      node = node.parent;
    }
    expect(role).toBe('tooltip');
    expect(findStyleUp(labelNode, 'zIndex')).toBe(DEFAULT_Z_INDICES.tooltip);
  });

  it('Android back dismisses an open tooltip', async () => {
    const onClose = jest.fn();
    const { getByTestId, queryByText } = render(
      <OverlayProvider>
        <Tooltip label="Dismiss me" onClose={onClose}>
          <Pressable testID="trigger"><Text>Target</Text></Pressable>
        </Tooltip>
        <OverlayRenderer />
      </OverlayProvider>
    );
    fireEvent.press(getByTestId('trigger'));
    await settle();
    expect(queryByText('Dismiss me')).toBeTruthy();
    act(() => {
      handleBackPress();
    });
    await settle();
    expect(queryByText('Dismiss me')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
