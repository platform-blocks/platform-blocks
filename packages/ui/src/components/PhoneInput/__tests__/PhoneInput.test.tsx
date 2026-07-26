import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { PhoneInput } from '../PhoneInput';
import type { PhoneChangeMeta } from '../types';

const getInput = (root: ReturnType<typeof render>) => root.UNSAFE_getAllByType(TextInput)[0];
const displayed = (root: ReturnType<typeof render>) => getInput(root).props.value as string;

/** Type keystrokes one at a time against whatever the field currently shows. */
const type = (root: ReturnType<typeof render>, keys: string) => {
  for (const key of keys) {
    fireEvent.changeText(getInput(root), displayed(root) + key);
  }
};

describe('PhoneInput', () => {
  describe('controlled/uncontrolled', () => {
    // Regression: a value-sync effect listed `internalValue` in its own deps and
    // reset state back to the `value` prop (default ''), so an uncontrolled
    // field erased every keystroke. This is what the docs playground renders.
    it('is typeable when used uncontrolled (no value/onChange)', () => {
      const root = render(<PhoneInput country="US" />);

      type(root, '5551234567');

      expect(displayed(root)).toBe('(555) 123-4567');
    });

    it('seeds uncontrolled state from defaultValue', () => {
      const root = render(<PhoneInput country="US" defaultValue="5551234567" />);
      expect(displayed(root)).toBe('(555) 123-4567');
    });

    it('respects a controlled value and reports changes', () => {
      const onChange = jest.fn();

      const Controlled = () => {
        const [value, setValue] = useState('');
        return (
          <PhoneInput
            country="US"
            value={value}
            onChange={(raw, formatted, meta) => {
              onChange(raw, formatted, meta);
              setValue(raw);
            }}
          />
        );
      };

      const root = render(<Controlled />);
      type(root, '555');

      expect(displayed(root)).toBe('(555');
      expect(onChange).toHaveBeenLastCalledWith('555', '+1 (555', expect.anything());
    });

    it('does not move a controlled value when no onChange is provided', () => {
      const root = render(<PhoneInput country="US" value="" />);
      fireEvent.changeText(getInput(root), '5');
      expect(displayed(root)).toBe('');
    });

    it('accepts a formatted controlled value without truncating it', () => {
      const root = render(<PhoneInput country="US" value="(555) 123-4567" />);
      expect(displayed(root)).toBe('(555) 123-4567');
    });
  });

  describe('formatting', () => {
    it('formats progressively and caps at the mask length', () => {
      const root = render(<PhoneInput country="US" />);

      type(root, '5551234567');
      expect(displayed(root)).toBe('(555) 123-4567');

      type(root, '89');
      expect(displayed(root)).toBe('(555) 123-4567');
    });

    it('deleting a separator removes the digit before it', () => {
      const root = render(<PhoneInput country="US" defaultValue="5551234567" />);

      // Backspace over the space at index 5 of '(555) 123-4567' deletes the
      // digit in front of it (the third 5), then everything reflows.
      fireEvent.changeText(getInput(root), '(555)123-4567');

      expect(displayed(root)).toBe('(551) 234-567');
    });

    it('uses a custom mask over the country mask', () => {
      const root = render(
        <PhoneInput country="US" mask="000-000-0000 x0000" showCountryCode={false} />
      );

      type(root, '55512345671234');
      expect(displayed(root)).toBe('555-123-4567 x1234');
    });

    it('reports a caret position that keeps up with typing', () => {
      const root = render(<PhoneInput country="US" />);
      type(root, '5551');
      expect(getInput(root).props.selection).toEqual({ start: 7, end: 7 });
    });
  });

  describe('country handling', () => {
    // Regression: autoDetect defaulted to true and matched country codes against
    // *national* digits, so a US number starting 55/91/81 flipped to Brazil,
    // India or Japan mid-typing and dragged the mask with it.
    it('keeps the requested country while typing', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" onChange={onChange} />);

      type(root, '5551234567');

      expect(displayed(root)).toBe('(555) 123-4567');
      expect(onChange).toHaveBeenLastCalledWith(
        '5551234567',
        '+1 (555) 123-4567',
        expect.objectContaining({ country: 'US', dialCode: '+1' })
      );
    });

    // Regression: at 10 digits detection fell through to US, whose 10-digit cap
    // then made the 11th digit of a GB/BR number unreachable.
    it.each([
      ['GB', '7911123456', '7911 123456'],
      ['BR', '11999999999', '(11) 99999-9999'],
      ['DE', '03012345678', '030 12345678']
    ])('formats %s numbers to full length', (country, digits, expected) => {
      const root = render(<PhoneInput country={country} />);
      type(root, digits);
      expect(displayed(root)).toBe(expected);
    });

    it('accepts the legacy UK alias for GB', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="UK" onChange={onChange} />);

      type(root, '7911123456');

      expect(displayed(root)).toBe('7911 123456');
      expect(onChange).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ country: 'GB', dialCode: '+44' })
      );
    });

    it('falls back to the international format for an unknown country', () => {
      const root = render(<PhoneInput country="ZZ" />);
      type(root, '123456789012');
      expect(displayed(root)).toBe('123 456 789 012');
    });
  });

  describe('international input', () => {
    // Regression: pasting '+1 (555) 123-4567' produced 11 digits, which the
    // 10-digit US cap truncated to '(155) 512-3456' — a different number.
    it('strips a leading dial code on paste instead of truncating', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" onChange={onChange} />);

      fireEvent.changeText(getInput(root), '+1 (555) 123-4567');

      expect(displayed(root)).toBe('(555) 123-4567');
      expect(onChange).toHaveBeenLastCalledWith(
        '5551234567',
        '+1 (555) 123-4567',
        expect.objectContaining({ e164: '+15551234567' })
      );
    });

    it('does not switch country on a dial code unless autoDetect is set', () => {
      const onCountryChange = jest.fn();
      const root = render(
        <PhoneInput country="US" onCountryChange={onCountryChange} />
      );

      fireEvent.changeText(getInput(root), '+44 7911 123456');

      expect(onCountryChange).not.toHaveBeenCalled();
    });

    // Regression: with autoDetect off the '+44' was stripped anyway and the
    // remaining digits kept the active country, so a UK number submitted as
    // '+17911123456' — a different, valid, US number.
    it('does not re-file a foreign dial code under the active country', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" onChange={onChange} />);

      fireEvent.changeText(getInput(root), '+447911123456');

      expect(onChange.mock.calls.at(-1)![2].e164).not.toBe('+17911123456');
    });

    it('switches country on a pasted dial code when autoDetect is set', () => {
      const onCountryChange = jest.fn();
      const root = render(
        <PhoneInput defaultCountry="US" autoDetect onCountryChange={onCountryChange} />
      );

      fireEvent.changeText(getInput(root), '+447911123456');

      expect(onCountryChange).toHaveBeenCalledWith('GB');
      expect(displayed(root)).toBe('7911 123456');
    });

    // Regression: the '+' was dropped on the next render, so an international
    // prefix could only ever be pasted, never typed.
    it('lets an international prefix be typed one key at a time', () => {
      const root = render(<PhoneInput defaultCountry="US" autoDetect />);

      fireEvent.changeText(getInput(root), '+');
      expect(displayed(root)).toBe('+');

      fireEvent.changeText(getInput(root), '+4');
      expect(displayed(root)).toBe('+4');

      // '+44' resolves, so the dial code moves into the prefix and the field clears.
      fireEvent.changeText(getInput(root), '+44');
      expect(displayed(root)).toBe('');

      type(root, '7911123456');
      expect(displayed(root)).toBe('7911 123456');
    });
  });

  describe('change metadata', () => {
    const lastMeta = (fn: jest.Mock): PhoneChangeMeta => fn.mock.calls.at(-1)![2];

    it('builds E.164 from the dial code and national digits', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" onChange={onChange} />);

      type(root, '5551234567');

      expect(lastMeta(onChange).e164).toBe('+15551234567');
      expect(lastMeta(onChange).isComplete).toBe(true);
    });

    it('drops the national trunk prefix from E.164', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="GB" onChange={onChange} />);

      type(root, '07911123456'.slice(0, 10));

      expect(lastMeta(onChange).e164).toBe('+44791112345');
    });

    it('reports incompleteness while the mask is unfilled', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" onChange={onChange} />);

      type(root, '555');

      expect(lastMeta(onChange).isComplete).toBe(false);
    });

    // Regression: `formatted` was built from the previous render's mask and
    // dial code, so it disagreed with what the field showed.
    it('reports a formatted value that matches the field', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" onChange={onChange} />);

      type(root, '5551234');

      const [, formatted] = onChange.mock.calls.at(-1)!;
      expect(formatted).toBe(`+1 ${displayed(root)}`);
    });

    it('omits the dial code from `formatted` when the prefix is hidden', () => {
      const onChange = jest.fn();
      const root = render(<PhoneInput country="US" showCountryCode={false} onChange={onChange} />);

      type(root, '555');

      expect(onChange).toHaveBeenLastCalledWith('555', '(555', expect.anything());
    });
  });

  describe('accessibility', () => {
    it('labels the field with the country and dial code', () => {
      const root = render(<PhoneInput country="GB" />);
      expect(getInput(root).props.accessibilityLabel)
        .toBe('Phone number, United Kingdom, country code +44');
    });

    it('lets a caller override the label', () => {
      const root = render(<PhoneInput country="US" accessibilityLabel="Mobile" />);
      expect(getInput(root).props.accessibilityLabel).toBe('Mobile');
    });

    it('uses a phone keypad', () => {
      const root = render(<PhoneInput country="US" />);
      expect(getInput(root).props.keyboardType).toBe('phone-pad');
    });

    // Regression: hardcoded textInputProps were passed after {...base}, so a
    // caller's own textInputProps were dropped entirely.
    it('merges caller-supplied textInputProps', () => {
      const root = render(
        <PhoneInput country="US" textInputProps={{ autoFocus: true, maxLength: 20 }} />
      );

      expect(getInput(root).props.autoFocus).toBe(true);
      expect(getInput(root).props.maxLength).toBe(20);
      expect(getInput(root).props.keyboardType).toBe('phone-pad');
    });
  });
});
