import React from 'react';
import { BaseInputProps, ExtendedTextInputProps } from '../Input/types';

/**
 * Built-in country presets. Any other string is accepted and falls back to the
 * `INTL` format, so a caller can pass an unsupported ISO code without crashing.
 */
export type PhoneCountryCode =
  | 'US'
  | 'CA'
  | 'GB'
  | 'FR'
  | 'DE'
  | 'AU'
  | 'BR'
  | 'IN'
  | 'JP'
  | 'INTL'
  | (string & {});

export interface PhoneFormat {
  /** Display name for this format */
  name: string;
  /** Country calling code (e.g. '+1', '+44'). Empty for the international format. */
  countryCode: string;
  /**
   * Formatting mask for the **national** number, using 0 for digits
   * (e.g. '(000) 000-0000'). The mask is the single source of truth for how many
   * digits the field accepts — a literal digit in a mask is ambiguous, so the
   * dial code is rendered as a separate prefix rather than embedded here.
   */
  mask: string;
  /** Placeholder text example */
  placeholder: string;
  /**
   * National trunk prefix stripped when building the E.164 value — the leading
   * `0` in a UK/FR/DE/AU/JP national number, which must not appear after the
   * country code.
   */
  trunkPrefix?: string;
}

export interface PhoneChangeMeta {
  /** The resolved country the value is formatted for. */
  country: PhoneCountryCode;
  /** Dial code for that country (e.g. '+1'). Empty for the international format. */
  dialCode: string;
  /** Submittable E.164 value (e.g. '+15551234567'), or '' while empty. */
  e164: string;
  /** Whether every digit the mask expects has been entered. */
  isComplete: boolean;
}

export interface PhoneInputProps
  extends Omit<BaseInputProps, 'value' | 'onChangeText'> {
  /** Phone number value (digits only). Omit for an uncontrolled field. */
  value?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
  /** Change handler receiving (nationalDigits, formattedDisplay, meta) */
  onChange?: (raw: string, formatted: string, meta: PhoneChangeMeta) => void;
  /** Country preset to format against. Controlled when provided. */
  country?: PhoneCountryCode;
  /** Initial country while uncontrolled. Defaults to 'US'. */
  defaultCountry?: PhoneCountryCode;
  /** Called when the country changes (via the picker, or `autoDetect`). */
  onCountryChange?: (country: PhoneCountryCode) => void;
  /** Render the dial code as a dropdown so the user can change country. */
  selectableCountry?: boolean;
  /**
   * Switch country when the user types or pastes an explicit `+<dial code>`
   * prefix. Off by default: it changes the mask out from under the caller's
   * `country` prop.
   *
   * The active country's own dial code is stripped either way, so pasting a
   * full local number never truncates it. A *foreign* dial code is only
   * stripped when `autoDetect` lets us switch to that country — otherwise the
   * digits would be re-filed under the active country, turning
   * `+447911123456` into `+17911123456`.
   */
  autoDetect?: boolean;
  /** Show the dial code prefix ahead of the field */
  showCountryCode?: boolean;
  /**
   * Custom mask pattern (overrides the country mask). Use '0' for digits, any
   * other character as a literal. Avoid literal digits — see `PhoneFormat.mask`.
   */
  mask?: string;
  /** Additional props forwarded to the underlying TextInput. */
  textInputProps?: ExtendedTextInputProps;
}
