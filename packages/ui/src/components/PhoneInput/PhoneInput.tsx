import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  type NativeSyntheticEvent,
  type TextInput,
  type TextInputSelectionChangeEventData
} from 'react-native';
import {
  PhoneChangeMeta,
  PhoneCountryCode,
  PhoneFormat,
  PhoneInputProps
} from './types';
import { TextInputBase } from '../Input/InputBase';
import { Flex } from '../Flex';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { Menu, MenuDropdown, MenuItem } from '../Menu';
import { createMask, type Mask } from '../../hooks/useMaskedInput/utils/mask';
import { useControllableState } from '../../hooks/useControllableState';

/**
 * Built-in country presets.
 *
 * Each mask covers the **national** number only; the dial code is rendered as a
 * separate prefix. The mask also defines how many digits the field accepts, so
 * there is no second length field that can drift out of sync with it.
 */
export const PHONE_FORMATS: Record<string, PhoneFormat> = {
  US: {
    name: 'United States',
    countryCode: '+1',
    mask: '(000) 000-0000',
    placeholder: '(555) 123-4567'
  },
  CA: {
    name: 'Canada',
    countryCode: '+1',
    mask: '(000) 000-0000',
    placeholder: '(555) 123-4567'
  },
  GB: {
    name: 'United Kingdom',
    countryCode: '+44',
    mask: '0000 000000',
    placeholder: '7911 123456',
    trunkPrefix: '0'
  },
  FR: {
    name: 'France',
    countryCode: '+33',
    mask: '00 00 00 00 00',
    placeholder: '01 23 45 67 89',
    trunkPrefix: '0'
  },
  DE: {
    name: 'Germany',
    countryCode: '+49',
    mask: '000 00000000',
    placeholder: '030 12345678',
    trunkPrefix: '0'
  },
  AU: {
    name: 'Australia',
    countryCode: '+61',
    mask: '000 000 000',
    placeholder: '412 345 678',
    trunkPrefix: '0'
  },
  BR: {
    name: 'Brazil',
    countryCode: '+55',
    mask: '(00) 00000-0000',
    placeholder: '(11) 99999-9999'
  },
  IN: {
    name: 'India',
    countryCode: '+91',
    mask: '00000 00000',
    placeholder: '98765 43210'
  },
  JP: {
    name: 'Japan',
    countryCode: '+81',
    mask: '00-0000-0000',
    placeholder: '90-1234-5678',
    trunkPrefix: '0'
  },
  INTL: {
    name: 'International',
    countryCode: '',
    mask: '000 000 000 000 000',
    placeholder: 'Enter phone number'
  }
};

/** Countries offered by the built-in picker, in display order. */
export const PHONE_COUNTRIES: PhoneCountryCode[] = [
  'US', 'CA', 'GB', 'FR', 'DE', 'AU', 'BR', 'IN', 'JP', 'INTL'
];

/** Non-ISO spellings accepted for `country`. */
const COUNTRY_ALIASES: Record<string, PhoneCountryCode> = { UK: 'GB' };

/** Normalise a caller-supplied country to a key of `PHONE_FORMATS`. */
export function resolvePhoneCountry(country?: PhoneCountryCode): PhoneCountryCode {
  if (!country) return 'US';
  const upper = String(country).toUpperCase();
  const aliased = COUNTRY_ALIASES[upper] ?? upper;
  return PHONE_FORMATS[aliased] ? aliased : 'INTL';
}

/** Look up the format for a country, falling back to the international one. */
export function getPhoneFormat(country?: PhoneCountryCode): PhoneFormat {
  return PHONE_FORMATS[resolvePhoneCountry(country)];
}

/** Dial codes, longest first, so '+44' wins over a hypothetical '+4'. */
const DIAL_CODES = Object.entries(PHONE_FORMATS)
  .filter(([, format]) => format.countryCode)
  .map(([country, format]) => ({ country, dial: format.countryCode.replace(/\D/g, '') }))
  .sort((a, b) => b.dial.length - a.dial.length);

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/**
 * Split a leading dial code off an international digit string.
 *
 * `preferred` breaks the tie between countries that share a dial code (+1 is
 * both US and CA) so an explicitly selected country survives a paste.
 */
function splitDialCode(
  digits: string,
  preferred: PhoneCountryCode
): { country: PhoneCountryCode; national: string } | null {
  const match = DIAL_CODES.find(entry => digits.startsWith(entry.dial));
  if (!match) return null;

  const preferredEntry = DIAL_CODES.find(entry => entry.country === preferred);
  const country =
    preferredEntry && preferredEntry.dial === match.dial ? preferred : match.country;

  return { country, national: digits.slice(match.dial.length) };
}

