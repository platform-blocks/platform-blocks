import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { FloatingActions } from '../FloatingActions';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('FloatingActions (react-native-web DOM)', () => {
  const actions = [
    { key: 'a', icon: 'plus', onPress: jest.fn(), accessibilityLabel: 'New file' },
    { key: 'b', icon: 'search', onPress: jest.fn(), accessibilityLabel: 'Search' },
  ];

  it('the main button is a disclosure that reveals labelled actions', () => {
    render(<FloatingActions actions={actions} />);
    const toggle = screen.getByRole('button', { name: 'Open actions' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'New file' })).toBeNull();

    fireEvent.click(toggle);
    const close = screen.getByRole('button', { name: 'Close actions' });
    expect(close.getAttribute('aria-expanded')).toBe('true');
    const controlled = close.getAttribute('aria-controls');
    expect(controlled && document.getElementById(controlled)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'New file' })).toBeTruthy();
  });

  it('Escape closes it', () => {
    render(<FloatingActions actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.getByRole('button', { name: 'Open actions' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('an action runs and closes the dial', () => {
    render(<FloatingActions actions={actions} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(actions[1].onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
  });

  it('adds the Spotlight and GitHub defaults only when their props are set', () => {
    const { unmount } = render(<FloatingActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Open spotlight' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open GitHub' })).toBeNull();
    unmount();

    const onOpenSpotlight = jest.fn();
    render(<FloatingActions onOpenSpotlight={onOpenSpotlight} githubUrl="https://github.com/acme/app" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    expect(screen.getByRole('button', { name: 'Open GitHub' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open spotlight' }));
    expect(onOpenSpotlight).toHaveBeenCalledTimes(1);
  });
});
