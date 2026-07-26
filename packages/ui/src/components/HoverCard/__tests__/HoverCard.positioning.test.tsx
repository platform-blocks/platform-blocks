import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

import { HoverCard } from '../HoverCard';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';

/**
 * HoverCard used to position itself: it measured the trigger behind a pair of
 * `setTimeout`s, assumed a flat 120px card height, opened the overlay once, and
 * never looked again. That produced two defects these tests pin down — a card
 * that opened on the wrong side when its real content didn't fit the guess, and
 * one that stayed at its original viewport coordinates once the page scrolled.
 *
 * It now goes through `useDropdownPositioning`, so the assertions here are about
 * what that delegation is supposed to buy.
 */

const mockShowOverlay = jest.fn();
const mockHideOverlay = jest.fn();
let mockPosition: any = {
  x: 24,
  y: 70,
  placement: 'bottom',
  maxHeight: 200,
  finalWidth: 240,
  finalHeight: 120,
  anchorEdge: 'top',
  anchorOffset: 70,
  flipped: false,
  shifted: false,
};
let capturedOptions: any = null;

jest.mock('../../../core/hooks/useDropdownPositioning', () => ({
  useDropdownPositioning: (options: any) => {
    capturedOptions = options;
    return {
      position: options.isOpen ? mockPosition : null,
      anchorRef: { current: null },
      popoverRef: { current: null },
      showOverlay: mockShowOverlay,
      hideOverlay: mockHideOverlay,
      updatePosition: jest.fn(),
      isPositioning: false,
    };
  },
}));

const renderHoverCard = (props: any = {}) =>
  render(
    <OverlayProvider>
      <HoverCard target={<Text>Trigger</Text>} trigger="click" {...props}>
        <Text>Card body</Text>
      </HoverCard>
    </OverlayProvider>
  );

describe('HoverCard positioning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOptions = null;
  });

  it('delegates positioning rather than measuring and placing itself', async () => {
    renderHoverCard({ position: 'top', offset: 12 });

    expect(capturedOptions).toBeTruthy();
    expect(capturedOptions.placement).toBe('top');
    expect(capturedOptions.offset).toBe(12);
    // Flip and shift are what make the card avoid the viewport edges at all.
    expect(capturedOptions.flip).toBe(true);
    expect(capturedOptions.shift).toBe(true);
  });

  it('does not position while closed', () => {
    renderHoverCard();

    expect(capturedOptions.isOpen).toBe(false);
    expect(mockShowOverlay).not.toHaveBeenCalled();
  });

  it('pushes the card once the hook reports a position', async () => {
    const { getByText } = renderHoverCard();

    fireEvent.press(getByText('Trigger'));

    await waitFor(() => expect(mockShowOverlay).toHaveBeenCalled());
    expect(capturedOptions.isOpen).toBe(true);
  });

  it('caps the card to the space the positioner found', async () => {
    const { getByText } = renderHoverCard();

    fireEvent.press(getByText('Trigger'));
    await waitFor(() => expect(mockShowOverlay).toHaveBeenCalled());

    // Without this a tall card overflows the viewport instead of fitting.
    const [, overrides] = mockShowOverlay.mock.calls[0];
    expect(overrides.maxHeight).toBe(200);
  });

  it('marks a hover-triggered card as hover so outside clicks do not dismiss it', async () => {
    const { getByText } = renderHoverCard({ trigger: 'hover' });

    // Native falls back to press-to-toggle for hover triggers.
    fireEvent.press(getByText('Trigger'));
    await waitFor(() => expect(mockShowOverlay).toHaveBeenCalled());

    const [, overrides] = mockShowOverlay.mock.calls[0];
    expect(overrides.trigger).toBe('hover');
    expect(capturedOptions.closeOnClickOutside).toBe(false);
  });

  it('updates the open card in place when the anchor moves', async () => {
    const { getByText, rerender } = renderHoverCard();

    fireEvent.press(getByText('Trigger'));
    await waitFor(() => expect(mockShowOverlay).toHaveBeenCalled());
    const callsAfterOpen = mockShowOverlay.mock.calls.length;

    // The page scrolls: the hook reports new coordinates for the same anchor.
    await act(async () => {
      mockPosition = { ...mockPosition, y: 10, anchorOffset: 10 };
      rerender(
        <OverlayProvider>
          <HoverCard target={<Text>Trigger</Text>} trigger="click">
            <Text>Card body</Text>
          </HoverCard>
        </OverlayProvider>
      );
    });

    // Re-pushed, so the card tracks the trigger instead of being stranded.
    expect(mockShowOverlay.mock.calls.length).toBeGreaterThan(callsAfterOpen);
  });
});
