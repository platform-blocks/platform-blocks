import {
  formatDisplayValue,
  formatEditableValue,
  groupThousands,
  isShiftHeld,
  normalizeInput,
  resolveShiftMultiplier,
  toLocalizedString,
  type FormatOptions,
  type NormalizeOptions,
} from '../numberFormat';

const baseFormat: FormatOptions = {
  format: 'decimal',
  currency: 'USD',
  decimalSeparator: '.',
  thousandSeparator: undefined,
  thousandsGroupStyle: 'thousand',
  fixedDecimalScale: false,
  allowDecimal: true,
};

const baseNormalize: NormalizeOptions = {
  allowDecimal: true,
  allowNegative: true,
  allowLeadingZeros: true,
  decimalSeparator: '.',
  allowedDecimalSeparators: ['.'],
};

describe('groupThousands', () => {
  it('groups western, lakh and wan styles', () => {
    expect(groupThousands('1234567', ',', 'thousand')).toBe('1,234,567');
    expect(groupThousands('1234567', ',', 'lakh')).toBe('12,34,567');
    expect(groupThousands('12345678', ',', 'wan')).toBe('1234,5678');
    expect(groupThousands('123', ',', 'lakh')).toBe('123');
  });

  it('leaves the digits alone without a separator or with style none', () => {
    expect(groupThousands('1234', undefined, 'thousand')).toBe('1234');
    expect(groupThousands('1234', ',', 'none')).toBe('1234');
  });
});

describe('formatDisplayValue', () => {
  it('applies separators, scale and affixes', () => {
    expect(
      formatDisplayValue(-1234.5, {
        ...baseFormat,
        thousandSeparator: '.',
        decimalSeparator: ',',
        decimalScale: 2,
        fixedDecimalScale: true,
        prefix: '€',
      })
    ).toBe('-€1.234,50');
  });

  it('trims trailing zeros unless the scale is fixed', () => {
    expect(formatDisplayValue(1.5, { ...baseFormat, decimalScale: 3 })).toBe('1.5');
    expect(formatDisplayValue(1.5, { ...baseFormat, decimalScale: 3, fixedDecimalScale: true })).toBe('1.500');
  });

  it('truncates when decimals are not allowed and adds the percentage suffix', () => {
    expect(formatDisplayValue(12.9, { ...baseFormat, allowDecimal: false, format: 'percentage' })).toBe('12%');
  });

  it('defers to a custom formatter and blanks non-finite values', () => {
    expect(formatDisplayValue(3, { ...baseFormat, formatter: (value) => `#${value}` })).toBe('#3');
    expect(formatDisplayValue(Number.NaN, baseFormat)).toBe('');
  });
});

describe('formatEditableValue / toLocalizedString', () => {
  it('shows raw digits with the field decimal separator', () => {
    expect(formatEditableValue(1234.5, { allowDecimal: true, fixedDecimalScale: false, decimalSeparator: ',' })).toBe('1234,5');
    expect(formatEditableValue(7.9, { allowDecimal: false, fixedDecimalScale: false, decimalSeparator: '.' })).toBe('7');
    expect(
      formatEditableValue(2, { allowDecimal: true, decimalScale: 2, fixedDecimalScale: true, decimalSeparator: '.' })
    ).toBe('2.00');
    expect(toLocalizedString('', ',')).toBe('');
  });
});

describe('normalizeInput', () => {
  it('parses separators, prefix and suffix', () => {
    const result = normalizeInput('$1,234.5 USD', {
      ...baseNormalize,
      thousandSeparator: ',',
      prefix: '$',
      suffix: ' USD',
    });
    expect(result).toEqual({ normalized: '1234.5', localized: '1234.5', parsedValue: 1234.5, hasValue: true });
  });

  it('keeps partial entries without a value', () => {
    expect(normalizeInput('-', baseNormalize)).toMatchObject({ normalized: '-', hasValue: false, parsedValue: undefined });
    expect(normalizeInput('1.', baseNormalize)).toMatchObject({ normalized: '1.', parsedValue: 1, hasValue: true });
  });

  it('honours allowNegative, allowDecimal, decimalScale and leading zeros', () => {
    expect(normalizeInput('-12', { ...baseNormalize, allowNegative: false }).normalized).toBe('12');
    // Integer fields ignore a typed decimal separator.
    expect(normalizeInput('3.', { ...baseNormalize, allowDecimal: false }).normalized).toBe('3');
    expect(normalizeInput('1.23456', { ...baseNormalize, decimalScale: 2 }).normalized).toBe('1.23');
    expect(normalizeInput('007', { ...baseNormalize, allowLeadingZeros: false }).normalized).toBe('7');
  });

  it('accepts alternative decimal separators and localizes the result', () => {
    const result = normalizeInput('1,5', { ...baseNormalize, decimalSeparator: ',', allowedDecimalSeparators: [','] });
    expect(result.normalized).toBe('1.5');
    expect(result.localized).toBe('1,5');
    expect(result.parsedValue).toBe(1.5);
  });

  it('returns an empty result for empty input', () => {
    expect(normalizeInput('', baseNormalize)).toEqual({ normalized: '', localized: '', parsedValue: undefined, hasValue: false });
  });
});

describe('modifiers', () => {
  it('detects Shift from DOM-like and native events', () => {
    expect(isShiftHeld({ shiftKey: true })).toBe(true);
    expect(isShiftHeld({ nativeEvent: { getModifierState: (key) => key === 'Shift' } })).toBe(true);
    expect(isShiftHeld({ nativeEvent: { modifiers: ['Shift'] } })).toBe(true);
    expect(isShiftHeld({ shiftKey: false })).toBe(false);
    expect(isShiftHeld(undefined)).toBe(false);
  });

  it('sanitizes the shift multiplier', () => {
    expect(resolveShiftMultiplier(undefined)).toBe(10);
    expect(resolveShiftMultiplier(Number.NaN)).toBe(10);
    expect(resolveShiftMultiplier(-5)).toBe(5);
    expect(resolveShiftMultiplier(0.5)).toBe(1);
  });
});
