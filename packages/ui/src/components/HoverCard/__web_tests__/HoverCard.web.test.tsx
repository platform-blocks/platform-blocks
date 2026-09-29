import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { HoverCard } from '../HoverCard';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { getTabbableElements } from '../../../core/overlay/focus';

const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 140, bottom: 72, width: 120, height: 32, toJSON: () => ({}) } as DOMRect;
  };
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalRect;
});

beforeEach(() => __resetLayerStackForTests());

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
}

function Profile(props: Partial<React.ComponentProps<typeof HoverCard>>) {
  return (
    <OverlayProvider>
      <HoverCard
        openDelay={0}
        closeDelay={0}
        target={<Pressable role="link" accessibilityLabel="@platform-blocks"><Text>@platform-blocks</Text></Pressable>}
        {...props}
      >
        <Text>Cross-platform UI blocks</Text>
      </HoverCard>
      <OverlayRenderer />
    </OverlayProvider>
  );
}

describe('HoverCard (react-native-web DOM)', () => {
  it('adds no extra tab stop around the target', () => {
    const { container } = render(<Profile />);
    expect(getTabbableElements(container)).toHaveLength(1);
  });

  it('opens on keyboard focus, wires aria-expanded / aria-controls, and closes on Escape', async () => {
    render(<Profile />);
    const target = screen.getByRole('link', { name: '@platform-blocks' });
    expect(target.getAttribute('aria-expanded')).toBe('false');

    act(() => target.focus());
    await settle();
    const card = screen.getByRole('dialog');
    expect(card.textContent).toBe('Cross-platform UI blocks');
    expect(target.getAttribute('aria-expanded')).toBe('true');
    expect(target.getAttribute('aria-controls')).toBe(card.id);
    // Hover/focus cards never steal focus.
    expect(document.activeElement).toBe(target);

    fireEvent.keyDown(target, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on pointer hover and stays open while the pointer is on the card', async () => {
    render(<Profile closeDelay={50} />);
    const target = screen.getByRole('link', { name: '@platform-blocks' });
    fireEvent.mouseEnter(target);
    await settle();
    const card = screen.getByRole('dialog');
    fireEvent.mouseLeave(target);
    fireEvent.mouseEnter(card);
    await settle();
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.mouseLeave(card);
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
