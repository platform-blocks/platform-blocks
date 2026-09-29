/**
 * a11yProps / legacy builders on native (the default jest project runs as iOS).
 * The web output is covered by src/core/accessibility/__web_tests__/a11yProps.web.test.tsx.
 */
import { Platform } from 'react-native';

import { a11yProps, joinIdRefs, roleFromAccessibilityRole } from '../a11yProps';
import { createAccessibilityProps, getAccessibilityValueProps } from '../utils';

describe('a11yProps (native)', () => {
  it('runs as native', () => {
    expect(Platform.OS).not.toBe('web');
  });

  it('emits role and flat aria state, never accessibilityState/accessibilityValue', () => {
    const props = a11yProps({
      role: 'checkbox',
      label: 'Accept',
      checked: 'mixed',
      disabled: true,
      busy: true,
      value: { min: 0, max: 10, now: 0, text: 'none' },
    });
    expect(props).toEqual({
      role: 'checkbox',
      'aria-label': 'Accept',
      'aria-checked': 'mixed',
      'aria-disabled': true,
      'aria-busy': true,
      'aria-valuemin': 0,
      'aria-valuemax': 10,
      'aria-valuenow': 0,
      'aria-valuetext': 'none',
    });
    expect(props).not.toHaveProperty('accessibilityState');
    expect(props).not.toHaveProperty('accessibilityValue');
  });

  it('keeps false for two-sided states and drops false flags', () => {
    expect(a11yProps({ selected: false, expanded: false, disabled: false, hidden: false })).toEqual({
      'aria-selected': false,
      'aria-expanded': false,
    });
  });

  it('routes the hint to accessibilityHint and drops web-only ARIA', () => {
    const props = a11yProps({
      hint: 'Opens settings',
      describedBy: 'desc',
      controls: 'panel',
      hasPopup: 'menu',
      invalid: true,
      required: true,
      level: 2,
      activeDescendant: 'opt-1',
      orientation: 'vertical',
    });
    expect(props).toEqual({ accessibilityHint: 'Opens settings' });
  });

  it('maps current → selected, pressed → checked, live/modal to native props', () => {
    expect(a11yProps({ current: 'page' })).toEqual({ 'aria-selected': true });
    expect(a11yProps({ current: 'page', selected: false })).toEqual({ 'aria-selected': false });
    expect(a11yProps({ pressed: true })).toEqual({ 'aria-checked': true });
    expect(a11yProps({ live: 'polite' })).toEqual({ accessibilityLiveRegion: 'polite' });
    expect(a11yProps({ live: 'off' })).toEqual({ accessibilityLiveRegion: 'none' });
    expect(a11yProps({ modal: true })).toEqual({ accessibilityViewIsModal: true });
  });

  it('passes native actions through', () => {
    const onAction = jest.fn();
    const actions = [{ name: 'increment' }];
    expect(a11yProps({ actions, onAction })).toEqual({
      accessibilityActions: actions,
      onAccessibilityAction: onAction,
    });
  });

  it('joins labelledBy with commas (RN splits on commas) and skips falsy ids', () => {
    expect(a11yProps({ labelledBy: ['a', false, 'b', undefined] })['aria-labelledby']).toBe('a,b');
    expect(joinIdRefs([false, null])).toBeUndefined();
    expect(joinIdRefs('x')).toBe('x');
  });

  it('maps web-only roles to their native counterparts', () => {
    expect(a11yProps({ role: 'listbox' }).role).toBe('list');
    expect(a11yProps({ role: 'menuitemcheckbox' }).role).toBe('menuitem');
    expect(a11yProps({ role: 'textbox' })).toEqual({});
  });

  it('keeps the element id', () => {
    expect(a11yProps({ id: 'field-1' })).toEqual({ id: 'field-1' });
  });
});

describe('roleFromAccessibilityRole', () => {
  it('maps legacy accessibilityRole values to ARIA roles', () => {
    expect(roleFromAccessibilityRole('adjustable')).toBe('slider');
    expect(roleFromAccessibilityRole('header')).toBe('heading');
    expect(roleFromAccessibilityRole('image')).toBe('img');
    expect(roleFromAccessibilityRole('togglebutton')).toBe('button');
    expect(roleFromAccessibilityRole('tabbar')).toBe('tablist');
    expect(roleFromAccessibilityRole('button')).toBe('button');
    expect(roleFromAccessibilityRole('text')).toBeUndefined();
    expect(roleFromAccessibilityRole(undefined)).toBeUndefined();
  });
});

describe('legacy builders', () => {
  it('getAccessibilityValueProps publishes aria-value* (works on both platforms)', () => {
    expect(getAccessibilityValueProps({ min: 0, max: 100, now: 42 })).toEqual({
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 42,
    });
    expect(getAccessibilityValueProps({ now: 0 })['aria-valuenow']).toBe(0);
    expect(getAccessibilityValueProps({ text: 'On' })).toEqual({ 'aria-valuetext': 'On' });
    expect(getAccessibilityValueProps(undefined)).toEqual({});
  });

  it('createAccessibilityProps emits role + aria-* and stays accessible', () => {
    const props = createAccessibilityProps({
      role: 'button',
      label: 'Save',
      hint: 'Saves the form',
      disabled: true,
      selected: false,
    });
    expect(props).toEqual({
      accessible: true,
      role: 'button',
      'aria-label': 'Save',
      'aria-disabled': true,
      accessibilityHint: 'Saves the form',
    });
  });

  it('createAccessibilityProps maps state and legacy-only roles', () => {
    const props = createAccessibilityProps({
      role: 'text',
      state: { checked: true, expanded: false },
      value: { now: 3 },
    });
    expect(props).toEqual({
      accessible: true,
      accessibilityRole: 'text',
      'aria-checked': true,
      'aria-expanded': false,
      'aria-valuenow': 3,
    });
  });

  it('makes leaf value/image roles one accessibility element on native', () => {
    expect(a11yProps({ role: 'slider' }).accessible).toBe(true);
    expect(a11yProps({ role: 'img', label: 'Logo' }).accessible).toBe(true);
    expect(a11yProps({ role: 'progressbar' }).accessible).toBe(true);
    // An explicit value wins, and container/interactive roles are left alone.
    expect(a11yProps({ role: 'slider', accessible: false }).accessible).toBe(false);
    expect(a11yProps({ role: 'button' }).accessible).toBeUndefined();
    expect(a11yProps({ role: 'group' }).accessible).toBeUndefined();
  });

  it('drops roleDescription on native', () => {
    expect(a11yProps({ role: 'region', roleDescription: 'carousel' })).not.toHaveProperty('aria-roledescription');
  });
});
