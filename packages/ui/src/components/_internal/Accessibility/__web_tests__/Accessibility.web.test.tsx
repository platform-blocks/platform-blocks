import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../../core/theme/PlatformBlocksProvider';
import { AccessibleAnnouncer, AccessibleModal } from '../AccessibleComponents';
import { ErrorBoundaryFallback, Landmark, LiveRegion, ProgressIndicator, SkipLink } from '../AccessibilityHelpers';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Accessibility helpers (react-native-web DOM)', () => {
  it('ProgressIndicator exposes a named progressbar with its value', () => {
    render(<ProgressIndicator value={30} max={60} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('60');
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-valuetext')).toBe('50% complete');
    expect(screen.getByText('Upload (50%)')).toBeTruthy();
  });

  it('Landmark renders the requested landmark role and name', () => {
    render(
      <Landmark role="navigation" label="Primary">
        <Text>links</Text>
      </Landmark>
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
  });

  it('LiveRegion is a polite (optionally atomic) live region', () => {
    render(
      <LiveRegion atomic>
        <Text>3 results</Text>
      </LiveRegion>
    );
    const region = screen.getByText('3 results').closest('[aria-live]');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('aria-atomic')).toBe('true');
  });

  it('AccessibleAnnouncer lists announcements in a polite status region', () => {
    const { container } = render(
      <AccessibleAnnouncer announcements={['Saved']}>
        <Text>content</Text>
      </AccessibleAnnouncer>
    );
    // (The library's global announce() region lives outside the render container.)
    const status = within(container).getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('Saved');
  });

  it('SkipLink is a named link that focuses its in-page target', () => {
    const target = document.createElement('main');
    target.id = 'main-content';
    document.body.appendChild(target);
    const onPress = jest.fn();

    render(
      <SkipLink href="#main-content" onPress={onPress}>
        main content
      </SkipLink>
    );
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    fireEvent.click(link);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(target);
    expect(target.getAttribute('tabindex')).toBe('-1');
    target.remove();
  });

  it('ErrorBoundaryFallback is an alert with a named retry button', () => {
    const resetError = jest.fn();
    render(<ErrorBoundaryFallback error={new Error('Boom')} resetError={resetError} />);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Something went wrong');
    expect(alert.textContent).toContain('Boom');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(resetError).toHaveBeenCalledTimes(1);
  });

  it('AccessibleModal is a modal dialog named by its title that closes on Escape', () => {
    const onDismiss = jest.fn();
    render(
      <AccessibleModal visible title="Saved" onDismiss={onDismiss}>
        <Pressable role="button" onPress={() => {}}>
          <Text>OK</Text>
        </Pressable>
      </AccessibleModal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Saved' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    // Focus moved into the dialog.
    expect(dialog.contains(document.activeElement)).toBe(true);

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('AccessibleModal renders nothing while hidden', () => {
    render(
      <AccessibleModal visible={false} title="Hidden">
        <Text>body</Text>
      </AccessibleModal>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
