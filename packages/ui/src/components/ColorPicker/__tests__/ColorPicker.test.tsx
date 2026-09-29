import React from 'react';
import { View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { ColorPicker } from '../ColorPicker';

// Native / small-screen presentation: the palette opens in a DropdownSheet.
jest.mock('../../../hooks/useOverlayMode', () => ({
  ...jest.requireActual('../../../hooks/useOverlayMode'),
  useOverlayMode: () => ({
    deviceInfo: {},
    isWeb: false,
    isMobileExperience: true,
    isDesktopExperience: false,
    shouldUseModal: true,
    shouldUseOverlay: false,
    shouldUsePortal: false,
  }),
}));

const SWATCHES = ['#FF6B6B', '#4ECDC4', '#45B7D1'];

const renderPicker = (ui: React.ReactElement) => render(<OverlayProvider>{ui}</OverlayProvider>);

const expanded = (name: string) => screen.getByRole('button', { name }).props.accessibilityState?.expanded;

describe('ColorPicker (sheet path)', () => {
  it('names the trigger after the value, or asks for one', () => {
    const { rerender } = renderPicker(<ColorPicker swatches={SWATCHES} />);
    expect(screen.getByRole('button', { name: 'Select a color' })).toBeTruthy();

    rerender(
      <OverlayProvider>
        <ColorPicker swatches={SWATCHES} value="#4ECDC4" />
      </OverlayProvider>
    );
    expect(screen.getByRole('button', { name: 'Color #4ECDC4' })).toBeTruthy();

    rerender(
      <OverlayProvider>
        <ColorPicker swatches={SWATCHES} value="#4ECDC4" accessibilityLabel="Label color" />
      </OverlayProvider>
    );
    expect(screen.getByRole('button', { name: 'Label color' })).toBeTruthy();
  });

  it('opens a sheet with a labelled radio group of named swatches', () => {
    renderPicker(<ColorPicker swatches={SWATCHES} defaultValue="#45b7d1" testID="picker" />);
    expect(expanded('Color #45b7d1')).toBe(false);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);

    fireEvent.press(screen.getByRole('button', { name: 'Color #45b7d1' }));

    expect(expanded('Color #45b7d1')).toBe(true);
    expect(screen.getByText('Choose a color')).toBeTruthy();
    // A container role: not an accessible element itself on native (that would
    // swallow the radios), so it is found by test id.
    const group = screen.getByTestId('picker-swatches');
    expect(group.props.role).toBe('radiogroup');
    expect(group.props.accessibilityLabel ?? group.props['aria-label']).toBe('Color swatches');
    expect(screen.getAllByRole('radio')).toHaveLength(SWATCHES.length);
    SWATCHES.forEach((color) => expect(screen.getByRole('radio', { name: color })).toBeTruthy());
    // Case-insensitive match against the (lower-case) current value.
    expect(screen.getByRole('radio', { name: '#45B7D1', checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '#FF6B6B', checked: false })).toBeTruthy();
  });

  it('selects a swatch, reports the normalized hex and closes', () => {
    const onChange = jest.fn();
    renderPicker(<ColorPicker swatches={['#abc', ...SWATCHES]} onChange={onChange} />);

    fireEvent.press(screen.getByRole('button', { name: 'Select a color' }));
    fireEvent.press(screen.getByRole('radio', { name: '#abc' }));

    expect(onChange).toHaveBeenCalledWith('#AABBCC');
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(expanded('Color #AABBCC')).toBe(false);
  });

  it('closes from the sheet close button', () => {
    renderPicker(<ColorPicker swatches={SWATCHES} />);
    fireEvent.press(screen.getByRole('button', { name: 'Select a color' }));
    fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('uses readable swatch labels when given', () => {
    renderPicker(<ColorPicker swatches={SWATCHES} swatchLabels={{ '#FF6B6B': 'Coral' }} />);
    fireEvent.press(screen.getByRole('button', { name: 'Select a color' }));
    expect(screen.getByRole('radio', { name: 'Coral' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '#4ECDC4' })).toBeTruthy();
  });

  it('does not open when disabled', () => {
    renderPicker(<ColorPicker swatches={SWATCHES} disabled />);
    const trigger = screen.getByRole('button', { name: 'Select a color', disabled: true });
    act(() => {
      fireEvent.press(trigger);
    });
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('forwards the ref to the root view and applies spacing', () => {
    const ref = React.createRef<View>();
    renderPicker(<ColorPicker ref={ref} swatches={SWATCHES} mt="md" testID="picker" />);
    expect(ref.current).toBeTruthy();
    const flat = Object.assign({}, ...[screen.getByTestId('picker').props.style].flat(Infinity).filter(Boolean));
    expect(flat.marginTop).toBeGreaterThan(0);
  });
});
