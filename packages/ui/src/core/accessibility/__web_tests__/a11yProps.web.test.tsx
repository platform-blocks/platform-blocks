import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { render, screen } from '@testing-library/react';

import { a11yProps } from '../a11yProps';
import { createAccessibilityProps, getAccessibilityValueProps } from '../utils';

describe('a11yProps (web)', () => {
  it('runs as web', () => {
    expect(Platform.OS).toBe('web');
  });

  it('emits web ARIA and no native-only props', () => {
    const props = a11yProps({
      role: 'tab',
      selected: true,
      controls: ['panel-1'],
      describedBy: ['hint-1', false],
      hint: 'native only',
      hasPopup: 'menu',
      current: 'page',
      pressed: false,
      invalid: true,
      required: true,
      level: 2,
      live: 'polite',
      modal: true,
      actions: [{ name: 'activate' }],
    });
    expect(props).toEqual({
      role: 'tab',
      'aria-selected': true,
      'aria-controls': 'panel-1',
      'aria-describedby': 'hint-1',
      'aria-haspopup': 'menu',
      'aria-current': 'page',
      'aria-pressed': false,
      'aria-invalid': true,
      'aria-required': true,
      'aria-level': 2,
      'aria-live': 'polite',
      'aria-modal': true,
    });
  });

  it('joins id refs with spaces and keeps web-only roles verbatim', () => {
    expect(a11yProps({ labelledBy: ['a', 'b'] })['aria-labelledby']).toBe('a b');
    expect(a11yProps({ role: 'listbox' }).role).toBe('listbox');
  });

  it('reaches the DOM through react-native-web', () => {
    render(
      <View>
        <Text id="volume-help">Drag to adjust</Text>
        <View testID="slider" {...a11yProps({ role: 'slider', label: 'Volume', describedBy: 'volume-help', value: { min: 0, max: 100, now: 40, text: '40%' }, id: 'vol' })} />
        <Pressable {...a11yProps({ role: 'button', pressed: true, hasPopup: 'dialog', label: 'Bold' })} />
      </View>
    );
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider.id).toBe('vol');
    expect(slider.getAttribute('aria-describedby')).toBe('volume-help');
    expect(slider.getAttribute('aria-valuenow')).toBe('40');
    expect(slider.getAttribute('aria-valuetext')).toBe('40%');
    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('legacy builders publish values the DOM can read', () => {
    expect(getAccessibilityValueProps({ now: 3 })).toEqual({ 'aria-valuenow': 3 });
    render(<View {...createAccessibilityProps({ role: 'progressbar', label: 'Upload', value: { min: 0, max: 10, now: 3 } })} />);
    expect(screen.getByRole('progressbar', { name: 'Upload' }).getAttribute('aria-valuenow')).toBe('3');
  });

  it('emits aria-roledescription and never forces `accessible` (which makes RNW views focusable)', () => {
    const props = a11yProps({ role: 'slider', roleDescription: 'volume knob' });
    expect(props['aria-roledescription']).toBe('volume knob');
    expect(props).not.toHaveProperty('accessible');
    render(<View {...a11yProps({ role: 'region', roleDescription: 'carousel', label: 'Photos' })} />);
    expect(screen.getByRole('region', { name: 'Photos' }).getAttribute('aria-roledescription')).toBe('carousel');
  });
});
