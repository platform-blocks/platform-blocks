import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Spotlight } from '../Spotlight';
import { SpotlightProvider, spotlight } from '../SpotlightStore';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

beforeEach(() => __resetLayerStackForTests());
afterEach(() => {
  act(() => spotlight.close());
});

async function settle(ms = 150) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

const onSettings = jest.fn();
const ACTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'docs', label: 'Documentation' },
  { id: 'settings', label: 'Settings', onPress: onSettings },
];

function App() {
  return (
    <OverlayProvider>
      <SpotlightProvider>
        <Pressable role="button" accessibilityLabel="Search docs" onPress={() => spotlight.open()}>
          <Text>Search docs</Text>
        </Pressable>
        <Spotlight actions={ACTIONS} shortcut={null} />
      </SpotlightProvider>
      <OverlayRenderer />
    </OverlayProvider>
  );
}

async function open() {
  const trigger = screen.getByRole('button', { name: 'Search docs' });
  act(() => trigger.focus());
  fireEvent.click(trigger);
  await settle();
  return trigger;
}

describe('Spotlight (react-native-web DOM)', () => {
  it('is a modal dialog with a combobox driving a listbox via aria-activedescendant', async () => {
    render(<App />);
    await open();
    const dialog = screen.getByRole('dialog', { name: 'Search' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const input = screen.getByRole('combobox');
    expect(document.activeElement).toBe(input);
    const listbox = screen.getByRole('listbox');
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(input.getAttribute('aria-activedescendant')).toBeNull();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const first = screen.getAllByRole('option')[0];
    expect(input.getAttribute('aria-activedescendant')).toBe(first.id);
    expect(first.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const last = screen.getAllByRole('option')[2];
    expect(input.getAttribute('aria-activedescendant')).toBe(last.id);
    // Focus never leaves the search field (virtual focus).
    expect(document.activeElement).toBe(input);

    fireEvent.keyDown(input, { key: 'Enter' });
    await settle();
    expect(onSettings).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog', { name: 'Search' })).toBeNull();
  });

  it('traps Tab inside and restores focus to the opener on Escape', async () => {
    render(<App />);
    const trigger = await open();
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(screen.getByRole('dialog', { name: 'Search' }).contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    // The dialog plays its exit transition before closing.
    await settle(600);
    expect(screen.queryByRole('dialog', { name: 'Search' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
