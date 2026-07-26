import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { measureElement } from '../../utils/positioning-enhanced';
import { usePopoverPositioning } from '../usePopoverPositioning';

jest.mock('../../utils/positioning-enhanced', () => {
  const actual = jest.requireActual('../../utils/positioning-enhanced');
  return { ...actual, measureElement: jest.fn() };
});

const mockedMeasure = measureElement as jest.MockedFunction<typeof measureElement>;

/** Viewport-relative anchor rect returned by the next measureElement call. */
let anchorRect = { x: 0, y: 200, width: 160, height: 40 };

type Listener = (event?: unknown) => void;

describe('usePopoverPositioning — staying docked to the anchor', () => {
  const originalOS = Platform.OS;
  let listeners: Record<string, Listener[]>;

  beforeEach(() => {
    (Platform as any).OS = 'web';
    listeners = {};
    anchorRect = { x: 0, y: 200, width: 160, height: 40 };

    (global as any).window = {
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener: (type: string, handler: Listener) => {
        (listeners[type] ||= []).push(handler);
      },
      removeEventListener: (type: string, handler: Listener) => {
        listeners[type] = (listeners[type] || []).filter(h => h !== handler);
      },
    };
    (global as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => cb(0), 0) as unknown as number;
    (global as any).cancelAnimationFrame = (id: number) => clearTimeout(id);

    // The anchor moves with the page; the popover itself keeps a fixed size.
    mockedMeasure.mockImplementation((ref: any) =>
      Promise.resolve(
        ref?.current?.__isPopover
          ? { x: 0, y: 0, width: 160, height: 120 }
          : { ...anchorRect },
      ),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // `window` has to outlive the per-test teardown: RTL's auto-cleanup unmounts
  // after our afterEach, and the hook's cleanup touches removeEventListener.
  afterAll(() => {
    (Platform as any).OS = originalOS;
    delete (global as any).window;
  });

  /**
   * Mounts closed and then opens, which is how every real consumer uses this —
   * and the only path that exercised the stale-closure bug.
   */
  async function renderThenOpen() {
    const hook = renderHook(
      ({ open }: { open: boolean }) =>
        usePopoverPositioning(open, { placement: 'bottom-start', offset: 6 }),
      { initialProps: { open: false } },
    );

    // Attach fake nodes so measurement runs.
    hook.result.current.anchorRef.current = {};
    hook.result.current.popoverRef.current = { __isPopover: true };

    await act(async () => {
      hook.rerender({ open: true });
    });

    await waitFor(() => expect(hook.result.current.position).not.toBeNull());
    return hook;
  }

  async function emitScroll() {
    await act(async () => {
      listeners.scroll?.forEach(handler => handler());
      await new Promise(resolve => setTimeout(resolve, 20));
    });
  }

  it('recomputes the position when the page scrolls under an open popover', async () => {
    const { result } = await renderThenOpen();
    const initialY = result.current.position!.y;

    // Page scrolls down 80px: the anchor's viewport-relative top moves up.
    anchorRect = { ...anchorRect, y: anchorRect.y - 80 };
    await emitScroll();

    expect(result.current.position).not.toBeNull();
    expect(result.current.position!.y).toBe(initialY - 80);
  });

  it('keeps the position rather than clearing it on scroll', async () => {
    // Regression: the scroll handler invoked a stale updatePosition that still
    // closed over isOpen === false, so it nulled the position and left the
    // overlay frozen at its original viewport coordinates.
    const { result } = await renderThenOpen();

    await emitScroll();

    expect(result.current.position).not.toBeNull();
  });

  it('does not emit a new position object when the anchor has not moved', async () => {
    const { result } = await renderThenOpen();
    const first = result.current.position;

    mockedMeasure.mockClear();
    await emitScroll();

    // The reposition ran (anchor was re-measured) but produced no state churn.
    expect(mockedMeasure).toHaveBeenCalled();
    expect(result.current.position).toBe(first);
  });
});
