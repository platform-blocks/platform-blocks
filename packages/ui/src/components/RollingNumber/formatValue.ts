export interface FormatRollingValueOptions {
  /** Number of decimal places to render. Omit to keep the value's own precision. */
  decimalScale?: number;
  /** Pad the decimal part with zeros up to `decimalScale`. */
  fixedDecimalScale?: boolean;
  /** `true` for `,`, or an explicit separator string. */
  thousandSeparator?: boolean | string;
  /** Character between the integer and decimal parts. Default `.`. */
  decimalSeparator?: string;
}

const DEFAULT_THOUSAND_SEPARATOR = ',';
const DEFAULT_DECIMAL_SEPARATOR = '.';

const groupIntegerDigits = (digits: string, separator: string): string => {
  if (!separator) return digits;
  let out = '';
  for (let i = 0; i < digits.length; i += 1) {
    // Insert ahead of every third digit counted from the right, never leading.
    const fromRight = digits.length - i;
    if (i > 0 && fromRight % 3 === 0) out += separator;
    out += digits[i];
  }
  return out;
};

/**
 * Renders a number the way the component should display it.
 *
 * Kept free of React so the digit-splitting logic and its edge cases (negative
 * zero, exponent notation, fixed decimals) are testable on their own.
 */
export const formatRollingValue = (
  value: number,
  options: FormatRollingValueOptions = {}
): string => {
  const {
    decimalScale,
    fixedDecimalScale = false,
    thousandSeparator = false,
    decimalSeparator = DEFAULT_DECIMAL_SEPARATOR,
  } = options;

  const safeValue = Number.isFinite(value) ? value : 0;

  let body: string;
  if (typeof decimalScale === 'number' && decimalScale >= 0) {
    const scale = Math.min(Math.max(Math.trunc(decimalScale), 0), 20);
    body = Math.abs(safeValue).toFixed(scale);
    if (!fixedDecimalScale && scale > 0) {
      // Trim padding zeros, then the separator itself if nothing survived.
      body = body.replace(/\.?0+$/, '');
    }
  } else {
    // `toFixed(20)` would introduce float noise; String() keeps the shortest
    // round-tripping representation, which is what a plain counter wants.
    body = String(Math.abs(safeValue));
    if (body.includes('e')) {
      // Exponent notation has no digits to roll — expand it to a plain decimal.
      body = Math.abs(safeValue).toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
    }
  }

  const [rawInt, rawFrac = ''] = body.split('.');
  const separator = thousandSeparator === true
    ? DEFAULT_THOUSAND_SEPARATOR
    : (typeof thousandSeparator === 'string' ? thousandSeparator : '');

  const intPart = separator ? groupIntegerDigits(rawInt, separator) : rawInt;
  const sign = safeValue < 0 && Number(body) !== 0 ? '-' : '';

  return rawFrac
    ? `${sign}${intPart}${decimalSeparator}${rawFrac}`
    : `${sign}${intPart}`;
};

export interface RollingCell {
  /** Stable identity across renders — digits keep their place value. */
  key: string;
  char: string;
  isDigit: boolean;
  /**
   * Place value: `0` is the ones column, `1` the tens, `-1` the tenths. Digits
   * are keyed by this rather than by string index so crossing a magnitude
   * (`999` → `1,000`) does not renumber every column and restart its animation.
   */
  place: number;
}

const isDigitChar = (char: string) => char >= '0' && char <= '9';

/** Splits a formatted number into animated digit cells and static separators. */
export const toRollingCells = (
  formatted: string,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): RollingCell[] => {
  const chars = Array.from(formatted);
  const decimalIndex = chars.lastIndexOf(decimalSeparator);
  const places = new Array<number>(chars.length).fill(0);

  let place = 0;
  for (let i = (decimalIndex === -1 ? chars.length : decimalIndex) - 1; i >= 0; i -= 1) {
    if (isDigitChar(chars[i])) {
      places[i] = place;
      place += 1;
    }
  }

  let fractionPlace = -1;
  for (let i = decimalIndex + 1; decimalIndex !== -1 && i < chars.length; i += 1) {
    if (isDigitChar(chars[i])) {
      places[i] = fractionPlace;
      fractionPlace -= 1;
    }
  }

  return chars.map((char, index) => {
    const digit = isDigitChar(char);
    return {
      key: digit ? `d${places[index]}` : `s${index}:${char}`,
      char,
      isDigit: digit,
      place: places[index],
    };
  });
};
