import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { ToggleButton, ToggleGroup } from '../Toggle';
import { ToggleBar } from '../ToggleBar';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Toggle (react-native-web DOM)', () => {
  it('standalone toggle is a button with aria-pressed', () => {
    render(
      <ToggleButton value="bold" selected>
        Bold
      </ToggleButton>
    );
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('multi-select group: group of pressed buttons, uncontrolled via defaultValue', () => {
    const onChange = jest.fn();
    render(
      <ToggleGroup defaultValue={['b']} onChange={onChange} accessibilityLabel="Formatting">
        <ToggleButton value="b">Bold</ToggleButton>
        <ToggleButton value="i">Italic</ToggleButton>
      </ToggleGroup>
    );
    expect(screen.getByRole('group', { name: 'Formatting' })).toBeTruthy();
    const italic = screen.getByRole('button', { name: 'Italic' });
    expect(italic.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(italic);
    expect(onChange).toHaveBeenCalledWith(['b', 'i']);
    expect(italic.getAttribute('aria-pressed')).toBe('true');
  });

  it('exclusive group: radio group with one tab stop and arrow-key navigation', () => {
    render(
      <ToggleGroup exclusive defaultValue="center" accessibilityLabel="Alignment">
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleGroup>
    );
    expect(screen.getByRole('radiogroup', { name: 'Alignment' })).toBeTruthy();
    const left = screen.getByRole('radio', { name: 'Left' });
    const center = screen.getByRole('radio', { name: 'Center' });
    const right = screen.getByRole('radio', { name: 'Right' });
    expect(center.getAttribute('aria-checked')).toBe('true');
    // Roving tabindex: only the selected radio is in the tab order.
    expect(center.getAttribute('tabindex')).toBe('0');
    expect(left.getAttribute('tabindex')).toBe('-1');

    center.focus();
    fireEvent.keyDown(center, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(right);
    // Space selects the focused radio.
    fireEvent.keyDown(right, { key: ' ' });
    expect(right.getAttribute('aria-checked')).toBe('true');
    expect(center.getAttribute('aria-checked')).toBe('false');
  });

  it('ToggleBar chips are checkboxes (multiple) with aria-checked', () => {
    const onChange = jest.fn();
    render(
      <ToggleBar
        accessibilityLabel="Filters"
        value={['a']}
        onChange={onChange}
        options={[
          { label: 'Alpha', value: 'a' },
          { label: 'Beta', value: 'b' },
        ]}
      />
    );
    expect(screen.getByRole('checkbox', { name: 'Alpha' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });
});
