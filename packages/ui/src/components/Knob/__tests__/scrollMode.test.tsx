/**
 * Knob - wheel/trackpad scrolling as a reported interaction mode
 *
 * The wheel path bypasses the PanResponder entirely: it is a native `wheel` listener bound
 * to the host node so it can be non-passive and cancel page scroll. That means the hook is
 * driven here directly, with a stand-in host node that records its listeners, rather than
 * through a rendered Knob (the RN test renderer's host has no addEventListener).
 */

import { Platform } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';

import { useKnobInteraction } from '../hooks/useKnobInteraction';
import { normalizeInteractionConfig } from '../interactionConfig';
import type { KnobInteractionConfig } from '../types';

const SCROLL_MODE_IDLE_MS = 250;

const makeHost = () => {
  const listeners: Record<string, Array<(event: any) => void>> = {};
  return {
    node: {
      addEventListener: (type: string, fn: (event: any) => void) => {
        (listeners[type] ||= []).push(fn);
      },
      removeEventListener: (type: string, fn: (event: any) => void) => {
        listeners[type] = (listeners[type] ?? []).filter((entry) => entry !== fn);
      },
    },
    dispatch: (type: string, event: any) => {
      (listeners[type] ?? []).forEach((fn) => fn(event));
    },
  };
};

const wheelEvent = (delta: Partial<{ deltaX: number; deltaY: number }>) => ({
  deltaX: 0,
  deltaY: 0,
  ...delta,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
});

const setup = (
  interaction: Partial<KnobInteractionConfig> = {},
  flags: { disabled?: boolean; readOnly?: boolean } = {}
) => {
  const onModeChange = jest.fn();
  const handleValueUpdate = jest.fn();
  const host = makeHost();
  const valueRef = { current: 0 };
  const interactionConfig = normalizeInteractionConfig({
    modes: ['spin', 'scroll'],
    onModeChange,
    ...interaction,
  } as KnobInteractionConfig);

  const utils = renderHook(() =>
    useKnobInteraction({
      disabled: Boolean(flags.disabled),
      readOnly: Boolean(flags.readOnly),
      pointerGestureEnabled: true,
      hasSlideModes: false,
      hasVerticalSlide: false,
      hasHorizontalSlide: false,
      canSpin: true,
      interactionConfig,
      layoutState: { width: 200, height: 200, cx: 100, cy: 100, radius: 100 },
      updateFromPoint: jest.fn(),
      valueRef,
      hostRef: { current: host.node as any },
      resetLastDragAngle: jest.fn(),
      handleValueUpdate,
      degreesToValueDelta: (degrees: number) => degrees,
      isRTL: false,
      handleTap: jest.fn(),
      isPressActionable: () => true,
    })
  );

  return { onModeChange, handleValueUpdate, host, utils };
};

const originalOS = Platform.OS;

describe('Knob scroll interaction mode', () => {
  beforeAll(() => {
    (Platform as unknown as { OS: string }).OS = 'web';
  });
  afterAll(() => {
    (Platform as unknown as { OS: string }).OS = originalOS;
  });
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('reports scroll as the active mode while the wheel is driving the value', () => {
    const { onModeChange, handleValueUpdate, host } = setup();

    act(() => host.dispatch('wheel', wheelEvent({ deltaY: -12 })));

    expect(onModeChange).toHaveBeenCalledWith('scroll');
    expect(handleValueUpdate).toHaveBeenCalled();
  });

  it('stands the mode back down once the wheel goes idle', () => {
    const { onModeChange, host } = setup();

    act(() => host.dispatch('wheel', wheelEvent({ deltaY: -12 })));
    onModeChange.mockClear();

    // Momentum events keep the mode alive rather than each one ending it.
    act(() => jest.advanceTimersByTime(SCROLL_MODE_IDLE_MS - 50));
    act(() => host.dispatch('wheel', wheelEvent({ deltaY: -4 })));
    act(() => jest.advanceTimersByTime(SCROLL_MODE_IDLE_MS - 50));
    expect(onModeChange).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(60));
    expect(onModeChange).toHaveBeenCalledWith(null);
  });

  it('tracks horizontal wheel deltas too', () => {
    const { onModeChange, host } = setup();

    act(() => host.dispatch('wheel', wheelEvent({ deltaX: 20 })));

    expect(onModeChange).toHaveBeenCalledWith('scroll');
  });

  it('ignores a wheel event that carries no delta', () => {
    const { onModeChange, handleValueUpdate, host } = setup();

    act(() => host.dispatch('wheel', wheelEvent({})));

    expect(onModeChange).not.toHaveBeenCalled();
    expect(handleValueUpdate).not.toHaveBeenCalled();
  });

  it.each([['disabled'], ['readOnly']])('reports no mode when %s', (flag) => {
    const { onModeChange, handleValueUpdate, host } = setup({}, { [flag]: true });

    act(() => host.dispatch('wheel', wheelEvent({ deltaY: -12 })));

    expect(onModeChange).not.toHaveBeenCalled();
    expect(handleValueUpdate).not.toHaveBeenCalled();
  });

  it('does not bind a wheel listener when scrolling is disabled', () => {
    const { onModeChange, handleValueUpdate, host } = setup({ scroll: { enabled: false } });

    act(() => host.dispatch('wheel', wheelEvent({ deltaY: -12 })));

    expect(onModeChange).not.toHaveBeenCalled();
    expect(handleValueUpdate).not.toHaveBeenCalled();
  });
});
