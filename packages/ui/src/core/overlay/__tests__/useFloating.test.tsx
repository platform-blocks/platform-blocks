import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { act, render, waitFor, within } from '@testing-library/react-native';

import { OverlayProvider } from '../../providers/OverlayProvider';
import { OverlayRenderer } from '../../providers/OverlayRenderer';
import { DEFAULT_Z_INDICES } from '../../theme/zIndices';
import { resetWarnOnce } from '../../utils/logger';
import { measureElement } from '../../utils/positioning-enhanced';
import { __resetLayerStackForTests, dismissTopLayerOnEscape, handleBackPress } from '../layerStack';
import { OverlayHost } from '../OverlayHost';
import { useFloating } from '../useFloating';
import type { UseFloatingOptions } from '../useFloating';

jest.mock('../../utils/positioning-enhanced', () => {
  const actual = jest.requireActual('../../utils/positioning-enhanced');
  return { ...actual, measureElement: jest.fn() };
});

const mockedMeasure = measureElement as jest.MockedFunction<typeof measureElement>;

function Harness(props: Partial<UseFloatingOptions> & { opened: boolean }) {
  const floating = useFloating({ placement: 'bottom-start', ...props });
  return (
    <View>
      <Pressable testID="trigger" {...floating.getReferenceProps()}>
        <Text>Trigger</Text>
      </Pressable>
      {floating.renderFloating(
        <View testID="floating" {...floating.getFloatingProps()}>
          <Text>Floating content</Text>
        </View>
      )}
    </View>
  );
}

/** Lets the positioner's trailing (debounced) re-measure settle inside act(). */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

async function openFloating(screen: ReturnType<typeof render>) {
  const node = await screen.findByTestId('floating');
  await settle();
  return node;
}

function findStyleUp(node: any, key: string): unknown {
  let current = node;
  while (current) {
    const style = current.props?.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style.flat(Infinity).filter(Boolean)) : style;
    if (flat && flat[key] !== undefined) return flat[key];
    current = current.parent;
  }
  return undefined;
}

describe('useFloating (native)', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    resetWarnOnce();
    mockedMeasure.mockResolvedValue({ x: 20, y: 100, width: 120, height: 40 });
  });

  it('opens its content through the nearest overlay renderer with id, role and theme z-index', async () => {
    const screen = render(
      <OverlayProvider>
        <Harness opened id="menu-x" />
        <OverlayRenderer />
      </OverlayProvider>
    );

    const floating = await openFloating(screen);
    expect(floating.props.nativeID).toBe('menu-x');
    expect(floating.props.role).toBe('dialog');
    expect(findStyleUp(floating, 'zIndex')).toBe(DEFAULT_Z_INDICES.popover);
    const trigger = screen.getByTestId('trigger');
    expect(trigger.props['aria-expanded'] ?? trigger.props.accessibilityState?.expanded).toBe(true);
  });

  it('uses the layer option for the z-index', async () => {
    const screen = render(
      <OverlayProvider>
        <Harness opened layer="tooltip" />
        <OverlayRenderer />
      </OverlayProvider>
    );
    const floating = await openFloating(screen);
    expect(findStyleUp(floating, 'zIndex')).toBe(DEFAULT_Z_INDICES.tooltip);
  });

  it('closes when opened turns false', async () => {
    const screen = render(
      <OverlayProvider>
        <Harness opened />
        <OverlayRenderer />
      </OverlayProvider>
    );
    await openFloating(screen);
    screen.rerender(
      <OverlayProvider>
        <Harness opened={false} />
        <OverlayRenderer />
      </OverlayProvider>
    );
    await waitFor(() => expect(screen.queryByTestId('floating')).toBeNull());
  });

  it('reports Escape and Android back through onDismiss', async () => {
    const onDismiss = jest.fn();
    const screen = render(
      <OverlayProvider>
        <Harness opened onDismiss={onDismiss} />
        <OverlayRenderer />
      </OverlayProvider>
    );
    await openFloating(screen);

    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(onDismiss).toHaveBeenLastCalledWith('escape-key');

    act(() => {
      expect(handleBackPress()).toBe(true);
    });
    expect(onDismiss).toHaveBeenLastCalledWith('back-button');
  });

  it("routes a 'portal' overlay's Modal onRequestClose (Android back) to the layer stack", async () => {
    const onDismiss = jest.fn();
    const screen = render(
      <OverlayProvider>
        <Harness opened strategy="portal" onDismiss={onDismiss} />
        <OverlayRenderer />
      </OverlayProvider>
    );
    await openFloating(screen);
    const modal = screen.UNSAFE_getByType(Modal);
    act(() => {
      modal.props.onRequestClose();
    });
    expect(onDismiss).toHaveBeenCalledWith('back-button');
  });

  it('renders inside the nearest OverlayHost (e.g. a Dialog) instead of the root', async () => {
    const screen = render(
      <OverlayProvider>
        <View testID="app" />
        <View testID="modal-root">
          <OverlayHost>
            <Harness opened />
          </OverlayHost>
        </View>
        <OverlayRenderer />
      </OverlayProvider>
    );
    await openFloating(screen);
    expect(within(screen.getByTestId('modal-root')).getByTestId('floating')).toBeTruthy();
    // Hosted 'portal' overlays don't open a second native Modal.
    expect(screen.UNSAFE_queryAllByType(Modal)).toHaveLength(0);
  });

  it('renders inline with a one-time warning when there is no OverlayProvider', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = render(<Harness opened />);
    expect(screen.getByTestId('floating')).toBeTruthy();
    screen.rerender(<Harness opened />);
    const noProviderWarnings = warn.mock.calls.filter(([message]) => String(message).includes('OverlayProvider'));
    expect(noProviderWarnings).toHaveLength(1);
    warn.mockRestore();
  });

  it('does not warn about a missing OverlayProvider until it opens', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const noProviderWarnings = () =>
      warn.mock.calls.filter(([message]) => String(message).includes('OverlayProvider'));
    const screen = render(<Harness opened={false} />);
    screen.rerender(<Harness opened={false} />);
    expect(noProviderWarnings()).toHaveLength(0);
    screen.rerender(<Harness opened />);
    expect(noProviderWarnings()).toHaveLength(1);
    warn.mockRestore();
  });

  it('dismisses the inline fallback through the layer stack too', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const onDismiss = jest.fn();
    render(<Harness opened onDismiss={onDismiss} />);
    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(onDismiss).toHaveBeenCalledWith('escape-key');
    warn.mockRestore();
  });
});
