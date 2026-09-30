import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { OverlayProvider } from '../../providers/OverlayProvider';
import { OverlayRenderer } from '../../providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../layerStack';
import { useFloating } from '../useFloating';
import { ViewportPortal } from '../ViewportPortal';

// jsdom has no layout; give every element a box so an anchored overlay can be placed.
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

function Bar({ label = 'Delete' }: { label?: string }) {
  return (
    <View style={{ position: 'absolute', bottom: 24, left: 0 }}>
      <Pressable role="button" accessibilityLabel={label}>
        <Text>{label}</Text>
      </Pressable>
    </View>
  );
}

function pressEscape() {
  act(() => {
    fireEvent.keyDown(document, { key: 'Escape' });
  });
}

describe('ViewportPortal (react-native-web DOM)', () => {
  it('renders at the provider root, outside the component that owns it', () => {
    render(
      <OverlayProvider>
        <View testID="page">
          <ViewportPortal zIndex={1100}>
            <Bar />
          </ViewportPortal>
        </View>
        <View testID="root-renderer">
          <OverlayRenderer />
        </View>
      </OverlayProvider>
    );

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(screen.getByTestId('root-renderer').contains(button)).toBe(true);
    expect(screen.getByTestId('page').contains(button)).toBe(false);
  });

  it('renders in place without a provider, fixed to the viewport', () => {
    render(
      <View testID="page">
        <ViewportPortal zIndex={1100}>
          <Bar />
        </ViewportPortal>
      </View>
    );

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(screen.getByTestId('page').contains(button)).toBe(true);
    const layer = screen.getByTestId('page').firstElementChild as HTMLElement;
    expect(window.getComputedStyle(layer).position).toBe('fixed');
  });

  it('renders in place when withinPortal is false', () => {
    render(
      <OverlayProvider>
        <View testID="page">
          <ViewportPortal zIndex={1100} withinPortal={false}>
            <Bar />
          </ViewportPortal>
        </View>
        <OverlayRenderer />
      </OverlayProvider>
    );

    expect(screen.getByTestId('page').contains(screen.getByRole('button', { name: 'Delete' }))).toBe(true);
  });

  it('updates its content in place and removes it on unmount', () => {
    function Harness() {
      const [label, setLabel] = useState('Delete');
      const [shown, setShown] = useState(true);
      return (
        <>
          <Pressable role="button" accessibilityLabel="Rename" onPress={() => setLabel('Archive')}>
            <Text>Rename</Text>
          </Pressable>
          <Pressable role="button" accessibilityLabel="Hide" onPress={() => setShown(false)}>
            <Text>Hide</Text>
          </Pressable>
          {shown ? (
            <ViewportPortal zIndex={1100}>
              <Bar label={label} />
            </ViewportPortal>
          ) : null}
        </>
      );
    }
    render(
      <OverlayProvider>
        <Harness />
        <OverlayRenderer />
      </OverlayProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Archive' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByRole('button', { name: 'Archive' })).toBeNull();
  });

  it('closes on Escape only when asked to', () => {
    const onDismiss = jest.fn();
    const { rerender } = render(
      <OverlayProvider>
        <ViewportPortal zIndex={1100} onDismiss={onDismiss}>
          <Bar />
        </ViewportPortal>
        <OverlayRenderer />
      </OverlayProvider>
    );
    pressEscape();
    expect(onDismiss).not.toHaveBeenCalled();

    rerender(
      <OverlayProvider>
        <ViewportPortal zIndex={1100} onDismiss={onDismiss} closeOnEscape>
          <Bar />
        </ViewportPortal>
        <OverlayRenderer />
      </OverlayProvider>
    );
    pressEscape();
    expect(onDismiss).toHaveBeenCalledWith('escape-key');
  });

  it('lets Escape reach a menu opened above it first', async () => {
    const onBarDismiss = jest.fn();
    const onMenuDismiss = jest.fn();

    function Menu() {
      const floating = useFloating({ opened: true, onDismiss: onMenuDismiss, autoFocus: false });
      return (
        <View>
          <View {...floating.getReferenceProps()} />
          {floating.renderFloating(<View {...floating.getFloatingProps()} />)}
        </View>
      );
    }

    render(
      <OverlayProvider>
        <ViewportPortal zIndex={1100} onDismiss={onBarDismiss} closeOnEscape>
          <Bar />
        </ViewportPortal>
        <Menu />
        <OverlayRenderer />
      </OverlayProvider>
    );
    await settle();

    pressEscape();
    expect(onMenuDismiss).toHaveBeenCalledTimes(1);
    expect(onBarDismiss).not.toHaveBeenCalled();
  });
});
