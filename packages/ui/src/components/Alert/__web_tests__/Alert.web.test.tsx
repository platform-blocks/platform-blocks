import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Alert } from '../Alert';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

/**
 * Declarations that apply to an element: its inline style plus the rules of the
 * atomic classes react-native-web compiled its StyleSheet styles into.
 */
function declaredStyle(element: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {};
  const classes = new Set(Array.from(element.classList));
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      const match = /^\.([\w-]+)$/.exec(rule.selectorText);
      if (!match || !classes.has(match[1])) continue;
      for (let i = 0; i < rule.style.length; i++) {
        const prop = rule.style[i];
        out[prop] = rule.style.getPropertyValue(prop);
      }
    }
  }
  for (let i = 0; i < element.style.length; i++) {
    const prop = element.style[i];
    out[prop] = element.style.getPropertyValue(prop);
  }
  return out;
}

describe('Alert (react-native-web DOM)', () => {
  it('is an urgent alert for error and warning severities', () => {
    render(
      <>
        <Alert severity="error" title="Payment failed">Card declined</Alert>
        <Alert severity="warning" title="Draft warning" />
      </>
    );
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(alerts[0].textContent).toContain('Payment failed');
    expect(alerts[0].textContent).toContain('Card declined');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('is a polite status for info, success and plain alerts', () => {
    render(
      <>
        <Alert severity="info" title="Heads up" />
        <Alert severity="success" title="Saved" />
        <Alert title="Note" />
        <Alert color="error" variant="filled" title="Error-colored" />
      </>
    );
    expect(screen.getAllByRole('status')).toHaveLength(3);
    // A color alone makes the alert urgent too.
    expect(screen.getByRole('alert').textContent).toContain('Error-colored');
  });

  it('has a close button named "Close" with a 24px minimum target', () => {
    const onClose = jest.fn();
    render(<Alert title="Heads up" withCloseButton onClose={onClose} />);
    const close = screen.getByRole('button', { name: 'Close' });

    const style = declaredStyle(close);
    expect(parseFloat(style['min-width'])).toBeGreaterThanOrEqual(24);
    expect(parseFloat(style['min-height'])).toBeGreaterThanOrEqual(24);

    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom close label', () => {
    render(<Alert title="Heads up" withCloseButton closeButtonLabel="Dismiss message" />);
    expect(screen.getByRole('button', { name: 'Dismiss message' })).toBeTruthy();
  });
});
