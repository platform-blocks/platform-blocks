import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import type { FieldHandle } from '../../../core/types/base';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { ColorInput } from '../ColorInput';
import type { ColorInputProps } from '../types';

// Native / small-screen presentation: swatches open in a DropdownSheet.
jest.mock('../../../hooks/useOverlayMode', () => ({
  ...jest.requireActual('../../../hooks/useOverlayMode'),
  useOverlayMode: () => ({
    deviceInfo: {},
    isWeb: false,
    isMobileExperience: true,
    isDesktopExperience: false,
    shouldUseModal: true,
    shouldUseOverlay: false,
  }),
}));

const SWATCHES = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

function renderInput(props: Partial<ColorInputProps> = {}, ref?: React.Ref<FieldHandle>) {
  return render(
    <OverlayProvider>
      <ColorInput ref={ref} label="Brand color" swatches={SWATCHES} testID="color" {...props} />
    </OverlayProvider>
  );
}

const input = () => screen.getByTestId('color-input');
const toggleExpanded = () => screen.getByTestId('color-toggle').props.accessibilityState?.expanded;

describe('ColorInput (native)', () => {
  it('labels the hex input through the field frame', () => {
    renderInput({ required: true, description: 'Used for buttons' });
    expect(input().props['aria-label']).toBe('Brand color, required');
    expect(input().props.accessibilityHint).toBe('Used for buttons');
    expect(screen.getByText('Used for buttons')).toBeTruthy();
  });

  it('reports complete hex values while typing, un-normalized', () => {
    const onChange = jest.fn();
    renderInput({ onChange });

    fireEvent.changeText(input(), '#FF00');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.changeText(input(), '#ff0000');
    expect(onChange).toHaveBeenLastCalledWith('#ff0000');

    // A bare hex gets its '#'.
    fireEvent.changeText(input(), '0af');
    expect(onChange).toHaveBeenLastCalledWith('#0af');
  });

  it('normalizes on blur', () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    renderInput({ onChange, onBlur });

    fireEvent(input(), 'focus');
    fireEvent.changeText(input(), '#abc');
    fireEvent(input(), 'blur');

    expect(onChange).toHaveBeenLastCalledWith('#AABBCC');
    expect(input().props.value).toBe('#AABBCC');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('normalizes on submit', () => {
    const onChange = jest.fn();
    renderInput({ onChange });
    fireEvent.changeText(input(), '12a');
    fireEvent(input(), 'submitEditing');
    expect(onChange).toHaveBeenLastCalledWith('#1122AA');
    expect(input().props.value).toBe('#1122AA');
  });

  it('reverts invalid text to the last valid color on blur', () => {
    const onChange = jest.fn();
    renderInput({ onChange, defaultValue: '#FF0000' });
    fireEvent.changeText(input(), '#GG');
    fireEvent(input(), 'blur');
    expect(input().props.value).toBe('#FF0000');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the color when the text is emptied', () => {
    const onChange = jest.fn();
    renderInput({ onChange, defaultValue: '#FF0000' });
    fireEvent.changeText(input(), '');
    fireEvent(input(), 'blur');
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('clears with the clear button', () => {
    const onChange = jest.fn();
    const onClear = jest.fn();
    renderInput({ onChange, onClear, clearable: true, defaultValue: '#FF0000' });

    fireEvent.press(screen.getByRole('button', { name: 'Clear color' }));

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input().props.value).toBe('');
    expect(screen.queryByRole('button', { name: 'Clear color' })).toBeNull();
  });

  it('picks a swatch from the sheet', () => {
    const onChange = jest.fn();
    renderInput({ onChange, defaultValue: '#45b7d1' });

    const toggle = screen.getByRole('button', { name: 'Show color swatches' });
    expect(toggleExpanded()).toBe(false);
    fireEvent.press(toggle);

    expect(toggleExpanded()).toBe(true);
    expect(screen.getByRole('button', { name: 'Hide color swatches' })).toBeTruthy();
    // The sheet is titled with the field label.
    expect(screen.getAllByText('Brand color').length).toBeGreaterThan(1);
    expect(screen.getByRole('radio', { name: '#45B7D1', checked: true })).toBeTruthy();

    fireEvent.press(screen.getByRole('radio', { name: '#4ECDC4' }));

    expect(onChange).toHaveBeenLastCalledWith('#4ECDC4');
    expect(input().props.value).toBe('#4ECDC4');
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(toggleExpanded()).toBe(false);
  });

  it('has no swatch toggle without swatches', () => {
    renderInput({ withSwatches: false });
    expect(screen.queryByTestId('color-toggle')).toBeNull();
  });

  it('is not editable or pickable when disabled / read-only', () => {
    const { rerender } = renderInput({ disabled: true, defaultValue: '#FF0000', clearable: true });
    expect(input().props.editable).toBe(false);
    expect(screen.queryByRole('button', { name: 'Clear color' })).toBeNull();
    fireEvent.press(screen.getByTestId('color-toggle'));
    expect(screen.queryAllByRole('radio')).toHaveLength(0);

    rerender(
      <OverlayProvider>
        <ColorInput label="Brand color" swatches={SWATCHES} testID="color" readOnly defaultValue="#FF0000" />
      </OverlayProvider>
    );
    expect(input().props.editable).toBe(false);
    fireEvent.press(screen.getByTestId('color-toggle'));
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('follows the controlled value', () => {
    const { rerender } = renderInput({ value: '#FF0000' });
    expect(input().props.value).toBe('#FF0000');
    rerender(
      <OverlayProvider>
        <ColorInput label="Brand color" swatches={SWATCHES} testID="color" value="#00FF00" />
      </OverlayProvider>
    );
    expect(input().props.value).toBe('#00FF00');
  });

  it('shows the error under the field', () => {
    renderInput({ error: 'Pick a brand color' });
    expect(screen.getByText('Pick a brand color')).toBeTruthy();
  });

  it('exposes a FieldHandle ref', () => {
    const onChange = jest.fn();
    const ref = React.createRef<FieldHandle>();
    renderInput({ onChange, defaultValue: '#FF0000' }, ref);
    expect(typeof ref.current?.focus).toBe('function');
    expect(typeof ref.current?.blur).toBe('function');
    act(() => {
      ref.current?.clear?.();
    });
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(input().props.value).toBe('');
  });

  it('uses the theme monospace font for the hex text', () => {
    renderInput();
    const flat = Object.assign({}, ...[input().props.style].flat(Infinity).filter(Boolean));
    expect(flat.fontFamily).toBe(DEFAULT_THEME.fontFamilyMono);
  });

  it('sizes the field root with the box props; an explicit `w` wins over `fullWidth`', () => {
    renderInput({ fullWidth: true, w: 240 });
    const flat = Object.assign({}, ...[screen.getByTestId('color').props.style].flat(Infinity).filter(Boolean));
    expect(flat.width).toBe(240);
  });
});
