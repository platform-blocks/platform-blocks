import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Link } from '../Link';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Link (react-native-web DOM)', () => {
  it('is a real anchor named by its text', () => {
    render(<Link href="/docs">Documentation</Link>);
    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('external links open in a new tab safely and say so', () => {
    render(
      <Link href="https://example.com" external>
        Example
      </Link>
    );
    const link = screen.getByRole('link', { name: 'Example (opens in a new tab)' });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    // The ↗ glyph is decoration only.
    expect(link.querySelector('[aria-hidden="true"]')?.textContent).toContain('↗');
  });

  it('a custom onPress replaces navigation', () => {
    const onPress = jest.fn();
    render(
      <Link href="/somewhere" onPress={onPress}>
        Handled
      </Link>
    );
    const link = screen.getByRole('link', { name: 'Handled' });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(link, click);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(click.defaultPrevented).toBe(true);
  });

  it('disabled links drop href and expose aria-disabled', () => {
    render(
      <Link href="/x" disabled>
        Off
      </Link>
    );
    const link = screen.getByText('Off').closest('[role="link"]') as HTMLElement;
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('href')).toBeNull();
  });

  it('keeps array styles intact (no object spread)', () => {
    render(
      <Link href="/a" style={[{ marginTop: 7 }, { marginBottom: 9 }]} testID="styled">
        Styled
      </Link>
    );
    const link = screen.getByTestId('styled');
    expect(link.style.marginTop).toBe('7px');
    expect(link.style.marginBottom).toBe('9px');
  });

  it('flows inline inside text', () => {
    render(
      <Text>
        Read the <Link href="/docs">docs</Link>.
      </Text>
    );
    expect(screen.getByRole('link', { name: 'docs' })).toBeTruthy();
  });
});
