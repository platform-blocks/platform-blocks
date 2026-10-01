import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { IconButton } from '../../IconButton';
import { FloatingActions } from '../FloatingActions';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

function actionPosition(name: string) {
  let node = screen.getByRole('button', { name }).parentElement;
  while (node && getComputedStyle(node).position !== 'absolute') node = node.parentElement;
  if (!node) throw new Error(`No positioned wrapper for ${name}`);
  const style = getComputedStyle(node);
  return { bottom: parseFloat(style.bottom), end: parseFloat(style.right) };
}

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

  it('stacks actions above the trigger and can keep their labels visible', () => {
    render(<FloatingActions actions={actions} labelMode="persistent" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));

    const first = actionPosition('New file');
    const second = actionPosition('Search');
    expect(first.end).toBe(second.end);
    expect(first.bottom).toBeGreaterThan(second.bottom);
    expect(screen.getByText('New file')).toBeTruthy();
    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('fans actions above and toward the start side in flower mode', () => {
    render(<FloatingActions actions={actions} mode="flower" labelMode="none" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));

    const first = actionPosition('New file');
    const second = actionPosition('Search');
    expect(first.bottom).toBeGreaterThan(second.bottom);
    expect(first.end).toBeLessThan(second.end);
  });

  it('opens on hover, stays open while crossing to an action, and closes after leaving', () => {
    jest.useFakeTimers();
    const media = jest.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(hover: hover) and (pointer: fine)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    try {
      render(<FloatingActions actions={actions} trigger="hover" testID="dial" />);
      const dial = screen.getByTestId('dial');
      fireEvent.mouseEnter(dial);
      expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy();
      fireEvent.mouseLeave(dial);
      act(() => jest.advanceTimersByTime(100));
      fireEvent.mouseEnter(dial);
      act(() => jest.advanceTimersByTime(150));
      expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy();
      fireEvent.mouseLeave(dial);
      act(() => jest.advanceTimersByTime(150));
      expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    } finally {
      media.mockRestore();
      jest.useRealTimers();
    }
  });

  it('uses click activation when hover is unavailable', () => {
    render(<FloatingActions actions={actions} trigger="hover" testID="dial" />);
    fireEvent.mouseEnter(screen.getByTestId('dial'));
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy();
  });

  it('uses Button theme roles and per-action colors, including disabled behavior', () => {
    const disabledPress = jest.fn();
    render(<>
      <FloatingActions actions={[
        { key: 'a', icon: 'plus', accessibilityLabel: 'New file', onPress: jest.fn(), color: 'error' },
        { key: 'b', icon: 'search', accessibilityLabel: 'Search', onPress: disabledPress, disabled: true },
      ]} />
      <IconButton icon="plus" accessibilityLabel="Reference" variant="filled" color="error" size="xl" />
    </>);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    const action = screen.getByRole('button', { name: 'New file' });
    const reference = screen.getByRole('button', { name: 'Reference' });
    expect(action.style.backgroundColor).toBe(reference.style.backgroundColor);
    const iconStroke = action.querySelector('svg')?.getAttribute('stroke');
    expect(iconStroke).toBeTruthy();
    expect(iconStroke).toBe(reference.querySelector('svg')?.getAttribute('stroke'));
    const disabled = screen.getByRole('button', { name: 'Search' });
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(disabled);
    expect(disabledPress).not.toHaveBeenCalled();
  });

  it('supports a controlled open state', () => {
    const onChange = jest.fn();
    const { rerender } = render(<FloatingActions actions={actions} opened={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open actions' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    rerender(<PlocksProvider><FloatingActions actions={actions} opened onChange={onChange} /></PlocksProvider>);
    expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy();
  });

  it('allows themed trigger variants and distinct open and close icons', () => {
    render(<>
      <FloatingActions actions={actions} variant="outline" color="error" toggleIcon="search" closeIcon="close" />
      <IconButton icon="search" accessibilityLabel="Reference" variant="outline" color="error" size="3xl" />
    </>);
    const closed = screen.getByRole('button', { name: 'Open actions' });
    const reference = screen.getByRole('button', { name: 'Reference' });
    expect(closed.style.borderTopColor).toBe(reference.style.borderTopColor);
    expect(closed.querySelector('svg path')?.getAttribute('d')).toBe(reference.querySelector('svg path')?.getAttribute('d'));
    fireEvent.click(closed);
    const opened = screen.getByRole('button', { name: 'Close actions' });
    expect(opened.querySelector('svg path')?.getAttribute('d')).not.toBe(reference.querySelector('svg path')?.getAttribute('d'));
  });
});
