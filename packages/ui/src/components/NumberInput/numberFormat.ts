/**
 * Pure number formatting / parsing for NumberInput: locale-style separators,
 * thousands grouping (western, lakh, wan), prefixes/suffixes, currency and
 * percentage formats. No React, no platform code — unit tested on its own.
 */

export const DEFAULT_DECIMAL_SEPARATOR = '.';

export type ThousandsGroupStyle = 'none' | 'thousand' | 'lakh' | 'wan';
export type NumberFormat = 'integer' | 'decimal' | 'currency' | 'percentage';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Narrow currency symbol for an ISO code (`'USD'` → `'$'`), or `''` when the runtime can't tell. */
export function getCurrencySymbol(currency: string): string {
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    });
    return formatter.formatToParts(0).find((part) => part.type === 'currency')?.value ?? '';
  } catch {
    return '';
  }
}

/** Inserts `separator` into an integer digit string: 1,234,567 / 12,34,567 (lakh) / 123,4567 (wan). */
export function groupThousands(intPart: string, separator: string | undefined, style: ThousandsGroupStyle): string {
  if (!separator || style === 'none') {
    return intPart;
  }

  const part = intPart === '' ? '0' : intPart;

  switch (style) {
    case 'lakh': {
      if (part.length <= 3) return part;
      const lastThree = part.slice(-3);
      let remaining = part.slice(0, -3);
      const groups: string[] = [];
      while (remaining.length > 2) {
        groups.unshift(remaining.slice(-2));
        remaining = remaining.slice(0, -2);
      }
      if (remaining.length) {
        groups.unshift(remaining);
      }
      return `${groups.join(separator)}${separator}${lastThree}`;
    }
    case 'wan':
      return part.replace(/\B(?=(\d{4})+(?!\d))/g, separator);
    case 'thousand':
    default:
      return part.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }
}

export interface FormatOptions {
  format?: NumberFormat;
  currency: string;
  decimalSeparator: string;
  thousandSeparator?: string;
  thousandsGroupStyle: ThousandsGroupStyle;
  decimalScale?: number;
  precision?: number;
  fixedDecimalScale: boolean;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  allowDecimal: boolean;
}

/** `toFixed(scale)` with trailing zeros trimmed unless `fixed`. */
function toScaledString(value: number, scale: number | undefined, fixed: boolean): string {
  let base: string;
  if (typeof scale === 'number') {
    base = value.toFixed(scale);
    if (!fixed && scale > 0) {
      base = base.replace(/(\.\d*?)0+$/, (_, group: string) => (group === '.' ? '' : group));
    }
  } else {
    base = value.toString();
  }
  return base.replace(/\.$/, '');
}

/** The value as displayed while the field is NOT being edited (separators, prefix/suffix, custom formatter). */
export function formatDisplayValue(value: number, options: FormatOptions): string {
  if (!Number.isFinite(value)) return '';
  if (options.formatter) return options.formatter(value);

  const {
    format,
    currency,
    decimalSeparator,
    thousandSeparator,
    thousandsGroupStyle,
    decimalScale,
    precision,
    fixedDecimalScale,
    prefix,
    suffix,
    allowDecimal,
  } = options;

  const effectivePrefix = prefix ?? (format === 'currency' ? getCurrencySymbol(currency) : undefined);
  const effectiveSuffix = suffix ?? (format === 'percentage' ? '%' : undefined);

  const resolvedDecimalScale = allowDecimal ? (decimalScale ?? precision) : 0;
  const workingValue = allowDecimal ? value : Math.trunc(value);

  const sign = workingValue < 0 ? '-' : '';
  const base = toScaledString(Math.abs(workingValue), resolvedDecimalScale, fixedDecimalScale);

  const [intPartRaw, fracPart = ''] = base.split('.');
  const intPart = groupThousands(intPartRaw, thousandSeparator, thousandsGroupStyle);
  const decimalPortion = fracPart.length > 0 ? `${decimalSeparator}${fracPart}` : '';

  return `${sign}${effectivePrefix ?? ''}${intPart}${decimalPortion}${effectiveSuffix ?? ''}`;
}

export interface EditableFormatOptions {
  allowDecimal: boolean;
  decimalScale?: number;
  fixedDecimalScale: boolean;
  decimalSeparator: string;
}

/** The value as shown while the field is being edited: digits and the decimal separator only. */
export function formatEditableValue(value: number, options: EditableFormatOptions): string {
  if (!Number.isFinite(value)) return '';
  const normalized = options.allowDecimal
    ? toScaledString(value, options.decimalScale, options.fixedDecimalScale)
    : Math.trunc(value).toString();
  return toLocalizedString(normalized, options.decimalSeparator);
}

/** `'1.5'` → `'1,5'` for a `,` decimal separator. */
export function toLocalizedString(normalized: string, decimalSeparator: string): string {
  if (!normalized) return '';
  if (decimalSeparator === DEFAULT_DECIMAL_SEPARATOR) return normalized;
  return normalized.replace('.', decimalSeparator);
}

export interface NormalizeOptions {
  allowDecimal: boolean;
  allowNegative: boolean;
  allowLeadingZeros: boolean;
  decimalSeparator: string;
  allowedDecimalSeparators: string[];
  decimalScale?: number;
  thousandSeparator?: string;
  prefix?: string;
  suffix?: string;
}

export interface NormalizeResult {
  /** Canonical number text (`.` decimal point), possibly partial (`'-'`, `'1.'`). */
  normalized: string;
  /** `normalized` with the field's decimal separator, for display while editing. */
  localized: string;
  /** The parsed number, when `normalized` holds a finite one. */
  parsedValue?: number;
  /** Whether any digit was entered. */
  hasValue: boolean;
}

