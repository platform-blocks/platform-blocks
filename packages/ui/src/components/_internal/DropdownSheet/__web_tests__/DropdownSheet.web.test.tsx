import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { DropdownSheet } from '../DropdownSheet';
import { __resetLayerStackForTests } from '../../../../core/overlay/layerStack';

beforeEach(() => __resetLayerStackForTests());

async function settle(ms = 100) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function Picker() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Pressable role="button" accessibilityLabel="Pick a color" onPress={() => setOpened(true)}>
        <Text>Pick a color</Text>
      </Pressable>
      {/* jsdom never fires animationend, so the fade-out would never unmount. */}
      <DropdownSheet opened={opened} onClose={() => setOpened(false)} title="Choose a color" animationType="none">
        <Pressable role="button" accessibilityLabel="Red"><Text>Red</Text></Pressable>
        <Pressable role="button" accessibilityLabel="Blue"><Text>Blue</Text></Pressable>
      </DropdownSheet>
    </>
  );
}

describe('DropdownSheet (react-native-web DOM)', () => {
  it('is a modal dialog with a labelled close button; focus moves in, is trapped, and returns on Escape', async () => {
    render(<Picker />);
    const trigger = screen.getByRole('button', { name: 'Pick a color' });
    act(() => trigger.focus());
    fireEvent.click(trigger);
    await settle();

    const sheet = screen.getByRole('dialog', { name: 'Choose a color' });
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    const close = screen.getByRole('button', { name: 'Close' });
    // First tabbable (the close button) takes focus.
    expect(document.activeElement).toBe(close);

    const blue = screen.getByRole('button', { name: 'Blue' });
    act(() => blue.focus());
    fireEvent.keyDown(blue, { key: 'Tab' });
    expect(document.activeElement).toBe(close);

    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('dialog', { name: 'Choose a color' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
