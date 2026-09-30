import React, { useContext } from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext, SafeAreaProvider } from 'react-native-safe-area-context';
import type { EdgeInsets, Metrics } from 'react-native-safe-area-context';

import { PlocksProvider } from '../../theme/PlocksProvider';
import { Dialog } from '../../../components/Dialog';

// What the native module reports as the window's insets at launch; jest has no
// native module, so it is null unless a test sets it.
let mockWindowMetrics: Metrics | null = null;
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  get initialWindowMetrics() {
    return mockWindowMetrics;
  },
}));

const NOTCHED_PHONE: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

/** Records the insets the tree sees on every render, starting with the first. */
function renderProbe(tree: (probe: React.ReactElement) => React.ReactElement) {
  const seen: Array<EdgeInsets | null> = [];
  const Probe = () => {
    seen.push(useContext(SafeAreaInsetsContext));
    return <Text>probe</Text>;
  };
  const result = render(tree(<Probe />));
  return { ...result, seen };
}

function countSafeAreaProviders(node: ReturnType<ReturnType<typeof render>['toJSON']>): number {
  if (!node) return 0;
  if (Array.isArray(node)) return node.reduce((sum, child) => sum + countSafeAreaProviders(child), 0);
  if (typeof node === 'string') return 0;
  const own = node.type === 'RNCSafeAreaProvider' ? 1 : 0;
  return own + (node.children ?? []).reduce((sum, child) => sum + countSafeAreaProviders(child as never), 0);
}

describe('PlocksProvider safe area', () => {
  afterEach(() => {
    mockWindowMetrics = null;
  });

  it('provides the window insets on the first render, without an app-level SafeAreaProvider', () => {
    mockWindowMetrics = NOTCHED_PHONE;
    const { seen } = renderProbe((probe) => <PlocksProvider>{probe}</PlocksProvider>);

    expect(screen.getByText('probe')).toBeTruthy();
    expect(seen[0]).toEqual(NOTCHED_PHONE.insets);
  });

  it('starts from zero insets when the native module reports none', () => {
    const { seen } = renderProbe((probe) => <PlocksProvider>{probe}</PlocksProvider>);

    expect(screen.getByText('probe')).toBeTruthy();
    expect(seen[0]).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('defers to a SafeAreaProvider that is already mounted', () => {
    mockWindowMetrics = NOTCHED_PHONE;
    const routerInsets = { top: 20, right: 0, bottom: 0, left: 0 };
    const { seen, toJSON } = renderProbe((probe) => (
      <SafeAreaProvider initialMetrics={{ frame: NOTCHED_PHONE.frame, insets: routerInsets }}>
        <PlocksProvider>{probe}</PlocksProvider>
      </SafeAreaProvider>
    ));

    expect(seen[0]).toEqual(routerInsets);
    expect(countSafeAreaProviders(toJSON())).toBe(1);
  });

  it('mounts one provider for nested PlocksProviders', () => {
    const { toJSON } = renderProbe((probe) => (
      <PlocksProvider>
        <PlocksProvider>{probe}</PlocksProvider>
      </PlocksProvider>
    ));

    expect(countSafeAreaProviders(toJSON())).toBe(1);
  });

  it('mounts none with withSafeAreaProvider={false}', () => {
    mockWindowMetrics = NOTCHED_PHONE;
    const { seen, toJSON } = renderProbe((probe) => (
      <PlocksProvider withSafeAreaProvider={false}>{probe}</PlocksProvider>
    ));

    expect(seen[0]).toBeNull();
    expect(countSafeAreaProviders(toJSON())).toBe(0);
  });

  it('keeps a fullscreen Dialog clear of the notch and the home indicator', () => {
    mockWindowMetrics = NOTCHED_PHONE;
    render(
      <PlocksProvider>
        <Dialog opened variant="fullscreen" onClose={() => {}} testID="dialog">
          <Text>content</Text>
        </Dialog>
      </PlocksProvider>
    );

    const style = StyleSheet.flatten(screen.getByTestId('dialog').props.style);
    expect(style.paddingTop).toBe(47);
    expect(style.paddingBottom).toBe(34);
  });
});
