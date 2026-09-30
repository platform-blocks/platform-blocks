import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { RollingNumber } from '../RollingNumber';

const render = (ui: React.ReactElement) =>
  rtlRender(<PlocksProvider reducedMotion={false}>{ui}</PlocksProvider>);

/** The text assistive technology gets: everything outside aria-hidden subtrees. */
function accessibleText(element: HTMLElement): string {
  const copy = element.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return copy.textContent ?? '';
}

describe('RollingNumber (react-native-web DOM)', () => {
  it('exposes only the final formatted value; the rolling digit strips are hidden', () => {
    const { rerender } = render(
      <RollingNumber testID="n" value={1234.5} prefix="$" decimalScale={2} fixedDecimalScale thousandSeparator />
    );
    const root = screen.getByTestId('n');
    // Every digit column holds 0-9, all inside the aria-hidden row.
    const hidden = root.querySelector('[aria-hidden="true"]');
    expect(hidden?.textContent).toContain('0123456789');
    expect(accessibleText(root)).toBe('$1,234.50');

    // A new value is readable at once — never an in-between frame of the roll.
    rerender(
      <PlocksProvider reducedMotion={false}>
        <RollingNumber testID="n" value={1250} prefix="$" decimalScale={2} fixedDecimalScale thousandSeparator />
      </PlocksProvider>
    );
    expect(accessibleText(screen.getByTestId('n'))).toBe('$1,250.00');
  });

  it('reads a custom label instead of the digits', () => {
    render(<RollingNumber testID="n" value={12} accessibilityLabel="Twelve items" />);
    expect(accessibleText(screen.getByTestId('n'))).toBe('Twelve items');
  });

  it('adds no live region of its own (a surrounding one announces the value once)', () => {
    render(<RollingNumber testID="n" value={7} />);
    const root = screen.getByTestId('n');
    expect(root.querySelector('[aria-live]')).toBeNull();
    expect(root.hasAttribute('aria-live')).toBe(false);
  });
});
