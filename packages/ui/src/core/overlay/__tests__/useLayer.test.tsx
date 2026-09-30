import React from 'react';
import { Text, View } from 'react-native';
import { act, render } from '@testing-library/react-native';

import { useEscapeKey } from '../../../hooks/useEscapeKey';
import {
  __resetLayerStackForTests,
  dismissTopLayerOnEscape,
  getLayerStackSnapshot,
  handleBackPress,
} from '../layerStack';
import { LayerScope, useIsTopLayer, useLayer } from '../useLayer';
import type { UseLayerOptions } from '../useLayer';

function Layer({ name, onDismiss, children, ...options }: Partial<UseLayerOptions> & {
  name: string;
  onDismiss?: (reason: string) => void;
  children?: React.ReactNode;
}) {
  const { id } = useLayer({ active: true, id: name, onDismiss, ...options });
  const top = useIsTopLayer(id);
  return (
    <LayerScope id={id}>
      <Text testID={`${name}-top`}>{String(top)}</Text>
      {children}
    </LayerScope>
  );
}

describe('useLayer', () => {
  beforeEach(() => __resetLayerStackForTests());

  it('registers while active and unregisters when inactive/unmounted', () => {
    const { rerender, unmount } = render(<Layer name="a" active />);
    expect(getLayerStackSnapshot()).toEqual(['a']);
    rerender(<Layer name="a" active={false} />);
    expect(getLayerStackSnapshot()).toEqual([]);
    rerender(<Layer name="a" active />);
    expect(getLayerStackSnapshot()).toEqual(['a']);
    unmount();
    expect(getLayerStackSnapshot()).toEqual([]);
  });

  it('orders a nested layer above its parent even when both mount together', () => {
    const screen = render(
      <Layer name="parent">
        <Layer name="child" />
      </Layer>
    );
    expect(getLayerStackSnapshot()).toEqual(['parent', 'child']);
    expect(screen.getByTestId('child-top').props.children).toBe('true');
    expect(screen.getByTestId('parent-top').props.children).toBe('false');
  });

  it('gives Escape and back only to the topmost layer', () => {
    const parent = jest.fn();
    const child = jest.fn();
    render(
      <Layer name="parent" onDismiss={parent}>
        <Layer name="child" onDismiss={child} />
      </Layer>
    );

    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(child).toHaveBeenCalledWith('escape-key');
    expect(parent).not.toHaveBeenCalled();

    act(() => {
      handleBackPress();
    });
    expect(child).toHaveBeenLastCalledWith('back-button');
    expect(parent).not.toHaveBeenCalled();
  });

  it('reads the latest onDismiss without re-registering', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = render(<Layer name="a" onDismiss={first} />);
    rerender(<Layer name="a" onDismiss={second} />);
    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });
});

describe('useEscapeKey on the layer stack', () => {
  beforeEach(() => __resetLayerStackForTests());

  function Panel({ onEscape, enabled = true, children }: { onEscape: () => void; enabled?: boolean; children?: React.ReactNode }) {
    useEscapeKey(onEscape, enabled);
    return <View>{children}</View>;
  }

  it('fires only for the most recently enabled handler, and ignores Android back', () => {
    const outer = jest.fn();
    const inner = jest.fn();
    const { rerender } = render(
      <Panel onEscape={outer}>
        <Panel onEscape={inner} enabled={false} />
      </Panel>
    );
    rerender(
      <Panel onEscape={outer}>
        <Panel onEscape={inner} enabled />
      </Panel>
    );

    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();

    expect(handleBackPress()).toBe(false);
    expect(outer).not.toHaveBeenCalled();
  });
});
