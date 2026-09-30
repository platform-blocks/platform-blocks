import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Tooltip } from '../Tooltip';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 140, top: 140, left: 20, right: 140, bottom: 172, width: 120, height: 32, toJSON: () => ({}) } as DOMRect;
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

function Copy(props: Partial<React.ComponentProps<typeof Tooltip>>) {
  return (
    <OverlayProvider>
      <Tooltip label="Copy link to clipboard" {...props}>
        <Pressable role="button" accessibilityLabel="Copy">
          <Text>Copy</Text>
        </Pressable>
      </Tooltip>
      <OverlayRenderer />
    </OverlayProvider>
  );
}

describe('Tooltip (react-native-web DOM)', () => {
  it('shows on keyboard focus and describes the trigger (role="tooltip" + aria-describedby)', async () => {
    render(<Copy />);
    const trigger = screen.getByRole('button', { name: 'Copy' });
    expect(screen.queryByRole('tooltip')).toBeNull();

    act(() => trigger.focus());
    await settle();
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe('Copy link to clipboard');
    expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
    // Showing a tooltip never moves focus.
    expect(document.activeElement).toBe(trigger);
  });

  it('does not describe a trigger whose accessible name already is the tooltip text', async () => {
    render(
      <OverlayProvider>
        <Tooltip label="Copy">
          <Pressable role="button" accessibilityLabel="Copy">
            <Text>⧉</Text>
          </Pressable>
        </Tooltip>
        <OverlayRenderer />
      </OverlayProvider>
    );
    const trigger = screen.getByRole('button', { name: 'Copy' });
    act(() => trigger.focus());
    await settle();
    expect(screen.getByRole('tooltip').textContent).toBe('Copy');
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('Escape dismisses it without moving focus (WCAG 1.4.13)', async () => {
    render(<Copy />);
    const trigger = screen.getByRole('button', { name: 'Copy' });
    act(() => trigger.focus());
    await settle();
    expect(screen.getByRole('tooltip')).toBeTruthy();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('hides when focus leaves', async () => {
    render(<Copy />);
    const trigger = screen.getByRole('button', { name: 'Copy' });
    act(() => trigger.focus());
    await settle();
    act(() => trigger.blur());
    await settle();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  // Regression: the renderer's full-screen container must let the pointer
  // through. An inline `pointerEvents: 'box-none'` is ignored by
  // react-native-web, so the container covered the trigger, fired mouseleave,
  // closed the tooltip, uncovered the trigger, reopened it — a flicker loop.
  it('opens on hover without the overlay layer capturing the pointer', async () => {
    render(<Copy />);
    const trigger = screen.getByRole('button', { name: 'Copy' });
    fireEvent.mouseEnter(trigger);
    await settle();
    const tooltip = screen.getByRole('tooltip');

    const fullScreenLayers: HTMLElement[] = [];
    for (let el = tooltip.parentElement; el && el !== document.body; el = el.parentElement) {
      if (el.style.width === '100%' && el.style.height === '100%') fullScreenLayers.push(el);
    }
    expect(fullScreenLayers.length).toBeGreaterThan(0);
    for (const layer of fullScreenLayers) {
      expect(layer.style.pointerEvents).not.toBe('box-none');
      expect(getComputedStyle(layer).pointerEvents).toBe('none');
    }
  });
});
