import React, { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { __resetLayerStackForTests } from '../layerStack';
import { LayerScope, useLayer } from '../useLayer';
import type { UseLayerOptions } from '../useLayer';

type LayerProps = Partial<Omit<UseLayerOptions, 'containerRef'>> & {
  name: string;
  children?: React.ReactNode;
  withTrigger?: boolean;
};

/** A plain-DOM layer: a container div with two buttons, optionally nesting another layer. */
function Layer({ name, children, withTrigger, active = true, ...options }: LayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { id } = useLayer({
    active,
    containerRef,
    outsidePressIgnoreRefs: withTrigger ? [triggerRef] : undefined,
    ...options,
  });
  return (
    <LayerScope id={id}>
      {withTrigger && <button ref={triggerRef}>{`${name} trigger`}</button>}
      {active && (
        <div ref={containerRef} data-testid={`${name}-container`}>
          <button>{`${name} first`}</button>
          <button>{`${name} last`}</button>
          {children}
        </div>
      )}
    </LayerScope>
  );
}

describe('layer stack (web DOM)', () => {
  beforeEach(() => __resetLayerStackForTests());

  it('Escape dismisses only the topmost layer and stops the event', () => {
    const outer = jest.fn();
    const inner = jest.fn();
    const bubbleListener = jest.fn();
    document.addEventListener('keydown', bubbleListener);

    render(
      <Layer name="outer" onDismiss={outer} autoFocus={false}>
        <Layer name="inner" onDismiss={inner} autoFocus={false} />
      </Layer>
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => {
      document.body.dispatchEvent(event);
    });

    expect(inner).toHaveBeenCalledWith('escape-key');
    expect(outer).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    // Other document listeners (legacy per-component Escape handlers) never see it.
    expect(bubbleListener).not.toHaveBeenCalled();
    document.removeEventListener('keydown', bubbleListener);
  });

  it('swallows the matching Escape keyup (react-native-web Modal closes on keyup)', () => {
    const keyup = jest.fn();
    document.addEventListener('keyup', keyup);
    render(<Layer name="only" onDismiss={jest.fn()} autoFocus={false} />);

    fireEvent.keyDown(document.body, { key: 'Escape' });
    fireEvent.keyUp(document.body, { key: 'Escape' });
    expect(keyup).not.toHaveBeenCalled();

    // Only the one keyup is swallowed.
    fireEvent.keyUp(document.body, { key: 'Escape' });
    expect(keyup).toHaveBeenCalledTimes(1);
    document.removeEventListener('keyup', keyup);
  });

  it('leaves Escape alone when no layer is open', () => {
    const listener = jest.fn();
    document.addEventListener('keydown', listener);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(listener).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', listener);
  });

  it('moves focus to the first tabbable element on open and restores it on close', () => {
    function Harness({ open }: { open: boolean }) {
      return (
        <>
          <button>opener</button>
          <Layer name="dialog" active={open} />
        </>
      );
    }
    const { rerender } = render(<Harness open={false} />);
    const opener = screen.getByText('opener');
    opener.focus();
    expect(document.activeElement).toBe(opener);

    rerender(<Harness open />);
    expect(document.activeElement).toBe(screen.getByText('dialog first'));

    rerender(<Harness open={false} />);
    expect(document.activeElement).toBe(opener);
  });

  it("focuses the container itself with initialFocus 'container'", () => {
    render(<Layer name="panel" initialFocus="container" />);
    const container = screen.getByTestId('panel-container');
    expect(document.activeElement).toBe(container);
    expect(container.getAttribute('tabindex')).toBe('-1');
  });

  it('does not steal focus back when focus already moved elsewhere', () => {
    function Harness({ open }: { open: boolean }) {
      return (
        <>
          <button>opener</button>
          <button>elsewhere</button>
          <Layer name="pop" active={open} />
        </>
      );
    }
    const { rerender } = render(<Harness open={false} />);
    screen.getByText('opener').focus();
    rerender(<Harness open />);
    screen.getByText('elsewhere').focus();
    rerender(<Harness open={false} />);
    expect(document.activeElement).toBe(screen.getByText('elsewhere'));
  });

  it('traps Tab / Shift+Tab inside a trapping layer', () => {
    render(<Layer name="trap" trapFocus />);
    const first = screen.getByText('trap first');
    const last = screen.getByText('trap last');
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('pulls focus back into a trapping layer when it escapes', () => {
    render(
      <>
        <button>outside</button>
        <Layer name="modal" modal />
      </>
    );
    act(() => {
      screen.getByText('outside').focus();
    });
    expect(document.activeElement).toBe(screen.getByText('modal first'));
  });

  it('dismisses on outside press, but not on its trigger or inside a child layer', () => {
    const parent = jest.fn();
    const child = jest.fn();
    render(
      <>
        <button>page</button>
        <Layer name="parent" onDismiss={parent} closeOnOutsidePress withTrigger autoFocus={false}>
          <Layer name="child" onDismiss={child} closeOnOutsidePress autoFocus={false} />
        </Layer>
      </>
    );

    // Inside the child: nothing closes.
    fireEvent.pointerDown(screen.getByText('child first'));
    expect(parent).not.toHaveBeenCalled();
    expect(child).not.toHaveBeenCalled();

    // Inside the parent but outside the child: only the child closes.
    fireEvent.pointerDown(screen.getByText('parent first'));
    expect(child).toHaveBeenCalledWith('outside-press');
    expect(parent).not.toHaveBeenCalled();

    // The parent's trigger toggles itself, so it isn't "outside" the parent.
    fireEvent.pointerDown(screen.getByText('parent trigger'));
    expect(parent).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText('page'));
    expect(parent).toHaveBeenCalledWith('outside-press');
  });

  it('never outside-presses layers under a modal layer', () => {
    const below = jest.fn();
    render(
      <>
        <button>page</button>
        <Layer name="below" onDismiss={below} closeOnOutsidePress autoFocus={false} />
        <Layer name="modal" modal autoFocus={false} />
      </>
    );
    fireEvent.pointerDown(screen.getByText('page'));
    expect(below).not.toHaveBeenCalled();
  });
});
