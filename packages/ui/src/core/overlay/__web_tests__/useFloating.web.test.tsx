import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { OverlayProvider } from '../../providers/OverlayProvider';
import { OverlayRenderer } from '../../providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../layerStack';
import { useFloating } from '../useFloating';

// jsdom has no layout; give every element a box so the positioner can place it.
const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 180, bottom: 80, width: 160, height: 40, toJSON: () => ({}) } as DOMRect;
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

function Harness({ withRestoreTarget }: { withRestoreTarget?: boolean }) {
  const [opened, setOpened] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const floating = useFloating({
    opened,
    onDismiss: () => setOpened(false),
    restoreFocusRef: withRestoreTarget ? inputRef : undefined,
  });
  return (
    <View>
      <TextInput ref={inputRef} accessibilityLabel="Query" />
      <Pressable {...floating.getReferenceProps()} role="button" accessibilityLabel="Open" onPress={() => setOpened(true)}>
        <Text>Open</Text>
      </Pressable>
      {floating.renderFloating(
        <View {...floating.getFloatingProps()}>
          <Pressable role="button" accessibilityLabel="Inside">
            <Text>Inside</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

async function openAndEscape() {
  const trigger = screen.getByRole('button', { name: 'Open' });
  act(() => {
    trigger.focus();
  });
  fireEvent.click(trigger);
  await settle();
  const inside = screen.getByRole('button', { name: 'Inside' });
  // Focus moved into the layer (its positioned container or the content).
  expect(document.activeElement?.contains(inside)).toBe(true);
  fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
  await settle();
  expect(screen.queryByRole('button', { name: 'Inside' })).toBeNull();
  return trigger;
}

describe('useFloating focus restore (react-native-web DOM)', () => {
  it('returns focus to the anchor by default', async () => {
    render(
      <OverlayProvider>
        <Harness />
        <OverlayRenderer />
      </OverlayProvider>
    );
    const trigger = await openAndEscape();
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to restoreFocusRef when given', async () => {
    render(
      <OverlayProvider>
        <Harness withRestoreTarget />
        <OverlayRenderer />
      </OverlayProvider>
    );
    await openAndEscape();
    expect(document.activeElement).toBe(screen.getByLabelText('Query'));
  });
});
