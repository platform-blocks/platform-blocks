import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Spoiler } from '../Spoiler';

/** jsdom has no layout: hand every onLayout listener a measured height. */
function layoutAll(height: number) {
  act(() => {
    document.querySelectorAll('*').forEach((el) => {
      const handler = (el as unknown as { __reactLayoutHandler?: (e: unknown) => void }).__reactLayoutHandler;
      if (typeof handler === 'function') {
        handler({ nativeEvent: { layout: { x: 0, y: 0, width: 300, height } }, timeStamp: Date.now() });
      }
    });
  });
}

describe('Spoiler (react-native-web DOM)', () => {
  it('the toggle is a button with aria-expanded and aria-controls pointing at the content', () => {
    const onExpandedChange = jest.fn();
    render(
      <PlatformBlocksProvider>
        <Spoiler mah={100} transitionDuration={0} onExpandedChange={onExpandedChange}>
          <Text>Long content</Text>
        </Spoiler>
      </PlatformBlocksProvider>
    );
    layoutAll(400);

    const toggle = screen.getByRole('button', { name: 'Show more' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    const controls = toggle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const region = document.getElementById(controls!);
    expect(region?.textContent).toBe('Long content');

    fireEvent.click(toggle);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    const hide = screen.getByRole('button', { name: 'Hide' });
    expect(hide.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders no toggle when the content fits', () => {
    render(
      <PlatformBlocksProvider>
        <Spoiler mah={100}>
          <Text>Short</Text>
        </Spoiler>
      </PlatformBlocksProvider>
    );
    layoutAll(40);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('marks a disabled toggle aria-disabled', () => {
    render(
      <PlatformBlocksProvider>
        <Spoiler mah={100} disabled>
          <Text>Long content</Text>
        </Spoiler>
      </PlatformBlocksProvider>
    );
    layoutAll(400);
    expect(screen.getByRole('button', { name: 'Show more' }).getAttribute('aria-disabled')).toBe('true');
  });
});