/**
 * Caret position after an edit, derived by diffing the old and new text.
 *
 * `onChangeText` hands us only the resulting string — no selection — and the
 * DOM caret isn't readable from it on every platform. Bracketing the edit
 * between the common prefix and common suffix locates it without either.
 */
export function caretAfterEdit(previous: string, next: string): number {
  const maxCommon = Math.min(previous.length, next.length);

  let prefix = 0;
  while (prefix < maxCommon && previous[prefix] === next[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < maxCommon - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const inserted = next.length - prefix - suffix;
  return prefix + Math.max(0, inserted);
}

/** Build the submittable E.164 value for a national number. */
function toE164(national: string, format: PhoneFormat): string {
  if (!national) return '';

  let significant = national;
  if (format.trunkPrefix && significant.startsWith(format.trunkPrefix)) {
    significant = significant.slice(format.trunkPrefix.length);
  }
  if (!significant) return '';

  return `+${onlyDigits(format.countryCode)}${significant}`;
}

export const PhoneInput = React.forwardRef<TextInput, PhoneInputProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    country,
    defaultCountry = 'US',
    onCountryChange,
    selectableCountry = false,
    autoDetect = false,
    showCountryCode = true,
    mask: customMask,
    placeholder,
    startSection,
    endSection,
    size = 'md',
    textInputProps,
    ...base
  } = props;

  const [activeCountry, setActiveCountry] = useControllableState<PhoneCountryCode>({
    value: country === undefined ? undefined : resolvePhoneCountry(country),
    defaultValue: defaultCountry === undefined ? undefined : resolvePhoneCountry(defaultCountry),
    finalValue: 'US',
    onChange: onCountryChange
  });

  const currentFormat = getPhoneFormat(activeCountry);
  const maskPattern = customMask || currentFormat.mask;

  const mask = useMemo(
    () => createMask({ mask: maskPattern, lazy: true }),
    [maskPattern]
  );

  // The value prop is national digits, but tolerate a formatted or
  // dial-code-prefixed string rather than silently truncating it.
  const normalizeExternal = useCallback(
    (raw: string | undefined) => {
      if (raw === undefined) return undefined;
      const digits = onlyDigits(String(raw));
      if (!digits) return '';
      // Only strip a dial code that belongs to the country we format against;
      // stripping a foreign one would reinterpret the caller's number as a
      // local one (see the matching guard in handleChangeText).
      const split = String(raw).trim().startsWith('+')
        ? splitDialCode(digits, activeCountry)
        : null;
      const withoutDial =
        split && split.country === activeCountry ? split.national : digits;
      return withoutDial.slice(0, mask.slotCount);
    },
    [activeCountry, mask]
  );

  const [nationalDigits, setNationalDigits] = useControllableState<string>({
    value: normalizeExternal(value),
    defaultValue: normalizeExternal(defaultValue),
    finalValue: '',
    onChange: onChange as ((value: string, ...payload: any[]) => void) | undefined
  });

  /**
   * Holds the literal text while the user is typing an international prefix
   * that hasn't resolved to a known dial code yet ('+', '+4', …). Without it the
   * '+' is dropped on the next render and the prefix can never be completed by
   * typing — only by pasting.
   */
  const [dialPrefixDraft, setDialPrefixDraft] = useState<string | null>(null);

  const maskFor = useCallback(
    (forCountry: PhoneCountryCode): Mask => {
      if (customMask) return mask;
      const format = getPhoneFormat(forCountry);
      return format.mask === maskPattern ? mask : createMask({ mask: format.mask, lazy: true });
    },
    [customMask, mask, maskPattern]
  );

  const displayValue = useMemo(
    () => dialPrefixDraft ?? mask.applyMask(nationalDigits).value,
    [dialPrefixDraft, mask, nationalDigits]
  );

  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(
    undefined
  );

  // Mirrors the user's caret so an unrelated re-render re-applies where the
  // caret already is instead of yanking it to a stale position.
  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setSelection(event.nativeEvent.selection);
    },
    []
  );

  const dialCodeText = useMemo(() => {
    if (!showCountryCode) return '';
    return currentFormat.countryCode;
  }, [showCountryCode, currentFormat.countryCode]);

  const commit = useCallback(
    (national: string, forCountry: PhoneCountryCode, caret: number, activeMask: Mask) => {
      const format = getPhoneFormat(forCountry);
      const formattedNational = activeMask.applyMask(national).value;
      const prefix = showCountryCode ? format.countryCode : '';
      const formatted = [prefix, formattedNational].filter(Boolean).join(' ');

      const meta: PhoneChangeMeta = {
        country: forCountry,
        dialCode: format.countryCode,
        e164: toE164(national, format),
        isComplete: national.length === activeMask.slotCount
      };

      setDialPrefixDraft(null);
      setSelection({ start: caret, end: caret });
      setNationalDigits(national, formatted, meta);
    },
    [setNationalDigits, showCountryCode]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      // An explicit '+' means the user is entering an international number:
      // resolve the dial code rather than letting it eat national digit slots.
      if (text.trim().startsWith('+')) {
        const digits = onlyDigits(text);
        const split = splitDialCode(digits, activeCountry);

        // Stripping the dial code is only safe when we go on to format against
        // the country it belongs to. With autoDetect off we can't move, so
        // stripping a *foreign* code would silently re-file those digits under
        // the active country — '+447911123456' submitting as '+17911123456'.
        if (split && (autoDetect || split.country === activeCountry)) {
          const nextCountry = autoDetect ? split.country : activeCountry;
          const nextMask = maskFor(nextCountry);
          const national = split.national.slice(0, nextMask.slotCount);

          if (nextCountry !== activeCountry) {
            setActiveCountry(nextCountry);
          }
          commit(national, nextCountry, nextMask.applyMask(national).value.length, nextMask);
          return;
        }

        if (!split && autoDetect) {
          // Dial code still incomplete — hold the raw prefix so the next
          // keystroke can finish it.
          setDialPrefixDraft(`+${digits}`);
          return;
        }
        // Without autoDetect a '+' we can't adopt — unrecognised, or belonging
        // to another country — is just noise; fall through and let the digits
        // fill the current country's mask so the field echoes what was typed.
      }

      const result = mask.processInput(text, displayValue, caretAfterEdit(displayValue, text));
      commit(result.unmaskedValue, activeCountry, result.cursorPosition, mask);
    },
    [activeCountry, autoDetect, commit, displayValue, mask, maskFor, setActiveCountry]
  );

  const handleCountrySelect = useCallback(
    (nextCountry: PhoneCountryCode) => {
      if (nextCountry === activeCountry) return;

      const nextMask = maskFor(nextCountry);
      const national = nationalDigits.slice(0, nextMask.slotCount);

      setActiveCountry(nextCountry);
      commit(national, nextCountry, nextMask.applyMask(national).value.length, nextMask);
    },
    [activeCountry, commit, maskFor, nationalDigits, setActiveCountry]
  );

  const effectivePlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    if (customMask) return customMask.replace(/[0#]/g, '0');
    return currentFormat.placeholder || 'Enter phone number';
  }, [placeholder, customMask, currentFormat]);

  const dialCodeLabel = useMemo(() => {
    if (!dialCodeText) return null;
    return (
      <Text size="sm" weight="semibold" colorVariant="secondary">
        {dialCodeText}
      </Text>
    );
  }, [dialCodeText]);

  const countryPicker = useMemo(() => {
    if (!selectableCountry) return dialCodeLabel;

    return (
      <Menu position="bottom-start" offset={4}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Country: ${currentFormat.name}. Change country`}
          disabled={base.disabled}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        >
          <Text size="sm" weight="semibold" colorVariant="secondary">
            {dialCodeText || currentFormat.name}
          </Text>
          <Icon name="chevron-down" size={12} />
        </Pressable>
        <MenuDropdown>
          {PHONE_COUNTRIES.map(code => {
            const format = getPhoneFormat(code);
            return (
              <MenuItem key={code} onPress={() => handleCountrySelect(code)}>
                {format.countryCode ? `${format.name} (${format.countryCode})` : format.name}
              </MenuItem>
            );
          })}
        </MenuDropdown>
      </Menu>
    );
  }, [
    selectableCountry,
    dialCodeLabel,
    dialCodeText,
    currentFormat,
    base.disabled,
    handleCountrySelect
  ]);

  const startSectionContent = useMemo(() => {
    if (!countryPicker && !startSection) return undefined;
    if (!countryPicker) return startSection;
    if (!startSection) return countryPicker;

    return (
      <Flex direction="row" align="center" gap="xs">
        {countryPicker}
        {startSection}
      </Flex>
    );
  }, [countryPicker, startSection]);

  return (
    <TextInputBase
      ref={ref}
      {...base}
      value={displayValue}
      onChangeText={handleChangeText}
      placeholder={effectivePlaceholder}
      size={size as any}
      startSection={startSectionContent}
      endSection={endSection}
      textInputProps={{
        keyboardType: 'phone-pad',
        autoComplete: 'tel',
        textContentType: 'telephoneNumber',
        ...(Platform.OS === 'web' ? { inputMode: 'tel' as const } : null),
        ...textInputProps,
        selection,
        onSelectionChange: handleSelectionChange
      }}
      accessibilityLabel={
        base.accessibilityLabel ||
        (dialCodeText
          ? `Phone number, ${currentFormat.name}, country code ${dialCodeText}`
          : `Phone number, ${currentFormat.name}`)
      }
    />
  );
});

PhoneInput.displayName = 'PhoneInput';
