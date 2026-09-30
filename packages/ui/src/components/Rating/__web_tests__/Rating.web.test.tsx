import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Rating } from '../Rating';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Rating (react-native-web DOM)', () => {
  it('is a slider named by its label with its value in aria-value*', () => {
    render(<Rating id="service" label="Service" defaultValue={3} />);

    const slider = screen.getByRole('slider', { name: 'Service' });
    expect(slider.getAttribute('aria-labelledby')).toBe('service-label');
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('5');
    expect(slider.getAttribute('aria-valuenow')).toBe('3');
    expect(slider.getAttribute('aria-valuetext')).toBe('3 out of 5');
    expect(slider.getAttribute('tabindex')).toBe('0');
  });

  it('adjusts with the keyboard', () => {
    const onChange = jest.fn();
    render(<Rating label="Food" defaultValue={2} onChange={onChange} />);
    const slider = screen.getByRole('slider');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('3');

    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider.getAttribute('aria-valuenow')).toBe('5');

    fireEvent.keyDown(slider, { key: '2' });
    expect(slider.getAttribute('aria-valuenow')).toBe('2');

    fireEvent.keyDown(slider, { key: 'Backspace' });
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([3, 5, 2, 0]);
  });

  it('marks an invalid rating and links its error', () => {
    render(<Rating id="stars" label="Stars" error="Please rate" required />);
    const slider = screen.getByRole('slider', { name: 'Stars' });
    expect(slider.getAttribute('aria-invalid')).toBe('true');
    expect(slider.getAttribute('aria-describedby')).toBe('stars-error');
    expect(screen.getByRole('alert').textContent).toBe('Please rate');
  });

  it('is a labelled image, out of the tab order, when readOnly', () => {
    render(<Rating readOnly value={4} label="Average" />);
    const image = screen.getByRole('img', { name: 'Average: 4 out of 5' });
    expect(image.getAttribute('tabindex')).toBeNull();
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('is disabled for assistive technology and removed from the tab order', () => {
    render(<Rating label="Locked" disabled defaultValue={1} />);
    const slider = screen.getByRole('slider', { name: 'Locked' });
    expect(slider.getAttribute('aria-disabled')).toBe('true');
    expect(slider.getAttribute('tabindex')).toBe('-1');
  });
});
