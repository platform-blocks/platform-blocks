import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { RangeSlider, Slider } from '../Slider';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Slider (react-native-web DOM)', () => {
  it('exposes a focusable slider thumb named by the label, with aria-value*', () => {
    render(<Slider id="vol" label="Volume" defaultValue={40} valueLabel={(v) => `${v}%`} />);

    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb.getAttribute('aria-labelledby')).toBe('vol-label');
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb.getAttribute('aria-valuenow')).toBe('40');
    expect(thumb.getAttribute('aria-valuetext')).toBe('40%');
    expect(thumb.getAttribute('tabindex')).toBe('0');
  });

  it('adjusts with arrows, PageUp/PageDown and Home/End, reporting each settle', () => {
    const onChange = jest.fn();
    const onChangeEnd = jest.fn();
    render(<Slider label="Level" defaultValue={50} step={5} onChange={onChange} onChangeEnd={onChangeEnd} />);
    const thumb = screen.getByRole('slider');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('55');
    fireEvent.keyDown(thumb, { key: 'PageDown' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('45');
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');

    expect(onChange.mock.calls.map(([v]) => v)).toEqual([55, 45, 100, 0]);
    expect(onChangeEnd.mock.calls.map(([v]) => v)).toEqual([55, 45, 100, 0]);
  });

  it('snaps keyboard moves to ticks with restrictToTicks', () => {
    render(
      <Slider label="Snap" defaultValue={0} restrictToTicks ticks={[{ value: 0 }, { value: 30 }, { value: 100 }]} />
    );
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb.getAttribute('aria-valuenow')).toBe('30');
  });

  it('shows the value bubble while the thumb has keyboard focus', () => {
    render(<Slider label="Focus" defaultValue={12} valueLabel={(v) => `v${v}`} />);
    expect(screen.queryByText('v12')).toBeNull();
    fireEvent.focus(screen.getByRole('slider'));
    expect(screen.getByText('v12')).toBeTruthy();
  });

  it('links errors and leaves the tab order when disabled', () => {
    const { rerender } = render(<Slider id="s" label="Speed" error="Too fast" />);
    const thumb = screen.getByRole('slider', { name: 'Speed' });
    expect(thumb.getAttribute('aria-invalid')).toBe('true');
    expect(thumb.getAttribute('aria-describedby')).toBe('s-error');

    rerender(
      <PlatformBlocksProvider>
        <Slider id="s" label="Speed" disabled />
      </PlatformBlocksProvider>
    );
    expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('slider').getAttribute('tabindex')).toBe('-1');
  });
});

describe('RangeSlider (react-native-web DOM)', () => {
  it('is a labelled group of two named thumbs', () => {
    render(<RangeSlider id="price" label="Price" defaultValue={[20, 80]} />);

    const group = screen.getByRole('group', { name: 'Price' });
    expect(group).toBeTruthy();
    const low = screen.getByRole('slider', { name: 'Minimum' });
    const high = screen.getByRole('slider', { name: 'Maximum' });
    expect(low.getAttribute('aria-valuenow')).toBe('20');
    expect(low.getAttribute('aria-valuemax')).toBe('80');
    expect(high.getAttribute('aria-valuenow')).toBe('80');
    expect(high.getAttribute('aria-valuemin')).toBe('20');
  });

  it('moves each thumb with the keyboard without crossing', () => {
    const onChange = jest.fn();
    render(<RangeSlider label="Years" defaultValue={[40, 45]} step={5} onChange={onChange} />);
    const low = screen.getByRole('slider', { name: 'Minimum' });

    fireEvent.keyDown(low, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith([45, 45]);
    fireEvent.keyDown(low, { key: 'ArrowRight' });
    // Stopped at the maximum thumb.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(low.getAttribute('aria-valuenow')).toBe('45');
  });
});
