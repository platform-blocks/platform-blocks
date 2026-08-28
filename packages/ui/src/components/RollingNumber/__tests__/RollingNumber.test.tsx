import React from 'react';
import { Text as RNText } from 'react-native';
import { render } from '@testing-library/react-native';

import { RollingNumber } from '../RollingNumber';
import { formatRollingValue, toRollingCells } from '../formatValue';

describe('formatRollingValue', () => {
  it('renders a plain integer unchanged', () => {
    expect(formatRollingValue(1234)).toBe('1234');
  });

  it('groups thousands', () => {
    expect(formatRollingValue(1234567, { thousandSeparator: true })).toBe('1,234,567');
    expect(formatRollingValue(1234567, { thousandSeparator: ' ' })).toBe('1 234 567');
  });

  it('never leads with a separator', () => {
    expect(formatRollingValue(100, { thousandSeparator: true })).toBe('100');
    expect(formatRollingValue(1000, { thousandSeparator: true })).toBe('1,000');
  });

  it('pads to a fixed decimal scale', () => {
    expect(formatRollingValue(99.5, { decimalScale: 2, fixedDecimalScale: true })).toBe('99.50');
  });

  it('trims padding zeros when the scale is not fixed', () => {
    expect(formatRollingValue(99.5, { decimalScale: 2 })).toBe('99.5');
    expect(formatRollingValue(99, { decimalScale: 2 })).toBe('99');
  });

  it('keeps the sign outside the grouped digits', () => {
    expect(formatRollingValue(-1234.5, { thousandSeparator: true, decimalScale: 1, fixedDecimalScale: true }))
      .toBe('-1,234.5');
  });

  it('does not render a sign for a value that rounds to zero', () => {
    expect(formatRollingValue(-0.001, { decimalScale: 2, fixedDecimalScale: true })).toBe('0.00');
  });

  it('honours a custom decimal separator', () => {
    expect(formatRollingValue(1234.5, {
      thousandSeparator: '.',
      decimalSeparator: ',',
      decimalScale: 2,
      fixedDecimalScale: true,
    })).toBe('1.234,50');
  });

  it('falls back to zero for a non-finite value', () => {
    expect(formatRollingValue(Number.NaN)).toBe('0');
    expect(formatRollingValue(Number.POSITIVE_INFINITY)).toBe('0');
  });

  it('expands exponent notation into digits that can actually roll', () => {
    expect(formatRollingValue(1e-7)).not.toContain('e');
  });
});

describe('toRollingCells', () => {
  it('keys digits by place value, not string index', () => {
    const cells = toRollingCells('123');
    expect(cells.map((cell) => cell.key)).toEqual(['d2', 'd1', 'd0']);
  });

  it('keeps a digit key stable when the number gains a column', () => {
    const before = toRollingCells('999', '.');
    const after = toRollingCells('1,000', '.');
    // The ones column is still `d0` on both sides, so it animates 9 → 0 rather
    // than being unmounted and remounted as a different column.
    expect(before[before.length - 1].key).toBe('d0');
    expect(after[after.length - 1].key).toBe('d0');
  });

  it('numbers the fraction outward from the decimal point', () => {
    const cells = toRollingCells('1.25').filter((cell) => cell.isDigit);
    expect(cells.map((cell) => cell.place)).toEqual([0, -1, -2]);
  });

  it('marks separators as static', () => {
    const separators = toRollingCells('1,000').filter((cell) => !cell.isDigit);
    expect(separators).toHaveLength(1);
    expect(separators[0].char).toBe(',');
  });
});

describe('RollingNumber', () => {
  const digitTexts = (api: ReturnType<typeof render>) =>
    api.UNSAFE_getAllByType(RNText).map((node) => node.props.children);

  it('renders every digit column as a full 0–9 strip', () => {
    const api = render(<RollingNumber value={42} />);
    const texts = digitTexts(api);
    // Two columns × ten digits, plus the transparent selection copy on web only.
    expect(texts.filter((text) => text === '7')).toHaveLength(2);
  });

  it('exposes the formatted value to assistive tech instead of the strips', () => {
    const api = render(
      <RollingNumber value={1234.5} prefix="$ " suffix=" USD" decimalScale={2} fixedDecimalScale thousandSeparator />
    );
    expect(api.getByLabelText('$ 1,234.50 USD')).toBeTruthy();
  });

  it('lets an explicit accessibilityLabel win', () => {
    const api = render(<RollingNumber value={12} accessibilityLabel="Twelve items" />);
    expect(api.getByLabelText('Twelve items')).toBeTruthy();
  });

  it('renders prefix and suffix as static text', () => {
    const api = render(<RollingNumber value={5} prefix="~" suffix="%" />);
    const texts = digitTexts(api);
    expect(texts).toContain('~');
    expect(texts).toContain('%');
  });

  it('survives a value change without remounting', () => {
    const api = render(<RollingNumber value={9} />);
    expect(() => api.rerender(<RollingNumber value={10} />)).not.toThrow();
    expect(api.getByLabelText('10')).toBeTruthy();
  });
});
