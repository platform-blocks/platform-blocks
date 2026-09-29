import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { ColorPicker } from '../ColorPicker';

// Desktop web: the anchored dropdown (useFloating), not the sheet.
jest.mock('../../../hooks/useOverlayMode', () => ({
  ...jest.requireActual('../../../hooks/useOverlayMode'),
  useOverlayMode: () => ({
    deviceInfo: {},
    isWeb: true,
    isMobileExperience: false,
    isDesktopExperience: true,
    shouldUseModal: false,
    shouldUseOverlay: true,
    shouldUsePortal: true,
  }),
}));

// jsdom has no layout: give every element a box so the dropdown can be placed.
const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 60, bottom: 68, width: 40, height: 28, toJSON: () => ({}) } as DOMRect;
  };
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalRect;
});
beforeEach(() => __resetLayerStackForTests());

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

/** Lets positioning (async measure + re-measure) and focus moves settle. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

// Two rows of five.
const SWATCHES = ['#FF6B6B', '#F8B500', '#FECA57', '#96CEB4', '#4ECDC4', '#45B7D1', '#54A0FF', '#5F27CD', '#A29BFE', '#0F172A'];

describe('ColorPicker (react-native-web DOM)', () => {
  it('is a labelled button that controls a dialog of swatch radios', async () => {
    render(<ColorPicker swatches={SWATCHES} defaultValue="#96CEB4" />);
    const trigger = screen.getByRole('button', { name: 'Color #96CEB4' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    await settle();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const dialog = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-label')).toBe('Choose a color');

    const group = screen.getByRole('radiogroup', { name: 'Color swatches' });
    expect(dialog?.contains(group)).toBe(true);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual(SWATCHES);
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(SWATCHES.map((c) => String(c === '#96CEB4')));
    // One tab stop — the selected swatch — which takes focus on open.
    expect(radios.map((r) => r.getAttribute('tabindex'))).toEqual(SWATCHES.map((c) => (c === '#96CEB4' ? '0' : '-1')));
    expect(document.activeElement).toBe(radios[3]);
  });

  it('moves between swatches with the arrow keys (2-D) without selecting', async () => {
    const onChange = jest.fn();
    render(<ColorPicker swatches={SWATCHES} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select a color' }));
    await settle();

    const radios = screen.getAllByRole('radio');
    expect(document.activeElement).toBe(radios[0]);

    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(radios[1]);
    fireEvent.keyDown(radios[1], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(radios[6]);
    fireEvent.keyDown(radios[6], { key: 'End' });
    expect(document.activeElement).toBe(radios[9]);
    fireEvent.keyDown(radios[9], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(radios[4]);
    expect(onChange).not.toHaveBeenCalled();

    // Space picks the focused swatch and closes.
    fireEvent.keyDown(radios[4], { key: ' ' });
    await settle();
    expect(onChange).toHaveBeenCalledWith('#4ECDC4');
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.getByRole('button', { name: 'Color #4ECDC4' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<ColorPicker swatches={SWATCHES} />);
    const trigger = screen.getByRole('button', { name: 'Select a color' });
    act(() => trigger.focus());
    fireEvent.click(trigger);
    await settle();
    expect(screen.getByRole('radiogroup')).toBeTruthy();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('marks a disabled trigger and keeps it closed', async () => {
    render(<ColorPicker swatches={SWATCHES} disabled accessibilityLabel="Label color" />);
    const trigger = screen.getByRole('button', { name: 'Label color' });
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(trigger);
    await settle();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });
});
