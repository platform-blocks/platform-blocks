import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { ChartInteractionProvider, useChartInteractionContext, useChartInteractionVolatile } from '../../src/interaction/ChartInteractionContext';
import type { ActiveTarget } from '../../src/core/hittest/types';

interface ProviderHandle {
  setPointer: ReturnType<typeof useChartInteractionContext>['setPointer'];
  getPointer: () => ReturnType<typeof useChartInteractionContext>['pointer'];
  setActiveTarget: ReturnType<typeof useChartInteractionContext>['setActiveTarget'];
  clearActiveTargetIf: ReturnType<typeof useChartInteractionContext>['clearActiveTargetIf'];
  holdTouchTarget: ReturnType<typeof useChartInteractionContext>['holdTouchTarget'];
  cancelTouchHold: ReturnType<typeof useChartInteractionContext>['cancelTouchHold'];
  getActiveTarget: () => ReturnType<typeof useChartInteractionContext>['activeTarget'];
}

const InteractionHarness = React.forwardRef<ProviderHandle>((_, ref) => {
  // Merge stable (setters) + volatile (pointer/activeTarget) so the harness reads both.
  const ctx = { ...useChartInteractionContext(), ...useChartInteractionVolatile() };
  const pointerRef = React.useRef(ctx.pointer);
  const activeTargetRef = React.useRef(ctx.activeTarget);

  pointerRef.current = ctx.pointer;
  activeTargetRef.current = ctx.activeTarget;

  React.useImperativeHandle(ref, () => ({
    setPointer: ctx.setPointer,
    getPointer: () => pointerRef.current,
    setActiveTarget: ctx.setActiveTarget,
    clearActiveTargetIf: ctx.clearActiveTargetIf,
    holdTouchTarget: ctx.holdTouchTarget,
    cancelTouchHold: ctx.cancelTouchHold,
    getActiveTarget: () => activeTargetRef.current,
  }), [ctx]);

  return null;
});
InteractionHarness.displayName = 'InteractionHarness';

describe('ChartInteractionProvider', () => {
  it('respects pointer pixel threshold before updating state', async () => {
    const handle = React.createRef<ProviderHandle>();
    render(
      <ChartInteractionProvider config={{ pointerPixelThreshold: 5, pointerRAF: false }}>
        <InteractionHarness ref={handle} />
      </ChartInteractionProvider>
    );

    act(() => {
      handle.current?.setPointer({ x: 0, y: 0, inside: true });
    });

    await waitFor(() => {
      expect(handle.current?.getPointer()?.x).toBe(0);
    });

    act(() => {
      handle.current?.setPointer({ x: 2, y: 3, inside: true });
    });

    await waitFor(() => {
      expect(handle.current?.getPointer()?.x).toBe(0);
      expect(handle.current?.getPointer()?.y).toBe(0);
    });

    act(() => {
      handle.current?.setPointer({ x: 12, y: 18, inside: true });
    });

    await waitFor(() => {
      expect(handle.current?.getPointer()?.x).toBe(12);
      expect(handle.current?.getPointer()?.y).toBe(18);
    });
  });

  it('stores and clears the hit-test engine active target', async () => {
    const handle = React.createRef<ProviderHandle>();
    render(
      <ChartInteractionProvider config={{ pointerRAF: false }}>
        <InteractionHarness ref={handle} />
      </ChartInteractionProvider>
    );

    expect(handle.current?.getActiveTarget()).toBeNull();

    const target: ActiveTarget = {
      seriesId: 's1',
      markId: 0,
      kind: 'point',
      datum: { x: 1, y: 2 },
      pixel: { x: 20, y: 40 },
      value: 2,
      distance: 0,
    };

    act(() => {
      handle.current?.setActiveTarget(target);
    });

    await waitFor(() => {
      expect(handle.current?.getActiveTarget()).toEqual(target);
    });

    act(() => {
      handle.current?.setActiveTarget(null);
    });

    await waitFor(() => {
      expect(handle.current?.getActiveTarget()).toBeNull();
    });
  });

  it('does not let an older touch timeout clear a newer selection', () => {
    const handle = React.createRef<ProviderHandle>();
    render(
      <ChartInteractionProvider config={{ pointerRAF: false }}>
        <InteractionHarness ref={handle} />
      </ChartInteractionProvider>
    );
    const first: ActiveTarget = {
      seriesId: 'first', markId: 0, kind: 'point', datum: {},
      pixel: { x: 10, y: 10 }, value: 1, distance: 0,
    };
    const second: ActiveTarget = { ...first, seriesId: 'second', pixel: { x: 20, y: 20 } };
    act(() => {
      handle.current?.setActiveTarget(first);
      handle.current?.setActiveTarget(second);
      handle.current?.clearActiveTargetIf(first);
    });
    expect(handle.current?.getActiveTarget()).toEqual(second);
    act(() => handle.current?.clearActiveTargetIf(second));
    expect(handle.current?.getActiveTarget()).toBeNull();
  });

  it('retains a touched target and slice through release, then clears them after the hold', () => {
    jest.useFakeTimers();
    try {
      const handle = React.createRef<ProviderHandle>();
      render(
        <ChartInteractionProvider config={{ pointerRAF: false }}>
          <InteractionHarness ref={handle} />
        </ChartInteractionProvider>
      );
      const target: ActiveTarget = {
        seriesId: 'touch', markId: 1, kind: 'point', datum: {},
        pixel: { x: 10, y: 10 }, value: 1, distance: 0,
      };
      act(() => {
        handle.current?.setActiveTarget(target);
        handle.current?.setPointer({ x: 10, y: 10, inside: true, pageX: 150, pageY: 400 });
        handle.current?.holdTouchTarget();
        handle.current?.setPointer({ x: 0, y: 0, inside: false });
        handle.current?.setActiveTarget(null);
      });
      expect(handle.current?.getActiveTarget()).toEqual(target);
      expect(handle.current?.getPointer()).toMatchObject({ inside: true, pageX: 150, pageY: 400 });
      act(() => jest.advanceTimersByTime(8000));
      expect(handle.current?.getPointer()).toBeNull();
      expect(handle.current?.getActiveTarget()).toBeNull();

      const newer: ActiveTarget = { ...target, markId: 2, pixel: { x: 20, y: 20 } };
      act(() => {
        handle.current?.setActiveTarget(target);
        handle.current?.holdTouchTarget();
        handle.current?.setActiveTarget(newer);
      });
      act(() => jest.advanceTimersByTime(8000));
      expect(handle.current?.getActiveTarget()).toEqual(newer);
    } finally {
      jest.useRealTimers();
    }
  });
});
