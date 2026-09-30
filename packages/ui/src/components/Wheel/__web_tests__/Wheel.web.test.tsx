import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Wheel } from '../Wheel';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

const HOURS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));

describe('Wheel (react-native-web DOM)', () => {
  it('is one focusable slider named by its label, speaking the centered item', () => {
    const { container } = render(<Wheel label="Hour" items={HOURS} defaultValue={3} />);

    const wheel = screen.getByRole('slider', { name: 'Hour' });
    expect(wheel.getAttribute('aria-valuetext')).toBe('03');
    expect(wheel.getAttribute('aria-orientation')).toBe('vertical');
    expect(wheel.getAttribute('tabindex')).toBe('0');
    // Items are pointer targets only.
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('moves with the keyboard and reports each settled value', () => {
    const onChange = jest.fn();
    const onChangeComplete = jest.fn();
    render(<Wheel label="Hour" items={HOURS} defaultValue={3} onChange={onChange} onChangeComplete={onChangeComplete} />);
    const wheel = screen.getByRole('slider');

    fireEvent.keyDown(wheel, { key: 'ArrowUp' });
    expect(wheel.getAttribute('aria-valuetext')).toBe('04');
    fireEvent.keyDown(wheel, { key: 'End' });
    expect(wheel.getAttribute('aria-valuetext')).toBe('12');
    fireEvent.keyDown(wheel, { key: 'PageDown' });
    expect(wheel.getAttribute('aria-valuetext')).toBe('07');

    expect(onChange.mock.calls.map(([v]) => v)).toEqual([4, 12, 7]);
    expect(onChangeComplete.mock.calls.map(([v]) => v)).toEqual([4, 12, 7]);
  });

  it('is disabled and out of the tab order when disabled', () => {
    render(<Wheel label="Hour" items={HOURS} disabled />);
    const wheel = screen.getByRole('slider');
    expect(wheel.getAttribute('aria-disabled')).toBe('true');
    expect(wheel.getAttribute('tabindex')).toBe('-1');
  });
});