/**
 * Cleans what the user typed into number text: strips prefix/suffix and
 * thousands separators, accepts any allowed decimal separator, drops disallowed
 * signs/decimals, truncates to `decimalScale`, trims leading zeros.
 */
export function normalizeInput(value: string, options: NormalizeOptions): NormalizeResult {
  if (!value) {
    return { normalized: '', localized: '', parsedValue: undefined, hasValue: false };
  }

  let input = value.trim();

  if (options.prefix && input.startsWith(options.prefix)) {
    input = input.slice(options.prefix.length);
  }

  if (options.suffix && input.endsWith(options.suffix)) {
    input = input.slice(0, -options.suffix.length);
  }

  if (options.thousandSeparator) {
    const pattern = new RegExp(escapeRegExp(options.thousandSeparator), 'g');
    input = input.replace(pattern, '');
  }

  input = input.replace(/\s+/g, '');

  const decimalChars = new Set<string>(options.allowedDecimalSeparators);
  decimalChars.add(options.decimalSeparator);
  decimalChars.add(DEFAULT_DECIMAL_SEPARATOR);

  let normalized = '';
  let hasDecimal = false;
  let endedWithDecimal = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (char >= '0' && char <= '9') {
      normalized += char;
      endedWithDecimal = false;
      continue;
    }

    if ((char === '-' || char === '+') && normalized.length === 0) {
      if (char === '-' && options.allowNegative) {
        normalized += char;
      }
      endedWithDecimal = false;
      continue;
    }

    if (options.allowDecimal && decimalChars.has(char)) {
      if (!hasDecimal) {
        normalized += '.';
        hasDecimal = true;
        endedWithDecimal = true;
      }
    }
  }

  if (!options.allowNegative) {
    normalized = normalized.replace(/-/g, '');
  } else if (normalized.includes('-', 1)) {
    normalized = normalized[0] === '-' ? `-${normalized.slice(1).replace(/-/g, '')}` : normalized.replace(/-/g, '');
  }

  if (!options.allowDecimal) {
    const decimalIndex = normalized.indexOf('.');
    if (decimalIndex !== -1) {
      normalized = normalized.slice(0, decimalIndex);
      hasDecimal = false;
      endedWithDecimal = false;
    }
  }

  if (options.decimalScale !== undefined && options.decimalScale >= 0 && hasDecimal) {
    const [intPart, fracPartRaw = ''] = normalized.split('.');
    const truncated = fracPartRaw.slice(0, options.decimalScale);
    const keepDecimal = options.decimalScale > 0 && (truncated.length > 0 || endedWithDecimal);

    if (options.decimalScale === 0) {
      normalized = intPart;
      hasDecimal = false;
      endedWithDecimal = false;
    } else {
      normalized = truncated.length > 0 ? `${intPart}.${truncated}` : `${intPart}${keepDecimal ? '.' : ''}`;
      hasDecimal = truncated.length > 0 || keepDecimal;
      endedWithDecimal = truncated.length === 0 && keepDecimal;
    }
  }

  if (!options.allowLeadingZeros) {
    const negative = normalized.startsWith('-');
    let body = negative ? normalized.slice(1) : normalized;
    const [intPartRaw, fracRaw = ''] = body.split('.');
    let intPart = intPartRaw.replace(/^0+(?=\d)/, '');
    if (intPart === '') intPart = '0';

    if (fracRaw) {
      body = `${intPart}.${fracRaw}`;
    } else {
      body = intPart + (endedWithDecimal ? '.' : '');
    }

    normalized = negative ? `-${body}` : body;
  }

  const digits = normalized.replace(/[^0-9]/g, '');
  const hasValue = digits.length > 0;
  const parsedValue = hasValue ? Number(normalized) : undefined;

  return {
    normalized,
    localized: toLocalizedString(normalized, options.decimalSeparator),
    parsedValue: Number.isFinite(parsedValue) ? parsedValue : undefined,
    hasValue,
  };
}

/** Anything carrying keyboard/pointer modifier state (DOM events, RN events, their `nativeEvent`). */
export interface ModifierEventLike {
  shiftKey?: boolean;
  getModifierState?: (key: string) => boolean;
  modifiers?: unknown;
  modifierFlags?: unknown;
  nativeEvent?: ModifierEventLike;
}

/** Whether Shift is held in `event` (web keyboard/pointer events, or native modifier lists). */
export function isShiftHeld(event: ModifierEventLike | null | undefined): boolean {
  const native = event?.nativeEvent ?? event;
  if (!native) return false;

  if (typeof native.getModifierState === 'function') {
    try {
      if (native.getModifierState('Shift')) return true;
    } catch {
      // Some synthetic events throw from getModifierState; fall through.
    }
  }

  if (native.shiftKey) return true;

  const modifiers = native.modifiers ?? native.modifierFlags;
  return Array.isArray(modifiers) && modifiers.some((mod) => typeof mod === 'string' && mod.toLowerCase() === 'shift');
}

/** `shiftMultiplier` sanitized: finite, absolute, at least 1 (default 10). */
export function resolveShiftMultiplier(shiftMultiplier: number | undefined): number {
  if (typeof shiftMultiplier !== 'number' || !Number.isFinite(shiftMultiplier)) return 10;
  const absolute = Math.abs(shiftMultiplier);
  return absolute >= 1 ? absolute : 1;
}
