/**
 * Shared harness for AutoComplete's native tests: the anchored (desktop)
 * presentation with a real OverlayProvider, plus an outlet that renders what
 * the provider holds (the app shell's OverlayRenderer does this in an app).
 * Only the DOM measurement is faked — tests mock `usePopoverPositioning` with
 * `mockPositioning()` below.
 */
import React from 'react';
import { View } from 'react-native';

import { OverlayProvider, useOverlays } from '../../../core/providers/OverlayProvider';

function OverlayOutlet() {
  const overlays = useOverlays();
  return <View testID="overlay-outlet">{overlays.map((overlay) => <View key={overlay.id}>{overlay.content}</View>)}</View>;
}

export function WithOverlays({ children }: { children: React.ReactNode }) {
  return (
    <OverlayProvider>
      {children}
      <OverlayOutlet />
    </OverlayProvider>
  );
}

/** Factory for `jest.mock('../../../core/hooks/usePopoverPositioning', mockPositioning)`. */
export function mockPositioning() {
  const { useRef } = require('react');
  return {
    usePopoverPositioning: () => ({
      position: { x: 0, y: 40, placement: 'bottom-start', finalWidth: 300, finalHeight: 200, maxHeight: 260 },
      updatePosition: jest.fn().mockResolvedValue(undefined),
      isPositioning: false,
      anchorRef: useRef(null),
      popoverRef: useRef(null),
    }),
  };
}
