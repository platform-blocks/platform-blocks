/**
 * `getAccessibilityValueProps` — publishing a control's value to assistive tech.
 *
 * react-native-web (0.21) does not map RN's `accessibilityValue` object; it only forwards
 * the flattened `aria-value*` props. Emitting the object alone lands a valued role in the
 * DOM with nothing for a screen reader to read, so the helper emits both.
 */

import { Platform } from 'react-native';

import { createAccessibilityProps, getAccessibilityValueProps } from '../utils';

const originalOS = Platform.OS;
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};
afterAll(() => setPlatform(originalOS));

describe('getAccessibilityValueProps on web', () => {
  beforeEach(() => setPlatform('web'));

  it('mirrors the range into aria-value* alongside the RN object', () => {
    expect(getAccessibilityValueProps({ min: 0, max: 100, now: 42 })).toEqual({
      accessibilityValue: { min: 0, max: 100, now: 42 },
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 42,
    });
  });

  it('mirrors a text-only value, which is what toggles use', () => {
    expect(getAccessibilityValueProps({ text: 'On' })).toEqual({
      accessibilityValue: { text: 'On' },
      'aria-valuetext': 'On',
    });
  });

  it('keeps a zero, which is a value and not an absence', () => {
    expect(getAccessibilityValueProps({ now: 0 })['aria-valuenow']).toBe(0);
  });

  it('omits the members it was not given', () => {
    expect(Object.keys(getAccessibilityValueProps({ now: 5 }))).toEqual([
      'accessibilityValue',
      'aria-valuenow',
    ]);
  });

  it('returns nothing at all for no value', () => {
    expect(getAccessibilityValueProps(undefined)).toEqual({});
  });

  it('reaches anything built through createAccessibilityProps', () => {
    const props = createAccessibilityProps({ role: 'progressbar', value: { min: 0, max: 10, now: 3 } });

    expect(props['aria-valuenow']).toBe(3);
    expect(props.accessibilityValue).toEqual({ min: 0, max: 10, now: 3 });
  });
});

describe('getAccessibilityValueProps on native', () => {
  beforeEach(() => setPlatform('ios'));

  it('passes the RN object through untouched, with no web props riding along', () => {
    expect(getAccessibilityValueProps({ min: 0, max: 100, now: 42 })).toEqual({
      accessibilityValue: { min: 0, max: 100, now: 42 },
    });
  });
});
